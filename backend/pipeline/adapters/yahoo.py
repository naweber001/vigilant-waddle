"""Yahoo Finance data adapter for OHLCV and fundamental data."""

import logging

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)

# Fields we pull from yf.Ticker().info, mapped to our column names
FUNDAMENTALS_FIELDS = {
    "marketCap": "market_cap",
    "trailingPE": "pe_ratio",
    "forwardPE": "forward_pe",
    "dividendYield": "dividend_yield",
    "beta": "beta",
    "averageVolume": "avg_volume",
    "fiftyTwoWeekLow": "week_52_low",
    "fiftyTwoWeekHigh": "week_52_high",
    "trailingEps": "eps",
    "revenueGrowth": "revenue_growth",
    "debtToEquity": "debt_to_equity",
    "freeCashflow": "free_cash_flow",
}


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


def fetch_fundamentals(ticker: str) -> dict | None:
    """Fetch fundamental data for a single ticker.

    Returns:
        Dict with fundamental fields, or None if fetch fails.
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        if not info or info.get("regularMarketPrice") is None:
            logger.warning("No info returned for %s", ticker)
            return None

        result = {"ticker": ticker}
        for yf_key, our_key in FUNDAMENTALS_FIELDS.items():
            result[our_key] = info.get(yf_key)

        # Current price from info as a convenience
        result["current_price"] = info.get("regularMarketPrice") or info.get("currentPrice")
        result["name"] = info.get("shortName", "")
        result["sector"] = info.get("sector", "")

        return result

    except Exception:
        logger.exception("Failed to fetch fundamentals for %s", ticker)
        return None


def fetch_all_fundamentals(tickers: list[str]) -> pd.DataFrame:
    """Fetch fundamentals for multiple tickers.

    Returns:
        DataFrame with one row per ticker, or empty DataFrame if all fail.
    """
    rows = []
    for ticker in tickers:
        logger.info("Fetching fundamentals for %s...", ticker)
        data = fetch_fundamentals(ticker)
        if data:
            rows.append(data)
        else:
            logger.warning("Skipping fundamentals for %s", ticker)

    if not rows:
        return pd.DataFrame()

    return pd.DataFrame(rows)


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
