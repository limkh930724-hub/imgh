# Design: Customizable Watchlist + Daily Change

**Date:** 2026-03-27
**Status:** Approved

## Overview

Two enhancements to the market chips section on the Overview tab:

1. **Daily % change** — show each symbol's change vs previous close, color-coded green/red
2. **Customizable watchlist** — user can add/remove symbols; persisted in localStorage

File constraint: `index.html` only (inline, no new files).

---

## Feature 1: Daily % Change on Market Chips

### Data source

Yahoo Finance v8/chart already returns `meta.previousClose` and `meta.regularMarketPrice` in the existing `fetchMarketTicker()` response. No extra API calls needed.

### Calculation

```js
const change = ((price - previousClose) / previousClose) * 100;
const sign = change >= 0 ? '+' : '';
const label = `${change >= 0 ? '▲' : '▼'} ${sign}${change.toFixed(2)}%`;
```

### Display

Each chip renders three lines of text:
```
NAME
price
▲ +0.83%   ← green if positive, red if negative
```

Color tokens: use existing `--clr-greed` (#558b2f / dark: #4caf50) for positive, `--clr-extreme-fear` (#d32f2f) for negative.

### Error case

If `previousClose` is missing or zero, omit the change line silently (chip shows name + price only).

---

## Feature 2: Customizable Watchlist

### Storage

- localStorage key: `fg-watchlist`
- Value: JSON array of `{sym: string, name: string}` objects
- Default (first load, no saved data): `[{sym:'^KS11',name:'KOSPI'}, {sym:'^IXIC',name:'NASDAQ'}, {sym:'^GSPC',name:'S&P500'}, {sym:'^DJI',name:'DOW'}, {sym:'BTC-USD',name:'BTC'}]`
- `name` is the display label; on add, auto-populated from `meta.shortName` returned by Yahoo API

### Chip layout changes

- Each chip gets a `×` remove button (visible on hover, always visible on touch devices)
- A `+` add button is appended after the last chip

### Add flow

1. User clicks `+`
2. The `+` button transforms into a small input field (same chip width) with a ✓ confirm button
3. User types a symbol (e.g. `QQQ`) and presses Enter or clicks ✓
4. Validate: call `/api/proxy?url=` + encoded Yahoo v8/chart URL with `range=1d&interval=1m`
5. If valid (`meta.symbol` present in response): use `meta.shortName` truncated to 8 characters as `name` (fallback to uppercased input symbol if shortName is missing), add `{sym, name}` to list, save to localStorage, render new chip
6. If invalid (network error or missing `meta.symbol`): apply CSS shake animation to input, clear value, keep input open

### Remove flow

1. User clicks `×` on a chip
2. Remove from array, save to localStorage, re-render chips

### Max symbols

10 symbols. If at max, `+` button is hidden.

### Refresh behavior

`fetchMarketTicker()` already iterates `MKT_SYMBOLS`. Change it to iterate the live watchlist array instead.

---

## i18n keys to add

```
watchlistAdd:     "Add symbol" / "종목 추가"
watchlistInvalid: "Symbol not found" / "종목을 찾을 수 없음"
```

---

## CSS changes

- `.mkt-chip` — add `position: relative` for `×` button positioning
- `.mkt-chip-remove` — small `×` button, top-right corner, hidden by default, shown on `.mkt-chip:hover`
- `.mkt-chip-add` — `+` button, same height as chips, dashed border
- `.mkt-chip-input` — input field styled to match chip dimensions
- `.shake` — keyframe animation: `translateX(-4px 4px)` × 3, 300ms

---

## Data flow (unchanged except symbol source)

```
watchlist (localStorage / default)
  → fetchMarketTicker()  iterates watchlist symbols
  → per symbol: Yahoo v8/chart via /api/proxy
  → render chip: name + price + daily change %
```

No changes to CNN API, exchange rates, Timeline, Indicators, or Calendar.
