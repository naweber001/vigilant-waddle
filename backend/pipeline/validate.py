"""Basic data validation for OHLCV data."""

import logging

import pandas as pd

logger = logging.getLogger(__name__)


def validate_ohlcv(df: pd.DataFrame) -> pd.DataFrame:
    """Validate OHLCV data and drop bad rows.

    Checks:
        - No null values in required columns
        - Prices are positive
        - Volume is non-negative
        - High >= Low
        - High >= Open and High >= Close
        - Low <= Open and Low <= Close

    Returns:
        Cleaned DataFrame with invalid rows removed.
    """
    if df.empty:
        return df

    initial_count = len(df)
    required_cols = ["date", "open", "high", "low", "close", "volume", "ticker"]

    # Check required columns exist
    missing = set(required_cols) - set(df.columns)
    if missing:
        logger.error("Missing required columns: %s", missing)
        return pd.DataFrame()

    # Drop nulls in required fields
    df = df.dropna(subset=required_cols)

    # Prices must be positive
    price_mask = (df["open"] > 0) & (df["high"] > 0) & (df["low"] > 0) & (df["close"] > 0)
    df = df[price_mask]

    # Volume must be non-negative
    df = df[df["volume"] >= 0]

    # High/low sanity: high >= low
    df = df[df["high"] >= df["low"]]

    dropped = initial_count - len(df)
    if dropped > 0:
        logger.warning("Dropped %d invalid rows out of %d", dropped, initial_count)
    else:
        logger.info("All %d rows passed validation", initial_count)

    return df.reset_index(drop=True)
