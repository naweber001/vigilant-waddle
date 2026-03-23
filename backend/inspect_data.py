"""Test harness: run the pipeline and inspect stored data.

Usage:
    python inspect_data.py          # Full pipeline run + display
    python inspect_data.py --db     # Just display what's in the DB (no fetch)
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import TICKERS, DB_PATH
from db.store import init_db, get_ohlcv, get_fundamentals, get_row_counts


def display_ohlcv_summary(db_path: str, tickers: list[str]):
    """Show latest OHLCV data for each ticker."""
    counts = get_row_counts(db_path)
    if not counts:
        print("  (no OHLCV data in database)")
        return

    print(f"  {'Ticker':<8} {'Rows':>6}  {'Latest Date':<12} {'Close':>10} {'Volume':>14}")
    print(f"  {'─'*8} {'─'*6}  {'─'*12} {'─'*10} {'─'*14}")

    for ticker in tickers:
        df = get_ohlcv(db_path, ticker, limit=1)
        if df.empty:
            print(f"  {ticker:<8} {'0':>6}  {'—':<12} {'—':>10} {'—':>14}")
            continue
        row = df.iloc[0]
        count = counts.get(ticker, 0)
        print(f"  {ticker:<8} {count:>6}  {row['date']:<12} {row['close']:>10.2f} {int(row['volume']):>14,}")


def display_fundamentals(db_path: str):
    """Show fundamentals table."""
    df = get_fundamentals(db_path)
    if df.empty:
        print("  (no fundamentals data in database)")
        return

    # Key columns for display
    print(f"  {'Ticker':<8} {'Name':<20} {'Sector':<22} {'Price':>8} {'P/E':>8} {'Fwd P/E':>8} {'Beta':>6} {'Mkt Cap':>12}")
    print(f"  {'─'*8} {'─'*20} {'─'*22} {'─'*8} {'─'*8} {'─'*8} {'─'*6} {'─'*12}")

    for _, row in df.iterrows():
        name = (row.get("name") or "")[:19]
        sector = (row.get("sector") or "")[:21]
        price = f"{row['current_price']:.2f}" if row.get("current_price") else "—"
        pe = f"{row['pe_ratio']:.1f}" if row.get("pe_ratio") else "—"
        fpe = f"{row['forward_pe']:.1f}" if row.get("forward_pe") else "—"
        beta = f"{row['beta']:.2f}" if row.get("beta") else "—"
        mcap = f"{row['market_cap']/1e9:.1f}B" if row.get("market_cap") else "—"
        print(f"  {row['ticker']:<8} {name:<20} {sector:<22} {price:>8} {pe:>8} {fpe:>8} {beta:>6} {mcap:>12}")

    # Second table: more fundamental fields
    print()
    print(f"  {'Ticker':<8} {'Yield':>8} {'EPS':>8} {'Rev Grw':>8} {'D/E':>8} {'FCF':>12} {'52w Low':>9} {'52w High':>9}")
    print(f"  {'─'*8} {'─'*8} {'─'*8} {'─'*8} {'─'*8} {'─'*12} {'─'*9} {'─'*9}")

    for _, row in df.iterrows():
        yld = f"{row['dividend_yield']*100:.2f}%" if row.get("dividend_yield") else "—"
        eps = f"{row['eps']:.2f}" if row.get("eps") else "—"
        rev = f"{row['revenue_growth']*100:.1f}%" if row.get("revenue_growth") else "—"
        de = f"{row['debt_to_equity']:.1f}" if row.get("debt_to_equity") else "—"
        fcf = f"{row['free_cash_flow']/1e9:.1f}B" if row.get("free_cash_flow") else "—"
        w52l = f"{row['week_52_low']:.2f}" if row.get("week_52_low") else "—"
        w52h = f"{row['week_52_high']:.2f}" if row.get("week_52_high") else "—"
        print(f"  {row['ticker']:<8} {yld:>8} {eps:>8} {rev:>8} {de:>8} {fcf:>12} {w52l:>9} {w52h:>9}")


def main():
    db_only = "--db" in sys.argv

    if not db_only:
        print("Running pipeline...\n")
        from pipeline.run import run
        run()
        print()

    init_db(DB_PATH)

    print("=" * 70)
    print("LIFE Markets — Data Inspection")
    print("=" * 70)

    print("\n📈 OHLCV Summary (latest per ticker):\n")
    display_ohlcv_summary(DB_PATH, TICKERS)

    print("\n📊 Fundamentals:\n")
    display_fundamentals(DB_PATH)

    print()


if __name__ == "__main__":
    main()
