# Performance Monitor Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating, real-data performance monitoring widget to `index.html` that measures and displays the page's own Core Web Vitals, loading metrics, runtime FPS/long-task count, and resource timing — demonstrating 성능튜닝/모니터링 skill with live data, not a mockup.

**Architecture:** Purely additive changes to the single self-contained `index.html` file: new HTML markup (badge + collapsible panel), new CSS rules (own `PERFORMANCE MONITOR WIDGET` section, reusing existing design tokens), and one new self-contained IIFE in the existing `<script>` block, following the same pattern as the existing `bgCanvas` particle IIFE. No other files change.

**Tech Stack:** Vanilla JS, native `PerformanceObserver` / `performance.getEntriesByType` / `requestAnimationFrame` APIs. No new dependencies, no build step.

## Global Constraints

- Single file only: `index.html`. Do not create new files or extract JS/CSS elsewhere (repo convention: self-contained HTML pages, no modules — see `CLAUDE.md`).
- Reuse existing design tokens (`--bg`, `--bg-2`, `--bg-3`, `--text`, `--text-2`, `--border`, `--border-2`, `--accent`, `--shadow-sm`, `--shadow-lg`) for all chrome. The only new tokens allowed are three semantic status colors (`--perf-good`, `--perf-mid`, `--perf-poor`) added once to `:root`, since no existing token expresses amber/red status.
- All `PerformanceObserver` registrations must be wrapped in `try/catch` (some entry types are unsupported in some browsers) and gated behind `if (window.PerformanceObserver)`. A missing metric renders as `--`, never throws.
- The FPS `requestAnimationFrame` loop and the 1s panel refresh `setInterval` must only run while the panel is open; both must be cancelled on close (`cancelAnimationFrame` / `clearInterval`). PerformanceObserver entries (vitals/longtask/resource) keep collecting in the background regardless of panel state — that part is cheap and event-driven.
- 4-space indentation, `camelCase` JS, `kebab-case` CSS classes — matches existing file.
- No automated test suite exists in this repo (`AGENTS.md`: "manual smoke testing" is the convention). Every task below ends with a concrete manual browser-verification step using `npx serve . -l 8080` and exact DevTools console snippets — treat these as the test step for this codebase.

---

## File Map

| File | Change |
|---|---|
| `index.html` | Add 3 `:root` tokens, add `PERFORMANCE MONITOR WIDGET` CSS block (before `</style>`), add widget markup (after `</nav>` of `.dot-nav`, before the Hero section), add one new IIFE at the end of the existing `<script>` block (before `</script>`) |

---

## Task 1: Widget shell — markup, CSS, open/close toggle

Build the static structure and interaction shell first: badge + panel that opens/closes, styled with existing tokens, before wiring any real performance data. This isolates layout/interaction bugs from data-collection bugs.

**Files:**
- Modify: `index.html:16-32` (add 3 tokens to `:root`)
- Modify: `index.html:756` (insert new CSS block immediately before this `</style>` line)
- Modify: `index.html:775` (insert new markup immediately after this `</nav>` line, before the `<!-- ══ 1. HERO ══ -->` comment)
- Modify: `index.html:1456` (insert new `<script>` IIFE immediately before this `</script>` line)

**Interfaces:**
- Produces: DOM ids `perfWidget`, `perfBadge`, `perfPanel`, `perfClose`, `perfScore` — consumed by Tasks 2–4.
- Produces: JS functions `openPanel()`, `closePanel()` in the new IIFE — Tasks 2–4 add code that calls into these (via the same IIFE scope, since all code lives in one closure added incrementally).

- [ ] **Step 1: Add the 3 semantic status tokens to `:root`**

In `index.html`, find the `:root { ... }` block (line 16) and add three lines right before its closing `}` (line 32):

```css
            --perf-good: #16a34a;
            --perf-mid:  #d97706;
            --perf-poor: #dc2626;
```

- [ ] **Step 2: Add the widget CSS block**

Insert immediately before the `</style>` tag (line 756):

```css
        /* ═══════════════════════════
           PERFORMANCE MONITOR WIDGET
        ═══════════════════════════ */
        .perf-widget { position: fixed; bottom: 24px; right: 24px; z-index: 60; }
        .perf-badge {
            display: flex; align-items: center; gap: 0.35rem;
            padding: 0.55rem 0.9rem; border-radius: 999px;
            border: 1.5px solid var(--border-2); background: var(--bg-2);
            color: var(--text); font-size: 0.85rem; font-weight: 700;
            cursor: pointer; box-shadow: var(--shadow-sm);
            transition: transform 0.2s, border-color 0.2s;
        }
        .perf-badge:hover { transform: scale(1.05); border-color: var(--accent); }
        .perf-badge__score { min-width: 1.6em; text-align: right; }
        .perf-badge[data-band="good"] .perf-badge__score { color: var(--perf-good); }
        .perf-badge[data-band="mid"]  .perf-badge__score { color: var(--perf-mid); }
        .perf-badge[data-band="poor"] .perf-badge__score { color: var(--perf-poor); }

        .perf-panel {
            position: absolute; bottom: 56px; right: 0; width: 300px; max-height: 70vh;
            overflow-y: auto; background: var(--bg-2); border: 1px solid var(--border);
            border-radius: 16px; box-shadow: var(--shadow-lg); padding: 1rem;
        }
        .perf-panel[hidden] { display: none; }
        .perf-panel__header {
            display: flex; align-items: center; justify-content: space-between;
            font-weight: 700; font-size: 0.9rem; margin-bottom: 0.75rem; color: var(--text);
        }
        .perf-panel__close {
            background: none; border: none; color: var(--text-2); font-size: 1.1rem;
            cursor: pointer; line-height: 1; padding: 0 0.25rem;
        }
        .perf-panel__close:hover { color: var(--text); }
        .perf-section { margin-bottom: 0.9rem; }
        .perf-section:last-child { margin-bottom: 0; }
        .perf-section__title {
            font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.05em; color: var(--text-2); margin-bottom: 0.4rem;
        }
        .perf-chips { display: flex; gap: 0.5rem; }
        .perf-chip {
            flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
            padding: 0.4rem 0.3rem; border-radius: 10px; border: 1px solid var(--border);
            background: var(--bg-3);
        }
        .perf-chip__label { font-size: 0.65rem; color: var(--text-2); font-weight: 700; }
        .perf-chip__value { font-size: 0.85rem; font-weight: 700; color: var(--text); }
        .perf-chip[data-band="good"] .perf-chip__value { color: var(--perf-good); }
        .perf-chip[data-band="mid"]  .perf-chip__value { color: var(--perf-mid); }
        .perf-chip[data-band="poor"] .perf-chip__value { color: var(--perf-poor); }
        .perf-rows { display: flex; flex-direction: column; gap: 0.3rem; }
        .perf-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-2); }
        .perf-row span:last-child { color: var(--text); font-weight: 600; }
        .perf-resource-list { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; }
        .perf-resource-row { display: flex; justify-content: space-between; gap: 0.5rem; font-size: 0.72rem; color: var(--text-2); }
        .perf-resource-row__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
        .perf-resource-row__dur { color: var(--text); font-weight: 600; flex-shrink: 0; }

        @media (max-width: 768px) {
            .perf-widget { bottom: 16px; right: 16px; }
            .perf-panel { width: calc(100vw - 32px); max-width: 320px; }
        }
```

- [ ] **Step 3: Add the widget markup**

Insert immediately after `</nav>` (line 775), before the `<!-- ══ 1. HERO ══ -->` comment:

```html

    <!-- ══ Performance Monitor Widget ══ -->
    <div class="perf-widget" id="perfWidget">
        <button class="perf-badge" id="perfBadge" title="성능 모니터링" aria-label="성능 모니터링 열기">
            <span class="perf-badge__bolt">⚡</span>
            <span class="perf-badge__score mono" id="perfScore">--</span>
        </button>
        <div class="perf-panel" id="perfPanel" hidden>
            <div class="perf-panel__header">
                <span>⚡ 성능 모니터링</span>
                <button class="perf-panel__close" id="perfClose" aria-label="닫기">×</button>
            </div>
            <div class="perf-panel__body">
                <section class="perf-section">
                    <h4 class="perf-section__title">Core Web Vitals</h4>
                    <div class="perf-chips">
                        <div class="perf-chip" data-metric="lcp"><span class="perf-chip__label">LCP</span><span class="perf-chip__value mono">--</span></div>
                        <div class="perf-chip" data-metric="cls"><span class="perf-chip__label">CLS</span><span class="perf-chip__value mono">--</span></div>
                        <div class="perf-chip" data-metric="inp"><span class="perf-chip__label">INP</span><span class="perf-chip__value mono">--</span></div>
                    </div>
                </section>
                <section class="perf-section">
                    <h4 class="perf-section__title">로딩 세부 지표</h4>
                    <div class="perf-rows">
                        <div class="perf-row"><span>FCP</span><span class="mono" data-metric="fcp">--</span></div>
                        <div class="perf-row"><span>TTFB</span><span class="mono" data-metric="ttfb">--</span></div>
                        <div class="perf-row"><span>DOMContentLoaded</span><span class="mono" data-metric="dcl">--</span></div>
                    </div>
                </section>
                <section class="perf-section">
                    <h4 class="perf-section__title">런타임 모니터링</h4>
                    <div class="perf-rows">
                        <div class="perf-row"><span>FPS</span><span class="mono" data-metric="fps">--</span></div>
                        <div class="perf-row"><span>Long Task</span><span class="mono" data-metric="longtaskCount">0</span></div>
                        <div class="perf-row"><span>Total Blocking</span><span class="mono" data-metric="tbt">0ms</span></div>
                    </div>
                </section>
                <section class="perf-section">
                    <h4 class="perf-section__title">리소스 타이밍</h4>
                    <div class="perf-resource-list" id="perfResources"></div>
                    <div class="perf-rows" id="perfResourceSummary"></div>
                </section>
            </div>
        </div>
    </div>
```

- [ ] **Step 4: Add the open/close IIFE**

Insert immediately before `</script>` (line 1456):

```html
    <script>
    /* ══════════════════════════════════════════
       PERFORMANCE MONITOR WIDGET
    ══════════════════════════════════════════ */
    (function () {
        const badge    = document.getElementById('perfBadge');
        const panel    = document.getElementById('perfPanel');
        const closeBtn = document.getElementById('perfClose');

        function openPanel() {
            panel.hidden = false;
        }

        function closePanel() {
            panel.hidden = true;
        }

        badge.addEventListener('click', () => {
            if (panel.hidden) openPanel(); else closePanel();
        });
        closeBtn.addEventListener('click', closePanel);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !panel.hidden) closePanel();
        });
    })();
    </script>
```

(Note: this is a *new* `<script>` tag added right before the existing `</script>` closes the *previous* script block — i.e. it becomes its own sibling `<script>` element at the end of `<body>`, not nested inside the existing one. This matches how independent IIFEs are typically isolated; it is fine for multiple `<script>` tags to sit back-to-back before `</body>`.)

- [ ] **Step 5: Manual verification**

```bash
npx serve . -l 8080
```

Open `http://localhost:8080` in a browser. Confirm:
- A pill badge `⚡ --` appears bottom-right, above any other fixed UI, not overlapping `.dot-nav` or `.theme-toggle`.
- Clicking the badge opens a panel above it showing 4 section headers (Core Web Vitals / 로딩 세부 지표 / 런타임 모니터링 / 리소스 타이밍) with placeholder `--`/`0` values.
- Clicking the badge again, clicking the `×`, and pressing `Escape` each close the panel.
- Resize to a mobile width (≤768px) — badge/panel stay anchored bottom-right and don't overflow the viewport horizontally.
- Toggle dark/light theme (🌙 button) while the panel is open — panel background/text/borders update colors (no hardcoded light-only colors visible).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 성능 모니터링 위젯 셸 추가 (배지+패널 토글)"
```

---

## Task 2: Core Web Vitals + loading metrics

Wire real `PerformanceObserver` data into the LCP/CLS/INP chips and FCP/TTFB/DOMContentLoaded rows, and compute the badge score.

**Files:**
- Modify: `index.html` — inside the IIFE added in Task 1 (the `(function () { ... })();` block), add the code below.

**Interfaces:**
- Consumes: `panel` (DOM reference), `openPanel()`/`closePanel()` from Task 1.
- Produces: `metrics` object (`{ lcp, cls, inp, fcp, ttfb, dcl }`), `renderPanel()` function, `computeScore()` function — consumed by Task 3 and Task 4.

- [ ] **Step 1: Add metrics state and PerformanceObserver wiring**

Inside the Task 1 IIFE, immediately after the `const closeBtn = ...` line, add:

```js
        const scoreEl  = document.getElementById('perfScore');
        const metrics  = { lcp: null, cls: 0, inp: 0, fcp: null, ttfb: null, dcl: null };

        function safeObserve(type, callback) {
            if (!window.PerformanceObserver) return;
            try {
                new PerformanceObserver(callback).observe({ type, buffered: true });
            } catch (e) { /* entry type unsupported in this browser */ }
        }

        safeObserve('largest-contentful-paint', (list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            if (last) metrics.lcp = last.renderTime || last.loadTime;
        });

        safeObserve('layout-shift', (list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) metrics.cls += entry.value;
            }
        });

        safeObserve('event', (list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > metrics.inp) metrics.inp = entry.duration;
            }
        });

        safeObserve('paint', (list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') metrics.fcp = entry.startTime;
            }
        });

        window.addEventListener('load', () => {
            const nav = performance.getEntriesByType('navigation')[0];
            if (nav) {
                metrics.ttfb = nav.responseStart;
                metrics.dcl = nav.domContentLoadedEventEnd;
            }
        });
```

- [ ] **Step 2: Add score computation and badge update**

Immediately after the code from Step 1, add:

```js
        function scoreFromRange(value, good, poor) {
            if (value == null) return 100;
            if (value <= good) return 100;
            if (value >= poor) return 0;
            return Math.round(100 - ((value - good) / (poor - good)) * 100);
        }

        function computeScore() {
            const lcpScore = scoreFromRange(metrics.lcp, 2500, 4000);
            const clsScore = scoreFromRange(metrics.cls, 0.1, 0.25);
            const inpScore = scoreFromRange(metrics.inp, 200, 500);
            return Math.round(lcpScore * 0.4 + clsScore * 0.3 + inpScore * 0.3);
        }

        function bandFor(score) {
            if (score >= 90) return 'good';
            if (score >= 50) return 'mid';
            return 'poor';
        }

        function updateBadge() {
            const score = computeScore();
            scoreEl.textContent = score;
            badge.setAttribute('data-band', bandFor(score));
        }
```

- [ ] **Step 3: Add panel rendering for vitals + loading metrics**

Immediately after Step 2's code, add:

```js
        function vitalBand(metric, value) {
            if (value == null) return '';
            const thresholds = { lcp: [2500, 4000], cls: [0.1, 0.25], inp: [200, 500] };
            const [good, poor] = thresholds[metric];
            if (value <= good) return 'good';
            if (value <= poor) return 'mid';
            return 'poor';
        }

        function fmtMs(value) {
            return value == null ? '--' : Math.round(value) + 'ms';
        }

        function renderPanel() {
            const lcpChip = panel.querySelector('[data-metric="lcp"]');
            lcpChip.querySelector('.perf-chip__value').textContent = fmtMs(metrics.lcp);
            lcpChip.setAttribute('data-band', vitalBand('lcp', metrics.lcp));

            const clsChip = panel.querySelector('[data-metric="cls"]');
            clsChip.querySelector('.perf-chip__value').textContent = metrics.cls.toFixed(3);
            clsChip.setAttribute('data-band', vitalBand('cls', metrics.cls));

            const inpChip = panel.querySelector('[data-metric="inp"]');
            inpChip.querySelector('.perf-chip__value').textContent = fmtMs(metrics.inp);
            inpChip.setAttribute('data-band', vitalBand('inp', metrics.inp));

            panel.querySelector('[data-metric="fcp"]').textContent = fmtMs(metrics.fcp);
            panel.querySelector('[data-metric="ttfb"]').textContent = fmtMs(metrics.ttfb);
            panel.querySelector('[data-metric="dcl"]').textContent = fmtMs(metrics.dcl);

            updateBadge();
        }
```

- [ ] **Step 4: Call `renderPanel()` on open, and schedule the initial badge score**

Replace the Task 1 `openPanel` function body:

```js
        function openPanel() {
            panel.hidden = false;
            renderPanel();
        }
```

And at the very end of the IIFE (immediately before the closing `})();`), add:

```js
        setTimeout(updateBadge, 3000);
```

- [ ] **Step 5: Manual verification**

```bash
npx serve . -l 8080
```

Open `http://localhost:8080`. In DevTools console, run:

```js
performance.getEntriesByType('navigation')[0].responseStart
```

Expected: a positive number (confirms `navigation` timing is available in this browser — if `0` or missing, this is a known limitation noted in code via the `safeObserve` `try/catch`, not a bug).

Wait 3+ seconds after page load, then check the badge — it must show a number `0–100` (not `--`), colored green/amber/red via `data-band`. Click the badge to open the panel: LCP/CLS/INP chips and FCP/TTFB/DOMContentLoaded rows must all show real millisecond/decimal values (not `--`), each updating only when the panel opens (not before).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 성능 모니터링 위젯에 Core Web Vitals/로딩 지표 연동"
```

---

## Task 3: Runtime monitoring (FPS + Long Task), tied to panel open/close

Add the live FPS counter and Long Task / Total Blocking Time tracking. The `requestAnimationFrame` loop and the 1s refresh interval must start on open and stop on close (constraint from the spec: the monitor must not itself degrade page performance while collapsed).

**Files:**
- Modify: `index.html` — inside the same IIFE, extending `openPanel`/`closePanel` from Tasks 1–2.

**Interfaces:**
- Consumes: `renderPanel()`, `panel`, `openPanel()`/`closePanel()` from Task 2.
- Produces: `longtaskCount`, `totalBlockingTime` module-level vars and FPS row updates — consumed by Task 4's `renderPanel` extension (resource section) which runs alongside this.

- [ ] **Step 1: Add longtask observer and counters**

Inside the IIFE, immediately after the `safeObserve('paint', ...)` block from Task 2, add:

```js
        let longtaskCount = 0;
        let totalBlockingTime = 0;

        safeObserve('longtask', (list) => {
            for (const entry of list.getEntries()) {
                longtaskCount += 1;
                totalBlockingTime += Math.max(0, entry.duration - 50);
            }
        });
```

- [ ] **Step 2: Render longtask/TBT in `renderPanel()`**

In `renderPanel()` (added in Task 2 Step 3), immediately after the `dcl` line, add:

```js
            panel.querySelector('[data-metric="longtaskCount"]').textContent = longtaskCount;
            panel.querySelector('[data-metric="tbt"]').textContent = Math.round(totalBlockingTime) + 'ms';
```

- [ ] **Step 3: Add the FPS loop**

Immediately before the `function openPanel()` definition, add:

```js
        let fpsRafId = null;
        let frameCount = 0;
        let fpsWindowStart = performance.now();

        function fpsLoop(now) {
            frameCount += 1;
            const elapsed = now - fpsWindowStart;
            if (elapsed >= 250) {
                const fps = Math.round((frameCount / elapsed) * 1000);
                const fpsEl = panel.querySelector('[data-metric="fps"]');
                if (fpsEl) fpsEl.textContent = fps;
                frameCount = 0;
                fpsWindowStart = now;
            }
            fpsRafId = requestAnimationFrame(fpsLoop);
        }

        let liveUpdateInterval = null;
```

- [ ] **Step 4: Start/stop the loop and interval in `openPanel`/`closePanel`**

Replace both functions:

```js
        function openPanel() {
            panel.hidden = false;
            renderPanel();
            fpsWindowStart = performance.now();
            frameCount = 0;
            fpsRafId = requestAnimationFrame(fpsLoop);
            liveUpdateInterval = setInterval(renderPanel, 1000);
        }

        function closePanel() {
            panel.hidden = true;
            if (fpsRafId) cancelAnimationFrame(fpsRafId);
            if (liveUpdateInterval) clearInterval(liveUpdateInterval);
            fpsRafId = null;
            liveUpdateInterval = null;
        }
```

- [ ] **Step 5: Manual verification**

```bash
npx serve . -l 8080
```

Open `http://localhost:8080`, open DevTools → Performance tab (or just visually confirm), then open the perf panel. Confirm:
- The FPS row updates roughly 4x/second to a value near your monitor's refresh rate (e.g. ~60).
- In the DevTools console, run a deliberate long task to confirm the counter increments:
  ```js
  const start = performance.now(); while (performance.now() - start < 200) {}
  ```
  Within ~1s, the panel's "Long Task" count increases by at least 1 and "Total Blocking Time" increases by a value > 0ms.
- Close the panel, then run:
  ```js
  let calls = 0;
  const orig = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) { calls++; return orig(cb); };
  ```
  then reopen and close the panel a couple times and confirm `calls` only increments while the panel is open (you can eyeball this by leaving the panel closed for 5s and checking `calls` does not climb).

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: 성능 모니터링 위젯에 FPS/Long Task 런타임 추적 추가"
```

---

## Task 4: Resource timing breakdown + final smoke test

Add the resource timing list (top 5 slowest) and per-type summary (CSS/JS/IMG/기타), then run the full manual test pass from the spec.

**Files:**
- Modify: `index.html` — inside the same IIFE.

**Interfaces:**
- Consumes: `renderPanel()` from Task 2/3 (extended here), DOM ids `perfResources`/`perfResourceSummary` from Task 1.
- Produces: nothing further consumed by other tasks — this is the last task.

- [ ] **Step 1: Add `renderResources()`**

Immediately after the `renderPanel()` function (after the longtask/tbt lines added in Task 3 Step 2, and before its closing `}`), first add the call, then define the function after `renderPanel`:

In `renderPanel()`, immediately before its closing `}`, add:

```js
            renderResources();
```

Then, immediately after the closing `}` of `renderPanel()`, add:

```js

        function renderResources() {
            const list = performance.getEntriesByType('resource')
                .slice()
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 5);
            const listEl = document.getElementById('perfResources');
            listEl.innerHTML = list.map((r) => {
                const name = r.name.split('/').pop().split('?')[0] || r.name;
                return '<div class="perf-resource-row"><span class="perf-resource-row__name">' +
                    name + '</span><span class="perf-resource-row__dur mono">' +
                    Math.round(r.duration) + 'ms</span></div>';
            }).join('');

            const totals = { css: 0, js: 0, img: 0, etc: 0 };
            performance.getEntriesByType('resource').forEach((r) => {
                const t = r.initiatorType;
                if (t === 'css' || /\.css($|\?)/.test(r.name)) totals.css += r.duration;
                else if (t === 'script' || /\.js($|\?)/.test(r.name)) totals.js += r.duration;
                else if (t === 'img' || /\.(png|jpg|jpeg|svg|webp|gif)($|\?)/.test(r.name)) totals.img += r.duration;
                else totals.etc += r.duration;
            });
            const labels = { css: 'CSS 합계', js: 'JS 합계', img: '이미지 합계', etc: '기타 합계' };
            const summaryEl = document.getElementById('perfResourceSummary');
            summaryEl.innerHTML = ['css', 'js', 'img', 'etc'].map((key) =>
                '<div class="perf-row"><span>' + labels[key] + '</span><span class="mono">' +
                Math.round(totals[key]) + 'ms</span></div>'
            ).join('');
        }
```

- [ ] **Step 2: Manual verification of resource section**

```bash
npx serve . -l 8080
```

Open `http://localhost:8080`, open the perf panel. Confirm the "리소스 타이밍" section lists up to 5 resource filenames with millisecond durations sorted descending, and a 4-row summary (CSS/JS/이미지/기타 합계) with non-zero totals (this page loads Google Fonts CSS + this script, so at least the CSS/기타 rows should be non-zero).

- [ ] **Step 3: Full spec smoke test pass**

Run through every check from the spec's Testing section in one pass:
1. `npx serve . -l 8080`, open the page — confirm all four panel sections show real (non-placeholder) numbers within 3–5 seconds of load.
2. Toggle dark/light (🌙 button) with the panel open — confirm panel colors switch (background, text, chip colors all change, nothing stays hardcoded-light).
3. Resize to ≤768px width — confirm badge/panel don't collide with `.dot-nav` (hidden at this width anyway) or `.theme-toggle`, and the panel doesn't overflow the viewport horizontally.
4. DevTools → Network → throttle to "Slow 3G", hard-reload — confirm TTFB/FCP/LCP values increase and the LCP chip's color shifts toward amber/red (`data-band="mid"` or `"poor"`) if it crosses 2500ms/4000ms.
5. Re-run the long-task console snippet from Task 3 Step 5 — confirm the counter still increments correctly after all changes.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: 성능 모니터링 위젯에 리소스 타이밍 섹션 추가"
```

---

## Self-Review Notes

- **Spec coverage:** Core Web Vitals (Task 2), 로딩 세부 지표 (Task 2), 런타임 FPS/Long Task (Task 3), 리소스 타이밍 (Task 4), score badge (Task 2), panel-closed-stops-loops constraint (Task 3), theme/mobile integration (verified across Tasks 1 & 4) — all covered.
- **Placeholder scan:** none found; every step has literal code, not descriptions.
- **Type/name consistency:** `metrics`, `renderPanel`, `renderResources`, `openPanel`, `closePanel`, `longtaskCount`, `totalBlockingTime`, `fpsRafId`, `liveUpdateInterval` are spelled identically everywhere they're introduced and reused across tasks.
