# Customizable Watchlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded `MKT_SYMBOLS` with a localStorage-backed watchlist that lets users add/remove market symbols from the Overview tab.

**Architecture:** All changes are in `index.html` (inline JS + CSS). A `getWatchlist()` / `saveWatchlist()` pair reads/writes `fg-watchlist` in localStorage. `renderMktChips()` gains a `×` remove button per chip and a `+` add button at the end. Symbol validation on add uses the existing `/api/proxy` + Yahoo Finance v8/chart endpoint.

**Tech Stack:** Vanilla JS, CSS, Yahoo Finance v8/chart API, localStorage, existing `/api/proxy` Vercel function.

---

## File Structure

| File | Change |
|---|---|
| `index.html` | Only file modified — JS storage layer, render updates, CSS additions, i18n keys |

---

## Task 1: Storage layer — replace MKT_SYMBOLS with watchlist

**Files:**
- Modify: `index.html` (lines ~2563–2569 remove `MKT_SYMBOLS`; lines ~2599–2642 update functions)

### Context

Currently `const MKT_SYMBOLS` is a hardcoded array with per-symbol `fmt` functions (line 2563). `fetchMarketTicker()` iterates it (line 2619). `fetchOneMktSymbol()` (line 2599) returns `{price, prevClose}`. `renderMktChips(results)` (line 2580) destructures `{name, value, chgPct}`.

We will:
1. Remove `MKT_SYMBOLS`
2. Add `WL_DEFAULT`, `getWatchlist()`, `saveWatchlist()`, `fmtPrice()`, `_mktResults`
3. Update `fetchOneMktSymbol` to also return `shortName`
4. Update `fetchMarketTicker` to use `getWatchlist()` and `fmtPrice()`
5. Update `renderMktChips` to accept `{sym, name, value, chgPct}`

- [ ] **Step 1: Remove `const MKT_SYMBOLS` block and add storage helpers**

In `index.html`, replace:
```js
        const MKT_SYMBOLS = [
            { sym: '^KS11',  name: 'KOSPI',   fmt: (v) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 }) },
            { sym: '^IXIC',  name: 'NASDAQ',  fmt: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
            { sym: '^GSPC',  name: 'S&P 500', fmt: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 }) },
            { sym: '^DJI',   name: 'DOW',     fmt: (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }) },
            { sym: 'BTC-USD',name: 'BTC',     fmt: (v) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 }) },
        ];
```

With:
```js
        const WL_DEFAULT = [
            { sym: '^KS11',   name: 'KOSPI'   },
            { sym: '^IXIC',   name: 'NASDAQ'  },
            { sym: '^GSPC',   name: 'S&P 500' },
            { sym: '^DJI',    name: 'DOW'     },
            { sym: 'BTC-USD', name: 'BTC'     },
        ];
        function getWatchlist() {
            try {
                const saved = JSON.parse(localStorage.getItem('fg-watchlist'));
                if (Array.isArray(saved) && saved.length) return saved;
            } catch {}
            return WL_DEFAULT.slice();
        }
        function saveWatchlist(list) {
            localStorage.setItem('fg-watchlist', JSON.stringify(list));
        }

        const FMT_OVERRIDES = {
            '^KS11':   (v) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 }),
            '^DJI':    (v) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
            'BTC-USD': (v) => '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
        };
        function fmtPrice(sym, price) {
            const fn = FMT_OVERRIDES[sym];
            if (fn) return fn(price);
            return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
        }

        let _mktResults = [];
```

- [ ] **Step 2: Update `fetchOneMktSymbol` to return `shortName`**

Replace the return statement inside `fetchOneMktSymbol`:
```js
        // old:
            return {
                price:  meta.regularMarketPrice ?? meta.previousClose,
                prevClose: meta.previousClose ?? meta.chartPreviousClose,
            };
        // new:
            return {
                price:     meta.regularMarketPrice ?? meta.previousClose,
                prevClose: meta.previousClose ?? meta.chartPreviousClose,
                shortName: meta.shortName || meta.longName || null,
            };
```

- [ ] **Step 3: Update `fetchMarketTicker` to use `getWatchlist()` and `fmtPrice()`**

Replace the entire `fetchMarketTicker` function:
```js
        async function fetchMarketTicker() {
            setMktDot('loading');
            const statusEl = document.getElementById('mktStatusText');
            if (statusEl) statusEl.textContent = t('mktLoading');
            const watchlist = getWatchlist();
            try {
                const settled = await Promise.allSettled(
                    watchlist.map(m => fetchOneMktSymbol(m.sym))
                );

                const results = watchlist.map((m, i) => {
                    const r = settled[i];
                    if (r.status === 'fulfilled' && r.value.price != null) {
                        const price  = r.value.price;
                        const prev   = r.value.prevClose || price;
                        const chgPct = prev ? ((price - prev) / prev) * 100 : 0;
                        return { sym: m.sym, name: m.name, value: fmtPrice(m.sym, price), chgPct };
                    }
                    return { sym: m.sym, name: m.name, value: 'N/A', chgPct: 0 };
                });

                renderMktChips(results);
                setMktDot('live');
                if (statusEl) statusEl.textContent = t('mktJustUpdated');
                mktSecondsLeft = MKT_REFRESH;
            } catch (e) {
                console.warn('Market ticker fetch failed:', e.message);
                setMktDot('error');
                if (statusEl) statusEl.textContent = t('mktError');
            }
        }
```

- [ ] **Step 4: Update `renderMktChips` signature to use `sym`**

Replace the `renderMktChips` function:
```js
        function renderMktChips(results) {
            _mktResults = results;
            const container = document.getElementById('mktChips');
            container.innerHTML = '';
            results.forEach(({ sym, name, value, chgPct }) => {
                const isUp  = chgPct >= 0;
                const arrow = isUp ? '▲' : '▼';
                const cls   = isUp ? 'mkt-up' : 'mkt-down';
                const sign  = isUp ? '+' : '';
                const chip  = document.createElement('div');
                chip.className = 'mkt-chip';
                chip.dataset.sym = sym;
                chip.innerHTML = `
                    <div class="mkt-chip-name">${name}</div>
                    <div class="mkt-chip-value">${value}</div>
                    <div class="mkt-chip-change ${cls}">${arrow} ${sign}${chgPct.toFixed(2)}%</div>
                `;
                container.appendChild(chip);
            });
        }
```

- [ ] **Step 5: Open browser, verify market chips still display correctly**

Run: `npx serve .` and open `http://localhost:3000`

Expected: Global Markets section loads same 5 chips with prices and % change. No JS errors in console.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "refactor: replace MKT_SYMBOLS with localStorage watchlist storage layer"
```

---

## Task 2: Remove button on chips

**Files:**
- Modify: `index.html` (CSS block ~line 765; `renderMktChips` function ~line 2580)

### Context

`renderMktChips` now stores results in `_mktResults` and renders each chip as a `div.mkt-chip`. We add a `×` `<button>` inside each chip, positioned absolute top-right, visible on hover.

- [ ] **Step 1: Add CSS for `.mkt-chip-remove`**

Find the `.mkt-chip {` CSS block (~line 765) and add `position: relative;` to it, then add the remove button styles after `.mkt-chip-change`:

```css
        .mkt-chip { position: relative; /* add this */ }

        /* Add after .mkt-chip-change block: */
        .mkt-chip-remove {
            position: absolute;
            top: 3px; right: 4px;
            width: 16px; height: 16px;
            border: none; background: none;
            color: var(--text-dimmer);
            font-size: 13px; line-height: 1;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.15s;
            padding: 0;
            display: flex; align-items: center; justify-content: center;
            border-radius: 3px;
        }
        .mkt-chip:hover .mkt-chip-remove { opacity: 1; }
        .mkt-chip-remove:hover { background: var(--bg-hover); color: var(--text); }
        @media (hover: none) { .mkt-chip-remove { opacity: 0.7; } }
```

- [ ] **Step 2: Add `×` button and remove handler to `renderMktChips`**

Replace the `renderMktChips` function (updated in Task 1) with this version that adds the remove button:
```js
        function renderMktChips(results) {
            _mktResults = results;
            const container = document.getElementById('mktChips');
            container.innerHTML = '';
            results.forEach(({ sym, name, value, chgPct }, idx) => {
                const isUp  = chgPct >= 0;
                const arrow = isUp ? '▲' : '▼';
                const cls   = isUp ? 'mkt-up' : 'mkt-down';
                const sign  = isUp ? '+' : '';
                const chip  = document.createElement('div');
                chip.className = 'mkt-chip';
                chip.dataset.sym = sym;
                chip.innerHTML = `
                    <button class="mkt-chip-remove" aria-label="Remove ${name}">×</button>
                    <div class="mkt-chip-name">${name}</div>
                    <div class="mkt-chip-value">${value}</div>
                    <div class="mkt-chip-change ${cls}">${arrow} ${sign}${chgPct.toFixed(2)}%</div>
                `;
                chip.querySelector('.mkt-chip-remove').addEventListener('click', () => {
                    const wl = getWatchlist();
                    const newWl = wl.filter(w => w.sym !== sym);
                    saveWatchlist(newWl);
                    const newResults = _mktResults.filter(r => r.sym !== sym);
                    renderMktChips(newResults);
                });
                container.appendChild(chip);
            });
        }
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000`. Hover over a market chip — `×` button appears top-right. Click it — chip disappears. Refresh page — default 5 chips return (localStorage `fg-watchlist` not set yet, so defaults kick in).

To test persistence: remove a chip, open DevTools → Application → localStorage → `fg-watchlist` should show only 4 entries. Refresh — 4 chips shown.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add remove button to market watchlist chips"
```

---

## Task 3: Add button + symbol input

**Files:**
- Modify: `index.html` (CSS block; `renderMktChips`; new `showAddInput` function)

### Context

After all chips, we render a `+` add button. Clicking it replaces itself with an inline input wrapper. User types a symbol, presses Enter or clicks ✓. On success: symbol added to watchlist + chip rendered. On failure: shake animation + input cleared.

- [ ] **Step 1: Add CSS for add button and input**

After the `.mkt-chip-remove` CSS block added in Task 2, add:
```css
        .mkt-chip-add {
            border: 1px dashed var(--border-2);
            border-radius: 8px;
            padding: 0.6rem 0.75rem;
            min-width: 42px;
            background: none;
            color: var(--text-dimmer);
            font-size: 1.3rem;
            line-height: 1;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s, color 0.2s;
            align-self: stretch;
            display: flex; align-items: center; justify-content: center;
        }
        .mkt-chip-add:hover {
            background: var(--bg-hover);
            border-color: var(--text-dimmer);
            color: var(--text);
        }

        .mkt-chip-input-wrap {
            display: flex; align-items: center; gap: 4px;
            border: 1px solid var(--border-2);
            border-radius: 8px;
            padding: 0.4rem 0.6rem;
            min-width: 100px;
        }
        .mkt-chip-input {
            width: 72px;
            border: none;
            border-bottom: 1px solid var(--border-2);
            background: none;
            color: var(--text);
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            outline: none;
            font-family: inherit;
        }
        .mkt-chip-confirm {
            border: none; background: none;
            color: #558b2f;
            font-size: 1rem;
            cursor: pointer;
            padding: 0 2px;
            line-height: 1;
        }
        body.dark .mkt-chip-confirm { color: #4caf50; }
        .mkt-chip-confirm:disabled { opacity: 0.4; cursor: default; }

        @keyframes mkt-shake {
            0%, 100% { transform: translateX(0); }
            20%       { transform: translateX(-5px); }
            40%       { transform: translateX(5px); }
            60%       { transform: translateX(-5px); }
            80%       { transform: translateX(5px); }
        }
        .mkt-shake { animation: mkt-shake 0.4s ease; }
```

- [ ] **Step 2: Add `showAddInput` function**

Add this function immediately after `renderMktChips`:
```js
        function showAddInput(container, addBtn) {
            addBtn.style.display = 'none';
            const wrapper = document.createElement('div');
            wrapper.className = 'mkt-chip-input-wrap';
            const input = document.createElement('input');
            input.className = 'mkt-chip-input';
            input.placeholder = 'QQQ';
            input.maxLength = 12;
            input.setAttribute('autocomplete', 'off');
            const confirm = document.createElement('button');
            confirm.className = 'mkt-chip-confirm';
            confirm.textContent = '✓';
            wrapper.appendChild(input);
            wrapper.appendChild(confirm);
            container.appendChild(wrapper);
            input.focus();

            async function tryAdd() {
                const sym = input.value.trim().toUpperCase();
                if (!sym) return;
                confirm.disabled = true;
                input.disabled = true;
                try {
                    const data = await fetchOneMktSymbol(sym);
                    if (data.price == null) throw new Error('invalid');
                    const wl = getWatchlist();
                    if (wl.length >= 10 || wl.find(w => w.sym === sym)) {
                        wrapper.remove();
                        addBtn.style.display = '';
                        return;
                    }
                    const name = ((data.shortName || sym).slice(0, 8)).trim();
                    wl.push({ sym, name });
                    saveWatchlist(wl);
                    const prev   = data.prevClose || data.price;
                    const chgPct = prev ? ((data.price - prev) / prev) * 100 : 0;
                    _mktResults.push({ sym, name, value: fmtPrice(sym, data.price), chgPct });
                    renderMktChips(_mktResults);
                } catch {
                    wrapper.classList.remove('mkt-shake');
                    void wrapper.offsetWidth; // force reflow to re-trigger animation
                    wrapper.classList.add('mkt-shake');
                    input.disabled = false;
                    confirm.disabled = false;
                    input.value = '';
                    input.focus();
                }
            }

            confirm.addEventListener('click', tryAdd);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') tryAdd();
                if (e.key === 'Escape') {
                    wrapper.remove();
                    addBtn.style.display = '';
                }
            });
        }
```

- [ ] **Step 3: Update `renderMktChips` to append `+` button**

Add this block at the end of `renderMktChips`, after the `results.forEach(...)` loop:
```js
            // + add button
            if (getWatchlist().length < 10) {
                const addBtn = document.createElement('button');
                addBtn.className = 'mkt-chip-add';
                addBtn.textContent = '+';
                addBtn.title = t('watchlistAdd');
                addBtn.addEventListener('click', () => showAddInput(container, addBtn));
                container.appendChild(addBtn);
            }
```

- [ ] **Step 4: Verify in browser**

Open `http://localhost:3000`. After chips, a dashed `+` button appears.

Test add flow:
- Click `+` → input appears, cursor in field
- Type `QQQ` → press Enter → chip for QQQ appears with price and % change
- Type `FAKESYMBOL123` → press Enter → input shakes, clears, stays open
- Press Escape → input disappears, `+` returns

Test persistence: add QQQ, refresh page → QQQ still shown.

Test max: add 5 more symbols until total = 10. `+` button disappears.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add inline symbol input to market watchlist"
```

---

## Task 4: i18n keys

**Files:**
- Modify: `index.html` (TRANSLATIONS.en ~line 1185; TRANSLATIONS.ko ~line 1296)

### Context

`TRANSLATIONS.en` and `TRANSLATIONS.ko` are objects inside the script block. New keys needed: `watchlistAdd` (button tooltip) and `watchlistInvalid` (unused in DOM — reserved for future tooltip, but `showAddInput` uses the shake animation instead of a text error). Only `watchlistAdd` is actively used via `addBtn.title = t('watchlistAdd')`.

- [ ] **Step 1: Add keys to `TRANSLATIONS.en`**

Find `mktJustUpdated: 'Just updated',` in the `en` block and add after it:
```js
                watchlistAdd: 'Add symbol',
```

- [ ] **Step 2: Add keys to `TRANSLATIONS.ko`**

Find `mktJustUpdated: '방금 갱신됨',` in the `ko` block and add after it:
```js
                watchlistAdd: '종목 추가',
```

- [ ] **Step 3: Verify in browser**

Switch language to 한국어. Hover over `+` add button — tooltip shows `종목 추가`. Switch back to English — tooltip shows `Add symbol`.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add i18n keys for watchlist add button"
```
