"""Seed the database with realistic demo data for testing the UI."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DB_PATH
from db.store import init_db, upsert_ohlcv, upsert_fundamentals

import pandas as pd
import random

random.seed(42)

DEMO_TICKERS = {
    "NVDA": {"name": "NVIDIA Corporation", "sector": "Technology", "base_price": 118.50,
             "market_cap": 2.89e12, "pe": 55.3, "fwd_pe": 32.1, "yield": 0.0003,
             "beta": 1.65, "avg_vol": 45000000, "w52_low": 75.61, "w52_high": 153.13,
             "eps": 2.94, "rev_growth": 0.94, "de": 29.5, "fcf": 30.5e9},
    "VOO": {"name": "Vanguard S&P 500 ETF", "sector": "Broad Market", "base_price": 486.20,
            "market_cap": 542e9, "pe": 23.8, "fwd_pe": 21.2, "yield": 0.0127,
            "beta": 1.0, "avg_vol": 4200000, "w52_low": 432.50, "w52_high": 512.88,
            "eps": 20.43, "rev_growth": None, "de": None, "fcf": None},
    "JPM": {"name": "JPMorgan Chase & Co.", "sector": "Financial Services", "base_price": 247.80,
            "market_cap": 710e9, "pe": 13.1, "fwd_pe": 12.4, "yield": 0.0198,
            "beta": 1.05, "avg_vol": 9800000, "w52_low": 189.20, "w52_high": 262.50,
            "eps": 18.91, "rev_growth": 0.12, "de": 180.0, "fcf": None},
    "GDX": {"name": "VanEck Gold Miners ETF", "sector": "Gold Miners", "base_price": 42.18,
            "market_cap": 14.2e9, "pe": None, "fwd_pe": None, "yield": 0.0162,
            "beta": 0.65, "avg_vol": 22000000, "w52_low": 28.50, "w52_high": 45.20,
            "eps": None, "rev_growth": None, "de": None, "fcf": None},
    "ORCL": {"name": "Oracle Corporation", "sector": "Technology", "base_price": 168.40,
             "market_cap": 467e9, "pe": 37.8, "fwd_pe": 24.6, "yield": 0.0094,
             "beta": 1.12, "avg_vol": 11500000, "w52_low": 112.50, "w52_high": 192.43,
             "eps": 4.46, "rev_growth": 0.09, "de": 105.3, "fcf": 11.8e9},
}


def generate_ohlcv(ticker: str, info: dict, days: int = 60) -> pd.DataFrame:
    """Generate realistic daily OHLCV data."""
    rows = []
    dates = pd.bdate_range(end="2026-03-21", periods=days)
    price = info["base_price"] * 0.9  # start ~10% lower so there's a trend

    for date in dates:
        drift = 0.001  # slight upward bias
        volatility = 0.02
        change = price * (drift + volatility * (random.gauss(0, 1)))
        open_ = round(price + change * 0.3, 2)
        intraday = abs(change) * random.uniform(0.5, 1.5)
        low = round(min(open_, open_ - intraday * random.uniform(0, 1)), 2)
        high = round(max(open_, open_ + intraday * random.uniform(0.3, 1.2)), 2)
        close = round(random.uniform(low + (high - low) * 0.2, high - (high - low) * 0.1), 2)
        base_vol = info["avg_vol"] or 10000000
        volume = int(base_vol * random.uniform(0.6, 1.5))

        rows.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume,
            "ticker": ticker,
        })
        price = close

    # Make the last close match the "current" price
    if rows:
        rows[-1]["close"] = info["base_price"]

    return pd.DataFrame(rows)


def main():
    print("Seeding demo data...")
    init_db(DB_PATH)

    # Generate OHLCV
    all_ohlcv = []
    for ticker, info in DEMO_TICKERS.items():
        df = generate_ohlcv(ticker, info)
        all_ohlcv.append(df)
        print(f"  {ticker}: {len(df)} OHLCV rows")

    ohlcv_df = pd.concat(all_ohlcv, ignore_index=True)
    results = upsert_ohlcv(DB_PATH, ohlcv_df)
    for ticker, count in sorted(results.items()):
        print(f"    → {ticker}: {count} new rows stored")

    # Insert fundamentals
    fund_rows = []
    for ticker, info in DEMO_TICKERS.items():
        fund_rows.append({
            "ticker": ticker,
            "name": info["name"],
            "sector": info["sector"],
            "current_price": info["base_price"],
            "market_cap": info["market_cap"],
            "pe_ratio": info["pe"],
            "forward_pe": info["fwd_pe"],
            "dividend_yield": info["yield"],
            "beta": info["beta"],
            "avg_volume": info["avg_vol"],
            "week_52_low": info["w52_low"],
            "week_52_high": info["w52_high"],
            "eps": info["eps"],
            "revenue_growth": info["rev_growth"],
            "debt_to_equity": info["de"],
            "free_cash_flow": info["fcf"],
        })

    fund_df = pd.DataFrame(fund_rows)
    count = upsert_fundamentals(DB_PATH, fund_df)
    print(f"\n  Fundamentals: {count} tickers stored")
    print("\nDone! Start the server with: python server.py")


if __name__ == "__main__":
    main()
