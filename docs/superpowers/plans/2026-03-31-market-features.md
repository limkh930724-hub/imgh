# Market Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헤더 subtitle 삭제, 게이지 아래에 시장 심리 해석기 + 포트폴리오 수익률 계산기 추가

**Architecture:** 단일 `index.html` 파일 내 모든 변경. 해석기는 `applyData()` 호출 시 점수 기반으로 렌더링. 계산기는 기존 `CORS_PROXY` + Yahoo Finance API 재사용, 항목은 `localStorage('fg-portfolio')` 저장.

**Tech Stack:** Vanilla JS, HTML/CSS, Yahoo Finance v8/chart API (기존 proxy 재사용)

---

## File Map

| 파일 | 변경 내용 |
|------|-----------|
| `index.html` (head/style) | `.interpreter-*`, `.calc-*` CSS 추가 |
| `index.html` (body) | 헤더 subtitle 제거, interpreter + calculator HTML 추가 |
| `index.html` (TRANSLATIONS.en) | subtitle/learnMore 키 삭제, 해석기·계산기 i18n 키 추가 |
| `index.html` (TRANSLATIONS.ko) | 동일 |
| `index.html` (script) | `updateInterpreter()`, 포트폴리오 관련 함수들 추가, lang/theme toggle 핸들러 수정 |

---

## Task 1: 헤더 subtitle 제거

**Files:**
- Modify: `index.html` — body (header), TRANSLATIONS.en, TRANSLATIONS.ko

- [ ] **Step 1: 헤더 HTML에서 subtitle `<p>` 태그 제거**

현재 (`index.html` ~920행):
```html
<header class="header">
    <div class="header-top">
        <div>
            <div class="portfolio-label">Portfolio</div>
            <h1>임광호</h1>
            <p class="project-name" data-i18n="title">Fear & Greed Index</p>
            <p><span data-i18n="subtitle">CNN market sentiment tracker · </span> <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener" data-i18n="learnMore">Learn more about the index</a></p>
        </div>
        ...
    </div>
</header>
```

변경 후:
```html
<header class="header">
    <div class="header-top">
        <div>
            <div class="portfolio-label">Portfolio</div>
            <h1>임광호</h1>
            <p class="project-name" data-i18n="title">Fear & Greed Index</p>
        </div>
        <div class="header-controls">
            <button id="themeToggle" class="lang-toggle theme-toggle" title="Toggle dark mode">🌙</button>
            <button id="langToggle" class="lang-toggle">한국어</button>
        </div>
    </div>
</header>
```

- [ ] **Step 2: TRANSLATIONS.en에서 subtitle, learnMore 키 삭제**

현재:
```js
title: 'Fear & Greed Index',
subtitle: 'CNN market sentiment tracker · ',
learnMore: 'Learn more about the index',
```

변경 후:
```js
title: 'Fear & Greed Index',
```

- [ ] **Step 3: TRANSLATIONS.ko에서 subtitle, learnMore 키 삭제**

현재:
```js
title: '공포·탐욕 지수',
subtitle: 'CNN 시장 감정 추적기 · ',
learnMore: '지수에 대해 더 알아보기',
```

변경 후:
```js
title: '공포·탐욕 지수',
```

- [ ] **Step 4: 브라우저에서 확인**

`http://localhost:8080` 새로고침 → 헤더에 "임광호" + "Fear & Greed Index" 만 보이고 subtitle/링크 없는지 확인.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: remove subtitle from header"
```

---

## Task 2: 해석기 CSS 추가

**Files:**
- Modify: `index.html` — `<style>` 블록 (`.share-btn` 스타일 바로 뒤)

- [ ] **Step 1: CSS 추가**

`.share-btn` 스타일 아래에 아래 CSS 삽입:

```css
/* ── Score Interpreter ───────────────────────────────── */
.interpreter {
    margin-top: 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--bg-card);
    transition: background 0.25s, border-color 0.25s;
}

.interpreter-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--bg-active);
    border-bottom: 1px solid var(--border);
}

.interpreter-badge {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 900;
    color: #fff;
    flex-shrink: 0;
}

.interpreter-meta-title {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text);
}

.interpreter-zone-label {
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 0.15rem;
}

.interpreter-body {
    padding: 0.9rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.interp-row {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
}

.interp-icon {
    font-size: 0.95rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
}

.interp-text {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.6;
}

.interp-text strong {
    color: var(--text);
}
```

- [ ] **Step 2: 브라우저에서 스타일 에러 없는지 확인**

`http://localhost:8080` 새로고침 → 콘솔에 CSS 에러 없는지 확인.

---

## Task 3: 해석기 HTML + i18n 번역 키

**Files:**
- Modify: `index.html` — body (gauge-section), TRANSLATIONS.en, TRANSLATIONS.ko

- [ ] **Step 1: 해석기 HTML을 `.gauge-section` 안 `gauge-footer` 바로 뒤에 추가**

현재 (`index.html` ~1010행):
```html
<div class="gauge-section">
    <div class="gauge-wrapper">
        <canvas id="gaugeCanvas" class="gauge-canvas" width="500" height="340"></canvas>
    </div>
    <div class="gauge-footer">
        ...
    </div>
</div>
```

변경 후:
```html
<div class="gauge-section">
    <div class="gauge-wrapper">
        <canvas id="gaugeCanvas" class="gauge-canvas" width="500" height="340"></canvas>
    </div>
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
    <div class="interpreter" id="interpreter">
        <div class="interpreter-header">
            <div class="interpreter-badge" id="interpreterBadge">–</div>
            <div>
                <div class="interpreter-meta-title" data-i18n="interpTitle">시장 심리 해석</div>
                <div class="interpreter-zone-label" id="interpreterZoneLabel"></div>
            </div>
        </div>
        <div class="interpreter-body">
            <div class="interp-row">
                <div class="interp-icon">📉</div>
                <div class="interp-text" id="interpMarket"></div>
            </div>
            <div class="interp-row">
                <div class="interp-icon">📊</div>
                <div class="interp-text" id="interpHistory"></div>
            </div>
            <div class="interp-row">
                <div class="interp-icon">💡</div>
                <div class="interp-text" id="interpTip"></div>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 2: TRANSLATIONS.en에 해석기 키 추가**

`shareTitle: 'Share',` 바로 앞에 추가:

```js
interpTitle: 'Market Sentiment Analysis',
// Extreme Fear (0-25)
interpEFMarket: '<strong>Current market:</strong> Investors are in extreme fear. Panic selling is increasing and volatility is high.',
interpEFHistory: '<strong>Historical pattern:</strong> The 0–25 zone has historically offered <strong>long-term buying opportunities</strong>, though short-term further decline is possible.',
interpEFTip: '<strong>Insight:</strong> This is the zone Buffett described as "be greedy when others are fearful." Patience tends to be rewarded.',
// Fear (25-45)
interpFMarket: '<strong>Current market:</strong> Investors are cautious and risk-averse. Selling pressure is elevated.',
interpFHistory: '<strong>Historical pattern:</strong> Fear zones often precede market bottoms. Accumulation by long-term investors often begins here.',
interpFTip: '<strong>Insight:</strong> Consider dollar-cost averaging into positions. Avoid panic selling at this stage.',
// Neutral (45-55)
interpNMarket: '<strong>Current market:</strong> Sentiment is balanced between fear and greed. No strong directional bias.',
interpNHistory: '<strong>Historical pattern:</strong> Neutral zones are transitional — the market could break either way. Monitor for direction.',
interpNTip: '<strong>Insight:</strong> Hold existing positions and wait for a clearer signal before making large moves.',
// Greed (55-75)
interpGMarket: '<strong>Current market:</strong> Investors are optimistic and increasing risk appetite. Momentum is positive.',
interpGHistory: '<strong>Historical pattern:</strong> Greed zones can sustain for extended periods during bull markets, but risk of correction increases.',
interpGTip: '<strong>Insight:</strong> Consider taking partial profits or tightening stop-losses. Don\'t chase momentum blindly.',
// Extreme Greed (75-100)
interpEGMarket: '<strong>Current market:</strong> Euphoria is driving markets higher. FOMO is widespread and valuations are stretched.',
interpEGHistory: '<strong>Historical pattern:</strong> Extreme greed often precedes sharp corrections. Markets rarely stay in this zone for long.',
interpEGTip: '<strong>Insight:</strong> "Be fearful when others are greedy." This is a good time to reduce exposure or hedge.',
```

- [ ] **Step 3: TRANSLATIONS.ko에 해석기 키 추가**

동일 위치(`shareTitle: '공유',` 바로 앞)에 추가:

```js
interpTitle: '시장 심리 해석',
// Extreme Fear
interpEFMarket: '<strong>현재 시장:</strong> 투자자들이 극도의 공포 상태입니다. 패닉 매도가 증가하고 변동성이 높습니다.',
interpEFHistory: '<strong>역사적 패턴:</strong> 0–25 구간은 역사적으로 <strong>장기 매수 기회</strong>로 알려져 있습니다. 단기 추가 하락 가능성도 존재합니다.',
interpEFTip: '<strong>시사점:</strong> 버핏이 말한 "남들이 두려워할 때 탐욕스러워져라"에 해당하는 구간입니다. 인내심이 보상받는 경향이 있습니다.',
// Fear
interpFMarket: '<strong>현재 시장:</strong> 투자자들이 신중하고 위험 회피 성향을 보입니다. 매도 압력이 높습니다.',
interpFHistory: '<strong>역사적 패턴:</strong> 공포 구간은 종종 시장 바닥 전후에 나타납니다. 장기 투자자들의 매집이 시작되는 시점입니다.',
interpFTip: '<strong>시사점:</strong> 분할 매수를 고려하세요. 이 단계에서 패닉 매도는 피하는 것이 좋습니다.',
// Neutral
interpNMarket: '<strong>현재 시장:</strong> 공포와 탐욕 사이에서 균형을 유지하고 있습니다. 뚜렷한 방향성이 없습니다.',
interpNHistory: '<strong>역사적 패턴:</strong> 중립 구간은 전환점으로, 시장이 어느 방향으로든 움직일 수 있습니다. 방향성을 주시하세요.',
interpNTip: '<strong>시사점:</strong> 기존 포지션을 유지하고 더 명확한 신호가 나올 때까지 큰 움직임을 자제하세요.',
// Greed
interpGMarket: '<strong>현재 시장:</strong> 투자자들이 낙관적이고 위험 선호도가 높아지고 있습니다. 상승 모멘텀이 있습니다.',
interpGHistory: '<strong>역사적 패턴:</strong> 탐욕 구간은 강세장에서 오래 지속될 수 있지만 조정 위험도 높아집니다.',
interpGTip: '<strong>시사점:</strong> 일부 수익 실현이나 손절선 조정을 고려하세요. 모멘텀만 믿고 추격 매수는 위험합니다.',
// Extreme Greed
interpEGMarket: '<strong>현재 시장:</strong> 열풍이 시장을 끌어올리고 있습니다. FOMO 심리가 만연하고 밸류에이션이 부풀어 있습니다.',
interpEGHistory: '<strong>역사적 패턴:</strong> 극단적 탐욕은 종종 급격한 조정에 앞서 나타납니다. 이 구간이 오래 지속되는 경우는 드뭅니다.',
interpEGTip: '<strong>시사점:</strong> "남들이 탐욕스러울 때 두려워하라." 노출을 줄이거나 헤지를 고려할 때입니다.',
```

- [ ] **Step 4: 브라우저에서 해석기 구조 확인**

`http://localhost:8080` 새로고침 → 게이지 아래 해석기 카드 구조가 보이는지 확인 (내용은 빈 상태).

---

## Task 4: 해석기 JS 로직 연결

**Files:**
- Modify: `index.html` — script 블록 (`applyData` 함수 근처, lang/theme 핸들러)

- [ ] **Step 1: `updateInterpreter(score)` 함수 추가**

`applyData()` 함수 바로 앞에 추가:

```js
function updateInterpreter(score) {
    const zone = getZone(score);
    const badge = document.getElementById('interpreterBadge');
    const zoneLabel = document.getElementById('interpreterZoneLabel');
    const interpMarket = document.getElementById('interpMarket');
    const interpHistory = document.getElementById('interpHistory');
    const interpTip = document.getElementById('interpTip');

    // 구간 키 접두사 매핑
    const prefix = {
        extremeFear: 'EF',
        fear: 'F',
        neutral: 'N',
        greed: 'G',
        extremeGreed: 'EG',
    }[zone.labelKey];

    badge.textContent = Math.round(score);
    badge.style.background = zone.color;
    zoneLabel.textContent = t(zone.labelKey);
    zoneLabel.style.color = zone.color;
    interpMarket.innerHTML = t(`interp${prefix}Market`);
    interpHistory.innerHTML = t(`interp${prefix}History`);
    interpTip.innerHTML = t(`interp${prefix}Tip`);
}
```

- [ ] **Step 2: `applyData()` 에서 `updateInterpreter()` 호출**

`applyData()` 함수 내 `animateGauge(current);` 바로 뒤에 추가:

```js
updateInterpreter(current);
```

- [ ] **Step 3: lang 토글 핸들러에 `updateInterpreter` 추가**

`langToggle` 핸들러에서 `lastUpdated.textContent = ...` 바로 뒤에 추가:

```js
if (_cachedScores) updateInterpreter(_cachedScores.current);
```

- [ ] **Step 4: 브라우저에서 해석기 동작 확인**

`http://localhost:8080` 새로고침 → 게이지 아래 해석기에 현재 점수 + 구간별 텍스트 표시 확인. 언어 토글 시 텍스트 변경 확인.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add score interpreter below gauge"
```

---

## Task 5: 계산기 CSS 추가

**Files:**
- Modify: `index.html` — `<style>` 블록 (interpreter CSS 바로 뒤)

- [ ] **Step 1: CSS 추가**

interpreter CSS 블록 뒤에 추가:

```css
/* ── Portfolio Calculator ────────────────────────────── */
.calc-section {
    margin-top: 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: var(--bg-card);
    transition: background 0.25s, border-color 0.25s;
}

.calc-header {
    padding: 0.75rem 1rem;
    background: var(--bg-active);
    border-bottom: 1px solid var(--border);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--text);
}

.calc-body {
    padding: 0.9rem 1rem;
}

.calc-inputs {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 0.5rem;
    align-items: end;
    margin-bottom: 0.9rem;
}

.calc-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.calc-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-dimmer);
}

.calc-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.45rem 0.65rem;
    font-size: 0.82rem;
    color: var(--text);
    font-family: inherit;
    width: 100%;
    transition: border-color 0.2s;
}

.calc-input:focus {
    outline: none;
    border-color: var(--text-muted);
}

.calc-input::placeholder {
    color: var(--text-dimmer);
}

.calc-add-btn {
    background: var(--period-active-bg);
    color: var(--period-active-fg);
    border: none;
    border-radius: 6px;
    padding: 0.45rem 0.9rem;
    font-size: 0.78rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
}

.calc-add-btn:hover { opacity: 0.8; }
.calc-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.calc-empty {
    text-align: center;
    font-size: 0.8rem;
    color: var(--text-dimmer);
    padding: 1rem 0;
}

.calc-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 0.5rem;
    align-items: center;
    padding: 0.65rem 0.75rem;
    border-radius: 8px;
    background: var(--bg);
    border: 1px solid var(--border-2);
    margin-bottom: 0.4rem;
    transition: background 0.2s;
}

.calc-sym {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--text);
}

.calc-sub {
    font-size: 0.68rem;
    color: var(--text-dimmer);
    margin-top: 0.1rem;
}

.calc-cell {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.calc-cell-label {
    font-size: 0.65rem;
    color: var(--text-dimmer);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.calc-cell-val {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text);
}

.calc-pnl-pos { color: #2e7d32; font-weight: 700; }
.calc-pnl-neg { color: #d32f2f; font-weight: 700; }
body.dark .calc-pnl-pos { color: #56d364; }
body.dark .calc-pnl-neg { color: #f85149; }

.calc-del-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-dimmer);
    font-size: 1rem;
    line-height: 1;
    padding: 0.2rem;
    border-radius: 4px;
    transition: color 0.15s;
}
.calc-del-btn:hover { color: #d32f2f; }

.calc-total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-2);
}

.calc-total-label {
    font-size: 0.78rem;
    color: var(--text-muted);
    font-weight: 600;
}

.calc-total-val {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--text);
}

@media (max-width: 680px) {
    .calc-inputs {
        grid-template-columns: 1fr 1fr;
    }
    .calc-add-btn {
        grid-column: 1 / -1;
    }
    .calc-item {
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
    }
    .calc-del-btn {
        grid-column: 2;
        grid-row: 1;
        justify-self: end;
    }
}
```

---

## Task 6: 계산기 HTML + i18n 번역 키

**Files:**
- Modify: `index.html` — body (gauge-section 내 interpreter 바로 뒤), TRANSLATIONS

- [ ] **Step 1: 계산기 HTML을 interpreter 바로 뒤에 추가**

`</div><!-- /interpreter -->` 바로 뒤, `</div><!-- /gauge-section -->` 앞에:

```html
<div class="calc-section" id="calcSection">
    <div class="calc-header" data-i18n="calcTitle">📈 포트폴리오 수익률 계산기</div>
    <div class="calc-body">
        <div class="calc-inputs">
            <div class="calc-field">
                <label class="calc-label" data-i18n="calcSymLabel">티커 심볼</label>
                <input class="calc-input" id="calcSym" placeholder="AAPL, 005930.KS…" />
            </div>
            <div class="calc-field">
                <label class="calc-label" data-i18n="calcQtyLabel">수량</label>
                <input class="calc-input" id="calcQty" type="number" min="0" step="any" placeholder="10" />
            </div>
            <div class="calc-field">
                <label class="calc-label" data-i18n="calcPriceLabel">매입가</label>
                <input class="calc-input" id="calcPrice" type="number" min="0" step="any" placeholder="150.00" />
            </div>
            <button class="calc-add-btn" id="calcAddBtn" data-i18n="calcAddBtn">추가</button>
        </div>
        <div id="calcList"></div>
    </div>
</div>
```

- [ ] **Step 2: TRANSLATIONS.en에 계산기 키 추가**

`interpTitle: 'Market Sentiment Analysis',` 바로 앞에:

```js
calcTitle: '📈 Portfolio Return Calculator',
calcSymLabel: 'Ticker Symbol',
calcQtyLabel: 'Quantity',
calcPriceLabel: 'Buy Price',
calcAddBtn: 'Add',
calcEmpty: 'Add a ticker to track your portfolio returns.',
calcCurrentPrice: 'Current',
calcValue: 'Value',
calcReturn: 'Return',
calcTotal: 'Total',
calcLoadingPrice: 'Loading…',
calcErrorPrice: 'N/A',
```

- [ ] **Step 3: TRANSLATIONS.ko에 계산기 키 추가**

동일 위치:

```js
calcTitle: '📈 포트폴리오 수익률 계산기',
calcSymLabel: '티커 심볼',
calcQtyLabel: '수량',
calcPriceLabel: '매입가',
calcAddBtn: '추가',
calcEmpty: '티커를 추가해 포트폴리오 수익률을 확인하세요.',
calcCurrentPrice: '현재가',
calcValue: '평가금액',
calcReturn: '수익률',
calcTotal: '합계',
calcLoadingPrice: '로딩 중…',
calcErrorPrice: 'N/A',
```

- [ ] **Step 4: 브라우저에서 계산기 UI 구조 확인**

`http://localhost:8080` 새로고침 → 해석기 아래 계산기 카드(입력 폼)가 보이는지 확인.

---

## Task 7: 계산기 JS 로직

**Files:**
- Modify: `index.html` — script 블록 (lang/theme 핸들러 바로 앞)

- [ ] **Step 1: 포트폴리오 상태 + localStorage 함수 추가**

lang/theme 핸들러(`document.getElementById('themeToggle').addEventListener`) 바로 앞에 추가:

```js
// ══════════════════════════════════════
//  PORTFOLIO CALCULATOR
// ══════════════════════════════════════
let portfolioItems = JSON.parse(localStorage.getItem('fg-portfolio') || '[]');
// shape: [{ sym: string, qty: number, buyPrice: number }]

function savePortfolio() {
    localStorage.setItem('fg-portfolio', JSON.stringify(portfolioItems));
}

async function fetchCurrentPrice(sym) {
    const url = `${YAHOO_CHART}${encodeURIComponent(sym.toUpperCase())}?range=1d&interval=1d&includePrePost=false`;
    const resp = await fetch(CORS_PROXY + encodeURIComponent(url));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    const price = json.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (price == null) throw new Error('No price');
    return price;
}

function fmtNum(n) {
    if (n == null || isNaN(n)) return t('calcErrorPrice');
    return n >= 1000
        ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : n.toFixed(2);
}

function renderPortfolio() {
    const list = document.getElementById('calcList');
    if (!list) return;

    if (portfolioItems.length === 0) {
        list.innerHTML = `<div class="calc-empty">${t('calcEmpty')}</div>`;
        return;
    }

    let totalCost = 0, totalValue = 0;
    const rows = portfolioItems.map((item, idx) => {
        const cost = item.qty * item.buyPrice;
        const value = item.currentPrice != null ? item.qty * item.currentPrice : null;
        const pnl = value != null ? value - cost : null;
        const pnlPct = pnl != null ? (pnl / cost) * 100 : null;
        const pnlClass = pnl == null ? '' : pnl >= 0 ? 'calc-pnl-pos' : 'calc-pnl-neg';
        const pnlText = pnl == null
            ? (item.loading ? t('calcLoadingPrice') : t('calcErrorPrice'))
            : `${pnl >= 0 ? '+' : ''}${fmtNum(pnl)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%)`;

        if (value != null) { totalCost += cost; totalValue += value; }

        return `
        <div class="calc-item">
            <div class="calc-cell">
                <div class="calc-sym">${item.sym}</div>
                <div class="calc-sub">${item.qty} × ${fmtNum(item.buyPrice)}</div>
            </div>
            <div class="calc-cell">
                <div class="calc-cell-label">${t('calcCurrentPrice')}</div>
                <div class="calc-cell-val">${item.loading ? t('calcLoadingPrice') : fmtNum(item.currentPrice)}</div>
            </div>
            <div class="calc-cell">
                <div class="calc-cell-label">${t('calcValue')}</div>
                <div class="calc-cell-val">${value != null ? fmtNum(value) : (item.loading ? t('calcLoadingPrice') : t('calcErrorPrice'))}</div>
            </div>
            <div class="calc-cell">
                <div class="calc-cell-label">${t('calcReturn')}</div>
                <div class="calc-cell-val ${pnlClass}">${pnlText}</div>
            </div>
            <button class="calc-del-btn" onclick="removePortfolioItem(${idx})" title="Remove">×</button>
        </div>`;
    }).join('');

    const totalPnl = totalValue - totalCost;
    const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const totalClass = totalPnl >= 0 ? 'calc-pnl-pos' : 'calc-pnl-neg';
    const totalText = totalCost > 0
        ? `${fmtNum(totalValue)} <span class="${totalClass}">(${totalPnl >= 0 ? '+' : ''}${totalPct.toFixed(1)}%)</span>`
        : '–';

    list.innerHTML = rows + `
    <div class="calc-total-row">
        <span class="calc-total-label">${t('calcTotal')}</span>
        <span class="calc-total-val">${totalText}</span>
    </div>`;
}

async function loadPriceForItem(idx) {
    portfolioItems[idx].loading = true;
    portfolioItems[idx].currentPrice = null;
    renderPortfolio();
    try {
        portfolioItems[idx].currentPrice = await fetchCurrentPrice(portfolioItems[idx].sym);
    } catch (e) {
        portfolioItems[idx].currentPrice = null;
    }
    portfolioItems[idx].loading = false;
    renderPortfolio();
}

function removePortfolioItem(idx) {
    portfolioItems.splice(idx, 1);
    savePortfolio();
    renderPortfolio();
}

async function addPortfolioItem() {
    const symEl = document.getElementById('calcSym');
    const qtyEl = document.getElementById('calcQty');
    const priceEl = document.getElementById('calcPrice');
    const btn = document.getElementById('calcAddBtn');

    const sym = symEl.value.trim().toUpperCase();
    const qty = parseFloat(qtyEl.value);
    const buyPrice = parseFloat(priceEl.value);

    if (!sym || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) return;

    btn.disabled = true;
    const idx = portfolioItems.length;
    portfolioItems.push({ sym, qty, buyPrice, currentPrice: null, loading: true });
    savePortfolio();
    renderPortfolio();

    symEl.value = '';
    qtyEl.value = '';
    priceEl.value = '';
    btn.disabled = false;
    symEl.focus();

    await loadPriceForItem(idx);
    savePortfolio();
}

document.getElementById('calcAddBtn').addEventListener('click', addPortfolioItem);
['calcSym', 'calcQty', 'calcPrice'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
        if (e.key === 'Enter') addPortfolioItem();
    });
});

// 앱 로드 시 저장된 항목 복원 + 가격 갱신
(async () => {
    renderPortfolio();
    for (let i = 0; i < portfolioItems.length; i++) {
        await loadPriceForItem(i);
        savePortfolio();
    }
})();
```

- [ ] **Step 2: lang 토글 핸들러에 `renderPortfolio()` 추가**

`langToggle` 핸들러 마지막 줄(다른 `if` 블록들 뒤)에 추가:

```js
renderPortfolio();
```

- [ ] **Step 3: 브라우저에서 동작 확인**

`http://localhost:8080` 새로고침 → 계산기에 "티커를 추가해..." 빈 메시지 표시 확인.
AAPL 입력, 수량 10, 매입가 150 → 추가 → 현재가 로딩 후 수익률 표시 확인.
새로고침 후에도 항목 유지 확인 (localStorage).
언어 토글 시 레이블 변경 확인.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add portfolio return calculator with Yahoo Finance live prices"
```

---

## Task 8: 최종 검증 및 커밋

- [ ] **Step 1: 데스크탑 전체 확인**

`http://localhost:8080` → Overview 탭에서:
- [ ] 헤더: "PORTFOLIO / 임광호 / Fear & Greed Index" (subtitle 없음)
- [ ] 게이지 아래: 해석기 카드 (점수·구간·3줄 텍스트)
- [ ] 해석기 아래: 계산기 카드 (입력 폼)
- [ ] 다크 모드: 두 카드 모두 테마 변수 올바르게 적용
- [ ] 언어 전환: 해석기 텍스트 + 계산기 레이블 모두 변경

- [ ] **Step 2: 모바일 확인 (390px 뷰포트)**

개발자 도구에서 모바일 뷰 → 계산기 입력 2열 그리드, 추가 버튼 전체 너비, 종목 행 2열 래핑 확인.

- [ ] **Step 3: Final commit**

```bash
git add index.html
git commit -m "feat: market features complete — interpreter + portfolio calculator"
```
