"""Main pipeline runner for LIFE Markets data collection."""

import logging
import sys
import os

# Add backend to path so this can be run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import TICKERS, DB_PATH, DEFAULT_HISTORY_PERIOD
from db.store import init_db, upsert_ohlcv, get_row_counts
from pipeline.adapters.yahoo import fetch_multiple
from pipeline.validate import validate_ohlcv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def run(tickers: list[str] = None, period: str = None) -> dict[str, int]:
    """Run the full data pipeline: fetch, validate, store.

    Args:
        tickers: List of ticker symbols. Defaults to config.TICKERS.
        period: yfinance history period. Defaults to config.DEFAULT_HISTORY_PERIOD.

    Returns:
        Dict mapping ticker to new rows inserted.
    """
    tickers = tickers or TICKERS
    period = period or DEFAULT_HISTORY_PERIOD

    logger.info("=== LIFE Markets Data Pipeline ===")
    logger.info("Tickers: %s", ", ".join(tickers))
    logger.info("Period: %s", period)

    # Initialize database
    init_db(DB_PATH)

    # Fetch
    logger.info("Fetching OHLCV data from Yahoo Finance...")
    raw_df = fetch_multiple(tickers, period=period)
    if raw_df.empty:
        logger.error("No data fetched. Aborting.")
        return {}

    logger.info("Fetched %d total rows", len(raw_df))

    # Validate
    logger.info("Validating data...")
    clean_df = validate_ohlcv(raw_df)
    if clean_df.empty:
        logger.error("No valid data after validation. Aborting.")
        return {}

    logger.info("Validated %d rows", len(clean_df))

    # Store
    logger.info("Storing in database...")
    results = upsert_ohlcv(DB_PATH, clean_df)

    # Summary
    logger.info("=== Pipeline Complete ===")
    for ticker, count in sorted(results.items()):
        logger.info("  %s: %d new rows", ticker, count)

    totals = get_row_counts(DB_PATH)
    logger.info("Database totals:")
    for ticker, count in sorted(totals.items()):
        logger.info("  %s: %d rows", ticker, count)

    return results


if __name__ == "__main__":
    run()
