"""Export pipeline data to a static JSON file for GitHub Pages frontend.

Usage:
    python export_json.py                  # Fetch live data + export
    python export_json.py --db-only        # Export from existing DB (no fetch)
    python export_json.py --output ../frontend/data.json
"""

import json
import math
import os
import sys
import argparse
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import TICKERS, DB_PATH
from db.store import init_db, get_ohlcv, get_fundamentals, get_row_counts

import numpy as np


def clean(val):
    """Convert NaN/inf/numpy types to JSON-safe Python types."""
    if val is None:
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        v = float(val)
        return None if (math.isnan(v) or math.isinf(v)) else v
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    return val


def build_ticker_data(db_path: str, ticker: str) -> dict:
    """Build complete data object for one ticker."""
    fund_df = get_fundamentals(db_path, ticker)
    ohlcv = get_ohlcv(db_path, ticker, limit=120)

    if fund_df.empty:
        return None

    row = fund_df.iloc[0]

    # Build price history
    history = []
    for _, h in ohlcv.iterrows():
        history.append({
            "date": h["date"],
            "open": round(float(h["open"]), 2),
            "high": round(float(h["high"]), 2),
            "low": round(float(h["low"]), 2),
            "close": round(float(h["close"]), 2),
            "volume": int(h["volume"]),
        })
    history.reverse()

    # Calculate daily change from last two closes
    change_pct = None
    if len(history) >= 2:
        prev = history[-2]["close"]
        curr = history[-1]["close"]
        if prev > 0:
            change_pct = round(((curr - prev) / prev) * 100, 2)

    return {
        "ticker": ticker,
        "name": row.get("name") or "",
        "sector": row.get("sector") or "",
        "price": clean(row.get("current_price")),
        "change_pct": clean(change_pct),
        "pe_ratio": clean(row.get("pe_ratio")),
        "forward_pe": clean(row.get("forward_pe")),
        "market_cap": clean(row.get("market_cap")),
        "beta": clean(row.get("beta")),
        "dividend_yield": clean(row.get("dividend_yield")),
        "week_52_low": clean(row.get("week_52_low")),
        "week_52_high": clean(row.get("week_52_high")),
        "eps": clean(row.get("eps")),
        "revenue_growth": clean(row.get("revenue_growth")),
        "debt_to_equity": clean(row.get("debt_to_equity")),
        "free_cash_flow": clean(row.get("free_cash_flow")),
        "avg_volume": clean(row.get("avg_volume")),
        "history": history,
    }


def export(db_path: str, output_path: str):
    """Export all ticker data to a JSON file."""
    counts = get_row_counts(db_path)

    tickers = []
    for ticker in TICKERS:
        data = build_ticker_data(db_path, ticker)
        if data:
            data["ohlcv_rows"] = counts.get(ticker, 0)
            tickers.append(data)

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tickers": tickers,
        "count": len(tickers),
        "configured_tickers": TICKERS,
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Exported {len(tickers)} tickers to {output_path}")
    print(f"Generated at: {output['generated_at']}")
    for t in tickers:
        print(f"  {t['ticker']:5s} ${t['price']:>8.2f}  {len(t['history'])} days of history")


def main():
    parser = argparse.ArgumentParser(description="Export LIFE Markets data to JSON")
    parser.add_argument("--db-only", action="store_true", help="Skip fetching, export existing DB")
    parser.add_argument("--output", default=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "data.json"))
    args = parser.parse_args()

    if not args.db_only:
        print("Running pipeline to fetch fresh data...\n")
        from pipeline.run import run
        run()
        print()

    init_db(DB_PATH)
    export(DB_PATH, args.output)


if __name__ == "__main__":
    main()
