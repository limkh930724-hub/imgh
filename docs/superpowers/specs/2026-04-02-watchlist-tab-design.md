# Watchlist Tab Design Spec

**Date:** 2026-04-02
**Status:** Approved

## Goal

Add a dedicated "Watchlist" tab where users can add any Korean or US stock ticker and see today's price movement in a clean table view.

This is independent from the existing Overview tab chips (MKT_SYMBOLS), which remain unchanged.

---

## Architecture

Single-file pattern — all changes in `index.html` (HTML, CSS, JS inline). No new files needed.

### New globals

| Variable | Purpose |
|---|---|
| `watchlistData` | Last fetch result cache — `[{sym, name, price, change, pct, prevClose, currency}]`. Replayed on lang/theme switch without re-fetching. |

### Storage

- `localStorage('fg-watchlist')` — persisted array of `{sym, name, currency}`
- Completely separate from `fg-portfolio`

---

## Tab Structure

Fifth tab added after Calendar:

```
Overview | Timeline | Indicators | Calendar | Watchlist
```

i18n tab label: `tabWatchlist` → `'Watchlist'` / `'관심종목'`

---

## UI Layout

```
[ Symbol input ──────────────────────── Add ]
  (error message if invalid)

┌──────────┬────────┬─────────┬───────┬──────────┬───┐
│ Name     │ Price  │ Change  │  %    │Prev Close│   │
├──────────┼────────┼─────────┼───────┼──────────┼───┤
│ AAPL     │$182.50 │  +3.20  │+1.78% │  $179.30 │ × │
│ 삼성전자 │₩74,200 │   +800  │+1.09% │  ₩73,400 │ × │
│ TSLA     │$245.10 │  -8.40  │-3.31% │  $253.50 │ × │
└──────────┴────────┴─────────┴───────┴──────────┴───┘
```

**Empty state** (no tickers added yet):
```
관심 종목을 추가해보세요 / Add your first ticker
AAPL, TSLA, 005930 등 입력 후 Add
```

---

## Add Ticker Flow

1. User types symbol in input (e.g. `AAPL`, `TSLA`, `005930`)
2. Numeric-only input → auto-append `.KS` (Korean stock suffix)
3. Press Enter or click Add button
4. Validate: fetch Yahoo Finance `v8/chart/<sym>?range=1d&interval=1d` via existing `/api/proxy`
   - Success → extract `meta.shortName`, `meta.currency` → save to localStorage, add row with `…` loading state → populate with live data
   - Failure → show inline error below input: `wlInvalidSym`
5. Duplicate detection: if `sym` already in watchlist → show `wlDuplicate` error, do not add

---

## Table Behavior

- **Name column**: `meta.shortName` from Yahoo Finance (e.g. "Apple Inc.", "삼성전자")
- **Price**: `meta.regularMarketPrice`
- **Change**: `regularMarketPrice - previousClose` (absolute, with +/− sign)
- **%**: `(change / previousClose) * 100`, 2 decimal places, with +/− sign
- **Prev Close**: `meta.previousClose`
- **Delete (×)**: removes row immediately, updates localStorage

**Color coding:**
- Positive change → `#16a34a` (light) / `#4ade80` (dark)
- Negative change → `#dc2626` (light) / `#f87171` (dark)
- Zero / no data → `var(--text-muted)`

**Currency formatting:**
- `KRW` → `₩` prefix, `toLocaleString('ko-KR', {maximumFractionDigits: 0})`
- Others (USD etc.) → `$` prefix, `toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})`

**Loading state:** While fetching after add, show `…` in all data cells for that row.

**Mobile (≤480px):** Hide Prev Close column.

---

## Data Refresh

- Fetch all watchlist symbols when the Watchlist tab is first activated
- Auto-refresh every `MKT_REFRESH` seconds (3600s), same pattern as market ticker chips
- Skip refresh when the Watchlist tab is not active
- Cache result in `watchlistData`; replay on lang/theme toggle without re-fetching

---

## i18n Keys

Add to both `TRANSLATIONS.en` and `TRANSLATIONS.ko`:

| Key | EN | KO |
|---|---|---|
| `tabWatchlist` | `Watchlist` | `관심종목` |
| `wlAddPlaceholder` | `Symbol (e.g. AAPL, 005930)` | `종목코드 (예: AAPL, 005930)` |
| `wlAdd` | `Add` | `추가` |
| `wlColName` | `Name` | `종목명` |
| `wlColPrice` | `Price` | `현재가` |
| `wlColChange` | `Change` | `등락` |
| `wlColPct` | `%` | `%` |
| `wlColPrev` | `Prev Close` | `전일종가` |
| `wlEmpty` | `Add your first ticker` | `관심 종목을 추가해보세요` |
| `wlInvalidSym` | `Symbol not found` | `종목을 찾을 수 없습니다` |
| `wlDuplicate` | `Already in watchlist` | `이미 추가된 종목입니다` |

Lang/theme toggle: re-render table headers and empty state immediately using cached `watchlistData`.

---

## CSS

New styles scoped to `.watchlistView`:

- `.wl-add-row` — flex row, input + button, gap, padding
- `.wl-error` — small red text below input, hidden by default
- `.wl-table` — full-width table, border-collapse, uses `--border`, `--bg-card`, `--text` CSS vars
- `.wl-table th` — uppercase, small font, `var(--text-muted)`, border-bottom
- `.wl-table td` — padding, border-bottom `var(--border-2)`
- `.wl-table tr:hover td` — subtle background highlight
- `.wl-up` — green color class
- `.wl-down` — red color class
- `.wl-empty` — centered empty state text, `var(--text-muted)`
- `.wl-remove` — borderless × button, `var(--text-muted)`, hover darkens

---

## Out of Scope

- Sorting / filtering rows
- KR/US grouping by market
- Sparkline / mini chart per ticker
- Price alerts / notifications
- The existing Overview tab MKT_SYMBOLS chips (unchanged)
