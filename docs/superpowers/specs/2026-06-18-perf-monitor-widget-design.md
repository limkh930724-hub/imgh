# Performance Monitor Widget — Design Spec

**Date**: 2026-06-18
**File**: `index.html` (additive — no existing sections change)

---

## Goal

Add a floating, real-data performance monitoring widget to the portfolio landing page (`index.html`) that demonstrates 성능튜닝/모니터링 (performance tuning/monitoring) skill for SI/SM job applications. The widget measures and displays the page's own real runtime metrics — it is not a mockup or static screenshot.

---

## UI / UX

### Collapsed state — score badge
- Fixed position, bottom-right (`position: fixed; bottom: 24px; right: 24px; z-index: 50`)
- Small pill button: `⚡ <score>` where `<score>` is a 0–100 composite score (see Scoring below)
- Color-coded background ring matching score band:
  - 90–100 → green (`--accent` light/dark equivalents already in the page's token set)
  - 50–89 → amber
  - 0–49 → red
- On mobile (`≤768px`): same position, slightly smaller; never overlaps `.dot-nav` (dot-nav is right-side but vertically centered, so bottom-right stays clear) or `.theme-toggle` (top-right).

### Expanded state — panel
- Clicking the badge expands a panel anchored above it (`bottom: 76px; right: 24px`), card-style using existing tokens (`--bg-2`, `--border`, `--text`, `--text-2`, rounded corners matching other cards on the page).
- Close via: clicking the badge again, or an `×` in the panel header, or `Escape` key.
- Panel header: "⚡ 성능 모니터링" + close button.
- Four stacked sections, each a small labeled block:
  1. **Core Web Vitals** — LCP, CLS, INP as three stat chips, each with its own good/needs-improvement/poor color per Google thresholds (LCP ≤2.5s/≤4s, CLS ≤0.1/≤0.25, INP ≤200ms/≤500ms).
  2. **로딩 세부 지표** — FCP, TTFB, DOMContentLoaded, each as `label: value ms`.
  3. **런타임 모니터링** — live FPS counter (updates ~4x/sec while panel open) + cumulative Long Task count (≥50ms tasks) and total blocking time.
  4. **리소스 타이밍** — top 5 slowest resources by duration (name truncated + ms), plus a small total-by-type summary (CSS/JS/IMG/기타 합계 ms).
- Panel scrolls internally (`max-height`, `overflow-y: auto`) if content overflows on short viewports; does not affect page scroll-snap.

### Performance-of-the-monitor constraint
- `requestAnimationFrame` FPS loop and any other polling only run while the panel is **expanded**. On collapse, loops are cancelled (`cancelAnimationFrame`, clear intervals). The PerformanceObserver entries for Web Vitals/longtask/resource are passively collected from page load regardless of panel state (cheap, event-driven), so historical data is available immediately on first expand.

---

## Data Collection

All native browser APIs, no dependencies:

| Metric | API |
|---|---|
| LCP | `PerformanceObserver({type: 'largest-contentful-paint'})` |
| CLS | `PerformanceObserver({type: 'layout-shift'})`, sum of `value` for entries where `!hadRecentInput` |
| INP | `PerformanceObserver({type: 'event'})`, track max `duration` across interaction entries (durationThreshold: 40) |
| FCP | `PerformanceObserver({type: 'paint'})`, entry named `first-contentful-paint` |
| TTFB | `performance.getEntriesByType('navigation')[0].responseStart` |
| DOMContentLoaded | `performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd` |
| FPS | `requestAnimationFrame` delta-time loop, sampled into a rolling average |
| Long Tasks | `PerformanceObserver({type: 'longtask'})`, count + sum duration |
| Resource timing | `performance.getEntriesByType('resource')`, sorted by `duration` desc |

All observers are registered once on page load inside a single new `<script>` block at the end of `index.html` (after existing scripts), guarded with `if (window.PerformanceObserver)` and individual `try/catch` per observer type (Safari/older browsers don't support all entry types — a missing metric should render as `—` rather than break the widget).

---

## Scoring (collapsed badge number)

Simple weighted composite, 0–100, recomputed each time the panel is opened (and once ~3s after load for the initial badge value, since LCP/CLS need time to settle):

- LCP: 40 pts (full credit ≤2.5s, 0 pts ≥4s, linear between)
- CLS: 30 pts (full credit ≤0.1, 0 pts ≥0.25, linear between)
- INP: 30 pts (full credit ≤200ms, 0 pts ≥500ms, linear between)

This mirrors Lighthouse's emphasis on Core Web Vitals without claiming to *be* a Lighthouse score (label it "성능 점수", not "Lighthouse Score").

---

## Visual integration

- Reuses existing CSS variables already defined in `index.html`'s `:root` (no new design tokens unless a color token is missing — if so, derive from existing `--accent` family rather than introducing new hex literals).
- Respects `data-theme` light/dark via the same attribute selectors the rest of the page uses.
- No new fonts; matches existing `Plus Jakarta Sans` / `JetBrains Mono` (numbers in `JetBrains Mono`, consistent with the hero stat grid).
- `[data-reveal]` / scroll-reveal system is not applied to this widget — it's fixed-position chrome, not a scroll section.

---

## Out of Scope

- No backend/server metrics (this is a static site — there is no server process to monitor). The "성능튜닝/모니터링" demonstration is scoped to frontend/runtime performance instrumentation, which is the only real, honest data available on a static page.
- No historical persistence across page loads (no localStorage trend chart) — each load is a fresh measurement. Could be a future enhancement but adds scope not needed to demonstrate the core skill.
- No changes to other pages (`fear-greed.html`, `finance.html`, etc.) — `index.html` only.

---

## Testing

Manual smoke test per `CLAUDE.md` convention (no automated suite in this repo):
- Load `index.html` via `npx serve . -l 8080`, open badge, confirm all four sections render with real (non-placeholder) numbers.
- Toggle dark/light theme while panel is open — confirm colors update.
- Resize to mobile width (≤768px) — confirm badge/panel position doesn't collide with `.dot-nav`/`.theme-toggle`/custom cursor.
- Throttle network (DevTools "Slow 3G") to confirm TTFB/FCP/LCP values change accordingly and color thresholds shift to amber/red as expected.
- Force a long task (e.g. temporarily add a busy-loop in devtools console) to confirm the Long Task counter increments live while panel is open.
