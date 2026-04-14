# PWA + Heatmap Calendar + Share Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PWA installability (manifest + service worker), a Calendar heatmap tab, and a Share button to the Fear & Greed Index static app.

**Architecture:** Three independent features all sharing the existing single-file pattern. PWA adds two new files (`manifest.json`, `sw.js`, `icon.svg`) and minimal changes to `index.html`. Calendar and Share are pure `index.html` additions — new HTML, CSS, and JS inline with existing code structure.

**Tech Stack:** Vanilla JS, Canvas API, Web Share API, Service Worker Cache API, no build step.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `icon.svg` | Create | PWA home screen icon |
| `manifest.json` | Create | PWA metadata (name, display, icon, theme) |
| `sw.js` | Create | Cache-first static assets, network-first APIs |
| `index.html` | Modify | Manifest link + theme-color meta, Calendar tab HTML/CSS/JS, Share button HTML/CSS/JS, i18n keys, SW registration |

---

## Task 1: icon.svg + manifest.json

**Files:**
- Create: `icon.svg`
- Create: `manifest.json`

- [ ] **Step 1: Create icon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1a1a1a"/>
  <text y=".9em" font-size="72" x="14">📊</text>
</svg>
```

- [ ] **Step 2: Create manifest.json**

```json
{
  "name": "Fear & Greed Index",
  "short_name": "Fear & Greed",
  "description": "Real-time CNN Fear & Greed Index tracker with market data",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1a1a1a",
  "background_color": "#ffffff",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml" }
  ]
}
```

- [ ] **Step 3: Verify both files exist**

Run: `ls icon.svg manifest.json`
Expected: both files listed.

- [ ] **Step 4: Commit**

```bash
git add icon.svg manifest.json
git commit -m "feat: add PWA icon and manifest"
```

---

## Task 2: Service Worker (sw.js)

**Files:**
- Create: `sw.js`

- [ ] **Step 1: Create sw.js**

```js
const CACHE_NAME = 'fg-cache-v1';

// Static assets to cache on install
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon.svg'];

// URL prefixes that use network-first (fall back to cache)
const NETWORK_FIRST_PREFIXES = [
    'https://production.dataviz.cnn.io',
    'https://query1.finance.yahoo.com',
    'https://open.er-api.com',
    'https://corsproxy.io',
];

// URL prefixes that use cache-first
const CACHE_FIRST_PREFIXES = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { url } = event.request;

    if (NETWORK_FIRST_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    if (CACHE_FIRST_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    // Own origin: cache-first for GET
    if (event.request.method === 'GET') {
        event.respondWith(cacheFirst(event.request));
    }
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        return cached ?? Response.error();
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return Response.error();
    }
}
```

- [ ] **Step 2: Verify sw.js exists**

Run: `ls sw.js`
Expected: file listed.

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "feat: add service worker with cache-first/network-first strategies"
```

---

## Task 3: PWA integration in index.html

**Files:**
- Modify: `index.html` (lines ~5–10 in `<head>`, and last 3 lines of `<script>`)

- [ ] **Step 1: Add manifest link and theme-color to `<head>`**

Find this block (lines 5–10):
```html
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fear & Greed Index</title>
```

Replace with:
```html
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#1a1a1a">
    <title>Fear & Greed Index</title>
    <link rel="manifest" href="/manifest.json">
```

- [ ] **Step 2: Add SW registration at the bottom of `<script>`**

Find this block (last lines of the script, just before `</script>`):
```js
        fetchExchangeRates().then(startFxCountdown);
        fetchMarketTicker().then(startMktCountdown);
        fetchData();
    </script>
```

Replace with:
```js
        fetchExchangeRates().then(startFxCountdown);
        fetchMarketTicker().then(startMktCountdown);
        fetchData();

        // ─── Service Worker ───────────────────────────────────────────────────────
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
        }
    </script>
```

- [ ] **Step 3: Verify in browser**

1. Open the app with `npx serve .` (or `python -m http.server 8080`)
2. Open Chrome DevTools → Application → Manifest
3. Expected: name "Fear & Greed Index", display "standalone", icon shown
4. DevTools → Application → Service Workers: status "activated and is running"

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: integrate PWA manifest and service worker into index.html"
```

---

## Task 4: Calendar Tab — HTML, CSS, i18n keys

**Files:**
- Modify: `index.html` (style block, body HTML, TRANSLATIONS object)

- [ ] **Step 1: Add i18n keys to TRANSLATIONS.en**

Find the last line of `TRANSLATIONS.en` (just before the closing `},`):
```js
                fxJustUpdated: 'Just updated',
```

Add after it (keeping inside the `en:` block, before its closing `},`):
```js
                tabCalendar: 'Calendar',
                calThisYear: 'This Year',
                calLastYear: 'Last Year',
                calNoData: 'No data',
                shareTitle: 'Share',
                shareCopied: 'Copied!',
```

- [ ] **Step 2: Add i18n keys to TRANSLATIONS.ko**

Find the last line of `TRANSLATIONS.ko` (just before the closing `},`):
```js
                fxJustUpdated: '방금 갱신됨',
```

Add after it (keeping inside the `ko:` block, before its closing `},`):
```js
                tabCalendar: '캘린더',
                calThisYear: '올해',
                calLastYear: '작년',
                calNoData: '데이터 없음',
                shareTitle: '공유',
                shareCopied: '복사됨!',
```

- [ ] **Step 3: Add Calendar tab button in HTML**

Find:
```html
                <button class="tab" data-tab="indicators" data-i18n="tabIndicators">Indicators</button>
```

Replace with:
```html
                <button class="tab" data-tab="indicators" data-i18n="tabIndicators">Indicators</button>
                <button class="tab" data-tab="calendar" data-i18n="tabCalendar">Calendar</button>
```

- [ ] **Step 4: Add Calendar view HTML**

Find the closing tag of indicatorsView:
```html
            </div>

            <div class="error-msg" id="errorMsg" data-i18n="errorMsg">
```

Insert the calendar view between them:
```html
            </div>

            <!-- Calendar View -->
            <div class="view" id="calendarView">
                <div class="cal-years" id="calYears">
                    <button class="period-btn active" id="calBtnCurrent"></button>
                    <button class="period-btn" id="calBtnPrev"></button>
                </div>
                <div class="cal-wrapper">
                    <canvas id="calendarCanvas"></canvas>
                    <div class="chart-tooltip" id="calTooltip" style="display:none">
                        <div class="tt-date"></div>
                        <div class="tt-score"></div>
                    </div>
                </div>
            </div>

            <div class="error-msg" id="errorMsg" data-i18n="errorMsg">
```

- [ ] **Step 5: Add Calendar CSS**

Find the `@media (max-width: 680px)` block that has `.main-content` (near the end of the `<style>` block):
```css
        @media (max-width: 680px) {
            .main-content {
                grid-template-columns: 1fr;
            }
```

Insert the following CSS block just before that `@media` block:
```css
        /* ── Calendar Tab ─────────────────────────────────────────── */
        .cal-years {
            display: flex;
            gap: 0.5rem;
            padding: 1rem 1.5rem 0.75rem;
        }

        .cal-wrapper {
            overflow-x: auto;
            padding: 0.5rem 1.5rem 1.5rem;
            position: relative;
        }

        #calendarCanvas {
            display: block;
        }

        /* ── Share Button ─────────────────────────────────────────── */
        .gauge-footer {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            margin-top: 0.25rem;
        }

        .share-btn {
            background: none;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 3px 10px;
            cursor: pointer;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.75rem;
            font-family: inherit;
            transition: color 0.15s, border-color 0.15s;
            white-space: nowrap;
        }

        .share-btn:hover {
            color: var(--text);
            border-color: var(--text-muted);
        }

```

- [ ] **Step 6: Verify in browser**

1. Open the app, check that a 4th "Calendar" tab appears
2. Click it — a blank view should appear (no errors in console)
3. "This Year" / "Last Year" buttons should be present
4. No JS errors in DevTools console

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "feat: add Calendar tab HTML, CSS, and i18n keys"
```

---

## Task 5: Calendar Tab — drawCalendar() and interactions

**Files:**
- Modify: `index.html` (script block — add calendar JS section, modify tab switching, theme/lang toggles, applyData)

- [ ] **Step 1: Add calendar constants and state variables**

Find the SP500 overlay section (look for `let sp500OverlayEnabled = false;`). Insert a new section just before the `fetchAndCacheSP500` function:

```js
        // ─── Calendar Heatmap ─────────────────────────────────────────────────────
        const CAL_CELL = 14;
        const CAL_GAP  = 3;
        const CAL_STEP = CAL_CELL + CAL_GAP;
        const CAL_PAD_L = 28;   // space for day labels (M/W/F)
        const CAL_PAD_T = 24;   // space for month labels
        const CAL_PAD_R = 16;
        const CAL_PAD_B = 16;

        let calendarYear = new Date().getFullYear();
        let calendarDataMap = null; // Map<'YYYY-MM-DD', score>

        function buildCalendarMap() {
            calendarDataMap = new Map();
            historicalData.forEach(d => {
                const dt  = new Date(d.x);
                const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
                calendarDataMap.set(key, d.y);
            });
        }

        function drawCalendar() {
            if (!calendarDataMap) buildCalendarMap();

            const canvas = document.getElementById('calendarCanvas');
            const ctx    = canvas.getContext('2d');
            const dpr    = window.devicePixelRatio || 1;

            // Compute grid dimensions for chosen year
            const jan1     = new Date(calendarYear, 0, 1);
            const startDow = (jan1.getDay() + 6) % 7; // 0 = Mon
            const isLeap   = (calendarYear % 4 === 0 && calendarYear % 100 !== 0) || calendarYear % 400 === 0;
            const totalDays = startDow + (isLeap ? 366 : 365);
            const totalWeeks = Math.ceil(totalDays / 7);

            const W = CAL_PAD_L + totalWeeks * CAL_STEP + CAL_PAD_R;
            const H = CAL_PAD_T + 7 * CAL_STEP + CAL_PAD_B;

            canvas.width  = W * dpr;
            canvas.height = H * dpr;
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, W, H);

            const noDataColor = tc('#e8e8e8', '#21262d');
            const textColor   = tc('#888888', '#8b949e');

            // Day labels (M / W / F on rows 0,2,4)
            ctx.fillStyle  = textColor;
            ctx.font       = '10px Inter, sans-serif';
            ctx.textAlign  = 'right';
            ctx.textBaseline = 'middle';
            ['M','','W','','F','',''].forEach((label, i) => {
                if (label) ctx.fillText(label, CAL_PAD_L - 5, CAL_PAD_T + i * CAL_STEP + CAL_CELL / 2);
            });

            // Draw cells
            let col = 0;
            let row = startDow;
            const cur       = new Date(calendarYear, 0, 1);
            let prevMonth   = -1;

            ctx.textAlign    = 'left';
            ctx.textBaseline = 'alphabetic';

            while (cur.getFullYear() === calendarYear) {
                const month = cur.getMonth();
                const key   = `${cur.getFullYear()}-${String(month+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
                const score = calendarDataMap.get(key);

                // Month label at first column of each new month
                if (month !== prevMonth) {
                    ctx.fillStyle = textColor;
                    ctx.font      = '10px Inter, sans-serif';
                    ctx.fillText(t('months')[month], CAL_PAD_L + col * CAL_STEP, CAL_PAD_T - 7);
                    prevMonth = month;
                }

                ctx.fillStyle = score !== undefined ? getZone(score).color : noDataColor;
                ctx.fillRect(CAL_PAD_L + col * CAL_STEP, CAL_PAD_T + row * CAL_STEP, CAL_CELL, CAL_CELL);

                row++;
                if (row === 7) { row = 0; col++; }
                cur.setDate(cur.getDate() + 1);
            }
        }
```

- [ ] **Step 2: Add calendar tooltip and mouse interaction**

Directly after `drawCalendar()`, add:

```js
        (function attachCalendarInteraction() {
            const canvas  = document.getElementById('calendarCanvas');
            const tooltip = document.getElementById('calTooltip');

            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const mx   = e.clientX - rect.left;
                const my   = e.clientY - rect.top;

                const col = Math.floor((mx - CAL_PAD_L) / CAL_STEP);
                const row = Math.floor((my - CAL_PAD_T) / CAL_STEP);

                if (col < 0 || row < 0 || row >= 7) { tooltip.style.display = 'none'; return; }

                const jan1     = new Date(calendarYear, 0, 1);
                const startDow = (jan1.getDay() + 6) % 7;
                const dayIndex = col * 7 + row - startDow;
                if (dayIndex < 0) { tooltip.style.display = 'none'; return; }

                const date = new Date(calendarYear, 0, 1 + dayIndex);
                if (date.getFullYear() !== calendarYear) { tooltip.style.display = 'none'; return; }

                const key   = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                const score = calendarDataMap ? calendarDataMap.get(key) : undefined;

                tooltip.querySelector('.tt-date').textContent  = date.toLocaleDateString();
                tooltip.querySelector('.tt-score').textContent = score !== undefined
                    ? `${Math.round(score)} — ${t(getZone(score).labelKey)}`
                    : t('calNoData');

                const wrapRect = canvas.parentElement.getBoundingClientRect();
                let tipX = e.clientX - wrapRect.left + 12;
                let tipY = e.clientY - wrapRect.top  - 8;
                tooltip.style.display = 'block';
                tooltip.style.left    = tipX + 'px';
                tooltip.style.top     = tipY + 'px';
            });

            canvas.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
        })();
```

- [ ] **Step 3: Add year selector button logic**

Directly after the mouse interaction block, add:

```js
        const CAL_THIS_YEAR = new Date().getFullYear(); // module-level for lang toggle use

        function updateCalYearBtnLabels() {
            document.getElementById('calBtnCurrent').textContent = t('calThisYear') + ' (' + CAL_THIS_YEAR + ')';
            document.getElementById('calBtnPrev').textContent    = t('calLastYear') + ' (' + (CAL_THIS_YEAR - 1) + ')';
        }

        (function initCalendarYears() {
            const btnCurrent = document.getElementById('calBtnCurrent');
            const btnPrev    = document.getElementById('calBtnPrev');

            updateCalYearBtnLabels();

            btnCurrent.addEventListener('click', () => {
                calendarYear = CAL_THIS_YEAR;
                calendarDataMap = null;
                btnCurrent.classList.add('active');
                btnPrev.classList.remove('active');
                if (historicalData.length > 0) drawCalendar();
            });

            btnPrev.addEventListener('click', () => {
                calendarYear = CAL_THIS_YEAR - 1;
                calendarDataMap = null;
                btnPrev.classList.add('active');
                btnCurrent.classList.remove('active');
                if (historicalData.length > 0) drawCalendar();
            });
        })();
```

- [ ] **Step 4: Hook drawCalendar into tab switching**

Find the tab switching block:
```js
                if (target === 'indicators' && !indicatorsLoaded) {
                    fetchIndicators();
                }
```

Add the calendar case right after:
```js
                if (target === 'indicators' && !indicatorsLoaded) {
                    fetchIndicators();
                }
                if (target === 'calendar' && historicalData.length > 0) {
                    drawCalendar();
                }
```

- [ ] **Step 5: Invalidate calendar map on theme change**

Find the themeToggle click handler. After the line `if (filteredData.length > 0) drawTimeline();`, add:
```js
            calendarDataMap = null;
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
```

- [ ] **Step 6: Redraw calendar on lang change**

Find the langToggle click handler. After the line `applyTranslations();`, add:
```js
            calendarDataMap = null;
            updateCalYearBtnLabels();
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
```

- [ ] **Step 7: Invalidate calendar map in applyData**

Find `function applyData(current, prevClose, week, month, year, timestamp) {` and the first line inside it:
```js
            _cachedScores = { current, prevClose, week, month, year, timestamp };
```

Add after that line:
```js
            calendarDataMap = null; // historicalData just updated, invalidate cache
```

- [ ] **Step 8: Verify in browser**

1. Run the app, navigate to Calendar tab
2. A GitHub-style heatmap should appear with colored cells for dates with data
3. Cells without data appear gray (`--border-2` color)
4. Hover over a cell → tooltip shows date + score + zone name
5. Click "Last Year" → heatmap redraws for previous year
6. Toggle dark mode → colors update
7. Toggle language → month labels and tooltip zone name update

- [ ] **Step 9: Commit**

```bash
git add index.html
git commit -m "feat: add Calendar heatmap tab with year selector and hover tooltip"
```

---

## Task 6: Share Button — HTML and JS

**Files:**
- Modify: `index.html` (HTML structure in gauge-section, share handler JS)

- [ ] **Step 1: Wrap last-updated in gauge-footer div**

Find:
```html
                        <div class="last-updated" id="lastUpdated"></div>
```

Replace with:
```html
                        <div class="gauge-footer">
                            <div class="last-updated" id="lastUpdated"></div>
                            <button id="shareBtn" class="share-btn" title="Share">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                </svg>
                                <span id="shareBtnLabel"></span>
                            </button>
                        </div>
```

- [ ] **Step 2: Initialize share button label (i18n)**

Find the `initCalendarYears` IIFE that was added in Task 5. Add a new IIFE directly after it:

```js
        (function initShareButton() {
            const btn   = document.getElementById('shareBtn');
            const label = document.getElementById('shareBtnLabel');

            function updateLabel(text) {
                label.textContent = text;
                btn.title = text;
            }
            updateLabel(t('shareTitle'));

            btn.addEventListener('click', async () => {
                if (!_cachedScores) return;
                const { current } = _cachedScores;
                const zoneName    = t(getZone(current).labelKey);
                const shareText   = `Fear & Greed: ${Math.round(current)} (${zoneName})`;
                const shareUrl    = location.href;

                if (navigator.share) {
                    try {
                        await navigator.share({ title: 'Fear & Greed Index', text: shareText, url: shareUrl });
                    } catch (err) {
                        if (err.name !== 'AbortError') console.warn('Share failed:', err);
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
                        updateLabel(t('shareCopied'));
                        setTimeout(() => updateLabel(t('shareTitle')), 1500);
                    } catch {
                        // Clipboard not available — silently ignore
                    }
                }
            });
        })();
```

- [ ] **Step 3: Update share label on language toggle**

Find the langToggle click handler, specifically the block where `applyTranslations()` is called. After `applyTranslations();`, add:
```js
            document.getElementById('shareBtnLabel').textContent = t('shareTitle');
```

- [ ] **Step 4: Verify in browser (desktop)**

1. The share icon + label "Share" (or "공유") should appear below the gauge
2. On desktop: clicking Share should copy `Fear & Greed: 72 (Greed)\nhttps://...` to clipboard
3. Button label changes to "Copied!" for ~1.5s then reverts
4. Language toggle → label switches between "Share" and "공유"
5. No errors in console when score is not yet loaded (button click does nothing)

- [ ] **Step 5: Verify in browser (mobile simulation)**

1. In Chrome DevTools → Device toolbar → select any phone
2. Click Share → native share sheet should appear
3. Should show the score text and URL

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "feat: add Share button with Web Share API and clipboard fallback"
```

---

## Post-Implementation Checklist

- [ ] PWA Lighthouse score: open Chrome DevTools → Lighthouse → Progressive Web App → run audit. Expected: passes installability checks.
- [ ] Offline test: DevTools → Network → set to Offline → refresh page. Expected: app loads from cache.
- [ ] Calendar renders for both years with correct colors
- [ ] Share works on desktop (clipboard) and mobile simulation (share sheet)
- [ ] Dark mode + language toggle do not break any of the three features
- [ ] No console errors in any tab
