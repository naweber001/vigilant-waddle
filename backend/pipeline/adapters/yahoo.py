"""Yahoo Finance data adapter for OHLCV data."""

import logging
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)


def fetch_ohlcv(ticker: str, period: str = "6mo") -> pd.DataFrame:
    """Fetch OHLCV data for a single ticker.

    Args:
        ticker: Stock/ETF symbol (e.g. "NVDA").
        period: yfinance period string (1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max).

    Returns:
        DataFrame with columns: date, open, high, low, close, volume, ticker.
        Empty DataFrame if fetch fails.
    """
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period, auto_adjust=True)

        if df.empty:
            logger.warning("No data returned for %s", ticker)
            return pd.DataFrame()

        df = df.reset_index()
        df = df.rename(columns={
            "Date": "date",
            "Open": "open",
            "High": "high",
            "Low": "low",
            "Close": "close",
            "Volume": "volume",
        })
        df = df[["date", "open", "high", "low", "close", "volume"]]
        df["ticker"] = ticker
        # Normalize date to date-only string for consistent storage
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

        return df

    except Exception:
        logger.exception("Failed to fetch data for %s", ticker)
        return pd.DataFrame()


def fetch_multiple(tickers: list[str], period: str = "6mo") -> pd.DataFrame:
    """Fetch OHLCV data for multiple tickers.

    Returns:
        Combined DataFrame for all tickers, or empty DataFrame if all fail.
    """
    frames = []
    for ticker in tickers:
        logger.info("Fetching %s...", ticker)
        df = fetch_ohlcv(ticker, period=period)
        if not df.empty:
            frames.append(df)
        else:
            logger.warning("Skipping %s — no data returned", ticker)

    if not frames:
        return pd.DataFrame()

    return pd.concat(frames, ignore_index=True)
