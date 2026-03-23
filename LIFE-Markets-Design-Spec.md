# LIFE – Markets: Design Specification

## Overview

LIFE – Markets is a mobile-first portfolio management and market intelligence app designed for a once-daily morning check-in. The core philosophy is **patience as a feature** — the system defaults to "do nothing" and requires compelling evidence to recommend action.

The app is part of the LIFE ecosystem alongside LIFE – Fitness and LIFE – Legal.

---

## Architecture

### Frontend
- React JSX, single-file for mockup; multi-file for production
- Mobile-first (430px), iPhone-optimized
- Dark mode primary (Bloomberg-native aesthetic), light mode available
- IBM Plex Mono for data, IBM Plex Sans for body text
- Color palette: dark bg (#0b0e14), green (#00d26a) for positive, red (#ff3b5c) for negative, yellow (#ffb224) for caution, blue (#4e8cff) for accent, purple gradient for Claude/Analyst elements

### Backend (Claude Code Build)
- Python data pipeline with modular source adapters
- SQLite for local storage
- Cron-based two-stage refresh (Pacific Time)
- Anthropic API for Claude-powered summaries and Analyst

### Data Pipeline — Two-Stage (Pacific Time)

**Stage 1: Pre-Market**
- 5:30 AM PT — Data pull (pre-market prices, overnight news, filings, macro)
- 5:45 AM PT — Scoring engine run (composite scores for all 60 tickers)
- 6:00 AM PT — Claude analysis (Briefing, Verdict, alerts, summaries)

**Stage 2: Post-Open Refresh**
- 7:00 AM PT — Live price refresh (30 min after market open)
- 7:00 AM PT — Technical update (RSI, MACD with live data)
- 7:05 AM PT — Briefing addendum (if morning session changed anything)

---

## Navigation Structure

Five bottom tabs: **Home | Portfolio | Tickers | Analyst | Settings**

Icons: ⌂ | $ | ≡ | C (gradient badge) | ⚙

Active indicator: blue dot above icon.

---

## Tab: Home

Single scrollable page. No sub-tabs. The 60-second morning scan.

### Persistent Ticker Tape
- Scrolls continuously (5-second cycle), pauses on hover/touch
- Shows macro indicators: S&P 500, NASDAQ, VIX, 10Y Yield, DXY, Fed Rate
- Visible on ALL tabs, not just Home
- Gradient fades on left and right edges

### Daily Verdict (first card)
- Green/yellow/red left border + signal dot
- One-line verdict: "Hold steady" / "One item to consider" / "Attention needed"
- 2-3 sentence explanation referencing specific catalysts and cooling periods
- Quick stats: actionable alerts count, positions in cooling, catalysts this week
- **Most days should say "Hold steady."** If the system recommends action more than 2-3 times per month, thresholds are too sensitive.

### Morning Briefing
- Claude-generated macro analysis card with purple gradient "C" badge
- Covers market conditions, sector trends, and portfolio-relevant developments
- Generated at 6:00 AM PT, addendum at 7:05 AM if needed

### Macro Stats Grid
- 2x3 grid showing all six macro indicators with values and changes

### Upcoming Catalysts
- Earnings dates, Fed meetings, economic data releases, ex-dividend dates
- Each shows countdown badge ("4d"), affected ticker, event name, and detail
- This is the "why to wait" section — concrete reasons for patience

### Action Items
- Split into two sections:
  - **Action Recommended** — full-color cards with left border, prominently displayed
  - **Monitor Only — No Action Needed** — dimmed, compact, single-line items
- Badge count on Home only counts actionable items, not monitors
- Alert types: score drops, entry signals, sector cap warnings, analyst revisions, material news

---

## Tab: Portfolio

Three sub-tabs: **Summary | Positions | Performance**

### Summary
- Portfolio value (large, 38px, hero number)
- Daily P&L in dollars and percent
- All-time return, vs SPY alpha, cash reserve percentage
- Sector allocation donut chart with full legend (all 10 sectors)

### Positions
- Compact portfolio summary strip at top (value, daily P&L, cash, avg score)
- Collapsible holding rows — tap to expand summary, tap again to collapse
- Each row shows: traffic light dot, ticker, name, sector, weight, price, change, five-signal dots, composite score, velocity arrow
- Cooling period badge (⏳ 36h) on recently traded positions
- Expanded view shows mini summary + "View Full Analysis →" button
- **"+" button** to log trades (see Trade Logging section)

### Performance
- Portfolio vs S&P 500 line chart (6 months)
- Explicit alpha callout (+2.1%)
- Quick stats grid: Sharpe Ratio, Max Drawdown, Win Rate, Avg Score

---

## Tab: Tickers

Two sub-tabs via pill chips: **Watchlist | Research**

Plus **"+"** button to add tickers.

### Watchlist
- Curated names with full scoring, Claude summaries, news
- Includes portfolio holdings (marked with blue "Held" badge)
- **Conviction meter**: shows consecutive days above threshold (e.g., "14d ▲70")
  - Green badge if 5+ days (confirmed signal)
  - Yellow badge if under 5 days (unconfirmed)
- Sort buttons: Score, Δ%, A-Z
- Tap any row to open detail page

### Research
- Quant data only — no AI summaries, no scoring
- Denser table-like layout: ticker, price, RSI, MACD signal (Bull/Bear/Flat), P/E, 50-day MA indicator
- Promotion path: Research → Watchlist when conviction builds
- "Promote to Watchlist anytime for full analysis"

### Add Ticker Flow
- Inline overlay (not modal)
- Type ticker symbol (auto-uppercase)
- Choose destination: Research (default, quant only) or Watchlist (full scoring)
- Confirmation screen with next-refresh timing
- "Add Another" or "Done" buttons

---

## Detail Page (tap any stock)

### Header
- Back arrow, traffic light dot, ticker, name, score badge with color

### Price Header
- Large price (36px), daily change
- Stats grid: Mkt Cap, P/E, Fwd P/E, Yield, Beta, Avg Vol
- 52-week range visualization bar (gradient red→yellow→green with blue dot for current price)

### Price History Chart
- Recharts ComposedChart, 220px tall
- Time range toggles: 1W, 1M, 3M, 6M, 1Y, 5Y (3M default)
- Overlays with toggle checkboxes: 50-Day MA (yellow dashed), 200-Day MA (red dashed), Volume bars
- Interactive tooltips

### Score History Chart
- Area chart showing composite score over time (120px)
- Reference lines at 70 (bullish threshold) and 50 (neutral threshold)
- Zone legend: Bullish (70+), Neutral (50-70), Bearish (<50)

### Signal Pattern + Composite Score
- Five labeled signal dots: Fund, Tech, Analyst, Sent, Macro
- Composite score (30px) with velocity indicator (+3.2/wk)
- Category breakdown with progress bars and detail text

### Claude Analysis Card
- Purple gradient border wrapper for visual distinction
- "C" badge, title, timestamp
- Multi-paragraph analysis covering technicals, fundamentals, analyst consensus, risks, and bottom-line recommendation

### Recent News
- Sentiment-colored dots (green/red/yellow) with headlines and dates

---

## Tab: Analyst

Claude-powered analysis with portfolio-aware context. Subtle purple background tint.

### Context Badge
- Shows "Analyzing 12 holdings · 32 watchlist · 5 alerts"

### Structured Templates (v1 approach)
Five pre-built analysis cards:
1. 🛡 **Portfolio Risk Scan** — concentration, correlation, sector exposure, downside scenarios
2. 💰 **Deployment Opportunities** — always leads with "Do Nothing" option as default recommendation; evaluates whether patience is the better strategy before listing candidates
3. 📋 **Weekly Digest** — score changes, revisions, news, performance summary
4. 📊 **Sector Deep Dive** — intra-sector comparison against ETF benchmark
5. 🔍 **Thesis Check** — pressure-test any holding against original investment thesis

### Freeform Input
- Text input with send button
- Quick-suggestion chips: "What should I sell first?", "Am I too heavy in tech?", etc.

### Result View
- Back to templates link
- Claude analysis card with findings
- Follow-up input at bottom
- Risk Scan shows severity-coded findings (red/yellow/green) with recommended actions
- Deployment shows "Do Nothing" assessment first, then candidates with fit indicators

---

## Tab: Settings

Four collapsible sections (all default closed):

### Appearance
- Dark/Light theme toggle with visual preview cards

### Portfolio Rules
- **Position Limits**: Max per stock (slider 3-20%), max per ETF (5-30%), min/max total positions (stepper)
- **Sector & Asset Allocation**: Max per sector (10-40%), sub-sector cap (5-25%), target allocation ranges for equities/bonds/alternatives with visual range bars
- **Risk Parameters**: Target portfolio beta (slider 0.5-1.8), cash reserve floor (0-25%), correlation warnings toggle
- **Rebalancing**: Trigger type (Drift % / Quarterly / Score Drop) with conditional threshold

### Scoring Weights
- Adjustable sliders (0-50%, step 5) for each category
- Live validation: red warning if weights ≠ 100%, green checkmark if balanced
- Color-coded distribution bar
- Descriptions of what feeds each category

### Data Sources & Schedule
- Connected sources with status badges, feed descriptions, last sync times, frequency
- Two-stage refresh schedule (Pre-Market and Post-Open) in Pacific Time
- Heartbeat demo toggle (All Good / 1 Stale / 3 Failed) for testing

---

## Scoring System

### Philosophy: Signals First, Score Second

The primary assessment is a **five-signal pattern** where each category produces a discrete signal: bullish (green), neutral (yellow), or bearish (red). The composite score (0-100) is secondary — useful for sorting and ranking, not for decision-making.

### Five Signal Categories

| Category | Weight | Inputs | Signal Logic |
|----------|--------|--------|-------------|
| Fundamentals | 30% | P/E (sector-relative), FCF yield, revenue growth, debt-to-equity | Green: above-sector on 3+ metrics. Red: below on 3+ |
| Technicals | 25% | RSI, MACD, MA positioning, volume trends | Green: bullish on 3+ indicators. Red: bearish on 3+ |
| Analyst Consensus | 20% | Rating distribution, revision direction/velocity, PT vs price | Green: net upgrades + PT above price. Red: net downgrades |
| News & Sentiment | 15% | Material news events, insider activity, put/call ratio | Green: positive catalysts, no red flags. Red: material negative event |
| Macro Context | 10% | VIX level, rate environment, yield curve, sector rotation | Green: supportive conditions. Red: headwinds |

### Critical Design Decisions

1. **Sector-relative normalization** for fundamentals — P/E of 38 scores differently for tech vs banks
2. **Score velocity** tracked alongside absolute score — trending matters more than level
3. **Signal disagreement is informative** — green fundamentals + red technicals = "good company, bad timing, wait"
4. **False precision warning** — don't treat 72 vs 74 as meaningfully different; use bands (70+ = bullish zone)
5. **During shadow mode**, track whether five-signal pattern or composite score better predicts 2-4 week returns

### Portfolio-Level Overlay (not yet implemented)

Individual scores don't account for correlation. A portfolio-level check should discount a stock's attractiveness if you already have heavy exposure to its risk factors (e.g., four semiconductor names).

---

## Patience-as-a-Feature System

### Daily Verdict
- Defaults to "Hold steady" — requires compelling evidence to override
- References specific catalysts and cooling periods

### Catalyst Awareness
- Earnings, Fed meetings, economic releases, ex-dividend dates
- If a holding has a major catalyst within 5-7 business days, the system flags "wait"

### Conviction Threshold
- Stocks must hold above entry threshold for 3-5 consecutive days before the system considers them actionable
- Filters out noise and false breakouts

### Cooling Periods
- 48-72 hours after any trade where the system will not recommend further changes to that position
- Visible as ⏳ badge on portfolio rows

### Cost-of-Action Calculation
- Every trade has friction (commission, spread, tax)
- Analyst factors this into recommendations

### Alert Priority
- "Action Recommended" vs "Monitor Only — No Action Needed"
- Badge counts only actionable items

### Analyst Guardrails
- "Do Nothing" is always the first option in Deployment Opportunities
- Template descriptions use patience-first language
- Prompt engineering should include: "Always evaluate whether waiting is the optimal strategy"

---

## Trade Logging

### Manual Entry (v1)
Three-step flow from Portfolio → Positions → "+" button:

1. **Action + Ticker** — Buy/Sell toggle, ticker input with quick-pick chips from holdings
2. **Details** — Shares, price per share, date (default today), live total calculation
3. **Thesis + Confirm** — Optional thesis/reason text, pre-trade validation checks (position size, sector cap, cash floor), colored confirm button

### Pre-Trade Checks
- Position size as % of portfolio
- Sector cap status
- Cash remaining after trade
- Each shows ✓ or ⚠

### Post-Confirm
- Success screen with trade summary
- Thesis displayed in italics
- 48h cooling period notification
- "Log Another" or "Done"

### Future Enhancements
- Brokerage API sync (Phase 3)
- CSV import
- Tax-lot tracking (FIFO default)
- After-tax P&L display

---

## Data Health System

### Heartbeat Indicator
- Small dot in header, always visible
- Green pulse (2s cycle) = all sources current
- Amber slow pulse (3s cycle) = one source stale
- Red static (no pulse / flatline) = multiple sources failed
- Tap to see status detail

### Ghost Banner
- Invisible when healthy — zero visual noise on good days
- Slides in below header when source is stale
- Shows specific source name and staleness duration
- Dismissible with × button

---

## 60-Ticker Universe

### Core & Broad Market ETFs (8)
VOO, QQQ, VTI, IJR, VIG, VXUS, BND, GLD

### Sector & Thematic ETFs (13)
XLK, XLV, XLF, XLE, XLI, XLU, XLRE, SMH, PAVE, GDX, OIH, PPH, STK

### Individual Stocks by Sector

**Technology (8):** NVDA, MSFT, AAPL, AVGO, AMD, CRM, ORCL, PANW
**Healthcare (5):** UNH, LLY, TMO, ISRG, ABBV
**Financials (5):** V, MA, JPM, GS, BRK.B
**Consumer Discretionary (4):** AMZN, TSLA, BKNG, WMT
**Communication Services (3):** GOOGL, META, NFLX
**Industrials (4):** CAT, GE, DE, HON
**Energy (3):** XOM, COP, WMB
**Utilities (2):** VST, NEE
**Consumer Staples (2):** COST, PG
**Materials (1):** LIN
**Real Estate (2):** PLD, AMT

---

## Known Limitations & Future Considerations

### Scoring Model
- Sub-category normalization not yet defined (how P/E, FCF yield combine into one "fundamentals" number)
- Sector-relative scoring is essential but complex to implement
- Equal-weight averaging hides category disagreements — signal pattern addresses this
- 0-100 scale implies false precision near thresholds

### Benchmarking
- SPY may not be the right benchmark for a portfolio with different factor exposure
- Consider custom benchmark matching target allocation (70% SPY + 10% BND + 10% GLD etc.)

### Time Horizon Blending
- RSI/MACD are short-term signals (days-weeks); P/E and growth are long-term (quarters-years)
- Combining them implicitly blends timeframes
- System should be explicit about which signals apply to which horizon

### News Sentiment
- Currently one-dimensional (positive/negative/neutral)
- Should distinguish short-term price impact from long-term thesis impact

### Correlation
- Acknowledged in Settings but not quantified in scoring
- Portfolio-level overlay needed to discount attractiveness of correlated additions

### Tax Implications
- Trade log captures enough data (buy date, cost basis) to enable tax-aware sell recommendations later
- Not implemented in v1

### Universe Management
- Static 60-ticker list will need periodic review
- Quarterly "universe review" via Analyst to flag names that should be added or removed

---

## Phase Roadmap

### Phase 1: Data Pipeline + Basic Portfolio (Weeks 1-4)
- Python backend with modular source adapters
- Yahoo Finance, FRED, EDGAR integration
- SQLite storage
- Scoring engine with five-signal output
- React frontend: Portfolio tab with real scores
- Jupyter notebook test harness
- Manual validation against source websites

### Phase 2: Home Tab + Claude Summaries (Weeks 5-6)
- Anthropic API integration
- Morning Briefing, Daily Verdict, alerts
- Two-stage PT cron pipeline
- Shadow mode begins

### Phase 3: Full Feature Set (Weeks 7+)
- Charts (price history, score history, performance vs benchmark)
- Analyst tab with templates + freeform
- Tickers tab with add flow and conviction meters
- Trade logging
- Catalyst calendar

### Phase 4: Agent Architecture
- Replace static pipeline with Claude Agent SDK
- Autonomous morning workflow: agent decides what to investigate
- Analyst tab becomes fully agentic (not template-driven)
- Agent handles universe review, catalyst monitoring, correlation checks

### Testing Roadmap
- **Week 1:** Validate data collection on 5 tickers (NVDA, VOO, JPM, XOM, GLD) with manual cross-checks
- **Week 2:** Expand to 60, scoring model sanity checks
- **Week 3:** Claude summaries online, quality audit every factual claim
- **Week 4+:** Shadow mode — paper-trade signals for 2-4 weeks before acting with real money

---

## File Reference

- **Mockup:** `life-markets-mockup.jsx` (~2,200 lines, fully interactive)
- **This spec:** `LIFE-Markets-Design-Spec.md`

---

*Designed in collaboration between Alex and Claude, March 2026.*
