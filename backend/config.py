"""LIFE Markets configuration."""

import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "life_markets.db")

TICKERS = ["NVDA", "VOO", "JPM", "GDX", "ORCL"]

# Default lookback for initial data pull
DEFAULT_HISTORY_PERIOD = "6mo"
