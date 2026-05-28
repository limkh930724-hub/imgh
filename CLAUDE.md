# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Tool
When spawning subagents via the Agent tool, always set `model: "haiku"` unless the task explicitly requires a more capable model.

## Running the app

No build step, no package manager — all files are static HTML.

```bash
# Recommended (Python may not be installed)
npx serve . -l 8080
```

Open `http://localhost:8080` in a browser.

### 정보처리기사 quiz build script

`build_study_app.py` generates `정보처리기사_문제풀이.html` (a standalone multi-exam quiz app, separate from `Certificate.html`) by parsing Korean IT exam PDF pairs. Requires `pypdf`:

```bash
pip install pypdf
python build_study_app.py
```

The script auto-discovers PDF pairs in the repo root named `*{YYYYMMDD}*학생용*.pdf` (questions) and `*{YYYYMMDD}*해설집*.pdf` (explanations). `build_20200606_study_app.py` is an older hard-coded version for a single exam date.

## Architecture

This is a **multi-page portfolio hub**. Each page is a self-contained HTML file (no modules, no bundler). All logic, styles, and markup are inline per file.

| File | Purpose | Lines |
|---|---|---|
| `index.html` | 이직용 포트폴리오 랜딩 — 5-섹션 스크롤 스냅, Hero·Career·Skills·Projects·Contact | ~1400 |
| `fear-greed.html` | CNN Fear & Greed Index app (main app) | ~3577 |
| `asset.html` | 자산 계산기 통합 허브 — 3 tabs: compound, goal, journal | ~664 |
| `compound.html` | Redirect stub → `/asset.html?tab=compound` | 12 |
| `goal.html` | Redirect stub → `/asset.html?tab=goal` | 12 |
| `journal.html` | Redirect stub → `/asset.html?tab=journal` | 12 |
| `backtest.html` | 백테스트 비교기 (up to 3-ticker comparison) | ~1197 |
| `workout.html` | 운동 루틴 (workout routine dashboard) | ~431 |
| `agents.html` | AI 에이전트 부동산 조회 (Seoul map real estate search) | ~249 |
| `commerce.html` | 커머스 시스템 — OMS+WMS+PLM, React CDN + Context API, 단일 HTML | ~1478 |
| `disaster.html` | 재난 대응 시뮬레이터 — 대피소 지도, 재난문자 시뮬레이션, 경보·경로 | ~1540 |
| `Certificate.html` | 정보처리기사 문제풀이 — 퀴즈 앱, 라이트 테마 전용 | ~1155 |
| `portfolio_tracker.html` | 개인 주식 포트폴리오 트래커 — 비밀번호 게이트, 스냅샷 기반 수익률 추적 | ~1105 |
| `casestudy.html` | 기획 케이스 스터디 갤러리 — 카드 그리드, 각 케이스 상세 페이지로 링크 | ~237 |
| `casestudy-commerce.html` | 커머스 시스템 기획 케이스 스터디 상세 | ~366 |
| `casestudy-feargreed.html` | 공포탐욕지수 기획 케이스 스터디 상세 | ~374 |
| `casestudy-disaster.html` | 재난 대응 시뮬레이터 기획 케이스 스터디 상세 | ~420 |

Each HTML file is structured: `<head>` (font import + inline `<style>`) → `<body>` (markup) → `<script>` (all app logic).

### Portfolio Landing (`index.html`)

이직용 단일 페이지 스크롤 포트폴리오. 폰트: **Plus Jakarta Sans** (body) + **JetBrains Mono** (numbers/code). 다크/라이트 토글: `data-theme` on `<html>`, `localStorage('hub-theme')`, 기본 라이트.

**섹션 구조** (`scroll-snap-type: y mandatory`):
1. `#hero` — 2-column (left: 이름·철학·CTA / right: 2×2 stat grid). 카운터 애니메이션(0→target), 히어로 stagger entrance.
2. `#career` — 2-col grid, SM(2020–2023) vs SI(2023–현재). SI 카드에 `career-card--current` + pulse badge.
3. `#skills` — 3-col skill card grid. 카드 진입 시 내부 태그 stagger(`--i` CSS variable).
4. `#projects` — 6개 프로젝트 카드(3×2), `section--free`. 각 카드 상단 컬러 strip + 3D tilt(mousemove).
5. `#contact` — 2-col (left: 링크 목록 / right: ID 카드, 모바일 숨김).

**고정 UI**: `.theme-toggle`(top-right), `.dot-nav`(right side, 5 dots), `#cursorDot`+`#cursorRing`(custom cursor, desktop only).

**`#bgCanvas`**: `position:fixed; z-index:0` — Particles & Nodes Canvas 배경. 파티클 수 = `min(110, W*H/9000)`. 150px 이내 파티클끼리 선 연결, 마우스 100px 이내 반발. 테마 전환 시 색상 자동변경(라이트: `#16a34a` / 다크: `#4ade80`). 모든 `.section`은 `z-index:1`로 canvas 위에 렌더.

**스크롤 리빌 시스템**: `[data-reveal]` 속성 요소에 `IntersectionObserver`로 `.revealed` 클래스 추가. `--reveal-delay` CSS 변수로 stagger 제어. `.career-card`는 좌/우 slideIn, `.skill-card.revealed`는 내부 태그 stagger.

**모바일(≤768px)**: `scroll-snap-type` 유지, 모든 섹션 `min-height:100vh` 강제. dot-nav 숨김, custom cursor 숨김, 3D tilt 비활성.

### Asset Calculator Hub (`asset.html`)

Integrated hub combining three calculators into one page with a tab bar (`?tab=compound|goal|journal`). Tab state is read from the URL query param on load via `initAssetTabs()`. Each tool is initialized by its own `init*Tool()` function: `initCompoundTool()`, `initGoalTool()`, `initJournalTool()`. The old individual pages (`compound.html`, `goal.html`, `journal.html`) now redirect here with the appropriate `?tab=` param.

### Backtest (`backtest.html`)

Supports up to 3 tickers (A, B, and optional C). Ticker C is dynamically added/removed. Charts, summary cards, and comparison table all handle 3-ticker data. The diff column in the comparison table uses 1st-place vs last-place as the reference.

### Portfolio Tracker (`portfolio_tracker.html`)

Password-gated private portfolio tracker. Key architecture:

- **Password gate** — full-screen overlay (`#pt-gate`, `position:fixed;z-index:9999`) rendered before `.app`. Gate JS runs in a blocking IIFE in `<head>` area of body, using `crypto.subtle.digest('SHA-256', ...)` to compare against the stored hash. `sessionStorage('pt-auth')` persists auth for the browser session.
- **Data** — all snapshots are hardcoded in the `snapshots` array (no API calls). Each snapshot: `{date, label, totalAsset, totalEval, totalPnl, returnPct, sections[]}`. Add new data by appending to `snapshots`.
- **KPI Banner** — full-width 4-column strip (총투자자산 / 현재평가액 / 수익률 / 총손익) rendered by `renderKpiBanner()`. Rendered as large `28px` numbers above the main body.
- **Layout** — `.app` → `.topbar` → `.kpi-banner` → `.body` (`.left` sidebar 260px + `.right-wrap` flex:1). Desktop: `height:100vh; overflow:hidden`. Mobile (`≤768px`): stacks vertically, scrolling enabled.
- **Left panel** (`renderLeft()`) — donut SVG (asset allocation by section) + horizontal bar chart (P&L per section). Donut built from `rows[].amt`; bar from `rows[].pnl`.
- **Right panel** (`renderRight()`) — interactive canvas trend chart (`drawChart()`) + holdings cards filtered by `.itab` section tabs.
- **Calendar modal** — date picker to switch between snapshots. Days with data highlighted; clicking calls `pickDate(idx)`.
- **Color convention**: `--pos:#c0000a` (red = profit), `--neg:#1252a8` (blue = loss) — **inverted vs typical** financial convention.
- **Adding a new snapshot**: append an object to `snapshots[]` with the same shape as existing entries. `render()` auto-selects the last snapshot on load.

### Case Study Pages

- **`casestudy.html`** — gallery index page. 3-card grid (`.cs-grid`), each card links to a detail page. Uses same `hub-theme` localStorage key as `index.html`. Add new case study by adding a `.cs-card` `<a>` element to `.cs-grid`.
- **Detail pages** (`casestudy-*.html`) — shared structure: sticky header with `← 케이스 스터디` back link + fixed FAB `↗ 라이브` button (bottom-right, links to the live tool). Tab bar (`.cs-tabs`) with `.cs-tabs-inner` wrapper for centering. Four tabs: 배경 / 고민과 결정 / 화면 설계 / 완성. Tab switching: `switchTab(id)` sets `location.hash`, `updateTabUI(id)` updates DOM — `hashchange` listener calls `updateTabUI()` only (not `switchTab()`) to avoid circular coupling.

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

**Always** wrap the full Yahoo Finance URL in `encodeURIComponent` before appending to `CORS_PROXY`. Any `&` in the Yahoo URL that is not encoded will be parsed as a separate query parameter by the proxy handler, causing Yahoo to receive an incomplete URL:

```js
// Correct
const url = CORS_PROXY + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=2y&interval=1d');

// Wrong — &interval=1d is parsed as a separate query param by the proxy handler, not forwarded to Yahoo
const url = `${CORS_PROXY}https://...?range=2y&interval=1d`;
```

If you add a new upstream domain to fetch via the proxy, also add it to the `ALLOWED` array in `api/proxy.js`.

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

## localStorage key map

All persisted state lives in `localStorage` (or `sessionStorage` for auth). Keys by page:

| Key | Page | Contents |
|---|---|---|
| `hub-theme` | `index.html`, `casestudy.html` | `'light'` \| `'dark'` |
| `fg-lang` | `fear-greed.html` | `'en'` \| `'ko'` |
| `fg-theme` | `fear-greed.html` | `'light'` \| `'dark'` |
| `fg-portfolio` | `fear-greed.html` | `portfolioItems[]` (without `loading` field) |
| `fg-watchlist` | `fear-greed.html` (Watchlist tab) | watchlist ticker array |
| `fg-workout` | `workout.html` | `{sessions, checks, categories}` |
| `pt-auth` | `portfolio_tracker.html` | session auth flag (`sessionStorage`) |

## Coding conventions

- **Indentation**: 4 spaces
- **JS**: `camelCase` for variables and functions
- **CSS**: `kebab-case` for class names
- **Bilingual UI**: preserve existing `en`/`ko` patterns when editing visible text
- **Commits**: short Conventional Commit prefix + concise Korean description, e.g. `fix: backtest 카드 정렬 보정`

## Deployment

Deployed to Vercel. No `vercel.json` — Vercel's default static file serving handles all HTML pages. The `api/` directory is auto-detected as serverless functions (ESM, `export default async function handler`).

Environment variable required in Vercel:
- `DATA_GO_KR_API_KEY` (fallback name: `PUBLIC_DATA_API_KEY`) — 공공데이터포털 key for `api/real-estate.js`. Without it, the endpoint silently returns `MOCK_ITEMS`.

No other env vars are needed; all other external calls go through `api/proxy.js` which has no secrets.

### Serverless functions (`api/`)

- **`api/proxy.js`** — CORS proxy. `ALLOWED` array gates which upstream domains are permitted (CNN dataviz, Yahoo Finance, open.er-api.com). To proxy a new domain, add its prefix to `ALLOWED`. Responses are cached with `s-maxage=60, stale-while-revalidate=300`.
- **`api/real-estate.js`** — Korean apartment transaction data from 공공데이터포털 (data.go.kr), with `MOCK_ITEMS` fallback. Supports region codes for Seoul/Gyeonggi districts. Used by `agents.html`.

### Service Worker (`sw.js`)

Current `CACHE_NAME = 'fg-cache-v8'`. PRECACHE includes the main pages and assets. **Note:** `disaster.html`, `Certificate.html`, `portfolio_tracker.html`, and `casestudy*.html` are not yet in PRECACHE. When adding a new page, also add it to PRECACHE and bump `CACHE_NAME` to invalidate on deploy.

### Other files

- **`manifest.json`** + **`icon.svg`** — PWA web app manifest and home screen icon. Referenced in `sw.js` PRECACHE and `<link rel="manifest">` in `fear-greed.html`, but **these files do not currently exist** in the repo and need to be created.
- **`index.backup2.html`** — snapshot of `index.html` (card-grid 버전) before the 2026-05-27 portfolio redesign; not served, safe to ignore.
- **`.superpowers/`** — brainstorm and design artifacts generated by the superpowers skill system; not served.
- **`.claude/worktrees/`** — isolated git worktrees created by the Claude Code worktree skill; safe to ignore.
- **`docs/superpowers/specs/`** — design specs (`*-design.md`) for planned features.
- **`docs/superpowers/plans/`** — implementation plans generated from specs. Check this directory for pending feature plans before starting new work to avoid duplication.
