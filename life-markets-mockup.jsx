import { useState } from "react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart } from "recharts";

const THEMES = {
  dark: {
    bg: "#0b0e14",
    bgCard: "#131720",
    bgCardHover: "#1a1f2e",
    bgInput: "#0f1219",
    border: "#1e2433",
    borderLight: "#2a3145",
    text: "#e8eaed",
    textMuted: "#8b93a7",
    textDim: "#5a6378",
    green: "#00d26a",
    greenBg: "rgba(0,210,106,0.08)",
    greenDim: "#00a854",
    red: "#ff3b5c",
    redBg: "rgba(255,59,92,0.08)",
    redDim: "#cc2f4a",
    yellow: "#ffb224",
    yellowBg: "rgba(255,178,36,0.08)",
    yellowDim: "#cc8e1d",
    blue: "#4e8cff",
    blueBg: "rgba(78,140,255,0.08)",
    accent: "#4e8cff",
  },
  light: {
    bg: "#f4f2ee",
    bgCard: "#ffffff",
    bgCardHover: "#f0ede8",
    bgInput: "#eae7e1",
    border: "#d9d5cd",
    borderLight: "#c8c3ba",
    text: "#1a1a1a",
    textMuted: "#5c5c5c",
    textDim: "#8c8880",
    green: "#0ea95a",
    greenBg: "rgba(14,169,90,0.08)",
    greenDim: "#0b8a48",
    red: "#d92b4a",
    redBg: "rgba(217,43,74,0.07)",
    redDim: "#b0233c",
    yellow: "#c88a10",
    yellowBg: "rgba(200,138,16,0.07)",
    yellowDim: "#a0700d",
    blue: "#2b6ce6",
    blueBg: "rgba(43,108,230,0.07)",
    accent: "#2b6ce6",
  },
};

const MACRO_DATA = [
  { label: "S&P 500", value: "5,287.42", change: "+0.34%", up: true },
  { label: "NASDAQ", value: "16,891.03", change: "-0.12%", up: false },
  { label: "VIX", value: "22.4", change: "+1.8", up: null, status: "elevated" },
  { label: "10Y Yield", value: "4.31%", change: "+0.03", up: null, status: "neutral" },
  { label: "DXY", value: "104.2", change: "-0.22%", up: false },
  { label: "Fed Rate", value: "4.50%", change: "—", up: null, status: "hold" },
];

const MACRO_SUMMARY = "Markets are cautiously risk-on this morning. S&P 500 futures are slightly positive despite an elevated VIX at 22.4, suggesting hedging activity beneath the surface. The 10-year yield ticked up to 4.31%, continuing its drift higher — watch the 4.40% level as potential resistance. DXY weakened slightly, which is modestly supportive for equities and commodities. No Fed action expected near-term, but Friday's PCE print could shift rate cut expectations. Overall environment: proceed with moderate conviction, favor quality over speculation.";

const PORTFOLIO = [
  { ticker: "NVDA", name: "Nvidia", price: 892.41, change: 2.34, score: 82, weight: "8.2%", sector: "Technology", signal: "green", miniSummary: "Strong momentum with RSI at 64. MACD bullish. Analyst revisions trending up. AI capex cycle intact.", coolingHrs: 0, velocity: +3.2, signals: { F: "green", T: "green", A: "green", S: "green", M: "yellow" } },
  { ticker: "MSFT", name: "Microsoft", price: 441.20, change: 0.87, score: 76, weight: "7.1%", sector: "Technology", signal: "green", miniSummary: "Steady compounder. Cloud revenue accelerating. Copilot monetization early but promising. Fairly valued at 33x forward.", coolingHrs: 0, velocity: +1.1, signals: { F: "green", T: "green", A: "green", S: "yellow", M: "yellow" } },
  { ticker: "VOO", name: "Vanguard S&P 500", price: 632.46, change: 0.34, score: null, weight: "15.0%", sector: "Broad Market", signal: "green", miniSummary: "Core holding. Market trending above 50-day and 200-day MAs. Breadth improving from Q1 lows.", coolingHrs: 0, velocity: 0, signals: null },
  { ticker: "AMZN", name: "Amazon", price: 198.33, change: -0.41, score: 71, weight: "5.8%", sector: "Consumer Disc.", signal: "green", miniSummary: "AWS reaccelerating. Ad business now $60B+ run rate. Retail margins expanding. Slight pullback is entry-level territory.", coolingHrs: 36, velocity: -0.8, signals: { F: "green", T: "yellow", A: "green", S: "green", M: "yellow" } },
  { ticker: "LLY", name: "Eli Lilly", price: 824.50, change: -1.22, score: 68, weight: "4.5%", sector: "Healthcare", signal: "yellow", miniSummary: "GLP-1 demand strong but valuation stretched at 62x forward. Supply concerns easing. Watch for competitive data from Novo.", coolingHrs: 0, velocity: -2.1, signals: { F: "yellow", T: "yellow", A: "green", S: "yellow", M: "yellow" } },
  { ticker: "JPM", name: "JPMorgan Chase", price: 247.80, change: 1.05, score: 74, weight: "4.2%", sector: "Financials", signal: "green", miniSummary: "Best-in-class bank. NII stable, capital markets revenue improving. Credit quality holding. Dividend yield 2.1%.", coolingHrs: 0, velocity: +0.5, signals: { F: "green", T: "green", A: "green", S: "yellow", M: "yellow" } },
  { ticker: "XOM", name: "Exxon Mobil", price: 118.92, change: 1.73, score: 65, weight: "3.5%", sector: "Energy", signal: "yellow", miniSummary: "Oil at $78 supportive but not exciting. Strong FCF and dividend. Pioneer integration on track. Macro is the swing factor.", coolingHrs: 0, velocity: -1.5, signals: { F: "green", T: "yellow", A: "yellow", S: "yellow", M: "red" } },
  { ticker: "QQQ", name: "Invesco Nasdaq-100", price: 487.15, change: -0.12, score: null, weight: "12.0%", sector: "Growth", signal: "green", miniSummary: "Tech-heavy growth exposure. Slightly extended short-term but trend intact. Mag-7 earnings driving index.", coolingHrs: 0, velocity: 0, signals: null },
  { ticker: "GOOGL", name: "Alphabet", price: 178.44, change: 0.62, score: 79, weight: "5.0%", sector: "Communication", signal: "green", miniSummary: "Search resilient despite AI headwinds. Cloud growing 28% YoY. Cheapest mega-cap on FCF yield. Buyback accelerating.", coolingHrs: 12, velocity: +2.8, signals: { F: "green", T: "green", A: "green", S: "green", M: "yellow" } },
  { ticker: "V", name: "Visa", price: 312.88, change: 0.45, score: 77, weight: "3.8%", sector: "Financials", signal: "green", miniSummary: "Payment volumes growing 8% cross-border. Regulatory risk priced in. Premium compounder with 17% EPS growth.", coolingHrs: 0, velocity: +0.3, signals: { F: "green", T: "green", A: "green", S: "green", M: "yellow" } },
  { ticker: "GLD", name: "SPDR Gold Trust", price: 228.40, change: 0.92, score: null, weight: "5.0%", sector: "Commodities", signal: "green", miniSummary: "Gold at all-time highs. Central bank buying sustained. Hedge performing as intended in volatile macro.", coolingHrs: 0, velocity: 0, signals: null },
  { ticker: "BND", name: "Vanguard Total Bond", price: 71.23, change: 0.08, score: null, weight: "8.0%", sector: "Fixed Income", signal: "yellow", miniSummary: "Yield at 4.17% attractive. Duration risk if rates rise further. Serving as portfolio ballast. Hold steady.", coolingHrs: 0, velocity: 0, signals: null },
];

const DETAIL_DATA = {
  NVDA: {
    ticker: "NVDA", name: "Nvidia Corporation", price: 892.41, change: 2.34, score: 82,
    marketCap: "$2.19T", pe: "38.2x", fwdPe: "29.4x", sector: "Technology",
    divYield: "0.03%", beta: 1.68, avgVol: "42.1M", yearHigh: "$974.94", yearLow: "$473.20",
    scores: {
      fundamentals: { score: 74, weight: 30, detail: "P/E premium to sector but justified by 94% revenue growth. FCF yield 2.1%. Debt-to-equity 0.41." },
      technicals: { score: 88, weight: 25, detail: "Price above 50-day and 200-day MA. RSI 64 (bullish, not overbought). MACD bullish crossover 3 days ago. Volume trending above average." },
      analyst: { score: 85, weight: 20, detail: "42 analysts covering. 38 Buy, 3 Hold, 1 Sell. 4 upgrades in past 30 days, 0 downgrades. Consensus PT $1,020 (+14% upside). EPS revisions: +8% in 60 days." },
      sentiment: { score: 78, weight: 15, detail: "News flow positive — GTC keynote well-received. Blackwell ramp confirmed by suppliers. No material negative catalysts. Put/call ratio 0.6 (bullish)." },
      macro: { score: 72, weight: 10, detail: "AI capex cycle intact but VIX elevated at 22. Rate environment neutral for growth. Export restriction risk to China remains an overhang." },
    },
    claudeSummary: "Nvidia remains the highest-conviction name in the portfolio with a composite score of 82. The technical picture is strong — price is well above both major moving averages with a fresh MACD bullish crossover, and RSI at 64 leaves room to run before hitting overbought territory. Fundamentally, the 38x trailing P/E looks expensive in isolation, but the forward multiple of 29x against 94% revenue growth makes it one of the more reasonable mega-cap valuations on a PEG basis.\n\nThe analyst community is overwhelmingly bullish with 38 of 42 analysts at Buy, and importantly, the revision trend is accelerating — four upgrades in the past month with consensus EPS estimates climbing 8% in 60 days. This kind of revision momentum has historically preceded further price appreciation.\n\nThe main risks are macro in nature: an elevated VIX suggests the broader market is pricing in uncertainty, and any escalation of China export restrictions could impact the data center revenue outlook. However, the Blackwell ramp appears on track based on supply chain checks, and the GTC announcements reinforced Nvidia's platform dominance.\n\nBottom line: No action needed. Hold the current 8.2% position. Would consider adding on any pullback below $840, which would represent a move to the 50-day MA.",
    recentNews: [
      { date: "Mar 21", headline: "Blackwell GPU shipments confirmed ahead of schedule by major cloud customers", sentiment: "positive" },
      { date: "Mar 19", headline: "Jensen Huang keynote at GTC highlights new Rubin architecture roadmap", sentiment: "positive" },
      { date: "Mar 17", headline: "Senate committee schedules hearing on AI chip export controls", sentiment: "negative" },
      { date: "Mar 15", headline: "Morgan Stanley raises NVDA price target to $1,100 from $950", sentiment: "positive" },
    ],
  }
};

// Generate mock price history — 3 months of data for NVDA
const generatePriceData = () => {
  const data = [];
  let price = 740;
  let ma50 = 720;
  let ma200 = 680;
  const startDate = new Date(2025, 11, 22); // Dec 22
  for (let i = 0; i < 65; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const volatility = (Math.random() - 0.45) * 18;
    price = Math.max(680, Math.min(920, price + volatility));
    ma50 += (price - ma50) * 0.04;
    ma200 += (price - ma200) * 0.01;
    const vol = Math.floor(28 + Math.random() * 30);
    data.push({
      date: `${d.getMonth()+1}/${d.getDate()}`,
      price: Math.round(price * 100) / 100,
      ma50: Math.round(ma50 * 100) / 100,
      ma200: Math.round(ma200 * 100) / 100,
      volume: vol,
    });
  }
  // Ensure last point matches current price
  if (data.length > 0) {
    data[data.length - 1].price = 892.41;
    data[data.length - 1].ma50 = 848.20;
    data[data.length - 1].ma200 = 724.50;
  }
  return data;
};

const generateScoreHistory = () => {
  const data = [];
  let score = 68;
  const startDate = new Date(2025, 11, 22);
  for (let i = 0; i < 65; i += 3) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    score = Math.max(40, Math.min(95, score + (Math.random() - 0.4) * 6));
    data.push({
      date: `${d.getMonth()+1}/${d.getDate()}`,
      score: Math.round(score),
      fundamentals: Math.round(60 + Math.random() * 20),
      technicals: Math.round(55 + Math.random() * 35),
      analyst: Math.round(70 + Math.random() * 20),
    });
  }
  if (data.length > 0) data[data.length - 1].score = 82;
  return data;
};

const PRICE_HISTORY = generatePriceData();
const SCORE_HISTORY = generateScoreHistory();

// Portfolio performance vs benchmark
const generatePortfolioPerf = () => {
  const data = [];
  let portfolio = 100000;
  let spy = 100000;
  const startDate = new Date(2025, 8, 22); // Sep 22, 2025 — 6 months
  for (let i = 0; i < 130; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    portfolio += portfolio * ((Math.random() - 0.46) * 0.016);
    spy += spy * ((Math.random() - 0.47) * 0.012);
    data.push({
      date: `${d.getMonth()+1}/${d.getDate()}`,
      portfolio: Math.round(portfolio),
      spy: Math.round(spy),
    });
  }
  return data;
};
const PORTFOLIO_PERF = generatePortfolioPerf();

const SECTOR_ALLOCATION = [
  { sector: "Technology", pct: 28.3, color: "#4e8cff" },
  { sector: "Broad Market", pct: 27.0, color: "#00d26a" },
  { sector: "Communication", pct: 5.0, color: "#c77dff" },
  { sector: "Consumer Disc.", pct: 5.8, color: "#ff9f43" },
  { sector: "Financials", pct: 8.0, color: "#ffb224" },
  { sector: "Healthcare", pct: 4.5, color: "#ff6b81" },
  { sector: "Energy", pct: 3.5, color: "#ee5a24" },
  { sector: "Fixed Income", pct: 8.0, color: "#7c8aaa" },
  { sector: "Commodities", pct: 5.0, color: "#f9ca24" },
  { sector: "Growth", pct: 4.9, color: "#26de81" },
];

const ALERTS = [
  { type: "score_drop", icon: "▼", color: "red", ticker: "XOM", message: "Score dropped to 65 (was 72 last week)", time: "5:45 AM PT", priority: "action" },
  { type: "entry_signal", icon: "◎", color: "green", ticker: "PANW", message: "Crossed above score 75 entry threshold", time: "5:45 AM PT", priority: "action" },
  { type: "sector_warn", icon: "⚖", color: "yellow", ticker: null, message: "Technology allocation at 28.3% — approaching 30% cap", time: "5:45 AM PT", priority: "monitor" },
  { type: "revision", icon: "↑", color: "green", ticker: "GOOGL", message: "3 analyst upgrades in past 7 days", time: "5:30 AM PT", priority: "monitor" },
  { type: "news", icon: "!", color: "yellow", ticker: "NVDA", message: "Senate export control hearing scheduled for next week", time: "5:30 AM PT", priority: "monitor" },
];

const WATCHLIST = [
  { ticker: "PANW", name: "Palo Alto Networks", price: 188.42, change: 1.84, score: 75, sector: "Technology", signal: "green", daysAbove: 2, threshold: 75 },
  { ticker: "SMH", name: "VanEck Semiconductor", price: 267.33, change: 0.92, score: null, sector: "Semiconductors", signal: "green", daysAbove: null, threshold: null },
  { ticker: "ORCL", name: "Oracle", price: 192.18, change: -0.65, score: 70, sector: "Technology", signal: "green", daysAbove: 12, threshold: 70 },
  { ticker: "CRM", name: "Salesforce", price: 312.44, change: 0.33, score: 67, sector: "Technology", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "ABBV", name: "AbbVie", price: 194.22, change: 0.71, score: 72, sector: "Healthcare", signal: "green", daysAbove: 8, threshold: 70 },
  { ticker: "MA", name: "Mastercard", price: 542.10, change: 0.38, score: 76, sector: "Financials", signal: "green", daysAbove: 14, threshold: 70 },
  { ticker: "GS", name: "Goldman Sachs", price: 587.33, change: 1.22, score: 69, sector: "Financials", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "TSLA", name: "Tesla", price: 178.92, change: -3.41, score: 45, sector: "Consumer Disc.", signal: "red", daysAbove: 0, threshold: 70 },
  { ticker: "NFLX", name: "Netflix", price: 948.20, change: 1.12, score: 73, sector: "Communication", signal: "green", daysAbove: 6, threshold: 70 },
  { ticker: "DE", name: "Deere & Co", price: 412.88, change: -0.28, score: 62, sector: "Industrials", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "COP", name: "ConocoPhillips", price: 108.44, change: 2.11, score: 66, sector: "Energy", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "COST", name: "Costco", price: 912.33, change: 0.14, score: 71, sector: "Consumer Staples", signal: "green", daysAbove: 4, threshold: 70 },
  { ticker: "PLD", name: "Prologis", price: 118.90, change: 0.52, score: 64, sector: "Real Estate", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "LIN", name: "Linde", price: 468.22, change: 0.88, score: 73, sector: "Materials", signal: "green", daysAbove: 9, threshold: 70 },
  { ticker: "NEE", name: "NextEra Energy", price: 78.44, change: 0.33, score: 68, sector: "Utilities", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "VST", name: "Vistra", price: 142.88, change: 2.44, score: 77, sector: "Utilities", signal: "green", daysAbove: 11, threshold: 70 },
  { ticker: "HON", name: "Honeywell", price: 212.55, change: -0.18, score: 63, sector: "Industrials", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "PG", name: "Procter & Gamble", price: 168.92, change: 0.22, score: 69, sector: "Consumer Staples", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "AMT", name: "American Tower", price: 198.44, change: 0.67, score: 66, sector: "Real Estate", signal: "yellow", daysAbove: 0, threshold: 70 },
  { ticker: "GDX", name: "VanEck Gold Miners", price: 42.18, change: 1.92, score: null, sector: "Gold Miners", signal: "green", daysAbove: null, threshold: null },
];

const RESEARCH = [
  { ticker: "PLTR", name: "Palantir", price: 78.44, change: 3.22, sector: "Technology", rsi: 71, macd: "bullish", aboveMa50: true, pe: 168.2, vol: "48.2M" },
  { ticker: "CRWD", name: "CrowdStrike", price: 342.18, change: 1.14, sector: "Technology", rsi: 58, macd: "bullish", aboveMa50: true, pe: 482.1, vol: "6.8M" },
  { ticker: "COIN", name: "Coinbase", price: 218.90, change: -2.84, sector: "Financials", rsi: 42, macd: "bearish", aboveMa50: false, pe: 22.4, vol: "12.1M" },
  { ticker: "SNOW", name: "Snowflake", price: 168.33, change: 0.72, sector: "Technology", rsi: 53, macd: "neutral", aboveMa50: true, pe: null, vol: "5.4M" },
  { ticker: "UBER", name: "Uber", price: 74.22, change: 0.88, sector: "Consumer Disc.", rsi: 61, macd: "bullish", aboveMa50: true, pe: 28.6, vol: "18.9M" },
  { ticker: "ANET", name: "Arista Networks", price: 98.44, change: 1.33, sector: "Technology", rsi: 66, macd: "bullish", aboveMa50: true, pe: 42.8, vol: "4.2M" },
  { ticker: "SQ", name: "Block Inc", price: 68.12, change: -1.44, sector: "Financials", rsi: 38, macd: "bearish", aboveMa50: false, pe: 52.1, vol: "9.1M" },
  { ticker: "DDOG", name: "Datadog", price: 128.77, change: 0.55, sector: "Technology", rsi: 55, macd: "neutral", aboveMa50: true, pe: 288.4, vol: "4.8M" },
  { ticker: "ENPH", name: "Enphase Energy", price: 72.33, change: 2.91, sector: "Energy", rsi: 48, macd: "bullish", aboveMa50: false, pe: 45.2, vol: "5.6M" },
  { ticker: "ABNB", name: "Airbnb", price: 142.88, change: -0.33, sector: "Consumer Disc.", rsi: 50, macd: "neutral", aboveMa50: true, pe: 34.8, vol: "7.2M" },
  { ticker: "MELI", name: "MercadoLibre", price: 1844.20, change: 1.62, sector: "Consumer Disc.", rsi: 63, macd: "bullish", aboveMa50: true, pe: 58.4, vol: "0.4M" },
  { ticker: "NET", name: "Cloudflare", price: 108.44, change: 0.92, sector: "Technology", rsi: 57, macd: "bullish", aboveMa50: true, pe: null, vol: "6.1M" },
];

// Styles
const font = "'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace";
const fontSans = "'IBM Plex Sans', -apple-system, sans-serif";

export default function LifeMarkets() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [watchlistSort, setWatchlistSort] = useState("score");
  const [tickersSubTab, setTickersSubTab] = useState("watchlist");
  const [portfolioSubTab, setPortfolioSubTab] = useState("summary");
  const [analystView, setAnalystView] = useState("templates");
  const [analystResult, setAnalystResult] = useState(null);
  const [analystInput, setAnalystInput] = useState("");
  const [addTickerOpen, setAddTickerOpen] = useState(false);
  const [addTickerValue, setAddTickerValue] = useState("");
  const [addTickerTarget, setAddTickerTarget] = useState("research");
  const [addTickerConfirm, setAddTickerConfirm] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [tradeLogOpen, setTradeLogOpen] = useState(false);
  const [tradeLogStep, setTradeLogStep] = useState(1);
  const [trade, setTrade] = useState({ action: "buy", ticker: "", shares: "", price: "", date: new Date().toISOString().split("T")[0], thesis: "" });
  const [tradeConfirmed, setTradeConfirmed] = useState(false);
  const [chartRange, setChartRange] = useState("3M");
  const [chartOverlay, setChartOverlay] = useState({ ma50: true, ma200: true, volume: true });
  const [theme, setTheme] = useState("dark");
  const [settingsOpen, setSettingsOpen] = useState({ appearance: false, portfolio: false, scoring: false, data: false });
  const [weights, setWeights] = useState({ fundamentals: 30, technicals: 25, analyst: 20, sentiment: 15, macro: 10 });
  const [portfolioSettings, setPortfolioSettings] = useState({
    maxStock: 10, maxEtf: 20, maxSector: 25, minPositions: 15, maxPositions: 25,
    equityMin: 70, equityMax: 85, bondMin: 10, bondMax: 20, altMin: 5, altMax: 10,
    targetBeta: 1.1, cashFloor: 10, rebalanceTrigger: "threshold", rebalanceThreshold: 5,
    subSectorCap: 15, correlationWarn: true,
  });

  // Data source health — in production this would be live; mockup toggles for demo
  const [dataHealth, setDataHealth] = useState({
    sources: [
      { name: "Yahoo Finance", lastSync: "5:30 AM PT", ok: true },
      { name: "FRED", lastSync: "5:30 AM PT", ok: true },
      { name: "SEC EDGAR", lastSync: "5:30 AM PT", ok: true },
      { name: "Finnhub", lastSync: "4h ago", ok: false },
      { name: "Alpha Vantage", lastSync: "5:32 AM PT", ok: true },
      { name: "Claude", lastSync: "6:00 AM PT", ok: true },
    ],
    bannerDismissed: false,
  });

  const staleCount = dataHealth.sources.filter(s => !s.ok).length;
  const healthStatus = staleCount === 0 ? "healthy" : staleCount <= 1 ? "warn" : "critical";

  const COLORS = THEMES[theme];

  const getSignalColor = (signal) => {
    if (signal === "green") return COLORS.green;
    if (signal === "red") return COLORS.red;
    return COLORS.yellow;
  };

  const getSignalBg = (signal) => {
    if (signal === "green") return COLORS.greenBg;
    if (signal === "red") return COLORS.redBg;
    return COLORS.yellowBg;
  };

  const getChangeColor = (change) => {
    if (change > 0) return COLORS.green;
    if (change < 0) return COLORS.red;
    return COLORS.textMuted;
  };

  const formatChange = (change) => {
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const getScoreBarColor = (score) => {
    if (score >= 70) return COLORS.green;
    if (score >= 50) return COLORS.yellow;
    return COLORS.red;
  };

  // ---- DETAIL VIEW ----
  if (selectedTicker) {
    const detail = DETAIL_DATA[selectedTicker];
    if (!detail) {
      // Fallback for tickers without full detail data
      const item = [...PORTFOLIO, ...WATCHLIST].find(i => i.ticker === selectedTicker);
      return (
        <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: fontSans, maxWidth: 430, margin: "0 auto" }}>
          <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}` }}>
            <button onClick={() => setSelectedTicker(null)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 15, fontFamily: fontSans, cursor: "pointer", padding: 0 }}>← Back</button>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 18, color: COLORS.text }}>{item?.ticker}</span>
            <span style={{ color: COLORS.textMuted, fontSize: 13 }}>{item?.name}</span>
          </div>
          <div style={{ padding: 40, textAlign: "center", color: COLORS.textDim }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔨</div>
            <div style={{ fontSize: 15, fontFamily: fontSans }}>Detail view for {selectedTicker}</div>
            <div style={{ fontSize: 13, marginTop: 8, color: COLORS.textDim }}>Full data will populate when connected to live APIs</div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: fontSans, maxWidth: 430, margin: "0 auto" }}>
        {/* Detail Header */}
        <div style={{ padding: "14px 20px 12px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${COLORS.border}` }}>
          <button onClick={() => setSelectedTicker(null)} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 14, fontFamily: fontSans, cursor: "pointer", padding: "4px 0" }}>←</button>
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: COLORS.green,
            boxShadow: `0 0 8px ${COLORS.green}40`,
          }} />
          <span style={{ fontFamily: font, fontWeight: 700, fontSize: 18, color: COLORS.text }}>{detail.ticker}</span>
          <span style={{ color: COLORS.textMuted, fontSize: 13, flex: 1 }}>{detail.name}</span>
          <div style={{
            padding: "4px 10px", borderRadius: 6, fontFamily: font, fontSize: 14, fontWeight: 700,
            background: COLORS.greenBg, color: COLORS.green,
          }}>{detail.score}</div>
        </div>

        <div style={{ overflowY: "auto", height: "calc(100vh - 52px)", paddingBottom: 30 }}>
          {/* Price Header */}
          <div style={{ padding: "20px 20px 16px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: font, fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>${detail.price.toFixed(2)}</span>
              <span style={{ fontFamily: font, fontSize: 16, color: getChangeColor(detail.change), fontWeight: 600 }}>{formatChange(detail.change)}</span>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
              {[
                ["Mkt Cap", detail.marketCap], ["P/E", detail.pe], ["Fwd P/E", detail.fwdPe],
                ["Yield", detail.divYield], ["Beta", detail.beta], ["Avg Vol", detail.avgVol],
              ].map(([label, val]) => (
                <div key={label} style={{ minWidth: 70 }}>
                  <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
                  <div style={{ fontFamily: font, fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
            {/* 52-Week Range Bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8 }}>52-Week Range</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: font, fontSize: 10, color: COLORS.red }}>{detail.yearLow}</span>
                <div style={{ flex: 1, height: 4, background: COLORS.bgInput, borderRadius: 2, position: "relative" }}>
                  {/* Filled portion */}
                  {(() => {
                    const low = parseFloat(detail.yearLow.replace("$", ""));
                    const high = parseFloat(detail.yearHigh.replace("$", ""));
                    const pct = ((detail.price - low) / (high - low)) * 100;
                    return (
                      <>
                        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.red}, ${COLORS.yellow}, ${COLORS.green})`, borderRadius: 2, opacity: 0.6 }} />
                        <div style={{
                          position: "absolute", top: -3, left: `${pct}%`, transform: "translateX(-50%)",
                          width: 10, height: 10, borderRadius: "50%", background: COLORS.accent,
                          border: `2px solid ${COLORS.bg}`, boxShadow: `0 0 6px ${COLORS.accent}50`,
                        }} />
                      </>
                    );
                  })()}
                </div>
                <span style={{ fontFamily: font, fontSize: 10, color: COLORS.green }}>{detail.yearHigh}</span>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div style={{ margin: "0 20px 16px", padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            {/* Time Range Toggles */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600 }}>Price History</span>
              <div style={{ display: "flex", gap: 3 }}>
                {["1W", "1M", "3M", "6M", "1Y", "5Y"].map(r => (
                  <button key={r} onClick={() => setChartRange(r)} style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 10, fontFamily: font, cursor: "pointer",
                    border: `1px solid ${chartRange === r ? COLORS.accent : "transparent"}`,
                    background: chartRange === r ? COLORS.blueBg : "transparent",
                    color: chartRange === r ? COLORS.accent : COLORS.textDim,
                  }}>{r}</button>
                ))}
              </div>
            </div>

            {/* Main Price Line + MAs */}
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={PRICE_HISTORY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.textDim }} tickLine={false} axisLine={{ stroke: COLORS.border }} interval={Math.floor(PRICE_HISTORY.length / 5)} />
                <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fontSize: 9, fill: COLORS.textDim }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, fontFamily: font, padding: "8px 12px" }}
                  labelStyle={{ color: COLORS.textDim, marginBottom: 4 }}
                  itemStyle={{ padding: 0 }}
                />
                {chartOverlay.ma200 && <Line type="monotone" dataKey="ma200" stroke={COLORS.red} strokeWidth={1} dot={false} strokeDasharray="4 4" name="200-Day MA" />}
                {chartOverlay.ma50 && <Line type="monotone" dataKey="ma50" stroke={COLORS.yellow} strokeWidth={1} dot={false} strokeDasharray="4 4" name="50-Day MA" />}
                <Area type="monotone" dataKey="price" stroke={COLORS.accent} strokeWidth={2} fill={COLORS.blueBg} fillOpacity={0.5} name="Price" dot={false} activeDot={{ r: 4, fill: COLORS.accent, stroke: COLORS.bg, strokeWidth: 2 }} />
                {chartOverlay.volume && <Bar dataKey="volume" fill={COLORS.textDim} opacity={0.15} yAxisId="volume" name="Vol (M)" />}
                <YAxis yAxisId="volume" orientation="right" hide domain={[0, 200]} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Overlay Toggles */}
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              {[
                { key: "ma50", label: "50-Day MA", color: COLORS.yellow },
                { key: "ma200", label: "200-Day MA", color: COLORS.red },
                { key: "volume", label: "Volume", color: COLORS.textDim },
              ].map(o => (
                <button key={o.key} onClick={() => setChartOverlay(p => ({ ...p, [o.key]: !p[o.key] }))} style={{
                  display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                  <div style={{
                    width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${o.color}`,
                    background: chartOverlay[o.key] ? o.color + "30" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {chartOverlay[o.key] && <div style={{ width: 6, height: 6, borderRadius: 1.5, background: o.color }} />}
                  </div>
                  <span style={{ fontSize: 10, color: chartOverlay[o.key] ? COLORS.textMuted : COLORS.textDim }}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Score History Chart */}
          <div style={{ margin: "0 20px 16px", padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600 }}>Score History</span>
              <span style={{ fontFamily: font, fontSize: 12, color: COLORS.green, fontWeight: 600 }}>Current: 82</span>
            </div>

            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={SCORE_HISTORY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: COLORS.textDim }} tickLine={false} axisLine={{ stroke: COLORS.border }} interval={Math.floor(SCORE_HISTORY.length / 5)} />
                <YAxis domain={[30, 100]} tick={{ fontSize: 9, fill: COLORS.textDim }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, fontFamily: font, padding: "8px 12px" }}
                  labelStyle={{ color: COLORS.textDim, marginBottom: 4 }}
                />
                <ReferenceLine y={70} stroke={COLORS.green} strokeDasharray="3 3" strokeOpacity={0.4} />
                <ReferenceLine y={50} stroke={COLORS.yellow} strokeDasharray="3 3" strokeOpacity={0.4} />
                <Area type="monotone" dataKey="score" stroke={COLORS.green} strokeWidth={2} fill={COLORS.greenBg} fillOpacity={0.6} dot={false} activeDot={{ r: 4, fill: COLORS.green, stroke: COLORS.bg, strokeWidth: 2 }} name="Composite" />
              </AreaChart>
            </ResponsiveContainer>

            {/* Score zone legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
              {[
                { label: "Bullish (70+)", color: COLORS.green },
                { label: "Neutral (50-70)", color: COLORS.yellow },
                { label: "Bearish (<50)", color: COLORS.red },
              ].map(z => (
                <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 2, background: z.color, borderRadius: 1, opacity: 0.6 }} />
                  <span style={{ fontSize: 9, color: COLORS.textDim }}>{z.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Pattern + Composite Score */}
          <div style={{ margin: "0 20px 16px", padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            {/* Signal Pattern Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>Signal Pattern</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { key: "F", label: "Fund", sig: "green" },
                    { key: "T", label: "Tech", sig: "green" },
                    { key: "A", label: "Analyst", sig: "green" },
                    { key: "S", label: "Sent", sig: "green" },
                    { key: "M", label: "Macro", sig: "yellow" },
                  ].map(s => (
                    <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: s.sig === "green" ? COLORS.green : s.sig === "red" ? COLORS.red : COLORS.yellow,
                        boxShadow: `0 0 6px ${s.sig === "green" ? COLORS.green : s.sig === "red" ? COLORS.red : COLORS.yellow}30`,
                      }} />
                      <span style={{ fontSize: 8, color: COLORS.textDim, letterSpacing: 0.3 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <span style={{ fontFamily: font, fontSize: 30, fontWeight: 700, color: COLORS.green, letterSpacing: -1 }}>{detail.score}</span>
                  <span style={{ fontSize: 13, color: COLORS.textDim }}>/100</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2 }}>
                  <span style={{ fontFamily: font, fontSize: 11, color: COLORS.green, fontWeight: 600 }}>▲ +3.2/wk</span>
                  <span style={{ fontSize: 9, color: COLORS.textDim }}>velocity</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 10 }}>Category Breakdown</div>

            {/* Score Breakdown */}
            {Object.entries(detail.scores).map(([key, data]) => {
              const labels = { fundamentals: "Fundamentals", technicals: "Technicals", analyst: "Analyst Consensus", sentiment: "News & Sentiment", macro: "Macro Context" };
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{labels[key]} <span style={{ color: COLORS.textDim }}>({data.weight}%)</span></span>
                    <span style={{ fontFamily: font, fontSize: 12, color: getScoreBarColor(data.score) }}>{data.score}</span>
                  </div>
                  <div style={{ height: 4, background: COLORS.bgInput, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${data.score}%`, background: getScoreBarColor(data.score), borderRadius: 2, transition: "width 0.6s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 4, lineHeight: 1.5 }}>{data.detail}</div>
                </div>
              );
            })}
          </div>

          {/* Claude Summary Card */}
          <div style={{ margin: "0 20px 16px", padding: 2, background: `linear-gradient(135deg, ${COLORS.accent}40, #7c5cff40)`, borderRadius: 12 }}>
            <div style={{ padding: 16, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgCardHover} 100%)`, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>C</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Claude Analysis</span>
                <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>Updated 7:05 AM PT</span>
              </div>
            {detail.claudeSummary.split("\n\n").map((para, i) => (
              <p key={i} style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.65, margin: i === 0 ? 0 : "12px 0 0 0" }}>{para}</p>
            ))}
            </div>
          </div>

          {/* Recent News */}
          <div style={{ margin: "0 20px 20px", padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 12 }}>Recent News</div>
            {detail.recentNews.map((news, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", marginTop: 6, flexShrink: 0,
                  background: news.sentiment === "positive" ? COLORS.green : news.sentiment === "negative" ? COLORS.red : COLORS.yellow,
                }} />
                <div>
                  <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.5 }}>{news.headline}</div>
                  <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 3 }}>{news.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- MAIN APP ----
  const portfolioTickers = new Set(PORTFOLIO.map(p => p.ticker));
  const combinedWatchlist = [
    ...PORTFOLIO.map(p => ({ ...p, inPortfolio: true })),
    ...WATCHLIST.filter(w => !portfolioTickers.has(w.ticker)).map(w => ({ ...w, inPortfolio: false })),
  ];
  const sortedWatchlist = [...combinedWatchlist].sort((a, b) => {
    if (watchlistSort === "score") return (b.score || 0) - (a.score || 0);
    if (watchlistSort === "change") return b.change - a.change;
    return a.ticker.localeCompare(b.ticker);
  });

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", color: COLORS.text, fontFamily: fontSans, maxWidth: 430, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{`
        @keyframes heartbeat {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes heartbeatSlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
        @keyframes bannerSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .macro-scroll::-webkit-scrollbar { display: none; }
        @keyframes tickerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-tape {
          display: flex;
          animation: tickerScroll 5s linear infinite;
        }
        .ticker-tape:hover, .ticker-tape:active {
          animation-play-state: paused;
        }
      `}</style>

      {/* Light mode card shadows */}
      {theme === "light" && (
        <style>{`
          [data-card] { box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04) !important; border-color: rgba(0,0,0,0.06) !important; }
        `}</style>
      )}

      {/* Header */}
      <div style={{ padding: "16px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, width: 16, height: 16 }}>
              {[COLORS.green, COLORS.accent, COLORS.yellow, COLORS.red].map((c, i) => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: 1.5, background: c }} />
              ))}
            </div>
            <span style={{ fontFamily: font, fontWeight: 700, fontSize: 16, letterSpacing: 1.5 }}>LIFE</span>
            <span style={{ fontSize: 10, color: COLORS.textDim, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", marginTop: 1 }}>Markets</span>
          </div>
        </div>
        <div style={{ fontFamily: font, fontSize: 11, color: COLORS.textDim, display: "flex", alignItems: "center", gap: 6 }}>
          <span>Mar 22, 2026</span>
          <span style={{ color: COLORS.textDim }}>·</span>
          <span style={{ color: COLORS.green }}>Market Open</span>
          {/* Heartbeat Dot */}
          <button
            onClick={() => setDataHealth(h => ({ ...h, bannerDismissed: false }))}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 2, position: "relative", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
            title={healthStatus === "healthy" ? "All sources current" : `${staleCount} source${staleCount > 1 ? "s" : ""} stale`}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: healthStatus === "healthy" ? COLORS.green : healthStatus === "warn" ? COLORS.yellow : COLORS.red,
              animation: healthStatus === "healthy" ? "heartbeat 2s ease-in-out infinite" : healthStatus === "warn" ? "heartbeatSlow 3s ease-in-out infinite" : "none",
              boxShadow: `0 0 ${healthStatus === "healthy" ? 6 : healthStatus === "warn" ? 8 : 10}px ${healthStatus === "healthy" ? COLORS.green : healthStatus === "warn" ? COLORS.yellow : COLORS.red}50`,
            }} />
          </button>
        </div>
      </div>

      {/* Ghost Banner — only visible when a source is stale/failed */}
      {staleCount > 0 && !dataHealth.bannerDismissed && (
        <div style={{
          margin: "0 20px 4px", padding: "8px 12px", borderRadius: 8, display: "flex", alignItems: "center", gap: 8,
          background: healthStatus === "warn" ? COLORS.yellowBg : COLORS.redBg,
          border: `1px solid ${healthStatus === "warn" ? COLORS.yellow : COLORS.red}25`,
          animation: "bannerSlide 0.3s ease-out",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: healthStatus === "warn" ? COLORS.yellow : COLORS.red,
          }} />
          <div style={{ flex: 1 }}>
            {dataHealth.sources.filter(s => !s.ok).map((s, i) => (
              <span key={s.name} style={{ fontSize: 11, color: healthStatus === "warn" ? COLORS.yellow : COLORS.red }}>
                {i > 0 && " · "}{s.name} last synced {s.lastSync}
              </span>
            ))}
          </div>
          <button
            onClick={() => setDataHealth(h => ({ ...h, bannerDismissed: true }))}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", color: COLORS.textDim, fontSize: 14, lineHeight: 1 }}
          >×</button>
        </div>
      )}

      {/* Persistent Ticker Tape */}
      <div style={{ position: "relative", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}`, background: COLORS.bgCard, overflow: "hidden" }}>
        {/* Left fade */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 28, background: `linear-gradient(90deg, ${COLORS.bgCard}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        {/* Right fade */}
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 28, background: `linear-gradient(-90deg, ${COLORS.bgCard}, transparent)`, zIndex: 2, pointerEvents: "none" }} />
        <div className="ticker-tape" style={{ gap: 0, whiteSpace: "nowrap", cursor: "default" }}>
          {[...MACRO_DATA, ...MACRO_DATA].map((m, i) => (
            <div key={`${m.label}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 20px", borderRight: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.6 }}>{m.label}</span>
              <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.text }}>{m.value}</span>
              <span style={{
                fontFamily: font, fontSize: 11, fontWeight: 600,
                color: m.up === true ? COLORS.green : m.up === false ? COLORS.red : m.status === "elevated" ? COLORS.yellow : COLORS.textDim,
              }}>{m.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>

        {/* ===== HOME TAB (single scroll) ===== */}
        {activeTab === "home" && (
          <div style={{ padding: "16px 20px" }}>

            {/* Daily Verdict */}
            <div style={{
              padding: 16, borderRadius: 10, marginBottom: 12,
              background: COLORS.bgCard,
              borderLeft: `4px solid ${COLORS.green}`,
              border: `1px solid ${COLORS.green}25`,
              borderLeftWidth: 4,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.green, boxShadow: `0 0 10px ${COLORS.green}40` }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>Hold steady</span>
                <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>Daily Verdict</span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.65 }}>
                No portfolio changes recommended today. All positions are within allocation rules and score thresholds. NVDA reports earnings Wednesday — recommend waiting until after the report before any tech adjustments. AMZN and GOOGL are in cooling periods from recent trades.
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                {[
                  { label: "Actionable alerts", value: ALERTS.filter(a => a.priority === "action").length, color: COLORS.yellow },
                  { label: "In cooling", value: PORTFOLIO.filter(p => p.coolingHrs > 0).length, color: COLORS.accent },
                  { label: "Catalysts this week", value: "3", color: COLORS.textMuted },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: font, fontSize: 12, fontWeight: 700, color: s.color }}>{s.value}</span>
                    <span style={{ fontSize: 9, color: COLORS.textDim }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Morning Briefing */}
            <div style={{
              padding: 16, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgCardHover} 100%)`,
              borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, marginBottom: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>C</div>
                <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.accent, fontWeight: 600 }}>Morning Briefing</span>
                <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>6:00 AM PT</span>
              </div>
              {MACRO_SUMMARY.split(". ").reduce((acc, sentence, i, arr) => {
                const paraIndex = Math.floor(i / 2);
                if (!acc[paraIndex]) acc[paraIndex] = "";
                acc[paraIndex] += sentence + (i < arr.length - 1 ? ". " : "");
                return acc;
              }, []).map((para, i) => (
                <p key={i} style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7, margin: i === 0 ? 0 : "12px 0 0 0" }}>{para}</p>
              ))}
            </div>

            {/* Quick Macro Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              {MACRO_DATA.map(m => (
                <div key={m.label} style={{ padding: "10px 12px", background: COLORS.bgCard, borderRadius: 8, border: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: COLORS.text }}>{m.value}</span>
                    <span style={{
                      fontFamily: font, fontSize: 10,
                      color: m.up === true ? COLORS.green : m.up === false ? COLORS.red : m.status === "elevated" ? COLORS.yellow : COLORS.textDim,
                    }}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Catalysts */}
            <div style={{ padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 10 }}>Upcoming Catalysts</div>
              {[
                { type: "earnings", ticker: "NVDA", event: "Q4 Earnings Report", date: "Mar 26 (Wed)", daysAway: 4, detail: "AMC · Est $0.89 · Avg move ±8%", color: COLORS.accent },
                { type: "fed", ticker: null, event: "FOMC Minutes Released", date: "Mar 25 (Tue)", daysAway: 3, detail: "Could shift rate cut expectations", color: COLORS.yellow },
                { type: "earnings", ticker: "CRM", event: "Q4 Earnings Report", date: "Mar 27 (Thu)", daysAway: 5, detail: "AMC · Est $2.61 · Watchlist name", color: COLORS.accent },
                { type: "data", ticker: null, event: "PCE Inflation Data", date: "Mar 28 (Fri)", daysAway: 6, detail: "Fed's preferred inflation gauge", color: COLORS.yellow },
                { type: "ex-div", ticker: "JPM", event: "Ex-Dividend Date", date: "Mar 29 (Mon)", daysAway: 7, detail: "$1.15/share · 2.1% yield", color: COLORS.green },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                  <div style={{
                    minWidth: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 700, flexShrink: 0, textTransform: "uppercase",
                    background: c.color + "15", color: c.color, letterSpacing: 0.3,
                  }}>{c.daysAway}d</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500, lineHeight: 1.4 }}>
                      {c.ticker && <span style={{ fontFamily: font, fontWeight: 700, marginRight: 5 }}>{c.ticker}</span>}
                      {c.event}
                    </div>
                    <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>{c.date} · {c.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Items */}
            <div style={{ padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600 }}>Action Items</span>
                <span style={{ fontFamily: font, fontSize: 10, padding: "1px 6px", borderRadius: 6, background: COLORS.yellowBg, color: COLORS.yellow, fontWeight: 700 }}>{ALERTS.filter(a => a.priority === "action").length} actionable</span>
                <span style={{ fontSize: 10, color: COLORS.textDim }}>· {ALERTS.filter(a => a.priority === "monitor").length} monitoring</span>
              </div>

              {/* Actionable */}
              {ALERTS.filter(a => a.priority === "action").map((alert, i) => (
                <div key={`a-${i}`} style={{
                  padding: "12px 14px", marginBottom: 6, background: COLORS.bgInput, borderRadius: 8,
                  borderLeft: `3px solid ${alert.color === "red" ? COLORS.red : alert.color === "green" ? COLORS.green : COLORS.yellow}`,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      background: alert.color === "red" ? COLORS.redBg : alert.color === "green" ? COLORS.greenBg : COLORS.yellowBg,
                      color: alert.color === "red" ? COLORS.red : alert.color === "green" ? COLORS.green : COLORS.yellow,
                    }}>{alert.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.5, fontWeight: 500 }}>
                        {alert.ticker && <span style={{ fontFamily: font, fontWeight: 700, marginRight: 5 }}>{alert.ticker}</span>}
                        {alert.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Monitor */}
              {ALERTS.filter(a => a.priority === "monitor").map((alert, i) => (
                <div key={`m-${i}`} style={{
                  padding: "10px 14px", marginBottom: 4, background: COLORS.bgInput, borderRadius: 8, opacity: 0.6,
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.textDim }}>{alert.icon}</span>
                    <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.4 }}>
                      {alert.ticker && <span style={{ fontFamily: font, fontWeight: 700, marginRight: 4 }}>{alert.ticker}</span>}
                      {alert.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== PORTFOLIO TAB ===== */}
        {activeTab === "portfolio" && (
          <>
            {/* Portfolio Sub-Tabs */}
            <div style={{ display: "flex", gap: 0, padding: "0 20px", background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}` }}>
              {[
                { id: "summary", label: "Summary" },
                { id: "positions", label: "Positions" },
                { id: "performance", label: "Performance" },
              ].map(sub => (
                <button key={sub.id} onClick={() => setPortfolioSubTab(sub.id)} style={{
                  flex: 1, padding: "11px 4px 10px", background: "none", cursor: "pointer",
                  border: "none", borderBottom: `3px solid ${portfolioSubTab === sub.id ? COLORS.accent : "transparent"}`,
                  color: portfolioSubTab === sub.id ? COLORS.text : COLORS.textDim,
                  fontSize: 11, fontWeight: portfolioSubTab === sub.id ? 700 : 500, letterSpacing: 0.3, transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {sub.label}
                </button>
              ))}
            </div>

            {/* ---- SUMMARY ---- */}
            {portfolioSubTab === "summary" && (
              <div style={{ padding: "16px 20px" }}>
                {/* Value & P&L */}
                <div style={{ padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Portfolio Value</div>
                      <div style={{ fontFamily: font, fontSize: 38, fontWeight: 700, color: COLORS.text, letterSpacing: -1 }}>$248,412</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                        <span style={{ fontFamily: font, fontSize: 15, color: COLORS.green, fontWeight: 600 }}>+$1,842.30</span>
                        <span style={{ fontFamily: font, fontSize: 13, color: COLORS.green }}>+0.75%</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>today</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                        <div>
                          <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase" }}>All-time</div>
                          <div style={{ fontFamily: font, fontSize: 14, color: COLORS.green, fontWeight: 600 }}>+18.4%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase" }}>vs SPY</div>
                          <div style={{ fontFamily: font, fontSize: 14, color: COLORS.green, fontWeight: 600 }}>+2.1%</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase" }}>Cash Reserve</div>
                        <div style={{ fontFamily: font, fontSize: 14, color: COLORS.accent, fontWeight: 600 }}>12.4%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sector Allocation */}
                <div style={{ padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 14 }}>Sector Allocation</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
                      <svg viewBox="0 0 36 36" style={{ width: 110, height: 110, transform: "rotate(-90deg)" }}>
                        {(() => {
                          let offset = 0;
                          return SECTOR_ALLOCATION.map((s, i) => {
                            const dash = s.pct;
                            const gap = 100 - dash;
                            const el = (
                              <circle key={i} cx="18" cy="18" r="14" fill="none" stroke={s.color} strokeWidth="3.5"
                                strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset} opacity={0.8} />
                            );
                            offset += dash;
                            return el;
                          });
                        })()}
                      </svg>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                        <div style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: COLORS.text }}>12</div>
                        <div style={{ fontSize: 9, color: COLORS.textDim }}>positions</div>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {SECTOR_ALLOCATION.map(s => (
                        <div key={s.sector} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, opacity: 0.8 }} />
                            <span style={{ fontSize: 10, color: COLORS.textMuted }}>{s.sector}</span>
                          </div>
                          <span style={{ fontFamily: font, fontSize: 10, color: COLORS.text, fontWeight: 600 }}>{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- POSITIONS ---- */}
            {portfolioSubTab === "positions" && (
              <div style={{ padding: "12px 20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.textDim, fontWeight: 600 }}>Holdings</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: font, fontSize: 11, color: COLORS.textMuted }}>{PORTFOLIO.length} positions</span>
                    <button onClick={() => { setTradeLogOpen(true); setTradeLogStep(1); setTradeConfirmed(false); setTrade({ action: "buy", ticker: "", shares: "", price: "", date: new Date().toISOString().split("T")[0], thesis: "" }); }} style={{
                      width: 28, height: 28, borderRadius: 14, border: `1px solid ${COLORS.accent}`,
                      background: COLORS.blueBg, color: COLORS.accent, fontSize: 16, fontWeight: 600,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                </div>

                {/* Trade Log Overlay */}
                {tradeLogOpen && (
                  <div style={{
                    marginBottom: 12, padding: 16, background: COLORS.bgCard, borderRadius: 10,
                    border: `1px solid ${COLORS.accent}40`, position: "relative",
                  }}>
                    <button onClick={() => setTradeLogOpen(false)} style={{
                      position: "absolute", top: 10, right: 12, background: "none", border: "none",
                      color: COLORS.textDim, fontSize: 16, cursor: "pointer",
                    }}>×</button>

                    {!tradeConfirmed ? (
                      <>
                        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 14 }}>Log Trade</div>

                        {/* Step indicator */}
                        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                          {[1, 2, 3].map(s => (
                            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= tradeLogStep ? COLORS.accent : COLORS.bgInput, transition: "background 0.2s" }} />
                          ))}
                        </div>

                        {/* Step 1: Action + Ticker */}
                        {tradeLogStep === 1 && (
                          <>
                            <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Action</div>
                            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                              {["buy", "sell"].map(a => (
                                <button key={a} onClick={() => setTrade(t => ({ ...t, action: a }))} style={{
                                  flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize",
                                  border: `1px solid ${trade.action === a ? (a === "buy" ? COLORS.green : COLORS.red) : COLORS.border}`,
                                  background: trade.action === a ? (a === "buy" ? COLORS.greenBg : COLORS.redBg) : "transparent",
                                  color: trade.action === a ? (a === "buy" ? COLORS.green : COLORS.red) : COLORS.textDim,
                                }}>{a}</button>
                              ))}
                            </div>

                            <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Ticker</div>
                            <input
                              type="text" value={trade.ticker} placeholder="e.g. NVDA"
                              onChange={e => setTrade(t => ({ ...t, ticker: e.target.value.toUpperCase() }))}
                              style={{
                                width: "100%", padding: "10px 14px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                                borderRadius: 8, color: COLORS.text, fontSize: 15, fontFamily: font, fontWeight: 600,
                                outline: "none", letterSpacing: 1, boxSizing: "border-box", marginBottom: 12,
                              }}
                              onFocus={e => e.target.style.borderColor = COLORS.accent}
                              onBlur={e => e.target.style.borderColor = COLORS.border}
                            />

                            {/* Quick picks from watchlist */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                              {PORTFOLIO.slice(0, 8).map(p => (
                                <button key={p.ticker} onClick={() => setTrade(t => ({ ...t, ticker: p.ticker }))} style={{
                                  padding: "4px 8px", borderRadius: 4, fontSize: 10, fontFamily: font, cursor: "pointer",
                                  border: `1px solid ${trade.ticker === p.ticker ? COLORS.accent : COLORS.border}`,
                                  background: trade.ticker === p.ticker ? COLORS.blueBg : "transparent",
                                  color: trade.ticker === p.ticker ? COLORS.accent : COLORS.textDim,
                                }}>{p.ticker}</button>
                              ))}
                            </div>

                            <button onClick={() => { if (trade.ticker.trim()) setTradeLogStep(2); }} style={{
                              width: "100%", padding: "11px", borderRadius: 8, border: "none", cursor: trade.ticker.trim() ? "pointer" : "default",
                              background: trade.ticker.trim() ? `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)` : COLORS.bgInput,
                              color: trade.ticker.trim() ? "#fff" : COLORS.textDim, fontSize: 13, fontWeight: 600,
                            }}>Next →</button>
                          </>
                        )}

                        {/* Step 2: Shares, Price, Date */}
                        {tradeLogStep === 2 && (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase",
                                background: trade.action === "buy" ? COLORS.greenBg : COLORS.redBg,
                                color: trade.action === "buy" ? COLORS.green : COLORS.red,
                              }}>{trade.action}</span>
                              <span style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: COLORS.text }}>{trade.ticker}</span>
                            </div>

                            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Shares</div>
                                <input type="number" value={trade.shares} placeholder="100"
                                  onChange={e => setTrade(t => ({ ...t, shares: e.target.value }))}
                                  style={{
                                    width: "100%", padding: "10px 12px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                                    borderRadius: 8, color: COLORS.text, fontSize: 14, fontFamily: font, outline: "none", boxSizing: "border-box",
                                  }}
                                  onFocus={e => e.target.style.borderColor = COLORS.accent}
                                  onBlur={e => e.target.style.borderColor = COLORS.border}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Price per share</div>
                                <input type="number" value={trade.price} placeholder="892.41" step="0.01"
                                  onChange={e => setTrade(t => ({ ...t, price: e.target.value }))}
                                  style={{
                                    width: "100%", padding: "10px 12px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                                    borderRadius: 8, color: COLORS.text, fontSize: 14, fontFamily: font, outline: "none", boxSizing: "border-box",
                                  }}
                                  onFocus={e => e.target.style.borderColor = COLORS.accent}
                                  onBlur={e => e.target.style.borderColor = COLORS.border}
                                />
                              </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Date</div>
                              <input type="date" value={trade.date}
                                onChange={e => setTrade(t => ({ ...t, date: e.target.value }))}
                                style={{
                                  width: "100%", padding: "10px 12px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                                  borderRadius: 8, color: COLORS.text, fontSize: 13, fontFamily: font, outline: "none", boxSizing: "border-box",
                                }}
                              />
                            </div>

                            {/* Total */}
                            {trade.shares && trade.price && (
                              <div style={{ padding: "10px 12px", background: COLORS.bgInput, borderRadius: 8, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: COLORS.textDim }}>Total {trade.action === "buy" ? "cost" : "proceeds"}</span>
                                <span style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: trade.action === "buy" ? COLORS.text : COLORS.green }}>
                                  ${(parseFloat(trade.shares) * parseFloat(trade.price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}

                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setTradeLogStep(1)} style={{
                                flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                                background: "transparent", color: COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer",
                              }}>← Back</button>
                              <button onClick={() => { if (trade.shares && trade.price) setTradeLogStep(3); }} style={{
                                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                                background: (trade.shares && trade.price) ? `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)` : COLORS.bgInput,
                                color: (trade.shares && trade.price) ? "#fff" : COLORS.textDim, fontSize: 13, fontWeight: 600,
                                cursor: (trade.shares && trade.price) ? "pointer" : "default",
                              }}>Next →</button>
                            </div>
                          </>
                        )}

                        {/* Step 3: Thesis + Confirm */}
                        {tradeLogStep === 3 && (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 700, textTransform: "uppercase",
                                background: trade.action === "buy" ? COLORS.greenBg : COLORS.redBg,
                                color: trade.action === "buy" ? COLORS.green : COLORS.red,
                              }}>{trade.action}</span>
                              <span style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: COLORS.text }}>{trade.ticker}</span>
                              <span style={{ fontSize: 12, color: COLORS.textMuted }}>· {trade.shares} shares @ ${parseFloat(trade.price).toFixed(2)}</span>
                            </div>

                            <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                              {trade.action === "buy" ? "Investment thesis (optional)" : "Reason for selling (optional)"}
                            </div>
                            <textarea
                              value={trade.thesis} placeholder={trade.action === "buy" ? "e.g. AI capex cycle, undervalued on PEG basis" : "e.g. Taking profits ahead of earnings"}
                              onChange={e => setTrade(t => ({ ...t, thesis: e.target.value }))}
                              rows={3}
                              style={{
                                width: "100%", padding: "10px 12px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                                borderRadius: 8, color: COLORS.text, fontSize: 12, fontFamily: fontSans, outline: "none",
                                resize: "none", boxSizing: "border-box", lineHeight: 1.5, marginBottom: 14,
                              }}
                              onFocus={e => e.target.style.borderColor = COLORS.accent}
                              onBlur={e => e.target.style.borderColor = COLORS.border}
                            />

                            {/* Pre-confirm checks */}
                            <div style={{ padding: "10px 12px", background: COLORS.bgInput, borderRadius: 8, marginBottom: 14 }}>
                              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8, color: COLORS.textDim, marginBottom: 8 }}>Pre-trade check</div>
                              {[
                                { label: "Position size", value: `${((parseFloat(trade.shares) * parseFloat(trade.price)) / 248412 * 100).toFixed(1)}% of portfolio`, ok: ((parseFloat(trade.shares) * parseFloat(trade.price)) / 248412 * 100) <= 10 },
                                { label: "Sector cap", value: "Technology at 28.3%", ok: true },
                                { label: "Cash after trade", value: `${(12.4 - (parseFloat(trade.shares) * parseFloat(trade.price)) / 248412 * 100).toFixed(1)}%`, ok: (12.4 - (parseFloat(trade.shares) * parseFloat(trade.price)) / 248412 * 100) >= 10 },
                              ].map((c, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{c.label}</span>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ fontFamily: font, fontSize: 11, color: c.ok ? COLORS.textMuted : COLORS.yellow }}>{c.value}</span>
                                    <span style={{ fontSize: 10, color: c.ok ? COLORS.green : COLORS.yellow }}>{c.ok ? "✓" : "⚠"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={() => setTradeLogStep(2)} style={{
                                flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                                background: "transparent", color: COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer",
                              }}>← Back</button>
                              <button onClick={() => setTradeConfirmed(true)} style={{
                                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                                background: `linear-gradient(135deg, ${trade.action === "buy" ? COLORS.green : COLORS.red}, ${trade.action === "buy" ? COLORS.greenDim : COLORS.redDim})`,
                                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                              }}>Confirm {trade.action === "buy" ? "Buy" : "Sell"}</button>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      /* Confirmed state */
                      <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
                          margin: "0 auto 12px", fontSize: 22,
                          background: trade.action === "buy" ? COLORS.greenBg : COLORS.redBg,
                        }}>{trade.action === "buy" ? "✓" : "✓"}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                          <span style={{ color: trade.action === "buy" ? COLORS.green : COLORS.red, textTransform: "capitalize" }}>{trade.action}</span> logged
                        </div>
                        <div style={{ fontFamily: font, fontSize: 14, color: COLORS.textMuted, marginBottom: 4 }}>
                          {trade.shares} shares of {trade.ticker} @ ${parseFloat(trade.price).toFixed(2)}
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textDim, marginBottom: 4 }}>
                          ${(parseFloat(trade.shares) * parseFloat(trade.price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total · {trade.date}
                        </div>
                        {trade.thesis && (
                          <div style={{ fontSize: 11, color: COLORS.textDim, fontStyle: "italic", marginBottom: 8 }}>"{trade.thesis}"</div>
                        )}
                        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 14 }}>
                          48h cooling period started. Portfolio data will update on next refresh.
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setTradeConfirmed(false); setTradeLogStep(1); setTrade({ action: "buy", ticker: "", shares: "", price: "", date: new Date().toISOString().split("T")[0], thesis: "" }); }} style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                            background: "transparent", color: COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Log Another</button>
                          <button onClick={() => setTradeLogOpen(false)} style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: "none",
                            background: COLORS.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {PORTFOLIO.map((item) => (
                  <div
                    key={item.ticker}
                    style={{
                      width: "100%", marginBottom: 4, background: COLORS.bgCard,
                      borderRadius: 8, border: `1px solid ${expandedRow === item.ticker ? COLORS.accent + "40" : COLORS.border}`,
                      transition: "border-color 0.15s",
                      boxShadow: theme === "light" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <button
                      onClick={() => setExpandedRow(expandedRow === item.ticker ? null : item.ticker)}
                      style={{ width: "100%", padding: "12px 14px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: getSignalColor(item.signal),
                          boxShadow: `0 0 8px ${getSignalColor(item.signal)}30`,
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: COLORS.text }}>{item.ticker}</span>
                            <span style={{ fontSize: 11, color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                          </div>
                          <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                            {item.sector} · {item.weight}
                            {item.coolingHrs > 0 && (
                              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.3, padding: "1px 5px", borderRadius: 3, background: COLORS.accent + "20", color: COLORS.accent }}>⏳ {item.coolingHrs}h</span>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: font, fontSize: 14, fontWeight: 600 }}>${item.price.toFixed(2)}</div>
                          <div style={{ fontFamily: font, fontSize: 11, color: getChangeColor(item.change) }}>{formatChange(item.change)}</div>
                        </div>
                        {/* Signal Dots + Score */}
                        {item.signals ? (
                          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{ display: "flex", gap: 3 }}>
                              {Object.entries(item.signals).map(([key, sig]) => (
                                <div key={key} style={{
                                  width: 8, height: 8, borderRadius: "50%",
                                  background: sig === "green" ? COLORS.green : sig === "red" ? COLORS.red : COLORS.yellow,
                                  opacity: 0.9,
                                }} title={key === "F" ? "Fundamentals" : key === "T" ? "Technicals" : key === "A" ? "Analyst" : key === "S" ? "Sentiment" : "Macro"} />
                              ))}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: getSignalColor(item.signal) }}>{item.score}</span>
                              {item.velocity !== 0 && (
                                <span style={{ fontFamily: font, fontSize: 8, color: item.velocity > 0 ? COLORS.green : COLORS.red, fontWeight: 600 }}>
                                  {item.velocity > 0 ? "▲" : "▼"}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            width: 38, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 6, flexShrink: 0, fontFamily: font, fontSize: 11, fontWeight: 600,
                            color: COLORS.textDim, border: `1px solid ${COLORS.border}`,
                          }}>ETF</div>
                        )}
                      </div>
                    </button>
                    {expandedRow === item.ticker && (
                      <div style={{ padding: "0 14px 12px", borderTop: `1px solid ${COLORS.border}` }}>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.6, padding: "10px 0 10px 18px" }}>{item.miniSummary}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTicker(item.ticker); }}
                          style={{
                            width: "100%", padding: "8px", background: COLORS.blueBg, border: `1px solid ${COLORS.accent}30`,
                            borderRadius: 6, cursor: "pointer", color: COLORS.accent, fontSize: 11, fontWeight: 600,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          }}
                        >View Full Analysis →</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ---- PERFORMANCE ---- */}
            {portfolioSubTab === "performance" && (
              <div style={{ padding: "16px 20px" }}>
                <div style={{ padding: 16, background: COLORS.bgCard, borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600 }}>Portfolio vs S&P 500</span>
                    <span style={{ fontSize: 10, color: COLORS.textDim }}>6 months</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: COLORS.textDim }}>Portfolio </span>
                      <span style={{ fontFamily: font, fontSize: 12, color: COLORS.green, fontWeight: 600 }}>+18.4%</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: COLORS.textDim }}>S&P 500 </span>
                      <span style={{ fontFamily: font, fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>+16.3%</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: COLORS.textDim }}>Alpha </span>
                      <span style={{ fontFamily: font, fontSize: 12, color: COLORS.green, fontWeight: 600 }}>+2.1%</span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={PORTFOLIO_PERF} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 8, fill: COLORS.textDim }} tickLine={false} axisLine={{ stroke: COLORS.border }} interval={Math.floor(PORTFOLIO_PERF.length / 5)} />
                      <YAxis tick={{ fontSize: 8, fill: COLORS.textDim }} tickLine={false} axisLine={false} domain={['dataMin - 2000', 'dataMax + 2000']} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 11, fontFamily: font, padding: "8px 12px" }}
                        labelStyle={{ color: COLORS.textDim, marginBottom: 4 }}
                        formatter={(v) => [`$${v.toLocaleString()}`, undefined]}
                      />
                      <Line type="monotone" dataKey="spy" stroke={COLORS.textDim} strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="S&P 500" />
                      <Line type="monotone" dataKey="portfolio" stroke={COLORS.accent} strokeWidth={2} dot={false} name="Portfolio" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 14, height: 2, background: COLORS.accent, borderRadius: 1 }} />
                      <span style={{ fontSize: 10, color: COLORS.textMuted }}>Portfolio</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 14, height: 2, background: COLORS.textDim, borderRadius: 1, opacity: 0.6 }} />
                      <span style={{ fontSize: 10, color: COLORS.textMuted }}>S&P 500</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Sharpe Ratio", value: "1.42", color: COLORS.green },
                    { label: "Max Drawdown", value: "-8.2%", color: COLORS.red },
                    { label: "Win Rate", value: "68%", color: COLORS.green },
                    { label: "Avg Score", value: "72.4", color: COLORS.accent },
                  ].map(s => (
                    <div key={s.label} style={{ padding: "12px", background: COLORS.bgCard, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                      <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontFamily: font, fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== TICKERS TAB ===== */}
        {activeTab === "tickers" && (
          <div style={{ padding: "8px 20px 0" }}>
            {/* Sub-tab chips + Add button */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              {[
                { id: "watchlist", label: "Watchlist", count: combinedWatchlist.length },
                { id: "research", label: "Research", count: RESEARCH.length },
              ].map(sub => (
                <button key={sub.id} onClick={() => setTickersSubTab(sub.id)} style={{
                  padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${tickersSubTab === sub.id ? COLORS.accent : COLORS.border}`,
                  background: tickersSubTab === sub.id ? COLORS.blueBg : "transparent",
                  color: tickersSubTab === sub.id ? COLORS.accent : COLORS.textMuted,
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
                }}>
                  {sub.label}
                  <span style={{
                    fontFamily: font, fontSize: 10, padding: "1px 6px", borderRadius: 8,
                    background: tickersSubTab === sub.id ? COLORS.accent + "20" : COLORS.bgInput,
                    color: tickersSubTab === sub.id ? COLORS.accent : COLORS.textDim,
                  }}>{sub.count}</span>
                </button>
              ))}
              <button onClick={() => { setAddTickerOpen(true); setAddTickerValue(""); setAddTickerConfirm(null); }} style={{
                marginLeft: "auto", width: 32, height: 32, borderRadius: 16, border: `1px solid ${COLORS.accent}`,
                background: COLORS.blueBg, color: COLORS.accent, fontSize: 18, fontWeight: 600,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}>+</button>
            </div>

            {/* Add Ticker Overlay */}
            {addTickerOpen && (
              <div style={{
                marginBottom: 12, padding: 16, background: COLORS.bgCard, borderRadius: 10,
                border: `1px solid ${COLORS.accent}40`, position: "relative",
              }}>
                <button onClick={() => setAddTickerOpen(false)} style={{
                  position: "absolute", top: 10, right: 12, background: "none", border: "none",
                  color: COLORS.textDim, fontSize: 16, cursor: "pointer",
                }}>×</button>

                {!addTickerConfirm ? (
                  <>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Add Ticker</div>

                    {/* Ticker input */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Symbol</div>
                      <input
                        type="text"
                        value={addTickerValue}
                        onChange={e => setAddTickerValue(e.target.value.toUpperCase())}
                        placeholder="e.g. SOFI"
                        style={{
                          width: "100%", padding: "10px 14px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                          borderRadius: 8, color: COLORS.text, fontSize: 15, fontFamily: font, fontWeight: 600,
                          outline: "none", letterSpacing: 1, boxSizing: "border-box",
                        }}
                        onFocus={e => e.target.style.borderColor = COLORS.accent}
                        onBlur={e => e.target.style.borderColor = COLORS.border}
                        autoFocus
                      />
                    </div>

                    {/* Destination picker */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Add to</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { id: "research", label: "Research", desc: "Quant data only" },
                          { id: "watchlist", label: "Watchlist", desc: "Full scoring + summaries" },
                        ].map(d => (
                          <button key={d.id} onClick={() => setAddTickerTarget(d.id)} style={{
                            flex: 1, padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                            border: `1px solid ${addTickerTarget === d.id ? COLORS.accent : COLORS.border}`,
                            background: addTickerTarget === d.id ? COLORS.blueBg : "transparent",
                          }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: addTickerTarget === d.id ? COLORS.accent : COLORS.text }}>{d.label}</div>
                            <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add button */}
                    <button onClick={() => {
                      if (addTickerValue.trim()) setAddTickerConfirm({ ticker: addTickerValue.trim(), target: addTickerTarget });
                    }} style={{
                      width: "100%", padding: "12px", background: addTickerValue.trim() ? `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)` : COLORS.bgInput,
                      border: "none", borderRadius: 8, cursor: addTickerValue.trim() ? "pointer" : "default",
                      color: addTickerValue.trim() ? "#fff" : COLORS.textDim, fontSize: 13, fontWeight: 700,
                    }}>
                      {addTickerValue.trim() ? `Add ${addTickerValue.trim()} to ${addTickerTarget === "research" ? "Research" : "Watchlist"}` : "Enter a ticker symbol"}
                    </button>
                  </>
                ) : (
                  /* Confirmation state */
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: COLORS.greenBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 20 }}>✓</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                      <span style={{ fontFamily: font }}>{addTickerConfirm.ticker}</span> added
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14 }}>
                      {addTickerConfirm.target === "research"
                        ? "Quant data will pull on next refresh (5:30 AM PT). Promote to Watchlist anytime for full analysis."
                        : "Full scoring and Claude summary will generate on next refresh (6:00 AM PT)."}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setAddTickerConfirm(null); setAddTickerValue(""); }} style={{
                        flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
                        background: "transparent", color: COLORS.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>Add Another</button>
                      <button onClick={() => setAddTickerOpen(false)} style={{
                        flex: 1, padding: "10px", borderRadius: 8, border: "none",
                        background: COLORS.accent, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ---- WATCHLIST SUB-TAB ---- */}
            {tickersSubTab === "watchlist" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: COLORS.textDim, lineHeight: 1.4 }}>Full scoring · Claude summaries · News</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["score", "change", "alpha"].map(s => (
                      <button key={s} onClick={() => setWatchlistSort(s)} style={{
                        padding: "4px 10px", borderRadius: 4, fontSize: 10, fontFamily: font, cursor: "pointer",
                        border: `1px solid ${watchlistSort === s ? COLORS.accent : COLORS.border}`,
                        background: watchlistSort === s ? COLORS.blueBg : "transparent",
                        color: watchlistSort === s ? COLORS.accent : COLORS.textDim,
                      }}>
                        {s === "alpha" ? "A-Z" : s === "score" ? "Score" : "Δ%"}
                      </button>
                    ))}
                  </div>
                </div>

                {sortedWatchlist.map((item) => (
                  <button
                    key={item.ticker}
                    onClick={() => setSelectedTicker(item.ticker)}
                    style={{
                      width: "100%", padding: "10px 14px", marginBottom: 3, background: COLORS.bgCard,
                      borderRadius: 8, border: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgCardHover}
                    onMouseLeave={e => e.currentTarget.style.background = COLORS.bgCard}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: getSignalColor(item.signal),
                        boxShadow: `0 0 8px ${getSignalColor(item.signal)}30`,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.text }}>{item.ticker}</span>
                          <span style={{ fontSize: 11, color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 1, display: "flex", alignItems: "center", gap: 5 }}>
                          {item.sector}
                          {item.inPortfolio && (
                            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "1px 5px", borderRadius: 3, background: COLORS.accent + "20", color: COLORS.accent }}>Held</span>
                          )}
                          {!item.inPortfolio && item.daysAbove > 0 && item.score >= (item.threshold || 70) && (
                            <span style={{
                              fontSize: 8, fontWeight: 700, letterSpacing: 0.3, padding: "1px 5px", borderRadius: 3,
                              background: item.daysAbove >= 5 ? COLORS.greenBg : COLORS.yellowBg,
                              color: item.daysAbove >= 5 ? COLORS.green : COLORS.yellow,
                            }}>{item.daysAbove}d ▲{item.threshold}</span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600 }}>${item.price.toFixed(2)}</div>
                        <div style={{ fontFamily: font, fontSize: 11, color: getChangeColor(item.change) }}>{formatChange(item.change)}</div>
                      </div>
                      <div style={{
                        width: 38, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 6, flexShrink: 0, fontFamily: font, fontSize: 13, fontWeight: 700,
                        background: item.score ? getSignalBg(item.signal) : "transparent",
                        color: item.score ? getSignalColor(item.signal) : COLORS.textDim,
                        border: item.score ? "none" : `1px solid ${COLORS.border}`,
                      }}>
                        {item.score || "ETF"}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* ---- RESEARCH SUB-TAB ---- */}
            {tickersSubTab === "research" && (
              <>
                <div style={{ fontSize: 10, color: COLORS.textDim, lineHeight: 1.4, marginBottom: 10 }}>Quant data only · Promote to Watchlist for full analysis</div>

                {/* Column headers */}
                <div style={{ display: "flex", alignItems: "center", padding: "0 14px 6px", gap: 8 }}>
                  <span style={{ flex: 1, fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8 }}>Ticker</span>
                  <span style={{ width: 52, fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "right" }}>Price</span>
                  <span style={{ width: 40, fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "right" }}>RSI</span>
                  <span style={{ width: 48, fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "center" }}>MACD</span>
                  <span style={{ width: 48, fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 0.8, textAlign: "right" }}>P/E</span>
                </div>

                {RESEARCH.map((item) => (
                  <div
                    key={item.ticker}
                    style={{
                      display: "flex", alignItems: "center", padding: "10px 14px", marginBottom: 3, background: COLORS.bgCard,
                      borderRadius: 8, border: `1px solid ${COLORS.border}`, gap: 8,
                    }}
                  >
                    {/* Ticker info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                        <span style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.text }}>{item.ticker}</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>{item.sector}</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>·</span>
                        <span style={{ fontSize: 10, color: COLORS.textDim }}>Vol {item.vol}</span>
                        {item.aboveMa50 && <span style={{ fontSize: 8, color: COLORS.green, fontWeight: 600 }}>▲50D</span>}
                        {!item.aboveMa50 && <span style={{ fontSize: 8, color: COLORS.red, fontWeight: 600 }}>▼50D</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ width: 52, textAlign: "right" }}>
                      <div style={{ fontFamily: font, fontSize: 12, fontWeight: 600, color: COLORS.text }}>{item.price >= 1000 ? `$${(item.price/1000).toFixed(1)}k` : `$${item.price.toFixed(0)}`}</div>
                      <div style={{ fontFamily: font, fontSize: 10, color: getChangeColor(item.change) }}>{formatChange(item.change)}</div>
                    </div>

                    {/* RSI */}
                    <div style={{ width: 40, textAlign: "right" }}>
                      <span style={{
                        fontFamily: font, fontSize: 12, fontWeight: 600,
                        color: item.rsi >= 70 ? COLORS.red : item.rsi <= 30 ? COLORS.green : COLORS.textMuted,
                      }}>{item.rsi}</span>
                    </div>

                    {/* MACD */}
                    <div style={{ width: 48, textAlign: "center" }}>
                      <span style={{
                        fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5,
                        color: item.macd === "bullish" ? COLORS.green : item.macd === "bearish" ? COLORS.red : COLORS.yellow,
                        background: item.macd === "bullish" ? COLORS.greenBg : item.macd === "bearish" ? COLORS.redBg : COLORS.yellowBg,
                      }}>{item.macd === "bullish" ? "Bull" : item.macd === "bearish" ? "Bear" : "Flat"}</span>
                    </div>

                    {/* P/E */}
                    <div style={{ width: 48, textAlign: "right" }}>
                      <span style={{ fontFamily: font, fontSize: 12, color: COLORS.textMuted }}>{item.pe ? item.pe.toFixed(0) + "x" : "N/A"}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ===== ANALYST TAB ===== */}
        {activeTab === "analyst" && (
          <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 140px)", background: `linear-gradient(180deg, transparent 0%, #7c5cff06 100%)` }}>

            {/* Context badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "8px 12px", background: COLORS.bgCard, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>C</div>
              <span style={{ fontSize: 10, color: COLORS.textDim }}>Analyzing</span>
              <span style={{ fontFamily: font, fontSize: 10, color: COLORS.accent }}>12 holdings</span>
              <span style={{ fontSize: 10, color: COLORS.textDim }}>·</span>
              <span style={{ fontFamily: font, fontSize: 10, color: COLORS.accent }}>32 watchlist</span>
              <span style={{ fontSize: 10, color: COLORS.textDim }}>·</span>
              <span style={{ fontFamily: font, fontSize: 10, color: COLORS.accent }}>5 alerts</span>
            </div>

            {/* Template view */}
            {analystView === "templates" && (
              <>
                {/* Template Cards */}
                {[
                  { id: "risk", icon: "🛡", title: "Portfolio Risk Scan", desc: "Analyze concentration, correlation, sector exposure, and downside scenarios. Identifies what to watch — not necessarily what to change.", color: COLORS.red },
                  { id: "deploy", icon: "💰", title: "Deployment Opportunities", desc: "Evaluate whether now is the right time to deploy capital, or if patience is the better strategy. Factors in catalysts, cooling periods, and conviction strength.", color: COLORS.green },
                  { id: "digest", icon: "📋", title: "Weekly Digest", desc: "Summarize all score changes, analyst revisions, news events, and portfolio performance. Highlights what mattered and what was noise.", color: COLORS.accent },
                  { id: "sector", icon: "📊", title: "Sector Deep Dive", desc: "Compare your holdings within a specific sector against each other and their ETF benchmark. Surfaces rebalancing opportunities.", color: COLORS.yellow },
                  { id: "thesis", icon: "🔍", title: "Thesis Check", desc: "Pressure-test any holding. What's changed since entry? Is the original case intact? Should you hold, trim, or add?", color: "#c77dff" },
                ].map(t => (
                  <button key={t.id} onClick={() => {
                    if (t.id === "risk") setAnalystResult("risk");
                    else if (t.id === "deploy") setAnalystResult("deploy");
                    else setAnalystResult("risk");
                    setAnalystView("result");
                  }} style={{
                    width: "100%", padding: "14px 16px", marginBottom: 6, background: COLORS.bgCard,
                    borderRadius: 10, border: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left",
                    borderLeft: `3px solid ${t.color}`, transition: "background 0.15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = COLORS.bgCardHover}
                    onMouseLeave={e => e.currentTarget.style.background = COLORS.bgCard}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: COLORS.textDim, lineHeight: 1.5, marginTop: 3 }}>{t.desc}</div>
                      </div>
                      <span style={{ fontSize: 14, color: COLORS.textDim }}>→</span>
                    </div>
                  </button>
                ))}

                {/* Freeform input */}
                <div style={{ marginTop: 8, position: "relative" }}>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, fontWeight: 600, marginBottom: 8 }}>Ask Anything</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={analystInput}
                      onChange={e => setAnalystInput(e.target.value)}
                      placeholder="What would happen if oil dropped to $60?"
                      style={{
                        flex: 1, padding: "12px 14px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                        borderRadius: 10, color: COLORS.text, fontSize: 13, fontFamily: fontSans, outline: "none",
                      }}
                      onFocus={e => e.target.style.borderColor = COLORS.accent}
                      onBlur={e => e.target.style.borderColor = COLORS.border}
                    />
                    <button onClick={() => { if (analystInput.trim()) { setAnalystResult("custom"); setAnalystView("result"); }}} style={{
                      padding: "12px 16px", background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, border: "none",
                      borderRadius: 10, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700,
                    }}>→</button>
                  </div>
                  {/* Quick suggestion chips */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {["What should I sell first?", "Am I too heavy in tech?", "Best entry points right now", "Earnings this week"].map(q => (
                      <button key={q} onClick={() => { setAnalystInput(q); }} style={{
                        padding: "5px 10px", borderRadius: 6, fontSize: 10, background: COLORS.bgCard,
                        border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, cursor: "pointer",
                      }}>{q}</button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Result view */}
            {analystView === "result" && (
              <>
                <button onClick={() => { setAnalystView("templates"); setAnalystResult(null); }} style={{
                  background: "none", border: "none", color: COLORS.accent, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 12, textAlign: "left",
                }}>← Back to templates</button>

                {analystResult === "risk" && (
                  <div style={{ padding: 16, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgCardHover} 100%)`, borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>C</div>
                      <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.accent, fontWeight: 600 }}>Portfolio Risk Scan</span>
                      <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>Just now</span>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>Overall Risk Assessment: <span style={{ color: COLORS.yellow }}>Moderate</span></div>

                    {/* Findings */}
                    {[
                      { severity: "yellow", title: "Sector Concentration", body: "Technology allocation at 28.3% is approaching your 30% cap. Adding any new tech position would likely breach the limit. Consider rebalancing MSFT or AVGO to make room, or hold off on promoting PANW from the watchlist despite its strong score." },
                      { severity: "green", title: "Position Sizing", body: "All individual positions are within your 10% stock cap. VOO at 15% and QQQ at 12% are within the 20% ETF limit. No position sizing violations." },
                      { severity: "yellow", title: "Correlation Risk", body: "NVDA, MSFT, GOOGL, and AMZN have a rolling 90-day correlation above 0.75. Together they represent 26.1% of the portfolio. A broad tech selloff would impact more than a quarter of your holdings simultaneously." },
                      { severity: "green", title: "Cash Reserve", body: "Cash at 12.4% is above your 10% floor. You have approximately $30,800 available for deployment without breaching the reserve." },
                      { severity: "red", title: "Downside Scenario", body: "A 10% market correction would reduce portfolio value by approximately $21,800 based on current beta of 1.12. Your most exposed position is NVDA (beta 1.68), which could see a 16-17% drawdown in that scenario. Consider whether the 8.2% position size is appropriate for your risk tolerance." },
                    ].map((finding, i) => (
                      <div key={i} style={{
                        padding: "12px 14px", marginBottom: 6, background: COLORS.bgInput, borderRadius: 8,
                        borderLeft: `3px solid ${finding.severity === "red" ? COLORS.red : finding.severity === "yellow" ? COLORS.yellow : COLORS.green}`,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{finding.title}</div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{finding.body}</div>
                      </div>
                    ))}

                    <div style={{ marginTop: 12, padding: "12px 14px", background: COLORS.bgInput, borderRadius: 8, borderLeft: `3px solid ${COLORS.accent}` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>Recommended Actions</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7 }}>
                        1. Monitor tech allocation — one more green day could push it past 30%.{"\n"}
                        2. Consider trimming NVDA from 8.2% to 6% to reduce both sector concentration and single-stock beta exposure.{"\n"}
                        3. The freed capital (~$5,400) could deploy into healthcare or industrials where you're underweight relative to targets.
                      </div>
                    </div>
                  </div>
                )}

                {analystResult === "deploy" && (
                  <div style={{ padding: 16, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgCardHover} 100%)`, borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>C</div>
                      <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.accent, fontWeight: 600 }}>Deployment Opportunities</span>
                      <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>Just now</span>
                    </div>

                    <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
                      You have $30,800 in deployable cash (12.4% of portfolio, 10% floor = $24,800 minimum). That gives you approximately $6,000 to deploy while maintaining your reserve.
                    </div>

                    {/* Do Nothing assessment */}
                    <div style={{
                      padding: "12px 14px", marginBottom: 12, background: COLORS.bgInput, borderRadius: 8,
                      borderLeft: `3px solid ${COLORS.accent}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>⏸ Option: Do Nothing</span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: COLORS.blueBg, color: COLORS.accent, fontWeight: 600 }}>RECOMMENDED</span>
                      </div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
                        NVDA reports earnings Wednesday (4 days away) with an average post-earnings move of ±8%. FOMC minutes release Tuesday. PCE inflation data Friday. This is a catalyst-heavy week — deploying capital before these events increases your exposure to unpredictable binary outcomes. Consider waiting until Friday afternoon when all three catalysts have resolved. Your cash reserve is healthy at 12.4% and there's no urgency to deploy.
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 10 }}>If you decide to act despite the catalysts, here are the strongest candidates:</div>

                    {[
                      { ticker: "VST", score: 77, sector: "Utilities", reason: "Highest-scoring utility on your watchlist. You're currently 0% in utilities against a market weight of ~2.5%. Adding a 2.5% position ($6,200) fills a sector gap and adds defensive ballast.", fit: "green" },
                      { ticker: "ABBV", score: 72, sector: "Healthcare", reason: "Healthcare is underweight at 4.5% vs your target range. ABBV provides pharma exposure distinct from LLY's growth profile — steadier cash flows, 3.8% dividend yield. A 2% position works within limits.", fit: "green" },
                      { ticker: "LIN", score: 73, sector: "Materials", reason: "You have zero materials exposure. LIN is the highest-quality name in the sector — industrial gases compounder with pricing power. Even a small 1.5% position diversifies meaningfully.", fit: "green" },
                      { ticker: "PANW", score: 75, sector: "Technology", reason: "Strong score and bullish technicals, but adding this would push tech to ~31%, breaching your 30% cap. Would need to trim an existing tech position first.", fit: "yellow" },
                    ].map((opp, i) => (
                      <div key={i} style={{
                        padding: "12px 14px", marginBottom: 6, background: COLORS.bgInput, borderRadius: 8,
                        borderLeft: `3px solid ${opp.fit === "green" ? COLORS.green : COLORS.yellow}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                            <span style={{ fontFamily: font, fontSize: 14, fontWeight: 700, color: COLORS.text }}>{opp.ticker}</span>
                            <span style={{ fontSize: 10, color: COLORS.textDim }}>{opp.sector}</span>
                          </div>
                          <span style={{ fontFamily: font, fontSize: 13, fontWeight: 700, color: COLORS.green }}>{opp.score}</span>
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{opp.reason}</div>
                      </div>
                    ))}
                  </div>
                )}

                {analystResult === "custom" && (
                  <div style={{ padding: 16, background: `linear-gradient(135deg, ${COLORS.bgCard} 0%, ${COLORS.bgCardHover} 100%)`, borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>C</div>
                      <span style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: COLORS.accent, fontWeight: 600 }}>Analysis</span>
                      <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: "auto" }}>Just now</span>
                    </div>

                    <div style={{ padding: "10px 14px", background: COLORS.bgInput, borderRadius: 8, marginBottom: 14, borderLeft: `3px solid ${COLORS.accent}` }}>
                      <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>Your question</div>
                      <div style={{ fontSize: 13, color: COLORS.text }}>{analystInput}</div>
                    </div>

                    <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.7 }}>
                      <p style={{ margin: "0 0 12px" }}>Based on your current portfolio composition and the data available, here's my analysis:</p>
                      <p style={{ margin: "0 0 12px" }}>Your portfolio has meaningful energy exposure through XOM (3.5%) and indirect exposure through broad market ETFs. A drop in oil to $60 would primarily impact XOM, which derives roughly 60% of revenue from upstream operations that are sensitive to crude prices. At $60 oil, XOM's free cash flow would compress by an estimated 35-40%, though the dividend would likely remain covered.</p>
                      <p style={{ margin: "0 0 12px" }}>The secondary effects are more nuanced. Lower energy prices would be disinflationary, which could accelerate Fed rate cuts — a tailwind for your growth-heavy tech positions (NVDA, MSFT, AMZN, GOOGL). Your QQQ and VOO holdings would likely benefit on net.</p>
                      <p style={{ margin: 0 }}>Net portfolio impact: modestly positive. The ~$8,700 in XOM exposure would face a potential 15-20% drawdown (~$1,300-1,700), but the broader portfolio tailwind from lower rates would likely offset this. No action needed preemptively, but consider setting an alert if oil breaks below $70.</p>
                    </div>
                  </div>
                )}

                {/* Follow-up input */}
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ask a follow-up..."
                    style={{
                      flex: 1, padding: "12px 14px", background: COLORS.bgInput, border: `1px solid ${COLORS.border}`,
                      borderRadius: 10, color: COLORS.text, fontSize: 13, fontFamily: fontSans, outline: "none",
                    }}
                    onFocus={e => e.target.style.borderColor = COLORS.accent}
                    onBlur={e => e.target.style.borderColor = COLORS.border}
                  />
                  <button style={{
                    padding: "12px 16px", background: `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)`, border: "none",
                    borderRadius: 10, cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700,
                  }}>→</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === "settings" && (
          <div style={{ padding: "12px 20px" }}>

            {/* Collapsible Section Component Helper */}
            {(() => {
              const Section = ({ id, icon, title, children }) => (
                <div style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setSettingsOpen(p => ({ ...p, [id]: !p[id] }))}
                    style={{
                      width: "100%", padding: "14px 16px", background: COLORS.bgCard, borderRadius: settingsOpen[id] ? "10px 10px 0 0" : 10,
                      border: `1px solid ${settingsOpen[id] ? COLORS.accent + "40" : COLORS.border}`, cursor: "pointer", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 10, transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, flex: 1 }}>{title}</span>
                    <span style={{ fontSize: 12, color: COLORS.textDim, transition: "transform 0.2s", transform: settingsOpen[id] ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                  </button>
                  {settingsOpen[id] && (
                    <div style={{ padding: "16px", background: COLORS.bgCard, borderRadius: "0 0 10px 10px", borderTop: "none", border: `1px solid ${COLORS.accent}40`, borderTopColor: COLORS.border }}>
                      {children}
                    </div>
                  )}
                </div>
              );

              const SliderSetting = ({ label, value, onChange, min, max, step = 1, unit = "%", color = COLORS.accent }) => (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{label}</span>
                    <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color }}>{value}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
                    style={{ width: "100%", height: 4, appearance: "none", background: COLORS.bgInput, borderRadius: 2, outline: "none", cursor: "pointer",
                      accentColor: color,
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: COLORS.textDim }}>{min}{unit}</span>
                    <span style={{ fontSize: 9, color: COLORS.textDim }}>{max}{unit}</span>
                  </div>
                </div>
              );

              const ToggleSetting = ({ label, description, value, onChange }) => (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: COLORS.text }}>{label}</div>
                    {description && <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>{description}</div>}
                  </div>
                  <button onClick={() => onChange(!value)} style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
                    background: value ? COLORS.accent : COLORS.bgInput,
                  }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, transition: "left 0.2s",
                      left: value ? 21 : 3,
                    }} />
                  </button>
                </div>
              );

              const SectionLabel = ({ children }) => (
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.textDim, fontWeight: 600, marginBottom: 12, marginTop: 8 }}>{children}</div>
              );

              const totalWeight = weights.fundamentals + weights.technicals + weights.analyst + weights.sentiment + weights.macro;

              return (
                <>
                  {/* ---- APPEARANCE ---- */}
                  <Section id="appearance" icon="◐" title="Appearance">
                    <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.textDim, fontWeight: 600, marginBottom: 12 }}>Theme</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[
                        { id: "dark", label: "Dark", desc: "Bloomberg-native", preview: { bg: "#0b0e14", card: "#131720", text: "#e8eaed", accent: "#4e8cff" } },
                        { id: "light", label: "Light", desc: "Clean & readable", preview: { bg: "#f4f2ee", card: "#ffffff", text: "#1a1a1a", accent: "#2b6ce6" } },
                      ].map(t => (
                        <button key={t.id} onClick={() => setTheme(t.id)} style={{
                          flex: 1, padding: 0, borderRadius: 10, cursor: "pointer", overflow: "hidden",
                          border: `2px solid ${theme === t.id ? COLORS.accent : COLORS.border}`,
                          background: "transparent", transition: "border-color 0.2s",
                        }}>
                          {/* Mini preview */}
                          <div style={{ padding: "10px 10px 8px", background: t.preview.bg }}>
                            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d26a" }} />
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffb224" }} />
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff3b5c" }} />
                            </div>
                            <div style={{ height: 5, width: "70%", background: t.preview.card, borderRadius: 2, marginBottom: 3 }} />
                            <div style={{ height: 5, width: "50%", background: t.preview.card, borderRadius: 2, marginBottom: 3 }} />
                            <div style={{ height: 14, background: t.preview.card, borderRadius: 3, marginBottom: 3, display: "flex", alignItems: "center", padding: "0 6px" }}>
                              <div style={{ height: 3, width: "40%", background: t.preview.accent, borderRadius: 1, opacity: 0.6 }} />
                            </div>
                            <div style={{ height: 14, background: t.preview.card, borderRadius: 3, display: "flex", alignItems: "center", padding: "0 6px" }}>
                              <div style={{ height: 3, width: "60%", background: t.preview.accent, borderRadius: 1, opacity: 0.4 }} />
                            </div>
                          </div>
                          <div style={{ padding: "8px 10px", background: COLORS.bgCard }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: theme === t.id ? COLORS.accent : COLORS.text }}>{t.label}</div>
                            <div style={{ fontSize: 10, color: COLORS.textDim }}>{t.desc}</div>
                          </div>
                          {theme === t.id && (
                            <div style={{ height: 3, background: COLORS.accent }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* ---- PORTFOLIO SETTINGS ---- */}
                  <Section id="portfolio" icon="◉" title="Portfolio Rules">
                    <SectionLabel>Position Limits</SectionLabel>
                    <SliderSetting label="Max per stock" value={portfolioSettings.maxStock} onChange={v => setPortfolioSettings(p => ({...p, maxStock: v}))} min={3} max={20} />
                    <SliderSetting label="Max per ETF" value={portfolioSettings.maxEtf} onChange={v => setPortfolioSettings(p => ({...p, maxEtf: v}))} min={5} max={30} />
                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Min positions</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={() => setPortfolioSettings(p => ({...p, minPositions: Math.max(5, p.minPositions - 1)}))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bgInput, color: COLORS.text, cursor: "pointer", fontSize: 14 }}>−</button>
                          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: COLORS.accent, minWidth: 24, textAlign: "center" }}>{portfolioSettings.minPositions}</span>
                          <button onClick={() => setPortfolioSettings(p => ({...p, minPositions: Math.min(p.maxPositions - 1, p.minPositions + 1)}))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bgInput, color: COLORS.text, cursor: "pointer", fontSize: 14 }}>+</button>
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Max positions</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={() => setPortfolioSettings(p => ({...p, maxPositions: Math.max(p.minPositions + 1, p.maxPositions - 1)}))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bgInput, color: COLORS.text, cursor: "pointer", fontSize: 14 }}>−</button>
                          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 600, color: COLORS.accent, minWidth: 24, textAlign: "center" }}>{portfolioSettings.maxPositions}</span>
                          <button onClick={() => setPortfolioSettings(p => ({...p, maxPositions: Math.min(40, p.maxPositions + 1)}))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bgInput, color: COLORS.text, cursor: "pointer", fontSize: 14 }}>+</button>
                        </div>
                      </div>
                    </div>

                    <SectionLabel>Sector & Asset Allocation</SectionLabel>
                    <SliderSetting label="Max per sector" value={portfolioSettings.maxSector} onChange={v => setPortfolioSettings(p => ({...p, maxSector: v}))} min={10} max={40} color={COLORS.yellow} />
                    <SliderSetting label="Sub-sector cap" value={portfolioSettings.subSectorCap} onChange={v => setPortfolioSettings(p => ({...p, subSectorCap: v}))} min={5} max={25} color={COLORS.yellow} />

                    <div style={{ padding: "12px", background: COLORS.bgInput, borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, marginBottom: 10 }}>Target Allocation Ranges</div>
                      {[
                        { label: "Equities", min: portfolioSettings.equityMin, max: portfolioSettings.equityMax, color: COLORS.green, keyMin: "equityMin", keyMax: "equityMax" },
                        { label: "Fixed Income", min: portfolioSettings.bondMin, max: portfolioSettings.bondMax, color: COLORS.accent, keyMin: "bondMin", keyMax: "bondMax" },
                        { label: "Alternatives", min: portfolioSettings.altMin, max: portfolioSettings.altMax, color: COLORS.yellow, keyMin: "altMin", keyMax: "altMax" },
                      ].map(a => (
                        <div key={a.label} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: COLORS.text }}>{a.label}</span>
                            <span style={{ fontFamily: font, fontSize: 11, color: a.color }}>{a.min}–{a.max}%</span>
                          </div>
                          <div style={{ height: 6, background: COLORS.bg, borderRadius: 3, position: "relative" }}>
                            <div style={{ position: "absolute", left: `${a.min}%`, width: `${a.max - a.min}%`, height: "100%", background: a.color, borderRadius: 3, opacity: 0.5 }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 6 }}>
                        Total range: {portfolioSettings.equityMin + portfolioSettings.bondMin + portfolioSettings.altMin}–{portfolioSettings.equityMax + portfolioSettings.bondMax + portfolioSettings.altMax}%
                      </div>
                    </div>

                    <SectionLabel>Risk Parameters</SectionLabel>
                    <SliderSetting label="Target portfolio beta" value={portfolioSettings.targetBeta} onChange={v => setPortfolioSettings(p => ({...p, targetBeta: v}))} min={0.5} max={1.8} step={0.1} unit="" color="#c77dff" />
                    <SliderSetting label="Cash reserve floor" value={portfolioSettings.cashFloor} onChange={v => setPortfolioSettings(p => ({...p, cashFloor: v}))} min={0} max={25} color={COLORS.green} />
                    <ToggleSetting label="Correlation warnings" description="Alert when adding highly correlated positions" value={portfolioSettings.correlationWarn} onChange={v => setPortfolioSettings(p => ({...p, correlationWarn: v}))} />

                    <SectionLabel>Rebalancing</SectionLabel>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                      {[
                        { id: "threshold", label: "Drift %" },
                        { id: "calendar", label: "Quarterly" },
                        { id: "score", label: "Score Drop" },
                      ].map(r => (
                        <button key={r.id} onClick={() => setPortfolioSettings(p => ({...p, rebalanceTrigger: r.id}))} style={{
                          flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontFamily: font, cursor: "pointer",
                          border: `1px solid ${portfolioSettings.rebalanceTrigger === r.id ? COLORS.accent : COLORS.border}`,
                          background: portfolioSettings.rebalanceTrigger === r.id ? COLORS.blueBg : "transparent",
                          color: portfolioSettings.rebalanceTrigger === r.id ? COLORS.accent : COLORS.textDim,
                        }}>{r.label}</button>
                      ))}
                    </div>
                    {portfolioSettings.rebalanceTrigger === "threshold" && (
                      <SliderSetting label="Drift threshold" value={portfolioSettings.rebalanceThreshold} onChange={v => setPortfolioSettings(p => ({...p, rebalanceThreshold: v}))} min={2} max={15} />
                    )}
                    {portfolioSettings.rebalanceTrigger === "score" && (
                      <div style={{ fontSize: 12, color: COLORS.textMuted, padding: "8px 0" }}>Rebalance when any holding drops below score of 40</div>
                    )}
                    {portfolioSettings.rebalanceTrigger === "calendar" && (
                      <div style={{ fontSize: 12, color: COLORS.textMuted, padding: "8px 0" }}>Review and rebalance at end of each quarter</div>
                    )}
                  </Section>

                  {/* ---- SCORING WEIGHTS ---- */}
                  <Section id="scoring" icon="⚖" title="Scoring Weights">
                    {totalWeight !== 100 && (
                      <div style={{ padding: "8px 12px", borderRadius: 6, background: COLORS.redBg, border: `1px solid ${COLORS.red}30`, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>⚠</span>
                        <span style={{ fontSize: 11, color: COLORS.red }}>Weights total {totalWeight}% — must equal 100%</span>
                      </div>
                    )}
                    {totalWeight === 100 && (
                      <div style={{ padding: "8px 12px", borderRadius: 6, background: COLORS.greenBg, border: `1px solid ${COLORS.green}30`, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>✓</span>
                        <span style={{ fontSize: 11, color: COLORS.green }}>Weights balanced at 100%</span>
                      </div>
                    )}
                    {[
                      { key: "fundamentals", label: "Fundamentals", desc: "P/E, FCF yield, revenue growth, debt levels", color: COLORS.accent },
                      { key: "technicals", label: "Technicals", desc: "RSI, MACD, moving averages, volume", color: COLORS.green },
                      { key: "analyst", label: "Analyst Consensus", desc: "Ratings, price targets, revision direction", color: COLORS.yellow },
                      { key: "sentiment", label: "News & Sentiment", desc: "News flow, insider activity, put/call ratio", color: "#c77dff" },
                      { key: "macro", label: "Macro Context", desc: "VIX, rates, yield curve, sector rotation", color: COLORS.red },
                    ].map((w) => (
                      <div key={w.key} style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{w.label}</span>
                          <span style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: w.color }}>{weights[w.key]}%</span>
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 8 }}>{w.desc}</div>
                        <input type="range" min={0} max={50} step={5} value={weights[w.key]}
                          onChange={e => setWeights(p => ({...p, [w.key]: Number(e.target.value)}))}
                          style={{ width: "100%", height: 4, appearance: "none", background: COLORS.bgInput, borderRadius: 2, outline: "none", cursor: "pointer", accentColor: w.color }}
                        />
                        <div style={{ height: 6, background: COLORS.bgInput, borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${weights[w.key] * 2}%`, background: w.color, borderRadius: 3, opacity: 0.7, transition: "width 0.2s" }} />
                        </div>
                      </div>
                    ))}

                    {/* Visual weight distribution bar */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: COLORS.textDim, marginBottom: 8 }}>Weight Distribution</div>
                      <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden" }}>
                        {[
                          { key: "fundamentals", color: COLORS.accent },
                          { key: "technicals", color: COLORS.green },
                          { key: "analyst", color: COLORS.yellow },
                          { key: "sentiment", color: "#c77dff" },
                          { key: "macro", color: COLORS.red },
                        ].map(w => (
                          <div key={w.key} style={{ width: `${weights[w.key]}%`, background: w.color, opacity: 0.7, transition: "width 0.2s" }} />
                        ))}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, flexWrap: "wrap", gap: 6 }}>
                        {[
                          { key: "fundamentals", label: "Fund", color: COLORS.accent },
                          { key: "technicals", label: "Tech", color: COLORS.green },
                          { key: "analyst", label: "Analyst", color: COLORS.yellow },
                          { key: "sentiment", label: "News", color: "#c77dff" },
                          { key: "macro", label: "Macro", color: COLORS.red },
                        ].map(w => (
                          <div key={w.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ width: 6, height: 6, borderRadius: 1, background: w.color, opacity: 0.7 }} />
                            <span style={{ fontSize: 9, color: COLORS.textDim }}>{w.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Section>

                  {/* ---- DATA SOURCES ---- */}
                  <Section id="data" icon="⬡" title="Data Sources & Schedule">
                    <SectionLabel>Connected Sources</SectionLabel>
                    {[
                      { name: "Yahoo Finance", status: "Connected", active: true, feeds: "OHLCV, fundamentals, options chains, dividends", lastSync: "5:30 AM PT", freq: "2x daily" },
                      { name: "FRED", status: "Connected", active: true, feeds: "Fed funds rate, yield curve, CPI, employment", lastSync: "5:30 AM PT", freq: "Daily" },
                      { name: "SEC EDGAR", status: "Connected", active: true, feeds: "Forms 3/4/5, 8-K, 10-Q, 13-F filings", lastSync: "5:30 AM PT", freq: "Daily" },
                      { name: "Finnhub", status: "API Key Required", active: false, feeds: "Real-time quotes, news sentiment, earnings calendar", lastSync: "—", freq: "—" },
                      { name: "Alpha Vantage", status: "API Key Required", active: false, feeds: "Technical indicators, sector performance, news", lastSync: "—", freq: "—" },
                      { name: "TipRanks", status: "API Key Required", active: false, feeds: "Analyst rankings, consensus ratings, smart score", lastSync: "—", freq: "—" },
                      { name: "Anthropic (Claude)", status: "Connected", active: true, feeds: "AI summaries, synthesis, morning briefing", lastSync: "6:00 AM PT", freq: "2x daily" },
                    ].map((s, i) => (
                      <div key={s.name} style={{
                        padding: "12px 14px", marginBottom: 4, background: COLORS.bgInput, borderRadius: 8,
                        border: `1px solid ${s.active ? COLORS.border : COLORS.yellow + "30"}`,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{s.name}</span>
                          <span style={{ fontFamily: font, fontSize: 10, color: s.active ? COLORS.green : COLORS.yellow, padding: "2px 8px", borderRadius: 4, background: s.active ? COLORS.greenBg : COLORS.yellowBg }}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.textDim, lineHeight: 1.5 }}>{s.feeds}</div>
                        {s.active && (
                          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                            <span style={{ fontSize: 10, color: COLORS.textMuted }}>Last sync: <span style={{ fontFamily: font, color: COLORS.accent }}>{s.lastSync}</span></span>
                            <span style={{ fontSize: 10, color: COLORS.textMuted }}>Freq: <span style={{ fontFamily: font, color: COLORS.accent }}>{s.freq}</span></span>
                          </div>
                        )}
                      </div>
                    ))}

                    <SectionLabel>Refresh Schedule (Pacific Time)</SectionLabel>
                    <div style={{ padding: "14px", background: COLORS.bgInput, borderRadius: 8, marginBottom: 10 }}>
                      <div style={{ fontSize: 10, color: COLORS.accent, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Stage 1 · Pre-Market</div>
                      {[
                        { label: "Data pull", time: "5:30 AM", desc: "Pre-market prices, overnight news, filings, macro" },
                        { label: "Scoring engine", time: "5:45 AM", desc: "Composite scores for all 60 tickers" },
                        { label: "Claude analysis", time: "6:00 AM", desc: "Briefing, Verdict, alerts, portfolio summaries" },
                      ].map((r, i) => (
                        <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "6px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                          <span style={{ fontFamily: font, fontSize: 12, color: COLORS.accent, fontWeight: 600, minWidth: 64 }}>{r.time}</span>
                          <div>
                            <div style={{ fontSize: 12, color: COLORS.text }}>{r.label}</div>
                            <div style={{ fontSize: 10, color: COLORS.textDim }}>{r.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "14px", background: COLORS.bgInput, borderRadius: 8 }}>
                      <div style={{ fontSize: 10, color: COLORS.green, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Stage 2 · Post-Open Refresh</div>
                      {[
                        { label: "Live price refresh", time: "7:00 AM", desc: "Market prices after 30min of trading" },
                        { label: "Technical update", time: "7:00 AM", desc: "RSI, MACD, volume with live data" },
                        { label: "Briefing addendum", time: "7:05 AM", desc: "Claude updates if morning session changed anything" },
                      ].map((r, i) => (
                        <div key={r.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "6px 0", borderTop: i > 0 ? `1px solid ${COLORS.border}` : "none" }}>
                          <span style={{ fontFamily: font, fontSize: 12, color: COLORS.green, fontWeight: 600, minWidth: 64 }}>{r.time}</span>
                          <div>
                            <div style={{ fontSize: 12, color: COLORS.text }}>{r.label}</div>
                            <div style={{ fontSize: 10, color: COLORS.textDim }}>{r.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <SectionLabel>Heartbeat Demo</SectionLabel>
                    <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 10, lineHeight: 1.5 }}>Simulate source health to preview the heartbeat indicator and ghost banner. In production this updates automatically.</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[
                        { id: "healthy", label: "All Good", color: COLORS.green, match: staleCount === 0 },
                        { id: "warn", label: "1 Stale", color: COLORS.yellow, match: staleCount === 1 },
                        { id: "critical", label: "3 Failed", color: COLORS.red, match: staleCount > 1 },
                      ].map(d => (
                        <button key={d.id} onClick={() => {
                          if (d.id === "healthy") setDataHealth({ sources: dataHealth.sources.map(s => ({ ...s, ok: true, lastSync: s.name === "Finnhub" ? "5:31 AM PT" : s.lastSync })), bannerDismissed: false });
                          else if (d.id === "warn") setDataHealth({ sources: dataHealth.sources.map((s, i) => ({ ...s, ok: i !== 3, lastSync: i === 3 ? "4h ago" : "5:30 AM PT" })), bannerDismissed: false });
                          else setDataHealth({ sources: dataHealth.sources.map((s, i) => ({ ...s, ok: i < 3, lastSync: i < 3 ? "5:30 AM PT" : i === 3 ? "4h ago" : i === 4 ? "6h ago" : "2h ago" })), bannerDismissed: false });
                        }} style={{
                          flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontFamily: font, cursor: "pointer",
                          border: `1px solid ${d.match ? d.color : COLORS.border}`,
                          background: d.match ? d.color + "15" : "transparent",
                          color: d.match ? d.color : COLORS.textDim,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color }} />
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "8px 0 20px",
        background: theme === "light" ? "rgba(244,242,238,0.92)" : `linear-gradient(180deg, transparent 0%, ${COLORS.bg} 15%)`,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${COLORS.border}`,
        boxShadow: theme === "light" ? "0 -2px 12px rgba(0,0,0,0.04)" : "none",
      }}>
        {[
          { id: "home", label: "Home", icon: "⌂" },
          { id: "portfolio", label: "Portfolio", icon: "$" },
          { id: "tickers", label: "Tickers", icon: "≡" },
          { id: "analyst", label: "Analyst", icon: "C" },
          { id: "settings", label: "Settings", icon: "⚙" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: "2px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              color: activeTab === tab.id ? COLORS.accent : COLORS.textDim,
              transition: "color 0.15s",
            }}
          >
            {/* Active dot */}
            <div style={{
              width: 4, height: 4, borderRadius: "50%",
              background: activeTab === tab.id ? COLORS.accent : "transparent",
              marginBottom: 1, transition: "background 0.15s",
            }} />
            {tab.id === "analyst" ? (
              <div style={{
                width: 20, height: 20, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, lineHeight: 1,
                background: activeTab === "analyst" ? `linear-gradient(135deg, ${COLORS.accent}, #7c5cff)` : "transparent",
                color: activeTab === "analyst" ? "#fff" : COLORS.textDim,
                border: activeTab === "analyst" ? "none" : `1.5px solid ${COLORS.textDim}`,
              }}>C</div>
            ) : (
              <span style={{ fontSize: 18, lineHeight: "20px", height: 20, display: "flex", alignItems: "center" }}>{tab.icon}</span>
            )}
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
