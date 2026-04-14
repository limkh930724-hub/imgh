# Design: PWA + Heatmap Calendar + Share Button

**Date:** 2026-03-27
**Status:** Approved

## Overview

Three features added to the Fear & Greed Index app to improve portfolio quality and user experience:

1. **PWA** — installable app with offline support
2. **Heatmap Calendar tab** — annual F&G score visualization
3. **Share button** — native share or clipboard copy

File constraints: `index.html` (inline), plus `manifest.json` and `sw.js` as new files.

---

## Feature 1: PWA (manifest + service worker)

### New files
- `manifest.json` — app name, icons, theme color, `display: standalone`
- `sw.js` — service worker with cache strategies

### manifest.json
```json
{
  "name": "Fear & Greed Index",
  "short_name": "Fear & Greed",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a1a",
  "background_color": "#ffffff",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

Create `icon.svg` — a simple 📊 chart SVG (same emoji used in the existing favicon). SVG icons with `sizes: "any"` are valid PWA icons per the spec and require no build step.

### sw.js caching strategy
- **Cache-first:** `index.html`, `manifest.json`, Google Fonts CSS/woff2
- **Network-first:** CNN API, Yahoo Finance API, open.er-api.com (fall back to cache on failure)
- Cache name: `fg-cache-v1` — increment version constant to bust cache on deploy

### index.html changes
- `<head>`: add `<link rel="manifest" href="/manifest.json">` and `<meta name="theme-color" content="#1a1a1a">`
- Bottom of `<script>`: register service worker
  ```js
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```

---

## Feature 2: Heatmap Calendar Tab

### Tab addition
Add 4th tab button: `<button class="tab" data-tab="calendar" data-i18n="tabCalendar">Calendar</button>`
Add corresponding view: `<div class="view" id="calendarView">`

### Layout
```
[ This Year ] [ Last Year ]         ← year selector buttons
[ Canvas heatmap ]                  ← full-width canvas
```

### Canvas rendering (`drawCalendar()`)
- **Grid:** columns = weeks of the year, rows = 7 days (Mon–Sun)
- **Cell size:** ~14px with 2px gap (same density as GitHub contributions graph)
- **Color mapping by F&G score:**
  - 0–24: `--clr-extreme-fear` (#d32f2f / dark: same)
  - 25–44: `--clr-fear` (#ef6c00)
  - 45–55: `--clr-neutral` (#9e9e9e)
  - 56–74: `--clr-greed` (#558b2f)
  - 75–100: `--clr-extreme-greed` (#2e7d32)
  - No data: `var(--border-2)` (empty cell)
- **Month labels** above columns at month boundaries
- **Day labels** (M/W/F) on the left

### Data source
`historicalData` (already fetched — CNN API returns ~2 years of daily data). No new API calls needed.
Map by date string `YYYY-MM-DD` for O(1) lookup.

### Interaction
- **Hover:** show tooltip (same `.chart-tooltip` style as Timeline) with date, score, zone label
- **Year buttons:** re-draw canvas for selected year, active state same as period buttons in Timeline

### i18n keys to add
```
tabCalendar: "Calendar" / "캘린더"
calNoData: "No data for this date" / "데이터 없음"
```

---

## Feature 3: Share Button

### Placement
Inside `.gauge-section`, below `<div class="last-updated" id="lastUpdated">`.

### HTML
```html
<button id="shareBtn" class="share-btn" data-i18n-title="shareTitle">
  <svg ...><!-- share icon --></svg>
</button>
```

### Behavior (two-stage fallback)
1. **`navigator.share` supported** (mobile, modern browsers):
   ```js
   navigator.share({
     title: 'Fear & Greed Index',
     text: `Fear & Greed: ${score} (${zoneName})`,
     url: location.href
   });
   ```
2. **Fallback — clipboard copy:**
   ```js
   navigator.clipboard.writeText(`Fear & Greed: ${score} (${zoneName})\n${location.href}`);
   // button label changes to "Copied!" for 1.5s then reverts
   ```

Share text uses `t()` for zone name so it respects current language.

### i18n keys to add
```
shareTitle: "Share" / "공유"
shareCopied: "Copied!" / "복사됨!"
```

### Styling
- Small icon button, same style as `themeToggle` / `langToggle` (`.lang-toggle` class reuse)
- No separate new CSS class needed unless icon sizing requires it

---

## Data Flow (unchanged)

No changes to existing data flow. All three features consume already-fetched data:
- PWA caches existing requests
- Heatmap reads `historicalData`
- Share reads current score from DOM or `_cachedScores`

---

## File Summary

| File | Change |
|---|---|
| `index.html` | Add manifest link + theme-color meta, SW registration, Calendar tab + view, share button, new i18n keys |
| `manifest.json` | New file |
| `sw.js` | New file |
| `icon.svg` | New file — SVG icon for PWA manifest |
