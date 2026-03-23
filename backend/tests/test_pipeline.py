"""Tests for the data pipeline using synthetic data."""

import os
import sys
import tempfile

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.store import init_db, upsert_ohlcv, upsert_fundamentals, get_ohlcv, get_fundamentals, get_row_counts, get_latest_date
from pipeline.validate import validate_ohlcv


def make_sample_ohlcv(ticker: str, days: int = 5) -> pd.DataFrame:
    """Generate realistic synthetic OHLCV data."""
    import random
    random.seed(42)
    base_prices = {"NVDA": 120.0, "VOO": 480.0, "JPM": 195.0, "GDX": 38.0, "ORCL": 170.0}
    base = base_prices.get(ticker, 100.0)

    rows = []
    dates = pd.bdate_range(end="2026-03-21", periods=days)
    price = base
    for date in dates:
        change = price * random.uniform(-0.03, 0.03)
        open_ = round(price + change, 2)
        low = round(open_ * random.uniform(0.975, 0.999), 2)
        high = round(max(open_, low) * random.uniform(1.001, 1.025), 2)
        close = round(random.uniform(low, high), 2)
        volume = random.randint(5_000_000, 80_000_000)
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
    return pd.DataFrame(rows)


def test_validation_passes_good_data():
    df = make_sample_ohlcv("NVDA", days=10)
    result = validate_ohlcv(df)
    assert len(result) == len(df), f"Expected {len(df)} rows, got {len(result)}"
    print(f"PASS: validation passes good data ({len(result)} rows)")


def test_validation_drops_bad_rows():
    df = make_sample_ohlcv("NVDA", days=5)
    good_count = len(df)
    # Inject bad rows
    bad_rows = pd.DataFrame([
        {"date": "2026-03-22", "open": -1.0, "high": 120.0, "low": 118.0,
         "close": 119.0, "volume": 1000000, "ticker": "NVDA"},  # negative open
        {"date": "2026-03-23", "open": 120.0, "high": 115.0, "low": 118.0,
         "close": 119.0, "volume": 1000000, "ticker": "NVDA"},  # high < low
    ])
    df = pd.concat([df, bad_rows], ignore_index=True)
    result = validate_ohlcv(df)
    assert len(result) == good_count, f"Expected {good_count} rows after dropping bad ones, got {len(result)}"
    print("PASS: validation drops bad rows")


def test_db_roundtrip():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    try:
        init_db(db_path)

        # Insert data for multiple tickers
        tickers = ["NVDA", "VOO", "JPM", "GDX", "ORCL"]
        frames = [make_sample_ohlcv(t, days=20) for t in tickers]
        rows_per_ticker = len(frames[0])  # actual rows generated
        df = pd.concat(frames, ignore_index=True)

        results = upsert_ohlcv(db_path, df)
        assert len(results) == 5, f"Expected 5 tickers, got {len(results)}"
        for ticker, count in results.items():
            assert count == rows_per_ticker, f"Expected {rows_per_ticker} rows for {ticker}, got {count}"

        # Verify reads
        counts = get_row_counts(db_path)
        expected_total = rows_per_ticker * 5
        assert sum(counts.values()) == expected_total, f"Expected {expected_total} total rows, got {sum(counts.values())}"

        nvda = get_ohlcv(db_path, "NVDA", limit=5)
        assert len(nvda) == 5, f"Expected 5 rows, got {len(nvda)}"
        assert nvda.iloc[0]["ticker"] == "NVDA"

        latest = get_latest_date(db_path, "NVDA")
        assert latest is not None, "Expected a latest date, got None"

        print(f"PASS: database roundtrip (5 tickers × {rows_per_ticker} days)")

        # Test idempotency — inserting same data again should add 0 new rows
        results2 = upsert_ohlcv(db_path, df)
        for ticker, count in results2.items():
            assert count == 0, f"Expected 0 new rows for {ticker} on re-insert, got {count}"
        print("PASS: idempotent re-insert adds no duplicates")

    finally:
        os.unlink(db_path)


def test_fundamentals_roundtrip():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    try:
        init_db(db_path)

        fund_data = pd.DataFrame([
            {"ticker": "NVDA", "name": "NVIDIA Corp", "sector": "Technology",
             "current_price": 120.50, "market_cap": 2.9e12, "pe_ratio": 55.3,
             "forward_pe": 32.1, "dividend_yield": 0.0003, "beta": 1.65,
             "avg_volume": 45000000, "week_52_low": 75.0, "week_52_high": 153.0,
             "eps": 2.18, "revenue_growth": 0.94, "debt_to_equity": 29.5,
             "free_cash_flow": 30.5e9},
            {"ticker": "JPM", "name": "JPMorgan Chase", "sector": "Financial Services",
             "current_price": 195.20, "market_cap": 560e9, "pe_ratio": 11.2,
             "forward_pe": 10.8, "dividend_yield": 0.022, "beta": 1.05,
             "avg_volume": 12000000, "week_52_low": 170.0, "week_52_high": 210.0,
             "eps": 17.43, "revenue_growth": 0.12, "debt_to_equity": 180.0,
             "free_cash_flow": None},
        ])

        count = upsert_fundamentals(db_path, fund_data)
        assert count == 2, f"Expected 2 rows upserted, got {count}"

        # Read back
        all_fund = get_fundamentals(db_path)
        assert len(all_fund) == 2

        nvda_fund = get_fundamentals(db_path, "NVDA")
        assert len(nvda_fund) == 1
        assert nvda_fund.iloc[0]["pe_ratio"] == 55.3
        assert nvda_fund.iloc[0]["sector"] == "Technology"

        # Test upsert overwrites
        updated = pd.DataFrame([
            {"ticker": "NVDA", "name": "NVIDIA Corp", "sector": "Technology",
             "current_price": 125.00, "market_cap": 3.0e12, "pe_ratio": 57.0,
             "forward_pe": 33.0, "dividend_yield": 0.0003, "beta": 1.65,
             "avg_volume": 45000000, "week_52_low": 75.0, "week_52_high": 153.0,
             "eps": 2.18, "revenue_growth": 0.94, "debt_to_equity": 29.5,
             "free_cash_flow": 30.5e9},
        ])
        upsert_fundamentals(db_path, updated)
        nvda_fund = get_fundamentals(db_path, "NVDA")
        assert nvda_fund.iloc[0]["current_price"] == 125.00
        assert nvda_fund.iloc[0]["pe_ratio"] == 57.0

        # Total count should still be 2 (upsert, not duplicate)
        all_fund = get_fundamentals(db_path)
        assert len(all_fund) == 2

        print("PASS: fundamentals roundtrip (insert, read, upsert)")

    finally:
        os.unlink(db_path)


if __name__ == "__main__":
    test_validation_passes_good_data()
    test_validation_drops_bad_rows()
    test_db_roundtrip()
    test_fundamentals_roundtrip()
    print("\nAll tests passed.")
