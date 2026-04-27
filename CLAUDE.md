# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Tool
When spawning subagents via the Agent tool, always set `model: "haiku"` unless the task explicitly requires a more capable model.

## Running the app

No build step, no package manager — all files are static HTML.

```bash
# Serve locally (any static server works)
npx serve .
# or
python -m http.server 8080
```

Open `http://localhost:8080` in a browser.

## Architecture

This is a **multi-page portfolio hub**. Each page is a self-contained HTML file (no modules, no bundler). All logic, styles, and markup are inline per file.

| File | Purpose | Lines |
|---|---|---|
| `index.html` | Portfolio hub — card grid linking to all tools | ~675 |
| `fear-greed.html` | CNN Fear & Greed Index app (main app) | ~3984 |
| `asset.html` | 자산 계산기 통합 허브 — 3 tabs: compound, goal, journal | ~717 |
| `compound.html` | Redirect stub → `/asset.html?tab=compound` | 12 |
| `goal.html` | Redirect stub → `/asset.html?tab=goal` | 12 |
| `journal.html` | Redirect stub → `/asset.html?tab=journal` | 12 |
| `backtest.html` | 백테스트 비교기 (up to 3-ticker comparison) | ~1304 |
| `workout.html` | 운동 루틴 (workout routine dashboard) | ~432 |
| `agents.html` | AI 에이전트 부동산 조회 (Seoul map real estate search) | ~254 |
| `commerce.html` | 커머스 시스템 — OMS+WMS+PLM, React CDN + Context API, 단일 HTML | ~1588 |
| `disaster.html` | 재난 대응 시뮬레이터 — 대피소 지도, 재난문자 시뮬레이션, 경보·경로 | ~1681 |
| `Certificate.html` | 정보처리기사 문제풀이 — 퀴즈 앱, 라이트 테마 전용 | ~1120 |

Each HTML file is structured: `<head>` (Inter font + inline `<style>`) → `<body>` (markup) → `<script>` (all app logic).

### Hub (`index.html`)

Responsive card grid (3-col → 2-col → 1-col) with sticky top nav. Cards link to each tool page. Cards with `card-soon` class are non-clickable (`pointer-events: none`). Dark/light toggle is handled by JS: `data-theme` attribute on `<html>`, persisted to `localStorage('hub-theme')`, default dark.

### Asset Calculator Hub (`asset.html`)

Integrated hub combining three calculators into one page with a tab bar (`?tab=compound|goal|journal`). Tab state is read from the URL query param on load via `initAssetTabs()`. Each tool is initialized by its own `init*Tool()` function: `initCompoundTool()`, `initGoalTool()`, `initJournalTool()`. The old individual pages (`compound.html`, `goal.html`, `journal.html`) now redirect here with the appropriate `?tab=` param.

### Backtest (`backtest.html`)

Supports up to 3 tickers (A, B, and optional C). Ticker C is dynamically added/removed. Charts, summary cards, and comparison table all handle 3-ticker data. The diff column in the comparison table uses 1st-place vs last-place as the reference.

### Workout (`workout.html`)

State persisted to `localStorage('fg-workout')` as `{sessions: [], checks: {}, categories: []}`. Key features:
- **Sessions** — log form (name, category, minutes, intensity, note); 6 most recent shown in reverse order
- **Checklist** — per-day checkbox grid per category, stored in `state.checks['YYYY-MM-DD']`
- **Week strip** — 7-cell row for the current week: `●` (session logged), `◐` (checklist only), `○` (empty)
- **Templates** — `TEMPLATES` constant provides quick-fill presets (e.g. 상체, 하체, 유산소)
- **Stats** — total minutes, session count, top category, streak (consecutive days with activity)

### Fear & Greed app (`fear-greed.html`)

This is the main app. All globals and helper functions below refer to its `<script>` block.

### Key globals in the script block

| Variable | Purpose |
|---|---|
| `TRANSLATIONS` | i18n object with `en` and `ko` sub-objects containing all UI strings |
| `currentLang` | `'en'` or `'ko'`, persisted to `localStorage('fg-lang')` |
| `currentTheme` | `'light'` or `'dark'`, persisted to `localStorage('fg-theme')` |
| `CORS_PROXY` | `'/api/proxy?url='` — Vercel serverless proxy (`api/proxy.js`), prepended to all Yahoo/CNN fetches |
| `API_URL` | CNN Fear & Greed endpoint: `https://production.dataviz.cnn.io/index/fearandgreed/graphdata` |
| `historicalData` | Array of `{x: ms, y: score}` from CNN API, used by Timeline tab |
| `_cachedScores` | Last fetched scores; replayed on lang/theme switch without re-fetching |
| `_sp500Cache` | `{ts: number[], closes: number[]}` — S&P 500 daily closes (2y), ms timestamps |
| `sp500OverlayEnabled` | Boolean toggling the S&P 500 overlay on the Timeline canvas |
| `MKT_SYMBOLS` | Array of `{sym, name, fmt}` for market ticker chips: `^KS11`, `^IXIC`, `^GSPC`, `^DJI`, `BTC-USD` |
| `portfolioItems` | Array of `{sym, buyPrice, qty, loading}` for the portfolio calculator, persisted to `localStorage('fg-portfolio')` |
| `calendarYear` | Currently displayed year in the Calendar tab (default: current year) |
| `calendarDataMap` | `Map<'YYYY-MM-DD', score>` built from `historicalData`; nulled on data/theme/lang change to trigger redraw |
| `CAL_THIS_YEAR` | Module-level constant: `new Date().getFullYear()` — used by year selector buttons |

### Helper functions

- `t(key)` — returns `TRANSLATIONS[currentLang][key]` with English fallback
- `tc(light, dark)` — returns the correct value for the current theme
- `applyTranslations()` — updates all `data-i18n` elements in the DOM
- `applyTheme()` — toggles `body.dark` class and updates theme toggle button icon

### Data flow

```
fetchData()
  → CNN API (via CORS proxy)
  → applyData() → animateGauge() + renderHistory() + drawGauge()
  → historicalData (for Timeline tab)

fetchExchangeRates()           (1h refresh, open.er-api.com, no proxy needed)
fetchMarketTicker()            (1h refresh, Yahoo v8/chart per symbol, parallel)
fetchAndCacheSP500()           (on-demand when overlay toggled, Yahoo v8/chart range=2y)
```

### Canvas rendering

- **Gauge** (`drawGauge`, `animateGauge`) — `<canvas id="gaugeCanvas">`, draws colored arc zones, needle, and zone labels. Rotation formula: `rot = angle + Math.PI / 2` (do not add conditionals; that caused flipped labels).
- **Timeline** (`drawTimeline`, `initTimelineCanvas`) — `<canvas id="timelineCanvas">`, vanilla canvas with zone band fills, FG score line, optional S&P 500 orange overlay. `PADDING` constants control margins; `chartR` widens by 48px when SP500 overlay is active.
- **Indicators** — Chart.js line charts (lazy-loaded on first tab click).

### CORS proxy URL encoding rule

**Always** wrap the full Yahoo Finance URL in `encodeURIComponent` before appending to `CORS_PROXY`. Any `&` in the Yahoo URL that is not encoded will be parsed as a separate query parameter by corsproxy.io, causing Yahoo to receive an incomplete URL:

```js
// Correct
const url = CORS_PROXY + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=2y&interval=1d');

// Wrong — &interval=1d goes to corsproxy, not Yahoo
const url = `${CORS_PROXY}https://...?range=2y&interval=1d`;
```

### S&P 500 overlay matching

The FG historical timestamps (`historicalData[i].x`) are in **milliseconds**. `_sp500Cache.ts` stores Yahoo Finance timestamps converted to ms (`ts * 1000`). Matching uses nearest-neighbor within ±3 days — do not use date-string comparison (timezone offsets cause mismatches). SP500 is normalized to 0–100 using its own min/max for the filtered period, then drawn with `yPos()` (same coordinate system as FG), in orange (`#e65100` / `#fb923c` dark).

### Adding new i18n keys

Add to both `TRANSLATIONS.en` and `TRANSLATIONS.ko` blocks before `fxTitle`. Update `applyTranslations()` or use `data-i18n="keyName"` on HTML elements. For dynamic text (e.g. countdown), manually call `el.textContent = t('key')` in the lang/theme toggle handlers.

### Tab structure

Five tabs: **Overview** (gauge + history cards + market chips), **Timeline** (canvas chart with period buttons 1W/1M/3M/6M/1Y/All), **Indicators** (Chart.js lazy-loaded charts), **Calendar** (heatmap), **Watchlist** (localStorage-backed `fg-watchlist`, Yahoo Finance price fetch). Tab switching is handled by a single `click` listener on `.tab` buttons using `data-tab` attributes.

Below the tab panels, outside the `.main-content` grid, sit two additional sections:

- **Score Interpreter** (`.interpreter`) — shows a 3-line market reading based on the current FG score, split into 5 zones (0–25 Extreme Fear → 75–100 Extreme Greed). Updated by `updateInterpreter(score)`.
- **Portfolio Calculator** (`.calc-section`) — lets the user add ticker symbols with buy price + quantity; fetches current price via Yahoo Finance (same proxy), computes P&L. State is in `portfolioItems` and saved to `localStorage('fg-portfolio')`. The `loading` field is excluded from what gets persisted.

### Calendar heatmap

- `<canvas id="calendarCanvas">` inside `.cal-wrapper` (`.calendarView`).
- `buildCalendarMap()` converts `historicalData` into `calendarDataMap` (keyed `'YYYY-MM-DD'`). Call `calendarDataMap = null` to force a rebuild on next render.
- `drawCalendar()` renders a GitHub-style grid: weeks as columns, Mon–Sun as rows, cells colored by `getZone(score).color`. Cells with no data use `--border-2`.
- Month labels use `t('months')[month]` — an array of 12 abbreviated month names in the current language.
- Mouse tooltip (`#calTooltip`) shows date + score + zone name; uses `t(getZone(score).labelKey)`.
- Must call `calendarDataMap = null` on theme change (colors change), lang change (zone labels change), and inside `applyData()` (new data arrived).
- Year selector: `#calBtnCurrent` / `#calBtnPrev`, labels updated by `updateCalYearBtnLabels()`.

### Share button

- `#shareBtn` (`.share-btn`) sits in `.gauge-footer` below the gauge, alongside `#lastUpdated`.
- Prefers `navigator.share` (mobile native sheet); falls back to `navigator.clipboard.writeText` on desktop.
- Label (`#shareBtnLabel`) and `title` reflect current language; call `document.getElementById('shareBtnLabel').textContent = t('shareTitle')` in the lang toggle handler.

### Refresh intervals

- Exchange rates (`FX_REFRESH`): 3600 seconds
- Market ticker (`MKT_REFRESH`): 3600 seconds

## Coding conventions

- **Indentation**: 4 spaces
- **JS**: `camelCase` for variables and functions
- **CSS**: `kebab-case` for class names
- **Bilingual UI**: preserve existing `en`/`ko` patterns when editing visible text
- **Commits**: short Conventional Commit prefix + concise Korean description, e.g. `fix: backtest 카드 정렬 보정`

## Deployment

Deployed to Vercel. The `api/` directory contains serverless functions (ESM, `export default async function handler`).

Environment variable required in Vercel:
- `DATA_GO_KR_API_KEY` (fallback name: `PUBLIC_DATA_API_KEY`) — 공공데이터포털 key for `api/real-estate.js`. Without it, the endpoint silently returns `MOCK_ITEMS`.

No other env vars are needed; all other external calls go through `api/proxy.js` which has no secrets.

### Other files

- **`api/proxy.js`** — Vercel serverless function acting as CORS proxy. Allowlist: CNN dataviz, Yahoo Finance, open.er-api.com. Used in production; locally any static server works since the browser hits the same origin.
- **`api/real-estate.js`** — Vercel serverless function for Korean apartment transaction data. Fetches from 공공데이터포털 (data.go.kr) sale/rent endpoints, with MOCK_ITEMS fallback. Supports region codes for Seoul/Gyeonggi districts. Used by `agents.html`.
- **`sw.js`** — Service Worker for PWA offline support. Current `CACHE_NAME = 'fg-cache-v8'`. PRECACHE includes `/`, `/index.html`, `/fear-greed.html`, `/asset.html`, `/compound.html`, `/goal.html`, `/journal.html`, `/backtest.html`, `/workout.html`, `/agents.html`, `/commerce.html`, `/manifest.json`, `/icon.svg`. **Note:** `disaster.html` and `Certificate.html` are not yet in PRECACHE. Bump `CACHE_NAME` string to invalidate on deploy; add new pages to PRECACHE when created. Note: `NETWORK_FIRST_PREFIXES` still contains a legacy `https://corsproxy.io` entry from before the Vercel proxy migration — harmless but unused.
- **`manifest.json`** + **`icon.svg`** — PWA web app manifest and home screen icon. Referenced in `sw.js` PRECACHE and `<link rel="manifest">` in `fear-greed.html`, but **these files do not currently exist** in the repo and need to be created.
- **`index.backup.html`** — snapshot of `index.html` before a major restructure; not served, safe to ignore.
- **`.codex-*`** — local test artifacts from Codex experiments; not tracked, safe to ignore.
- **`preview-*.png`, `final-*.png`** — screenshot files from browser testing; local only, gitignored.
- **`docs/superpowers/specs/`** — design specs for planned features (approved before implementation).
- **`docs/superpowers/plans/`** — implementation plans generated from specs.
  - Pending (spec + plan): commerce redesign (`2026-04-17-commerce-redesign.md` — dark slate hero panel + 3×3 tile launcher home, ERP-style, full restyle of `commerce.html`); UI Lab (`2026-04-17-ui-lab.md` — React+Tailwind CDN showcase page, implemented and reverted, plan ready to re-implement); disaster simulator enhancements (`2026-04-22-disaster-sim.md`).
  - Pending (spec only): hub redesign (`2026-04-16-hub-redesign-design.md` — black-and-white agency style, supersedes `2026-04-06` version).
  - Completed: disaster simulator (`disaster.html` implemented); commerce system (`2026-04-14-commerce-system.md`); backtest 3-ticker support (`2026-04-14-backtest-3ticker.md`); asset calculator hub consolidation (compound + goal + journal → `asset.html`); portfolio hub + fear-greed split (`2026-04-06-portfolio-hub.md`); calculators compound + goal (`2026-04-06-calculators.md`); journal (`2026-04-06-journal.md`); backtest (`2026-04-06-backtest.md`); watchlist tab (`2026-04-02-watchlist-tab.md`); PWA + Calendar + Share (`2026-03-27-pwa-heatmap-share.md`); market features interpreter + portfolio calculator (`2026-03-31-market-features.md`).
