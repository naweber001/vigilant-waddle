"""SQLite storage layer for LIFE Markets."""

import logging
import sqlite3
from contextlib import contextmanager

import pandas as pd

logger = logging.getLogger(__name__)

SCHEMA = """
CREATE TABLE IF NOT EXISTS ohlcv (
    ticker  TEXT    NOT NULL,
    date    TEXT    NOT NULL,
    open    REAL    NOT NULL,
    high    REAL    NOT NULL,
    low     REAL    NOT NULL,
    close   REAL    NOT NULL,
    volume  INTEGER NOT NULL,
    PRIMARY KEY (ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_ohlcv_ticker ON ohlcv (ticker);
CREATE INDEX IF NOT EXISTS idx_ohlcv_date ON ohlcv (date);

CREATE TABLE IF NOT EXISTS sync_log (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker    TEXT    NOT NULL,
    synced_at TEXT    NOT NULL,
    rows_added INTEGER NOT NULL,
    status    TEXT    NOT NULL
);
"""


@contextmanager
def get_connection(db_path: str):
    """Context manager for SQLite connections."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
    finally:
        conn.close()


def init_db(db_path: str) -> None:
    """Create tables if they don't exist."""
    with get_connection(db_path) as conn:
        conn.executescript(SCHEMA)
        logger.info("Database initialized at %s", db_path)


def upsert_ohlcv(db_path: str, df: pd.DataFrame) -> dict[str, int]:
    """Insert OHLCV data, skipping rows that already exist (by ticker+date).

    Returns:
        Dict mapping ticker to number of new rows inserted.
    """
    if df.empty:
        return {}

    results = {}

    with get_connection(db_path) as conn:
        for ticker, group in df.groupby("ticker"):
            rows_before = conn.execute(
                "SELECT COUNT(*) FROM ohlcv WHERE ticker = ?", (ticker,)
            ).fetchone()[0]

            # Use INSERT OR IGNORE for idempotent upserts
            for _, row in group.iterrows():
                conn.execute(
                    "INSERT OR IGNORE INTO ohlcv (ticker, date, open, high, low, close, volume) "
                    "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (row["ticker"], row["date"], row["open"], row["high"],
                     row["low"], row["close"], int(row["volume"])),
                )

            rows_after = conn.execute(
                "SELECT COUNT(*) FROM ohlcv WHERE ticker = ?", (ticker,)
            ).fetchone()[0]

            new_rows = rows_after - rows_before
            results[ticker] = new_rows

            conn.execute(
                "INSERT INTO sync_log (ticker, synced_at, rows_added, status) "
                "VALUES (?, datetime('now'), ?, ?)",
                (ticker, new_rows, "ok"),
            )

        conn.commit()

    return results


def get_latest_date(db_path: str, ticker: str) -> str | None:
    """Get the most recent date stored for a ticker."""
    with get_connection(db_path) as conn:
        row = conn.execute(
            "SELECT MAX(date) FROM ohlcv WHERE ticker = ?", (ticker,)
        ).fetchone()
        return row[0] if row and row[0] else None


def get_ohlcv(db_path: str, ticker: str, limit: int = 30) -> pd.DataFrame:
    """Read OHLCV data for a ticker, most recent first."""
    with get_connection(db_path) as conn:
        return pd.read_sql_query(
            "SELECT * FROM ohlcv WHERE ticker = ? ORDER BY date DESC LIMIT ?",
            conn,
            params=(ticker, limit),
        )


def get_row_counts(db_path: str) -> dict[str, int]:
    """Get row counts per ticker."""
    with get_connection(db_path) as conn:
        rows = conn.execute(
            "SELECT ticker, COUNT(*) FROM ohlcv GROUP BY ticker"
        ).fetchall()
        return dict(rows)
