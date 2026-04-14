# Calculators Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `compound.html` (복리 계산기) and `goal.html` (목표 자산 계산기) and update the hub `index.html` to promote both cards to Live.

**Architecture:** Two standalone HTML pages — no build step, no modules, no server calls. All calculation runs in-browser on slider `input` events. Chart.js loaded from CDN. Hub `index.html` receives targeted find/replace edits to reorder cards and update nav.

**Tech Stack:** Vanilla HTML/CSS/JS, Chart.js CDN (`https://cdn.jsdelivr.net/npm/chart.js`), Inter font (Google Fonts CDN).

---

## File Map

| File | Action |
|---|---|
| `compound.html` | Create — 복리 계산기 |
| `goal.html` | Create — 목표 자산 계산기 |
| `index.html` | Modify — reorder cards, promote 2 to Live, update nav |

---

## Task 1: Create compound.html

**Files:**
- Create: `compound.html`

- [ ] **Step 1: Create the file**

Create `compound.html` with the following complete content:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>복리 계산기 | 임광호 포트폴리오</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💰</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #f8f7f4;
            color: #1a1a1a;
            min-height: 100vh;
        }

        a.back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.78rem;
            font-weight: 600;
            color: #888;
            text-decoration: none;
            padding: 1.25rem 1.5rem 0;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        a.back-link:hover { color: #1a1a1a; }

        .page-header {
            max-width: 760px;
            margin: 0 auto;
            padding: 1.25rem 1.5rem 0;
        }
        .page-header h1 {
            font-size: clamp(1.5rem, 4vw, 1.875rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.3rem;
        }
        .page-header p { color: #777; font-size: 0.875rem; }

        .container {
            max-width: 760px;
            margin: 0 auto;
            padding: 1.25rem 1.5rem 4rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .card {
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 14px;
            padding: 1.5rem;
        }

        .card-title {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #aaa;
            margin-bottom: 1.25rem;
        }

        /* Sliders */
        .slider-row {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            margin-bottom: 1.1rem;
        }
        .slider-row:last-of-type { margin-bottom: 0; }
        .slider-label {
            font-size: 0.82rem;
            color: #555;
            width: 110px;
            flex-shrink: 0;
        }
        .slider-row input[type=range] {
            flex: 1;
            accent-color: #3b82f6;
            cursor: pointer;
        }
        .slider-value {
            font-size: 0.85rem;
            font-weight: 700;
            color: #1a1a1a;
            min-width: 76px;
            text-align: right;
        }

        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            margin-top: 1.25rem;
        }
        .stat-box {
            background: #f8f7f4;
            border-radius: 10px;
            padding: 0.875rem 1rem;
        }
        .stat-label {
            font-size: 0.7rem;
            color: #999;
            margin-bottom: 0.35rem;
            white-space: nowrap;
        }
        .stat-value {
            font-size: 1.1rem;
            font-weight: 800;
            color: #1a1a1a;
        }
        .stat-value.blue { color: #2563eb; }

        /* Progress bar */
        .progress-wrap {
            display: flex;
            border-radius: 8px;
            overflow: hidden;
            height: 34px;
            margin-top: 1.25rem;
            font-size: 0.78rem;
            font-weight: 700;
        }
        .progress-profit {
            background: #3b82f6;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: width 0.25s;
            min-width: 60px;
        }
        .progress-principal {
            background: #a7f3d0;
            color: #065f46;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
        }

        /* Chart */
        .chart-legend {
            display: flex;
            gap: 1.25rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.76rem;
            color: #555;
        }
        .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }
        .chart-wrap { position: relative; height: 280px; }

        @media (max-width: 560px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .slider-label { width: 80px; font-size: 0.76rem; }
            .slider-value { min-width: 64px; font-size: 0.78rem; }
        }
    </style>
</head>
<body>

<a href="/" class="back-link">← Portfolio</a>

<div class="page-header">
    <h1>복리 계산기</h1>
    <p>초기 투자금과 연간 투자금으로 복리 성장을 시뮬레이션합니다</p>
</div>

<div class="container">

    <!-- 투자 조건 -->
    <div class="card">
        <div class="card-title">투자 조건</div>

        <div class="slider-row">
            <span class="slider-label">초기 투자금</span>
            <input type="range" id="s-principal" min="0" max="100000000" step="1000000" value="10000000">
            <span class="slider-value" id="v-principal">₩1,000만</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">연간 투자금</span>
            <input type="range" id="s-annual" min="0" max="50000000" step="500000" value="3000000">
            <span class="slider-value" id="v-annual">₩300만</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">연 수익률</span>
            <input type="range" id="s-rate" min="1" max="30" step="0.5" value="7">
            <span class="slider-value" id="v-rate">7.0%</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">투자 기간</span>
            <input type="range" id="s-years" min="1" max="40" step="1" value="20">
            <span class="slider-value" id="v-years">20년</span>
        </div>

        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-label">최종 금액</div>
                <div class="stat-value blue" id="r-final">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">총 투자 원금</div>
                <div class="stat-value" id="r-principal">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">순수 이자 수익</div>
                <div class="stat-value" id="r-interest">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">원금 대비 수익</div>
                <div class="stat-value" id="r-multi">-</div>
            </div>
        </div>
    </div>

    <!-- 그래프 -->
    <div class="card">
        <div class="card-title">자산 성장 그래프</div>
        <div class="progress-wrap">
            <div class="progress-profit" id="progress-profit">-</div>
            <div class="progress-principal" id="progress-principal">-</div>
        </div>
        <div class="chart-legend" style="margin-top:1rem;">
            <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>복리 성장</div>
            <div class="legend-item"><span class="legend-dot" style="background:#6ee7b7"></span>단리 성장</div>
            <div class="legend-item"><span class="legend-dot" style="background:#d1d5db"></span>원금</div>
        </div>
        <div class="chart-wrap">
            <canvas id="chart"></canvas>
        </div>
    </div>

</div>

<script>
    function fmtKRW(v) {
        v = Math.round(v);
        if (v >= 100000000) return '₩' + (v / 100000000).toFixed(2) + '억';
        if (v >= 10000)     return '₩' + Math.round(v / 10000).toLocaleString('ko-KR') + '만';
        return '₩' + v.toLocaleString('ko-KR');
    }

    function calculate() {
        const principal = Number(document.getElementById('s-principal').value);
        const annual    = Number(document.getElementById('s-annual').value);
        const rate      = Number(document.getElementById('s-rate').value) / 100;
        const years     = Number(document.getElementById('s-years').value);

        const compound = [principal];
        const simple   = [principal];
        const straight = [principal];

        for (let y = 1; y <= years; y++) {
            compound.push(compound[y - 1] * (1 + rate) + annual);
            simple.push(principal * (1 + rate * y) + annual * y);
            straight.push(principal + annual * y);
        }

        const final        = compound[years];
        const totalPrinc   = principal + annual * years;
        const interest     = final - totalPrinc;
        const multiplier   = totalPrinc > 0 ? final / totalPrinc : 1;
        const profitPct    = final > 0 ? (interest / final) * 100 : 0;

        return { compound, simple, straight, final, totalPrinc, interest, multiplier, profitPct, years };
    }

    // Chart setup
    const ctx = document.getElementById('chart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '복리 성장',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.06)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2.5,
                },
                {
                    label: '단리 성장',
                    data: [],
                    borderColor: '#6ee7b7',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: '원금',
                    data: [],
                    borderColor: '#d1d5db',
                    backgroundColor: 'transparent',
                    fill: false,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    borderWidth: 1.5,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + ctx.dataset.label + ': ' + fmtKRW(ctx.parsed.y),
                    },
                },
            },
            scales: {
                x: {
                    ticks: { font: { size: 11 }, color: '#999' },
                    grid:  { color: '#f0f0f0' },
                },
                y: {
                    ticks: {
                        font: { size: 11 },
                        color: '#999',
                        callback: v => fmtKRW(v),
                    },
                    grid: { color: '#f0f0f0' },
                },
            },
        },
    });

    function update() {
        // Update slider display values
        const principal = Number(document.getElementById('s-principal').value);
        const annual    = Number(document.getElementById('s-annual').value);
        const rate      = Number(document.getElementById('s-rate').value);
        const years     = Number(document.getElementById('s-years').value);

        document.getElementById('v-principal').textContent = fmtKRW(principal);
        document.getElementById('v-annual').textContent    = fmtKRW(annual);
        document.getElementById('v-rate').textContent      = rate.toFixed(1) + '%';
        document.getElementById('v-years').textContent     = years + '년';

        const r = calculate();

        // Stats
        document.getElementById('r-final').textContent     = fmtKRW(r.final);
        document.getElementById('r-principal').textContent  = fmtKRW(r.totalPrinc);
        document.getElementById('r-interest').textContent   = fmtKRW(r.interest);
        document.getElementById('r-multi').textContent      = r.multiplier.toFixed(2) + '배';

        // Progress bar
        const pPct = Math.max(0, Math.min(99, r.profitPct));
        document.getElementById('progress-profit').style.width    = pPct + '%';
        document.getElementById('progress-profit').textContent     = pPct.toFixed(1) + '% 수익';
        document.getElementById('progress-principal').textContent  = (100 - pPct).toFixed(1) + '% 원금';

        // Chart
        const labels = Array.from({ length: r.years + 1 }, (_, i) => i + '년');
        chart.data.labels            = labels;
        chart.data.datasets[0].data  = r.compound;
        chart.data.datasets[1].data  = r.simple;
        chart.data.datasets[2].data  = r.straight;
        chart.update('none');
    }

    ['s-principal', 's-annual', 's-rate', 's-years'].forEach(id => {
        document.getElementById(id).addEventListener('input', update);
    });

    update();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Serve with `npx serve .` or `python -m http.server 8080`, open `http://localhost:8080/compound.html`. Check:
1. 4 sliders render and are draggable
2. Slider values update as labels (₩1,000만 / ₩300만 / 7.0% / 20년)
3. 4 stat boxes show calculated values (최종 금액 / 총 투자 원금 / 순수 이자 수익 / 원금 대비 수익)
4. Progress bar shows profit % (blue) vs principal % (green)
5. Line chart shows 3 lines: 복리(blue), 단리(light green), 원금(grey dashed)
6. Moving any slider updates all values and chart instantly
7. Back link `← Portfolio` navigates to `/`
8. No console errors

- [ ] **Step 3: Commit**

```bash
git add compound.html
git commit -m "feat: add compound interest calculator"
```

---

## Task 2: Create goal.html

**Files:**
- Create: `goal.html`

- [ ] **Step 1: Create the file**

Create `goal.html` with the following complete content:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>목표 자산 계산기 | 임광호 포트폴리오</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #f8f7f4;
            color: #1a1a1a;
            min-height: 100vh;
        }

        a.back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.78rem;
            font-weight: 600;
            color: #888;
            text-decoration: none;
            padding: 1.25rem 1.5rem 0;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        a.back-link:hover { color: #1a1a1a; }

        .page-header {
            max-width: 760px;
            margin: 0 auto;
            padding: 1.25rem 1.5rem 0;
        }
        .page-header h1 {
            font-size: clamp(1.5rem, 4vw, 1.875rem);
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 0.3rem;
        }
        .page-header p { color: #777; font-size: 0.875rem; }

        .container {
            max-width: 760px;
            margin: 0 auto;
            padding: 1.25rem 1.5rem 4rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        .card {
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 14px;
            padding: 1.5rem;
        }

        .card-title {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: #aaa;
            margin-bottom: 1.25rem;
        }

        /* Sliders */
        .slider-row {
            display: flex;
            align-items: center;
            gap: 0.875rem;
            margin-bottom: 1.1rem;
        }
        .slider-row:last-of-type { margin-bottom: 0; }
        .slider-label {
            font-size: 0.82rem;
            color: #555;
            width: 110px;
            flex-shrink: 0;
        }
        .slider-row input[type=range] {
            flex: 1;
            accent-color: #3b82f6;
            cursor: pointer;
        }
        .slider-value {
            font-size: 0.85rem;
            font-weight: 700;
            color: #1a1a1a;
            min-width: 76px;
            text-align: right;
        }

        /* Big result display */
        .big-result {
            text-align: center;
            padding: 1.75rem 1rem 1.25rem;
        }
        .big-time {
            font-size: clamp(2.25rem, 8vw, 3.25rem);
            font-weight: 800;
            color: #1a1a1a;
            letter-spacing: -0.03em;
            line-height: 1.1;
        }
        .big-time.impossible { font-size: 1.5rem; color: #ef4444; }
        .big-subtitle {
            font-size: 0.85rem;
            color: #888;
            margin-top: 0.4rem;
        }
        .badge {
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            margin-top: 0.75rem;
        }
        .badge-fast { background: #dcfce7; color: #16a34a; }
        .badge-normal { background: #fef9c3; color: #854d0e; }
        .badge-slow { background: #fee2e2; color: #b91c1c; }

        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin-top: 1rem;
        }
        .stat-box {
            background: #f8f7f4;
            border-radius: 10px;
            padding: 0.875rem 1rem;
        }
        .stat-label {
            font-size: 0.7rem;
            color: #999;
            margin-bottom: 0.35rem;
            white-space: nowrap;
        }
        .stat-value {
            font-size: 1rem;
            font-weight: 800;
            color: #1a1a1a;
        }

        /* Chart */
        .chart-legend {
            display: flex;
            gap: 1.25rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.76rem;
            color: #555;
        }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .chart-wrap { position: relative; height: 280px; }

        /* Table */
        .year-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.82rem;
        }
        .year-table th {
            text-align: left;
            padding: 0.5rem 0.75rem;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #aaa;
            border-bottom: 1px solid #e8e8e8;
        }
        .year-table td {
            padding: 0.6rem 0.75rem;
            border-bottom: 1px solid #f5f5f5;
            color: #333;
            vertical-align: middle;
        }
        .year-table tr.achieved-row td {
            background: #eff6ff;
            font-weight: 600;
            color: #1d4ed8;
        }
        .year-table tr:last-child td { border-bottom: none; }
        .pbar-bg {
            background: #f0f0f0;
            border-radius: 4px;
            height: 7px;
            min-width: 80px;
        }
        .pbar-fill {
            background: #3b82f6;
            border-radius: 4px;
            height: 7px;
            transition: width 0.2s;
        }
        .pbar-fill.done { background: #22c55e; }

        .table-note {
            font-size: 0.72rem;
            color: #bbb;
            margin-top: 0.75rem;
            line-height: 1.5;
        }

        @media (max-width: 560px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .slider-label { width: 80px; font-size: 0.76rem; }
            .slider-value { min-width: 64px; font-size: 0.78rem; }
            .year-table th:nth-child(4),
            .year-table td:nth-child(4) { display: none; }
        }
    </style>
</head>
<body>

<a href="/" class="back-link">← Portfolio</a>

<div class="page-header">
    <h1>목표 자산 계산기</h1>
    <p>꾸준한 저축과 투자로 목표금액까지 걸리는 시간을 계산합니다</p>
</div>

<div class="container">

    <!-- 입력 조건 -->
    <div class="card">
        <div class="card-title">입력 조건</div>

        <div class="slider-row">
            <span class="slider-label">원금 (사전)</span>
            <input type="range" id="s-principal" min="0" max="500000000" step="1000000" value="60000000">
            <span class="slider-value" id="v-principal">₩6,000만</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">연간 저축</span>
            <input type="range" id="s-saving" min="0" max="50000000" step="500000" value="10000000">
            <span class="slider-value" id="v-saving">₩1,000만</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">투자 수익률</span>
            <input type="range" id="s-rate" min="0" max="30" step="0.5" value="5">
            <span class="slider-value" id="v-rate">5.0%</span>
        </div>
        <div class="slider-row">
            <span class="slider-label">목표 금액</span>
            <input type="range" id="s-target" min="10000000" max="1000000000" step="5000000" value="100000000">
            <span class="slider-value" id="v-target">₩1억</span>
        </div>

        <!-- Big display -->
        <div class="big-result">
            <div class="big-time" id="r-time">-</div>
            <div class="big-subtitle" id="r-subtitle">-</div>
            <div id="r-badge"></div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-label">현재 자산</div>
                <div class="stat-value" id="r-asset">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">월 저축액</div>
                <div class="stat-value" id="r-monthly">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">자본률</div>
                <div class="stat-value" id="r-capital-rate">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">총 납입 금액</div>
                <div class="stat-value" id="r-deposit">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">투자 수익</div>
                <div class="stat-value" id="r-return">-</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">수익 기여율</div>
                <div class="stat-value" id="r-return-rate">-</div>
            </div>
        </div>
    </div>

    <!-- 그래프 -->
    <div class="card">
        <div class="card-title">자산 성장 그래프</div>
        <div class="chart-legend">
            <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>복리 자산</div>
            <div class="legend-item"><span class="legend-dot" style="background:#6ee7b7"></span>납입 원금</div>
            <div class="legend-item"><span class="legend-dot" style="background:#ef4444;border-radius:0;height:2px;width:16px;"></span>목표금액</div>
        </div>
        <div class="chart-wrap">
            <canvas id="chart"></canvas>
        </div>
    </div>

    <!-- 연별 테이블 -->
    <div class="card">
        <div class="card-title">연별 자산 현황</div>
        <div style="overflow-x:auto;">
            <table class="year-table">
                <thead>
                    <tr>
                        <th>연차</th>
                        <th>진행률</th>
                        <th>잔액</th>
                        <th>수익</th>
                    </tr>
                </thead>
                <tbody id="table-body"></tbody>
            </table>
        </div>
        <p class="table-note">※ 투자 수익률은 세금 및 수수료를 고려하지 않은 단순 시뮬레이션입니다.</p>
    </div>

</div>

<script>
    function fmtKRW(v) {
        v = Math.round(v);
        if (v >= 100000000) return '₩' + (v / 100000000).toFixed(2) + '억';
        if (v >= 10000)     return '₩' + Math.round(v / 10000).toLocaleString('ko-KR') + '만';
        return '₩' + v.toLocaleString('ko-KR');
    }

    function calculate() {
        const principal   = Number(document.getElementById('s-principal').value);
        const annualSave  = Number(document.getElementById('s-saving').value);
        const rate        = Number(document.getElementById('s-rate').value) / 100;
        const target      = Number(document.getElementById('s-target').value);

        // Already at or above goal
        if (principal >= target) {
            return { achieved: true, years: 0, months: 0, principal, annualSave, rate, target, yearlyAsset: [principal], yearlyPrinc: [principal] };
        }

        // Month-level simulation (accurate to within 1 month)
        const monthlyRate = rate / 12;
        const monthlySave = annualSave / 12;
        let asset = principal;
        let m = 0;
        const MAX_M = 50 * 12;
        while (asset < target && m < MAX_M) {
            asset = asset * (1 + monthlyRate) + monthlySave;
            m++;
        }

        const achieved = m < MAX_M;
        const years    = Math.floor(m / 12);
        const months   = m % 12;

        // Build yearly arrays for chart & table (up to achieved year + 3, max 50)
        const chartYears = Math.min(achieved ? years + 3 : 50, 50);
        const yearlyAsset = [principal];
        const yearlyPrinc = [principal];
        let ya = principal;
        for (let y = 1; y <= chartYears; y++) {
            ya = ya * (1 + rate) + annualSave;
            yearlyAsset.push(ya);
            yearlyPrinc.push(principal + annualSave * y);
        }

        return { achieved, years, months, principal, annualSave, rate, target, yearlyAsset, yearlyPrinc, chartYears };
    }

    // Chart setup
    const ctx = document.getElementById('chart').getContext('2d');
    const goalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '복리 자산',
                    data: [],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.06)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2.5,
                },
                {
                    label: '납입 원금',
                    data: [],
                    borderColor: '#6ee7b7',
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    borderWidth: 2,
                },
                {
                    label: '목표금액',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    fill: false,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ' ' + ctx.dataset.label + ': ' + fmtKRW(ctx.parsed.y),
                    },
                },
            },
            scales: {
                x: {
                    ticks: { font: { size: 11 }, color: '#999' },
                    grid:  { color: '#f0f0f0' },
                },
                y: {
                    ticks: {
                        font: { size: 11 },
                        color: '#999',
                        callback: v => fmtKRW(v),
                    },
                    grid: { color: '#f0f0f0' },
                },
            },
        },
    });

    function update() {
        const principal  = Number(document.getElementById('s-principal').value);
        const annualSave = Number(document.getElementById('s-saving').value);
        const rate       = Number(document.getElementById('s-rate').value);
        const target     = Number(document.getElementById('s-target').value);

        document.getElementById('v-principal').textContent = fmtKRW(principal);
        document.getElementById('v-saving').textContent    = fmtKRW(annualSave);
        document.getElementById('v-rate').textContent      = rate.toFixed(1) + '%';
        document.getElementById('v-target').textContent    = fmtKRW(target);

        const r = calculate();

        // Big time display
        const timeEl    = document.getElementById('r-time');
        const subEl     = document.getElementById('r-subtitle');
        const badgeEl   = document.getElementById('r-badge');

        if (r.years === 0 && r.months === 0) {
            timeEl.className = 'big-time';
            timeEl.textContent = '이미 달성!';
            subEl.textContent  = '현재 자산이 목표를 초과합니다';
            badgeEl.innerHTML  = '<span class="badge badge-fast">달성 완료</span>';
        } else if (!r.achieved) {
            timeEl.className   = 'big-time impossible';
            timeEl.textContent = '50년 이상';
            subEl.textContent  = '저축액 또는 수익률을 높여보세요';
            badgeEl.innerHTML  = '<span class="badge badge-slow">장기 목표</span>';
        } else {
            const parts = [];
            if (r.years > 0)  parts.push(r.years + '년');
            if (r.months > 0) parts.push(r.months + '개월');
            timeEl.className   = 'big-time';
            timeEl.textContent = parts.join(' ');
            subEl.textContent  = '목표 ' + fmtKRW(target) + ' 달성까지';
            if (r.years <= 5)       badgeEl.innerHTML = '<span class="badge badge-fast">빠른 달성 가능</span>';
            else if (r.years <= 15) badgeEl.innerHTML = '<span class="badge badge-normal">달성 가능</span>';
            else                    badgeEl.innerHTML = '<span class="badge badge-slow">장기 목표</span>';
        }

        // Stats
        const totalDeposit = principal + annualSave * (r.years || 0);
        const finalAsset   = r.yearlyAsset[r.years] || principal;
        const investReturn = Math.max(0, finalAsset - totalDeposit);
        const returnRate   = finalAsset > 0 ? investReturn / finalAsset * 100 : 0;

        document.getElementById('r-asset').textContent        = fmtKRW(principal);
        document.getElementById('r-monthly').textContent      = fmtKRW(annualSave / 12);
        document.getElementById('r-capital-rate').textContent = (principal / target * 100).toFixed(1) + '%';
        document.getElementById('r-deposit').textContent      = fmtKRW(totalDeposit);
        document.getElementById('r-return').textContent       = fmtKRW(investReturn);
        document.getElementById('r-return-rate').textContent  = returnRate.toFixed(1) + '%';

        // Chart
        const chartYears = r.chartYears || 0;
        const labels = Array.from({ length: chartYears + 1 }, (_, i) => i + '년');
        goalChart.data.labels           = labels;
        goalChart.data.datasets[0].data = r.yearlyAsset;
        goalChart.data.datasets[1].data = r.yearlyPrinc;
        goalChart.data.datasets[2].data = Array(chartYears + 1).fill(target);
        goalChart.update('none');

        // Table
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';
        const tableMax = Math.min(chartYears, 50);
        for (let y = 1; y <= tableMax; y++) {
            const asset   = r.yearlyAsset[y] || 0;
            const princ   = r.yearlyPrinc[y] || 0;
            const ret     = Math.max(0, asset - princ);
            const pct     = Math.min(100, asset / target * 100);
            const isGoal  = r.achieved && y === r.years;
            const isDone  = asset >= target;
            const tr = document.createElement('tr');
            if (isGoal) tr.className = 'achieved-row';
            tr.innerHTML = `
                <td>${y}년${isGoal ? ' 🎯' : ''}</td>
                <td>
                    <div class="pbar-bg">
                        <div class="pbar-fill${isDone ? ' done' : ''}" style="width:${pct.toFixed(1)}%"></div>
                    </div>
                    <span style="font-size:0.72rem;color:#999;margin-top:2px;display:block">${pct.toFixed(0)}%</span>
                </td>
                <td>${fmtKRW(asset)}</td>
                <td>${fmtKRW(ret)}</td>
            `;
            tbody.appendChild(tr);
        }
    }

    ['s-principal', 's-saving', 's-rate', 's-target'].forEach(id => {
        document.getElementById(id).addEventListener('input', update);
    });

    update();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `http://localhost:8080/goal.html`. Check:
1. 4 sliders render and are draggable
2. Big time display shows "X년 Y개월" (e.g. "6년 3개월") with correct subtitle and badge
3. 원금 >= 목표금액이면 "이미 달성!" 표시
4. 6 stat boxes all show calculated values
5. Line chart shows 3 lines: 복리(blue), 납입 원금(light green), 목표금액(red dashed horizontal)
6. 연별 테이블 shows rows up to achieved year; reached row highlighted in blue and marked 🎯
7. Moving any slider updates all values instantly
8. Back link navigates to `/`
9. No console errors

- [ ] **Step 3: Commit**

```bash
git add goal.html
git commit -m "feat: add goal asset calculator"
```

---

## Task 3: Update index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update top nav — add two calculator links**

Find:
```html
        <a href="/fear-greed.html" class="topnav-link">공포탐욕지수</a>
    </nav>
```

Replace with:
```html
        <a href="/fear-greed.html" class="topnav-link">공포탐욕지수</a>
        <a href="/compound.html" class="topnav-link">복리 계산기</a>
        <a href="/goal.html" class="topnav-link">목표 자산</a>
    </nav>
```

- [ ] **Step 2: Replace entire card grid with updated order**

Find:
```html
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
```

Replace with:
```html
    <div class="grid">

        <a href="/fear-greed.html" class="card card-live">
            <div class="card-icon">📊</div>
            <div class="card-title">공포탐욕지수</div>
            <div class="card-desc">CNN Fear &amp; Greed Index 실시간 추적, 히스토리 캘린더, 종목 수익률 계산기</div>
            <span class="card-tag tag-live">Live</span>
        </a>

        <a href="/compound.html" class="card card-live">
            <div class="card-icon">💰</div>
            <div class="card-title">복리 계산기</div>
            <div class="card-desc">초기 투자금과 연간 투자금으로 복리·단리 성장을 시각화하고 비교</div>
            <span class="card-tag tag-live">Live</span>
        </a>

        <a href="/goal.html" class="card card-live">
            <div class="card-icon">🎯</div>
            <div class="card-title">목표 자산 계산기</div>
            <div class="card-desc">꾸준한 저축과 투자로 목표금액까지 걸리는 시간을 계산</div>
            <span class="card-tag tag-live">Live</span>
        </a>

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

    </div>
```

- [ ] **Step 3: Verify**

Open `http://localhost:8080/`. Check:
1. Nav shows: 홈 | 공포탐욕지수 | 복리 계산기 | 목표 자산
2. Card 1: 공포탐욕지수 — green border, Live badge, links to `/fear-greed.html`
3. Card 2: 복리 계산기 — green border, Live badge, links to `/compound.html`
4. Card 3: 목표 자산 계산기 — green border, Live badge, links to `/goal.html`
5. Cards 4–6: 절세/대출이자/환율 — Coming Soon, non-clickable
6. Hover on Live cards shows lift effect

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: promote compound and goal calculators to Live in hub"
```

---

## Post-Implementation Checklist

- [ ] `compound.html` loads, sliders work, chart shows 3 lines, stat boxes update
- [ ] `goal.html` loads, sliders work, big time display correct, table rows render, chart shows goal line
- [ ] Hub shows 3 Live cards in order: 공포탐욕지수 → 복리 계산기 → 목표 자산 계산기
- [ ] Hub nav has 4 links: 홈 | 공포탐욕지수 | 복리 계산기 | 목표 자산
- [ ] Back links on both calculators navigate to `/`
- [ ] 원금 >= 목표 in goal.html → "이미 달성!" displays
- [ ] 50년 초과 시 "50년 이상" displays
- [ ] Mobile responsive (2-col at ≤560px)
- [ ] No console errors on any page
