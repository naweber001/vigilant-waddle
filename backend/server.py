"""FastAPI server for LIFE Markets data."""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import DB_PATH, TICKERS
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

app = FastAPI(title="LIFE Markets API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the frontend
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")


@app.on_event("startup")
def startup():
    init_db(DB_PATH)


@app.get("/api/tickers")
def list_tickers():
    """Return fundamentals + latest price for all tickers."""
    fund_df = get_fundamentals(DB_PATH)
    counts = get_row_counts(DB_PATH)

    tickers = []
    for _, row in fund_df.iterrows():
        ticker = row["ticker"]
        # Get latest OHLCV for price change
        ohlcv = get_ohlcv(DB_PATH, ticker, limit=2)
        change_pct = None
        if len(ohlcv) >= 2:
            prev_close = ohlcv.iloc[1]["close"]
            if prev_close > 0:
                change_pct = round(((ohlcv.iloc[0]["close"] - prev_close) / prev_close) * 100, 2)

        tickers.append({
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
            "ohlcv_rows": counts.get(ticker, 0),
        })

    return {"tickers": tickers, "count": len(tickers)}


@app.get("/api/tickers/{ticker}")
def get_ticker_detail(ticker: str):
    """Return detail data for a single ticker."""
    ticker = ticker.upper()
    fund_df = get_fundamentals(DB_PATH, ticker)
    if fund_df.empty:
        return {"error": f"Ticker {ticker} not found"}

    row = fund_df.iloc[0]
    ohlcv = get_ohlcv(DB_PATH, ticker, limit=60)

    # Price history for chart
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

    change_pct = None
    if len(history) >= 2:
        prev = history[1]["close"]
        if prev > 0:
            change_pct = round(((history[0]["close"] - prev) / prev) * 100, 2)

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
        "history": list(reversed(history)),
    }


@app.get("/api/health")
def health():
    """Pipeline health check."""
    counts = get_row_counts(DB_PATH)
    fund_df = get_fundamentals(DB_PATH)
    return {
        "status": "ok" if counts else "empty",
        "ohlcv_tickers": len(counts),
        "ohlcv_total_rows": sum(counts.values()) if counts else 0,
        "fundamentals_tickers": len(fund_df),
        "configured_tickers": TICKERS,
    }


# Serve frontend as catch-all (must be last)
if os.path.isdir(FRONTEND_DIR):
    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

    app.mount("/", StaticFiles(directory=FRONTEND_DIR), name="frontend")


if __name__ == "__main__":
    import uvicorn
    print("Starting LIFE Markets server at http://localhost:8000")
    print("API docs at http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
