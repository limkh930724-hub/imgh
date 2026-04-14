# Watchlist Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Watchlist" tab where users can add Korean/US stock tickers and track daily price change in a clean table.

**Architecture:** All changes in `index.html`. New JS block inserted after the `initShareButton` IIFE (~line 3453). Tab switching, theme toggle, and lang toggle handlers each receive one additional hook. No new files required.

**Tech Stack:** Vanilla JS, Yahoo Finance v8/chart API via existing `/api/proxy` CORS proxy, `localStorage('fg-watchlist')`, existing CSS variables.

---

## File Map

| File | Change |
|---|---|
| `index.html` (style block ~line 915) | Add watchlist CSS after `.share-btn:hover` |
| `index.html` (body ~line 1280) | Add Watchlist tab button after Calendar tab button |
| `index.html` (body ~line 1395) | Add `#watchlistView` before `#errorMsg` |
| `index.html` (TRANSLATIONS.en ~line 1595) | Add 11 i18n keys after `calNoData` |
| `index.html` (TRANSLATIONS.ko ~line 1740) | Add 11 i18n keys after `calNoData` |
| `index.html` (script ~line 3453) | Add watchlist JS section after `initShareButton` IIFE |
| `index.html` (tab switch ~line 1841) | Add `watchlist` case |
| `index.html` (theme toggle ~line 3010) | Add re-render hook |
| `index.html` (lang toggle ~line 3022) | Add re-render + placeholder update |

---

## Task 1: i18n keys

**Files:**
- Modify: `index.html` (TRANSLATIONS.en ~line 1595, TRANSLATIONS.ko ~line 1740)

- [ ] **Step 1: Add keys to TRANSLATIONS.en**

Find:
```js
                calNoData: 'No data',
                calcTitle: 'Portfolio Return Calculator',
```

Replace with:
```js
                calNoData: 'No data',
                tabWatchlist: 'Watchlist',
                wlAddPlaceholder: 'Symbol (e.g. AAPL, 005930)',
                wlAdd: 'Add',
                wlColName: 'Name',
                wlColPrice: 'Price',
                wlColChange: 'Change',
                wlColPct: '%',
                wlColPrev: 'Prev Close',
                wlEmpty: 'Add your first ticker',
                wlInvalidSym: 'Symbol not found',
                wlDuplicate: 'Already in watchlist',
                calcTitle: 'Portfolio Return Calculator',
```

- [ ] **Step 2: Add keys to TRANSLATIONS.ko**

Find:
```js
                calNoData: '데이터 없음',
                calcTitle: '포트폴리오 수익률 계산기',
```

Replace with:
```js
                calNoData: '데이터 없음',
                tabWatchlist: '관심종목',
                wlAddPlaceholder: '종목코드 (예: AAPL, 005930)',
                wlAdd: '추가',
                wlColName: '종목명',
                wlColPrice: '현재가',
                wlColChange: '등락',
                wlColPct: '%',
                wlColPrev: '전일종가',
                wlEmpty: '관심 종목을 추가해보세요',
                wlInvalidSym: '종목을 찾을 수 없습니다',
                wlDuplicate: '이미 추가된 종목입니다',
                calcTitle: '포트폴리오 수익률 계산기',
```

- [ ] **Step 3: Verify**

Serve with `npx serve .` or `python -m http.server 8080`. Open browser, check DevTools console — no errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add watchlist i18n keys"
```

---

## Task 2: CSS

**Files:**
- Modify: `index.html` (style block ~line 912)

- [ ] **Step 1: Add watchlist styles**

Find:
```css
        .share-btn:hover {
            color: var(--text);
            border-color: var(--text-muted);
        }

        /* ── Score Interpreter
```

Replace with:
```css
        .share-btn:hover {
            color: var(--text);
            border-color: var(--text-muted);
        }

        /* ── Watchlist Tab ───────────────────────────────────────── */
        .wl-add-row {
            display: flex;
            gap: 0.5rem;
            padding: 1.25rem 1.5rem 0;
        }

        .wl-input {
            flex: 1;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            font-family: inherit;
            color: var(--text);
            outline: none;
        }

        .wl-input:focus {
            border-color: var(--text-muted);
        }

        .wl-add-btn {
            background: var(--bg-active);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            font-family: inherit;
            color: var(--text);
            cursor: pointer;
            white-space: nowrap;
        }

        .wl-add-btn:hover {
            background: var(--bg-hover);
        }

        .wl-error {
            min-height: 1.25rem;
            padding: 0.25rem 1.5rem 0;
            font-size: 0.75rem;
            color: #dc2626;
        }

        body.dark .wl-error {
            color: #f87171;
        }

        .wl-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0.75rem;
            font-size: 0.875rem;
        }

        .wl-table th {
            text-align: left;
            padding: 0.5rem 1rem;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--text-muted);
            border-bottom: 1px solid var(--border);
        }

        .wl-table td {
            padding: 0.65rem 1rem;
            border-bottom: 1px solid var(--border-2);
            color: var(--text);
        }

        .wl-table tbody tr:hover td {
            background: var(--bg-hover);
        }

        .wl-name {
            font-weight: 500;
            max-width: 160px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .wl-remove {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            font-size: 1rem;
            padding: 0 0.25rem;
            line-height: 1;
        }

        .wl-remove:hover {
            color: var(--text);
        }

        .wl-empty {
            text-align: center;
            color: var(--text-muted);
            padding: 2.5rem 1.5rem;
            font-size: 0.875rem;
        }

        @media (max-width: 480px) {
            .wl-hide-mobile { display: none; }
        }

        /* ── Score Interpreter
```

- [ ] **Step 2: Verify**

Reload page. No visual changes to existing tabs. No CSS errors in DevTools.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add watchlist CSS"
```

---

## Task 3: HTML

**Files:**
- Modify: `index.html` (tabs ~line 1280, views ~line 1395)

- [ ] **Step 1: Add Watchlist tab button**

Find:
```html
                <button class="tab" data-tab="calendar" data-i18n="tabCalendar">Calendar</button>
            </div>
```

Replace with:
```html
                <button class="tab" data-tab="calendar" data-i18n="tabCalendar">Calendar</button>
                <button class="tab" data-tab="watchlist" data-i18n="tabWatchlist">Watchlist</button>
            </div>
```

- [ ] **Step 2: Add watchlistView HTML**

Find (the closing `</div>` of the calendarView section, right before `#errorMsg`):
```html
            </div>

            <div class="error-msg" id="errorMsg" data-i18n="errorMsg">
```

Replace with:
```html
            </div>

            <!-- Watchlist View -->
            <div class="view" id="watchlistView">
                <div class="wl-add-row">
                    <input type="text" id="wlInput" class="wl-input">
                    <button id="wlAddBtn" class="wl-add-btn" data-i18n="wlAdd">Add</button>
                </div>
                <div class="wl-error" id="wlError"></div>
                <div id="wlTableWrap"></div>
            </div>

            <div class="error-msg" id="errorMsg" data-i18n="errorMsg">
```

- [ ] **Step 3: Verify**

Reload page. A 5th "Watchlist" / "관심종목" tab appears. Clicking it shows the input and Add button. No JS errors in DevTools.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add watchlist tab button and view HTML"
```

---

## Task 4: JS – core (state, helpers, render, fetch, init)

**Files:**
- Modify: `index.html` (script block ~line 3453)

- [ ] **Step 1: Insert watchlist JS block after initShareButton IIFE**

Find:
```js
        })();

        async function fetchAndCacheSP500() {
```

Replace with:
```js
        })();

        // ─── Watchlist Tab ────────────────────────────────────────────────────────
        let watchlistData = [];
        let wlLoaded      = false;
        let wlIntervalId  = null;
        let wlSecondsLeft = MKT_REFRESH;

        function getWatchlist() {
            return JSON.parse(localStorage.getItem('fg-watchlist') || '[]');
        }

        function saveWatchlist(items) {
            localStorage.setItem('fg-watchlist', JSON.stringify(
                items.map(({ sym, name, currency }) => ({ sym, name, currency }))
            ));
        }

        function fmtWlPrice(price, currency) {
            if (currency === 'KRW') {
                return '₩' + price.toLocaleString('ko-KR', { maximumFractionDigits: 0 });
            }
            return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        async function fetchWatchlistItem(sym) {
            const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`;
            const url = CORS_PROXY + encodeURIComponent(yahooUrl);
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const json = await resp.json();
            const meta = json?.chart?.result?.[0]?.meta;
            if (!meta || !meta.regularMarketPrice) throw new Error('No data');
            const price     = meta.regularMarketPrice;
            const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
            const change    = price - prevClose;
            const pct       = prevClose ? (change / prevClose) * 100 : 0;
            return {
                sym,
                name:     meta.shortName || sym,
                price,
                change,
                pct,
                prevClose,
                currency: meta.currency || 'USD',
            };
        }

        function renderWatchlist(data) {
            const wrap = document.getElementById('wlTableWrap');
            if (!wrap) return;
            watchlistData = data;

            if (data.length === 0) {
                wrap.innerHTML = `<div class="wl-empty">${t('wlEmpty')}</div>`;
                return;
            }

            const upColor   = currentTheme === 'dark' ? '#4ade80' : '#16a34a';
            const downColor = currentTheme === 'dark' ? '#f87171' : '#dc2626';

            const rows = data.map((item, i) => {
                if (item.loading) {
                    return `<tr>
                        <td class="wl-name">${item.sym}</td>
                        <td>…</td><td>…</td><td>…</td>
                        <td class="wl-hide-mobile">…</td>
                        <td><button class="wl-remove" onclick="removeWatchlistItem(${i})">×</button></td>
                    </tr>`;
                }
                const isUp   = item.change >= 0;
                const color  = item.change === 0 ? 'var(--text-muted)' : (isUp ? upColor : downColor);
                const sign   = isUp ? '+' : '−';
                const absStr = fmtWlPrice(Math.abs(item.change), item.currency).replace(/^[\$₩]/, '');
                return `<tr>
                    <td class="wl-name" title="${item.name}">${item.name}</td>
                    <td>${fmtWlPrice(item.price, item.currency)}</td>
                    <td style="color:${color}">${sign}${absStr}</td>
                    <td style="color:${color}">${isUp ? '+' : ''}${item.pct.toFixed(2)}%</td>
                    <td class="wl-hide-mobile">${fmtWlPrice(item.prevClose, item.currency)}</td>
                    <td><button class="wl-remove" onclick="removeWatchlistItem(${i})">×</button></td>
                </tr>`;
            }).join('');

            wrap.innerHTML = `<table class="wl-table">
                <thead><tr>
                    <th>${t('wlColName')}</th>
                    <th>${t('wlColPrice')}</th>
                    <th>${t('wlColChange')}</th>
                    <th>${t('wlColPct')}</th>
                    <th class="wl-hide-mobile">${t('wlColPrev')}</th>
                    <th></th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
        }

        async function fetchAllWatchlist() {
            const saved = getWatchlist();
            if (saved.length === 0) { renderWatchlist([]); return; }

            renderWatchlist(saved.map(s => ({ ...s, loading: true })));

            const settled = await Promise.allSettled(saved.map(s => fetchWatchlistItem(s.sym)));
            const results = saved.map((s, i) => {
                const r = settled[i];
                if (r.status === 'fulfilled') return r.value;
                return { sym: s.sym, name: s.name || s.sym, price: 0, change: 0, pct: 0, prevClose: 0, currency: s.currency || 'USD' };
            });
            saveWatchlist(results);
            renderWatchlist(results);
        }

        function removeWatchlistItem(i) {
            const saved = getWatchlist();
            saved.splice(i, 1);
            saveWatchlist(saved);
            watchlistData.splice(i, 1);
            renderWatchlist(watchlistData);
        }

        function startWlCountdown() {
            if (wlIntervalId) clearInterval(wlIntervalId);
            wlSecondsLeft = MKT_REFRESH;
            wlIntervalId  = setInterval(() => {
                wlSecondsLeft = Math.max(0, wlSecondsLeft - 1);
                if (wlSecondsLeft <= 0) {
                    if (document.getElementById('watchlistView').classList.contains('active')) {
                        fetchAllWatchlist().then(() => { wlSecondsLeft = MKT_REFRESH; });
                    } else {
                        wlSecondsLeft = MKT_REFRESH;
                    }
                }
            }, 1000);
        }

        (function initWatchlist() {
            const input  = document.getElementById('wlInput');
            const addBtn = document.getElementById('wlAddBtn');
            const errEl  = document.getElementById('wlError');

            input.placeholder = t('wlAddPlaceholder');

            function showErr(key) { errEl.textContent = t(key); }
            function clearErr()   { errEl.textContent = '';     }

            async function doAdd() {
                clearErr();
                let sym = input.value.trim().toUpperCase();
                if (!sym) return;
                if (/^\d+$/.test(sym)) sym = sym + '.KS';

                const saved = getWatchlist();
                if (saved.some(s => s.sym === sym)) { showErr('wlDuplicate'); return; }

                addBtn.disabled = true;
                input.disabled  = true;
                try {
                    const item    = await fetchWatchlistItem(sym);
                    const updated = [...saved, { sym: item.sym, name: item.name, currency: item.currency }];
                    saveWatchlist(updated);
                    watchlistData.push(item);
                    renderWatchlist(watchlistData);
                    input.value = '';
                } catch {
                    showErr('wlInvalidSym');
                } finally {
                    addBtn.disabled = false;
                    input.disabled  = false;
                    input.focus();
                }
            }

            addBtn.addEventListener('click', doAdd);
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });
        })();

        async function fetchAndCacheSP500() {
```

- [ ] **Step 2: Verify**

Open Watchlist tab.
1. Empty state: "Add your first ticker" / "관심 종목을 추가해보세요" message appears.
2. Type `AAPL`, press Enter → row appears with price, change, %, prev close in USD.
3. Type `005930`, press Enter → Samsung row appears with ₩ pricing.
4. Type `AAPL` again → "Already in watchlist" error appears, row not duplicated.
5. Type `ZZZZZZ`, press Enter → "Symbol not found" error appears.
6. Click × on a row → row removed.
7. Reload page → saved tickers restored (fetches fresh prices on next tab open).
8. No console errors throughout.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add watchlist JS — storage, fetch, render, add/remove, countdown"
```

---

## Task 5: Wire tab switching

**Files:**
- Modify: `index.html` (tab switch handler ~line 1841)

- [ ] **Step 1: Add watchlist case**

Find:
```js
                if (target === 'calendar' && historicalData.length > 0) {
                    drawCalendar();
                }
            });
        });
```

Replace with:
```js
                if (target === 'calendar' && historicalData.length > 0) {
                    drawCalendar();
                }
                if (target === 'watchlist') {
                    if (!wlLoaded) {
                        wlLoaded = true;
                        fetchAllWatchlist();
                        startWlCountdown();
                    } else {
                        renderWatchlist(watchlistData);
                    }
                }
            });
        });
```

- [ ] **Step 2: Verify**

1. Click Watchlist tab → shows `…` loading state, then live data.
2. Click Overview tab, then back to Watchlist → data shown immediately from cache (no re-fetch, no loading dots).
3. No console errors.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: wire watchlist tab switch — lazy first-load, cache replay"
```

---

## Task 6: Wire lang/theme toggles

**Files:**
- Modify: `index.html` (theme toggle ~line 3009, lang toggle ~line 3020)

- [ ] **Step 1: Re-render watchlist on theme change**

Find:
```js
            calendarDataMap = null;
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
            // Reset indicators so they re-render with new theme colors
```

Replace with:
```js
            calendarDataMap = null;
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
            if (document.getElementById('watchlistView').classList.contains('active')) renderWatchlist(watchlistData);
            // Reset indicators so they re-render with new theme colors
```

- [ ] **Step 2: Re-render watchlist on lang change**

Find:
```js
            calendarDataMap = null;
            updateCalYearBtnLabels();
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
            if (_cachedScores) {
```

Replace with:
```js
            calendarDataMap = null;
            updateCalYearBtnLabels();
            if (document.getElementById('calendarView').classList.contains('active')) drawCalendar();
            document.getElementById('wlInput').placeholder = t('wlAddPlaceholder');
            if (document.getElementById('watchlistView').classList.contains('active')) renderWatchlist(watchlistData);
            if (_cachedScores) {
```

- [ ] **Step 3: Verify**

With the Watchlist tab active and tickers added:
1. Toggle dark mode → up/down colors change to dark-mode green/red immediately.
2. Toggle light mode → colors revert.
3. Toggle language to Korean → column headers (종목명/현재가/등락/전일종가), input placeholder, and empty-state message switch to Korean.
4. Toggle back to English → headers revert.
5. No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: re-render watchlist on theme/lang toggle"
```

---

## Post-Implementation Checklist

- [ ] Watchlist tab visible as 5th tab, Korean + English labels correct
- [ ] Add AAPL, TSLA — USD price, signed change, % shown with green/red
- [ ] Add 005930 — KRW price (₩), Korean stock shortName
- [ ] Duplicate add shows "Already in watchlist" error
- [ ] Invalid symbol shows "Symbol not found" error
- [ ] × removes row, localStorage updated
- [ ] Reload page → tickers persist, fresh prices load on next tab activation
- [ ] Dark mode → colors update on active tab
- [ ] Language toggle → headers + placeholder switch
- [ ] Mobile (≤480px) — Prev Close column hidden
- [ ] No console errors in any scenario
