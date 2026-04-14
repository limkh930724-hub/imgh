# Backtest 3종목 비교 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백테스트 비교기에서 + 버튼으로 세 번째 종목 C를 동적으로 추가하여 최대 3종목 비교를 지원하고, UI를 파란/인디고 계열로 개선한다.

**Architecture:** 단일 HTML 파일(`backtest.html`) 내 CSS·HTML·JS를 모두 수정한다. JS는 기존 2종목 구조를 유지하면서 C 관련 함수를 추가하고, 기존 render 함수들이 선택적 C 인자를 받도록 확장한다. C가 없으면 기존 2종목 동작과 완전히 동일하다.

**Tech Stack:** Vanilla HTML/CSS/JS, Chart.js, Flatpickr, Yahoo Finance (CORS proxy)

---

### Task 1: CSS — 전체 UI 개선 + 종목 C 색상

**Files:**
- Modify: `backtest.html` (CSS `<style>` 블록)

현재 CSS에서 아래 항목들을 수정한다.

- [ ] **Step 1: 배경색 및 카드 스타일 교체**

`body` 배경 `#eef1f7` → `#f0f4ff`. 카드 `border-radius` `18px` → `20px`, 그림자 약간 강화.

`backtest.html`의 `body { ... }` 블록을 찾아서 교체:
```css
body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    background: #f0f4ff;
    color: #1a1a2e;
    min-height: 100vh;
}
```

`.card { ... }` 블록에서 `border-radius: 18px` → `border-radius: 20px` 로 변경:
```css
.card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 20px;
    padding: 1.75rem;
    box-shadow: 0 2px 8px rgba(99,102,241,0.07), 0 8px 24px rgba(0,0,0,0.06);
}
```

- [ ] **Step 2: 기간 버튼 active 색상, 실행 버튼 색상 인디고로**

`.period-btn.active` 블록:
```css
.period-btn.active {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    box-shadow: 0 2px 8px rgba(99,102,241,0.35);
}
```

`.run-btn` 블록:
```css
.run-btn {
    width: 100%;
    padding: 0.95rem;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    box-shadow: 0 4px 14px rgba(99,102,241,0.4);
    letter-spacing: 0.01em;
}
```

- [ ] **Step 3: 종목 C 블록 CSS 추가**

`.sym-block.b { ... }` 블록 바로 아래에 추가:
```css
.sym-block.c { background: #ecfdf5; border: 1.5px solid #a7f3d0; }
.sym-block.c .sym-label { color: #059669; }
.sym-block.c .sym-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.12); }
.sym-block.c .sym-name-tag { color: #059669; opacity: 0.8; }
```

- [ ] **Step 4: + 버튼 및 C 삭제 버튼 CSS 추가**

`.sym-grid` 관련 CSS 아래에 추가:
```css
/* ── 종목 C 추가 버튼 ── */
.add-sym-btn {
    width: 100%;
    padding: 0.85rem;
    background: #f0f4ff;
    border: 1.5px dashed #a5b4fc;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6366f1;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}
.add-sym-btn:hover { background: #e0e7ff; border-color: #6366f1; }

/* ── C 제거 버튼 ── */
.remove-sym-btn {
    float: right;
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 0.85rem;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    transition: color 0.15s;
}
.remove-sym-btn:hover { color: #dc2626; }

/* C 블록 슬라이드인 애니메이션 */
.sym-block.c {
    animation: slideIn 0.2s ease-out;
}
@keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 5: 요약 카드 C 색상 CSS 추가**

`.summary-card.b .summary-card-header { ... }` 아래에 추가:
```css
.summary-card.c .summary-card-header { border-top: 4px solid #10b981; }
```

- [ ] **Step 6: 비교 표 C 컬럼 헤더 색상**

`.comp-table .sym-dot` 블록 아래에 추가:
```css
.comp-table th.th-c .sym-dot { background: #10b981; }
```

- [ ] **Step 7: 3열 전환용 CSS 클래스 + 모바일 override 추가**

`.sym-block.c { animation: ... }` 뒤에 추가:
```css
/* C 추가 시 sym-grid 3열 전환 */
.sym-grid.has-c { grid-template-columns: 1fr 1fr 1fr; }
```

`@media (max-width: 600px)` 블록 안에 추가:
```css
.sym-grid.has-c { grid-template-columns: 1fr; }
```

이렇게 하면 모바일에서도 1열 스택이 유지된다 (inline style 대신 class를 써야 미디어쿼리가 올바르게 동작한다).

- [ ] **Step 8: 브라우저에서 UI 확인**

`http://localhost:8080/backtest.html` 열기. 배경이 연한 파랑으로, 카드가 더 둥글게, 버튼이 인디고로 변경됐는지 확인.

- [ ] **Step 9: 커밋**

```bash
git add backtest.html
git commit -m "style: 백테스트 UI 인디고/파랑 계열로 개선"
```

---

### Task 2: HTML — + 버튼, 종목 C 입력 블록, C 요약 카드

**Files:**
- Modify: `backtest.html` (HTML `<body>` 내 종목 입력 영역, 결과 영역)

- [ ] **Step 1: 종목 입력 그리드에 + 버튼과 C 블록 추가**

현재 `.sym-grid` 닫는 `</div>` (line ~548) 바로 뒤, `<div class="section-divider">` 전에 삽입:

```html
        <!-- 종목 C 추가 버튼 -->
        <button class="add-sym-btn" id="add-sym-c-btn" onclick="showSymC()">
            ＋ 종목 C 추가하기
        </button>

        <!-- 종목 C 블록 (초기 숨김) -->
        <div class="sym-grid" id="sym-c-wrapper" style="display:none; margin-top:0.75rem">
            <div class="sym-block c" style="grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;" id="sym-c-inner">
                <div style="display:contents">
                    <div class="sym-block c" style="animation:none">
                        <div class="sym-label">종목 C <button class="remove-sym-btn" onclick="hideSymC()" title="종목 C 제거">✕</button></div>
                        <input type="text" id="sym-c" class="sym-input" placeholder="예: NVDA, TSLA"
                               autocomplete="off" spellcheck="false">
                        <div class="sym-name-tag" id="name-c">· 입력 후 자동 조회</div>
                    </div>
                </div>
            </div>
        </div>
```

실제로는 더 단순하게 처리한다. `.sym-grid` 가 원래 `grid-template-columns: 1fr 1fr` 이므로 C 추가 시 `1fr 1fr 1fr`로 바꿔야 한다. 아래가 최종 HTML:

```html
        <!-- 종목 C 추가 버튼 -->
        <button class="add-sym-btn" id="add-sym-c-btn" onclick="showSymC()">
            ＋ 종목 C 추가하기
        </button>

        <!-- 종목 C 블록 (초기 숨김) -->
        <div id="sym-c-block" class="sym-block c" style="display:none; margin-top:0.75rem">
            <div class="sym-label">종목 C <button class="remove-sym-btn" onclick="hideSymC()" title="종목 C 제거">✕</button></div>
            <input type="text" id="sym-c" class="sym-input" placeholder="예: NVDA, TSLA"
                   autocomplete="off" spellcheck="false">
            <div class="sym-name-tag" id="name-c">· 입력 후 자동 조회</div>
        </div>
```

기존 `.sym-grid` 태그에 `id="sym-ab-grid"` 추가 (JS에서 3열 전환에 필요):
```html
<div class="sym-grid" id="sym-ab-grid" style="margin-bottom:1.25rem">
```

- [ ] **Step 2: C 요약 카드 추가 (결과 영역)**

현재 `.summary-grid` 안에 카드 a, b가 있다. 카드 b 닫는 `</div>` 뒤에 카드 c 삽입:

```html
            <div class="summary-card c" id="card-c" style="display:none">
                <div class="summary-card-header">
                    <div class="summary-sym" id="sym-label-c">-</div>
                    <div class="summary-corp" id="corp-c"></div>
                    <div id="badge-c" style="display:none">
                        <span class="summary-badge">🏆 수익 우위</span>
                    </div>
                    <div class="summary-hero">
                        <span class="summary-hero-num" id="ret-c">-</span>
                        <span class="summary-hero-label">누적 수익률</span>
                    </div>
                </div>
                <div class="summary-metrics">
                    <div class="summary-metric">
                        <span class="summary-metric-label">투자 원금</span>
                        <span class="summary-metric-value muted" id="invested-c">-</span>
                    </div>
                    <div class="summary-metric">
                        <span class="summary-metric-label">최종 평가금</span>
                        <span class="summary-metric-value" id="val-c">-</span>
                    </div>
                    <div class="summary-metric">
                        <span class="summary-metric-label">CAGR (연환산)</span>
                        <span class="summary-metric-value" id="cagr-c">-</span>
                    </div>
                </div>
            </div>
```

`.summary-grid` 태그에 `id="summary-grid"` 추가 (JS에서 3열 전환에 필요):
```html
<div class="summary-grid" id="summary-grid">
```

- [ ] **Step 3: 비교 표에 C 컬럼 추가**

`<thead>` 의 `<tr>` 마지막 `<th>차이 (A−B)</th>` 앞에 삽입:
```html
<th id="th-c" style="display:none"><span class="sym-dot" style="background:#10b981"></span><span id="th-c-text">C</span></th>
```

`<tbody>` 각 행의 `diff` td 앞에 C td 삽입 (행마다):
```html
<!-- 누적 수익률 행 -->
<td id="tc-ret-c" style="display:none">-</td>

<!-- 투자 원금 행 -->
<td id="tc-inv-c" style="display:none">-</td>

<!-- 최종 평가금 행 -->
<td id="tc-val-c" style="display:none">-</td>

<!-- CAGR 행 -->
<td id="tc-cagr-c" style="display:none">-</td>
```

투자기간 행의 `colspan="3"` → `id="tc-period"` 는 그대로 두되 C 표시 시 colspan을 JS에서 `"4"`로 변경.

- [ ] **Step 4: 브라우저에서 HTML 구조 확인**

`http://localhost:8080/backtest.html` 새로고침. 종목 A/B 아래 인디고 점선 "+ 종목 C 추가하기" 버튼이 보이는지 확인. 결과 영역은 아직 보이지 않으므로 DevTools에서 `#card-c` hidden 확인.

- [ ] **Step 5: 커밋**

```bash
git add backtest.html
git commit -m "feat: 백테스트 종목 C HTML 구조 추가 (+ 버튼, 입력 블록, 결과 카드, 표 컬럼)"
```

---

### Task 3: JS — 종목 C 추가/제거 토글 + 심볼 조회

**Files:**
- Modify: `backtest.html` (`<script>` 블록)

- [ ] **Step 1: showSymC / hideSymC 함수 추가**

`setupSymbolLookup('sym-b', 'name-b');` 행 바로 뒤에 추가:

```js
// ── 종목 C 추가/제거 ──
function showSymC() {
    document.getElementById('add-sym-c-btn').style.display = 'none';
    document.getElementById('sym-c-block').style.display = '';
    document.getElementById('sym-ab-grid').classList.add('has-c');
    document.getElementById('sym-c').focus();
}

function hideSymC() {
    document.getElementById('sym-c-block').style.display = 'none';
    document.getElementById('add-sym-c-btn').style.display = '';
    document.getElementById('sym-ab-grid').classList.remove('has-c');
    document.getElementById('sym-c').value = '';
    document.getElementById('name-c').textContent = '· 입력 후 자동 조회';
}

setupSymbolLookup('sym-c', 'name-c');
```

- [ ] **Step 2: 브라우저에서 토글 동작 확인**

1. "+ 종목 C 추가하기" 클릭 → 세 번째 초록 블록 슬라이드인, 그리드 3열 전환 확인
2. C 블록의 ✕ 클릭 → C 블록 숨겨지고, + 버튼 다시 표시, 그리드 2열 복귀 확인
3. 모바일 폭(≤600px DevTools)에서 C 추가 시 1열 스택 확인

- [ ] **Step 3: 커밋**

```bash
git add backtest.html
git commit -m "feat: 종목 C 추가/제거 토글 + 심볼 이름 조회"
```

---

### Task 4: JS — renderSummaryCards 3종목 지원

**Files:**
- Modify: `backtest.html` (`<script>` 블록 내 `renderSummaryCards`)

- [ ] **Step 1: renderSummaryCards 함수 교체**

기존 `function renderSummaryCards(symA, nameA, resA, symB, nameB, resB) { ... }` 전체를 아래로 교체:

```js
function renderSummaryCards(symA, nameA, resA, symB, nameB, resB, symC, nameC, resC) {
    const hasC = !!resC;
    const returns = [resA.cumulReturn, resB.cumulReturn];
    if (hasC) returns.push(resC.cumulReturn);
    const maxRet = Math.max(...returns);

    function fill(prefix, sym, name, res) {
        const isWinner = res.cumulReturn === maxRet;
        document.getElementById(`card-${prefix}`).classList.toggle('winner', isWinner);
        document.getElementById(`sym-label-${prefix}`).textContent = sym;
        document.getElementById(`corp-${prefix}`).textContent = name || '';
        document.getElementById(`badge-${prefix}`).style.display = isWinner ? '' : 'none';

        const retEl = document.getElementById(`ret-${prefix}`);
        retEl.textContent = formatPct(res.cumulReturn);
        retEl.className = 'summary-hero-num ' + (res.cumulReturn >= 0 ? 'pos' : 'neg');

        document.getElementById(`invested-${prefix}`).textContent = formatKRW(res.totalInvested);

        const valEl = document.getElementById(`val-${prefix}`);
        valEl.textContent = formatKRW(res.finalValue);
        valEl.className = 'summary-metric-value ' + (res.finalValue >= res.totalInvested ? 'pos' : 'neg');

        const cagrEl = document.getElementById(`cagr-${prefix}`);
        cagrEl.textContent = formatPct(res.cagr);
        cagrEl.className = 'summary-metric-value ' + (res.cagr >= 0 ? 'pos' : 'neg');
    }

    fill('a', symA, nameA, resA);
    fill('b', symB, nameB, resB);

    const cardC = document.getElementById('card-c');
    const summaryGrid = document.getElementById('summary-grid');
    if (hasC) {
        fill('c', symC, nameC, resC);
        cardC.style.display = '';
        summaryGrid.style.gridTemplateColumns = '1fr 1fr 1fr';
    } else {
        cardC.style.display = 'none';
        summaryGrid.style.gridTemplateColumns = '';
    }
}
```

- [ ] **Step 2: 브라우저에서 확인**

1. C 없이 비교 실행 → 기존과 동일하게 카드 A, B만 표시
2. C 추가 후 비교 실행 → 카드 3개, 3열 그리드, 🏆 배지 최고 수익률 카드에 표시

- [ ] **Step 3: 커밋**

```bash
git add backtest.html
git commit -m "feat: 요약 카드 3종목 지원"
```

---

### Task 5: JS — renderTable C 컬럼

**Files:**
- Modify: `backtest.html` (`<script>` 블록 내 `renderTable`)

- [ ] **Step 1: renderTable 함수 교체**

기존 `function renderTable(symA, resA, symB, resB) { ... }` 전체를 아래로 교체:

```js
function renderTable(symA, resA, symB, resB, symC, resC) {
    const hasC = !!resC;

    document.getElementById('th-a-text').textContent = symA;
    document.getElementById('th-b-text').textContent = symB;

    // C 컬럼 표시/숨김
    const cEls = ['th-c', 'tc-ret-c', 'tc-inv-c', 'tc-val-c', 'tc-cagr-c'];
    cEls.forEach(id => {
        document.getElementById(id).style.display = hasC ? '' : 'none';
    });
    if (hasC) {
        document.getElementById('th-c-text').textContent = symC;
        document.getElementById('tc-period').colSpan = 4;
    } else {
        document.getElementById('tc-period').colSpan = 3;
    }

    // 누적 수익률
    document.getElementById('tc-ret-a').textContent = formatPct(resA.cumulReturn);
    document.getElementById('tc-ret-b').textContent = formatPct(resB.cumulReturn);
    if (hasC) document.getElementById('tc-ret-c').textContent = formatPct(resC.cumulReturn);
    const retDiff = resA.cumulReturn - resB.cumulReturn;
    const rdEl = document.getElementById('tc-ret-diff');
    rdEl.textContent = (retDiff > 0 ? '+' : '') + retDiff.toFixed(1) + '%p';
    rdEl.className = 'diff ' + (retDiff > 0 ? 'pos' : retDiff < 0 ? 'neg' : '');

    // 투자 원금
    document.getElementById('tc-inv-a').textContent = formatKRW(resA.totalInvested);
    document.getElementById('tc-inv-b').textContent = formatKRW(resB.totalInvested);
    if (hasC) document.getElementById('tc-inv-c').textContent = formatKRW(resC.totalInvested);
    const invDiff = resA.totalInvested - resB.totalInvested;
    const idEl = document.getElementById('tc-inv-diff');
    idEl.textContent = invDiff === 0 ? '동일' : formatKRWDiff(invDiff);
    idEl.className = 'diff ' + (invDiff > 0 ? 'pos' : invDiff < 0 ? 'neg' : '');

    // 최종 평가금
    document.getElementById('tc-val-a').textContent = formatKRW(resA.finalValue);
    document.getElementById('tc-val-b').textContent = formatKRW(resB.finalValue);
    if (hasC) document.getElementById('tc-val-c').textContent = formatKRW(resC.finalValue);
    const valDiff = resA.finalValue - resB.finalValue;
    const vdEl = document.getElementById('tc-val-diff');
    vdEl.textContent = formatKRWDiff(valDiff);
    vdEl.className = 'diff ' + (valDiff > 0 ? 'pos' : valDiff < 0 ? 'neg' : '');

    // CAGR
    document.getElementById('tc-cagr-a').textContent = formatPct(resA.cagr);
    document.getElementById('tc-cagr-b').textContent = formatPct(resB.cagr);
    if (hasC) document.getElementById('tc-cagr-c').textContent = formatPct(resC.cagr);
    const cagrDiff = resA.cagr - resB.cagr;
    const cdEl = document.getElementById('tc-cagr-diff');
    cdEl.textContent = (cagrDiff > 0 ? '+' : '') + cagrDiff.toFixed(1) + '%p';
    cdEl.className = 'diff ' + (cagrDiff > 0 ? 'pos' : cagrDiff < 0 ? 'neg' : '');

    // 투자기간
    document.getElementById('tc-period').textContent =
        resA.dates[0] + ' ~ ' + resA.dates[resA.dates.length - 1];
}
```

- [ ] **Step 2: 브라우저 확인**

1. C 없이 비교 → 기존 4열(항목·A·B·차이) 그대로
2. C 추가 후 비교 → 5열(항목·A·B·C·차이), C 값 올바르게 표시, colspan 투자기간 행 정상

- [ ] **Step 3: 커밋**

```bash
git add backtest.html
git commit -m "feat: 비교 표 종목 C 컬럼 추가"
```

---

### Task 6: JS — renderChart + switchChartMode C 라인

**Files:**
- Modify: `backtest.html` (`<script>` 블록 내 `renderChart`, `switchChartMode`, `_chartData`)

- [ ] **Step 1: renderChart 함수 교체**

기존 `function renderChart(dates, resA, resB, symA, symB, mode) { ... }` 전체를 아래로 교체:

```js
function renderChart(dates, resA, resB, symA, symB, mode, resC, symC) {
    _chartData = { dates, resA, resB, symA, symB, resC, symC };
    if (btChartInstance) btChartInstance.destroy();
    const isReturns = mode === 'returns';
    const dataA = isReturns ? resA.returns : resA.values;
    const dataB = isReturns ? resB.returns : resB.values;

    function downsample(arr) {
        if (arr.length <= 500) return arr;
        const step = arr.length / 500;
        return Array.from({ length: 500 }, (_, i) => arr[Math.round(i * step)]);
    }

    const datasets = [
        { label: symA, data: downsample(dataA), borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.05)', fill: true,
          borderWidth: 2.5, pointRadius: 0, tension: 0.2 },
        { label: symB, data: downsample(dataB), borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,0.05)', fill: true,
          borderWidth: 2.5, pointRadius: 0, tension: 0.2 }
    ];

    if (resC) {
        const dataC = isReturns ? resC.returns : resC.values;
        datasets.push({
            label: symC, data: downsample(dataC), borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.05)', fill: true,
            borderWidth: 2.5, pointRadius: 0, tension: 0.2
        });
    }

    const ctx = document.getElementById('btChart').getContext('2d');
    btChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: downsample(dates), datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'top', labels: { font: { size: 12, weight: '600' }, usePointStyle: true, pointStyle: 'line', pointStyleWidth: 24 } },
                tooltip: {
                    backgroundColor: 'rgba(15,23,42,0.9)',
                    titleFont: { size: 12 },
                    bodyFont: { size: 13, weight: '700' },
                    padding: 10,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${isReturns ? formatPct(ctx.parsed.y) : formatKRW(ctx.parsed.y)}`
                    }
                }
            },
            scales: {
                x: { ticks: { maxTicksLimit: 7, font: { size: 11 }, color: '#94a3b8' }, grid: { color: '#f1f5f9' }, border: { color: '#e2e8f0' } },
                y: { ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => isReturns ? v.toFixed(0) + '%' : formatKRW(v) }, grid: { color: '#f1f5f9' }, border: { color: '#e2e8f0' } }
            }
        }
    });
}
```

- [ ] **Step 2: switchChartMode 함수 교체**

기존 `function switchChartMode(mode) { ... }` 전체를 아래로 교체:

```js
function switchChartMode(mode) {
    document.getElementById('tab-returns').className = 'chart-tab' + (mode === 'returns' ? ' active' : '');
    document.getElementById('tab-value').className = 'chart-tab' + (mode === 'value' ? ' active' : '');
    if (_chartData) {
        const { dates, resA, resB, symA, symB, resC, symC } = _chartData;
        renderChart(dates, resA, resB, symA, symB, mode, resC, symC);
    }
}
```

- [ ] **Step 3: 브라우저 확인**

1. C 없이 실행 → 차트에 파랑·주황 2개 라인만
2. C 추가 후 실행 → 초록 라인 3번째로 추가
3. "누적 수익률" ↔ "평가금액" 탭 전환 시 C 라인도 올바르게 갱신

- [ ] **Step 4: 커밋**

```bash
git add backtest.html
git commit -m "feat: 차트 종목 C 초록 라인 추가"
```

---

### Task 7: JS — runBacktest C 종목 처리

**Files:**
- Modify: `backtest.html` (`<script>` 블록 내 `runBacktest`)

- [ ] **Step 1: runBacktest 함수 교체**

기존 `async function runBacktest() { ... }` 전체를 아래로 교체:

```js
async function runBacktest() {
    const symA = document.getElementById('sym-a').value.trim().toUpperCase();
    const symB = document.getElementById('sym-b').value.trim().toUpperCase();
    const symCRaw = document.getElementById('sym-c').value.trim().toUpperCase();
    const symC = document.getElementById('sym-c-block').style.display !== 'none' && symCRaw ? symCRaw : null;

    const amountRaw = document.getElementById('amount').value.replace(/[^0-9]/g, '');
    const amount = Number(amountRaw);
    const investType = document.querySelector('input[name=invest-type]:checked').value;

    let startArg, endArg;
    const fpDates = fpInstance ? fpInstance.selectedDates : [];
    if (activeYears === null && fpDates.length === 2) {
        startArg = fpDates[0].toISOString().slice(0, 10);
        endArg   = fpDates[1].toISOString().slice(0, 10);
    } else {
        const end = new Date();
        const start = new Date();
        start.setFullYear(start.getFullYear() - (activeYears || 1));
        startArg = start.toISOString().slice(0, 10);
        endArg   = end.toISOString().slice(0, 10);
    }

    if (!symA || !symB) return showStatus('종목을 입력해주세요', true);
    if (!amount || amount <= 0) return showStatus('투자금액을 입력해주세요', true);

    const btn = document.getElementById('run-btn');
    btn.disabled = true;
    btn.textContent = '데이터 조회 중…';
    showStatus('Yahoo Finance에서 데이터를 불러오는 중입니다…');

    try {
        const fetches = [
            fetchStockData(symA, startArg, endArg),
            fetchStockData(symB, startArg, endArg),
        ];
        if (symC) fetches.push(fetchStockData(symC, startArg, endArg));

        const results = await Promise.all(fetches);
        const [dataA, dataB] = results;
        const dataC = results[2] || null;

        document.getElementById('name-a').textContent = '· ' + dataA.longName;
        document.getElementById('name-b').textContent = '· ' + dataB.longName;
        if (dataC) document.getElementById('name-c').textContent = '· ' + dataC.longName;

        const calcFn = investType === 'lump' ? calcLumpSum : calcDCA;
        const resA = calcFn(dataA.timestamps, dataA.prices, amount);
        const resB = calcFn(dataB.timestamps, dataB.prices, amount);
        const resC = dataC ? calcFn(dataC.timestamps, dataC.prices, amount) : null;

        hideStatus();
        document.getElementById('results').style.display = '';
        renderSummaryCards(symA, dataA.longName, resA, symB, dataB.longName, resB, symC, dataC?.longName, resC);
        renderTable(symA, resA, symB, resB, symC, resC);
        renderChart(resA.dates, resA, resB, symA, symB, 'returns', resC, symC);
        document.getElementById('tab-returns').className = 'chart-tab active';
        document.getElementById('tab-value').className = 'chart-tab';
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        showStatus(err.message || '알 수 없는 오류가 발생했습니다', true);
    } finally {
        btn.disabled = false;
        btn.textContent = '비교 시작 →';
    }
}
```

- [ ] **Step 2: 브라우저 E2E 검증 — 2종목**

1. `http://localhost:8080/backtest.html` 접속
2. SPY / QQQ, 1000만원, 일괄, 5Y → "비교 시작"
3. 카드 2개, 차트 2라인, 표 4열 확인
4. 탭 전환(누적↔평가금) 정상 동작 확인

- [ ] **Step 3: 브라우저 E2E 검증 — 3종목**

1. "+ 종목 C 추가하기" 클릭 → NVDA 입력
2. "비교 시작" 클릭
3. 카드 3개 (파/주황/초록), 🏆 최고 수익률 카드에 배지
4. 차트 3라인 (파/주황/초록)
5. 표 5열 (A·B·C·차이A-B), 투자기간 colspan=4
6. ✕ 클릭 → C 블록 사라짐 → 다시 비교 → 2종목만 표시

- [ ] **Step 4: 모바일 검증**

DevTools에서 너비 375px 설정:
1. 입력 칸 A·B·C 1열 수직 스택 확인
2. 요약 카드 1열 스택 확인
3. 비교 표 가로 스크롤 확인

- [ ] **Step 5: 최종 커밋**

```bash
git add backtest.html
git commit -m "feat: 백테스트 3종목 비교 완성 (C 동적 추가, 차트·카드·표 3종목 지원)"
```
