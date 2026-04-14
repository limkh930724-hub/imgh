# Portfolio Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hub landing page (`index.html`) that presents "임광호 포트폴리오" with 6 tool cards; move the existing fear & greed app to `fear-greed.html`.

**Architecture:** `git mv` renames the existing app to `fear-greed.html` (preserving git history). A new `index.html` is created as a standalone hub page. The service worker PRECACHE list is updated to include `fear-greed.html`. No routing library, no build step — plain HTML/CSS.

**Tech Stack:** Vanilla HTML/CSS, Inter font (Google Fonts), existing Vercel/Netlify static hosting.

---

## File Map

| File | Action |
|---|---|
| `index.html` | Rename → `fear-greed.html` via `git mv` |
| `fear-greed.html` | Update `<title>`, convert `.portfolio-label` to back-link |
| `index.html` (new) | Hub page: top nav + hero + 6-card grid |
| `sw.js` | Update PRECACHE list, bump cache name to `fg-cache-v2` |

---

## Task 1: Rename existing app to fear-greed.html

**Files:**
- Rename: `index.html` → `fear-greed.html`

- [ ] **Step 1: Rename with git mv**

```bash
git mv index.html fear-greed.html
```

- [ ] **Step 2: Verify rename**

```bash
git status
```

Expected output includes:
```
renamed: index.html -> fear-greed.html
```

- [ ] **Step 3: Commit**

```bash
git commit -m "refactor: rename index.html to fear-greed.html"
```

---

## Task 2: Update fear-greed.html — title and back link

**Files:**
- Modify: `fear-greed.html`

The existing app already has a `.portfolio-label` div that says "Portfolio". We convert it into an anchor that links back to the hub, and update the page title.

- [ ] **Step 1: Update `<title>`**

Find:
```html
    <title>임광호 포트폴리오</title>
```

Replace with:
```html
    <title>공포탐욕지수 | 임광호 포트폴리오</title>
```

- [ ] **Step 2: Convert `.portfolio-label` div → anchor**

Find:
```html
                    <div class="portfolio-label">Portfolio</div>
```

Replace with:
```html
                    <a href="/" class="portfolio-label">← Portfolio</a>
```

- [ ] **Step 3: Add anchor CSS (it inherits `.portfolio-label` styling but needs link reset)**

Find this existing rule in `<style>`:
```css
        .portfolio-label {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--link);
            margin-bottom: 0.3rem;
        }
```

Replace with:
```css
        .portfolio-label {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--link);
            margin-bottom: 0.3rem;
            text-decoration: none;
        }

        .portfolio-label:hover {
            color: var(--link-hover);
        }
```

- [ ] **Step 4: Verify visually**

Serve with `npx serve .` or `python -m http.server 8080`, open `http://localhost:8080/fear-greed.html`. Check:
1. Browser tab shows "공포탐욕지수 | 임광호 포트폴리오"
2. Top-left shows "← PORTFOLIO" as a link in the accent color
3. All existing app functionality works normally (gauge loads, tabs work)

- [ ] **Step 5: Commit**

```bash
git add fear-greed.html
git commit -m "feat: add back-link and update title in fear-greed.html"
```

---

## Task 3: Update sw.js

**Files:**
- Modify: `sw.js`

The service worker currently pre-caches `/index.html`. Since `/index.html` will be the hub, we need to add `/fear-greed.html` to PRECACHE and bump the cache version so browsers invalidate the old cache.

- [ ] **Step 1: Update PRECACHE and bump cache name**

Find:
```js
const CACHE_NAME = 'fg-cache-v1';

// Static assets to cache on install
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon.svg'];
```

Replace with:
```js
const CACHE_NAME = 'fg-cache-v2';

// Static assets to cache on install
const PRECACHE = ['/', '/index.html', '/fear-greed.html', '/manifest.json', '/icon.svg'];
```

- [ ] **Step 2: Commit**

```bash
git add sw.js
git commit -m "feat: update sw.js precache for hub + fear-greed split, bump to v2"
```

---

## Task 4: Create new hub index.html

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create the file**

Create `index.html` with the following content:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>임광호 포트폴리오</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💼</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #f8f7f4;
            color: #1a1a1a;
            min-height: 100vh;
        }

        /* ── Top Nav ── */
        .topnav {
            position: sticky;
            top: 0;
            z-index: 100;
            background: #fff;
            border-bottom: 1px solid #e8e8e8;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            gap: 2rem;
            height: 56px;
        }

        .topnav-logo {
            font-weight: 800;
            font-size: 0.95rem;
            color: #1a1a1a;
            text-decoration: none;
            margin-right: auto;
        }

        .topnav-link {
            font-size: 0.85rem;
            color: #666;
            text-decoration: none;
            padding: 4px 0;
            border-bottom: 2px solid transparent;
            white-space: nowrap;
        }

        .topnav-link:hover { color: #1a1a1a; }

        .topnav-link.active {
            color: #1a1a1a;
            border-bottom-color: #1a1a1a;
            font-weight: 600;
        }

        /* ── Hero ── */
        .hero {
            text-align: center;
            padding: 4rem 1rem 2.75rem;
        }

        .hero-badge {
            display: inline-block;
            background: #f0ede8;
            color: #666;
            font-size: 0.72rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            padding: 5px 14px;
            border-radius: 20px;
            margin-bottom: 1.25rem;
        }

        .hero h1 {
            font-size: clamp(1.6rem, 4vw, 2.25rem);
            font-weight: 800;
            line-height: 1.3;
            margin-bottom: 0.75rem;
            letter-spacing: -0.02em;
        }

        .hero p {
            color: #777;
            font-size: 0.95rem;
        }

        /* ── Card Grid ── */
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
            max-width: 960px;
            margin: 0 auto;
            padding: 0 1.5rem 4rem;
        }

        .card {
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 14px;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .card-live {
            border-color: #c8e6c9;
            cursor: pointer;
        }

        .card-live:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .card-soon {
            opacity: 0.65;
            cursor: default;
            pointer-events: none;
        }

        .card-icon {
            font-size: 2rem;
            margin-bottom: 0.75rem;
            line-height: 1;
        }

        .card-title {
            font-size: 0.95rem;
            font-weight: 700;
            margin-bottom: 0.4rem;
            color: #1a1a1a;
        }

        .card-desc {
            font-size: 0.8rem;
            color: #888;
            line-height: 1.55;
        }

        .card-tag {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 600;
            padding: 3px 9px;
            border-radius: 20px;
            margin-top: 0.875rem;
        }

        .tag-live { background: #e8f5e9; color: #2e7d32; }
        .tag-soon { background: #f5f5f5; color: #999; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
            .grid { grid-template-columns: repeat(2, 1fr); }
            .topnav { gap: 1.25rem; padding: 0 1rem; }
        }

        @media (max-width: 400px) {
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <nav class="topnav">
        <a href="/" class="topnav-logo">임광호 포트폴리오</a>
        <a href="/" class="topnav-link active">홈</a>
        <a href="/fear-greed.html" class="topnav-link">공포탐욕지수</a>
    </nav>

    <div class="hero">
        <span class="hero-badge">재테크 도구 모음</span>
        <h1>내 투자를 제대로 이해하는<br>금융 도구들</h1>
        <p>직접 만든 금융 분석 툴과 계산기를 한 곳에서</p>
    </div>

    <div class="grid">

        <a href="/fear-greed.html" class="card card-live">
            <div class="card-icon">📊</div>
            <div class="card-title">공포탐욕지수</div>
            <div class="card-desc">CNN Fear &amp; Greed Index 실시간 추적, 히스토리 캘린더, 종목 수익률 계산기</div>
            <span class="card-tag tag-live">Live</span>
        </a>

        <div class="card card-soon">
            <div class="card-icon">💰</div>
            <div class="card-title">복리 계산기</div>
            <div class="card-desc">원금·이율·기간으로 복리 수익을 시각화하고 단리와 비교</div>
            <span class="card-tag tag-soon">Coming Soon</span>
        </div>

        <div class="card card-soon">
            <div class="card-icon">💸</div>
            <div class="card-title">절세 계산기</div>
            <div class="card-desc">주식·ETF 양도소득세 절세 전략 시뮬레이션</div>
            <span class="card-tag tag-soon">Coming Soon</span>
        </div>

        <div class="card card-soon">
            <div class="card-icon">🏠</div>
            <div class="card-title">대출 이자 계산기</div>
            <div class="card-desc">원리금균등·원금균등 상환 방식 비교 및 총 이자 계산</div>
            <span class="card-tag tag-soon">Coming Soon</span>
        </div>

        <div class="card card-soon">
            <div class="card-icon">📈</div>
            <div class="card-title">환율 손익 계산기</div>
            <div class="card-desc">달러·엔·유로 환전 시점별 손익과 환차손 시뮬레이션</div>
            <span class="card-tag tag-soon">Coming Soon</span>
        </div>

        <div class="card card-soon">
            <div class="card-icon">🎯</div>
            <div class="card-title">목표 자산 계산기</div>
            <div class="card-desc">목표 금액까지 필요한 월 적립액과 기간을 역산</div>
            <span class="card-tag tag-soon">Coming Soon</span>
        </div>

    </div>

</body>
</html>
```

- [ ] **Step 2: Verify visually**

Open `http://localhost:8080/` (hub) and `http://localhost:8080/fear-greed.html` (app). Check:
1. Hub: top nav visible with logo + 홈(active) + 공포탐욕지수 links
2. Hub: hero section shows badge, h1, subtitle
3. Hub: 3×2 grid — 공포탐욕지수 card has green border, hover lift works; 5 Coming Soon cards are slightly faded and not clickable
4. Click "공포탐욕지수" card → navigates to fear-greed.html correctly
5. Click nav link "공포탐욕지수" → navigates to fear-greed.html correctly
6. fear-greed.html: "← PORTFOLIO" back-link in top-left → navigates to hub (`/`)
7. Mobile (≤640px): grid becomes 2-col; ≤400px: 1-col
8. No console errors on either page

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add portfolio hub landing page with 6-card grid"
```

---

## Post-Implementation Checklist

- [ ] `index.html` → hub page loads at `/`
- [ ] `fear-greed.html` → full F&G app loads at `/fear-greed.html`
- [ ] Hub card click navigates to fear-greed.html
- [ ] Back link in fear-greed.html navigates to `/`
- [ ] Nav links work on both pages
- [ ] Coming Soon cards are non-clickable (pointer-events: none)
- [ ] Responsive layout: 3-col → 2-col → 1-col
- [ ] Browser tab titles correct on both pages
- [ ] sw.js PRECACHE includes both `/index.html` and `/fear-greed.html`
- [ ] No console errors
