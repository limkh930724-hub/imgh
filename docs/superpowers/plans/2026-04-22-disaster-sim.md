# 재난 대응 시뮬레이션 UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `disaster.html` 단일 파일로 재난 관제센터 스타일 시뮬레이션 UI를 구현한다 — Leaflet 풀스크린 지도, 재난유형별 위험지역 Polygon, 대피소 마커, 점수 기반 추천 TOP3 우측 슬라이드 패널.

**Architecture:** 단일 정적 HTML 파일. `<head>`(CDN + 인라인 CSS) → `<body>`(마크업) → `<script>`(데이터 + 로직) 구조. 백엔드/DB 없음. 모든 데이터는 JS 상수로 하드코딩.

**Tech Stack:** Vanilla HTML/CSS, Leaflet.js 1.9 (CDN), JavaScript ES6+, OpenStreetMap 타일

> **TDD 참고:** 이 프로젝트는 테스트 러너가 없는 정적 HTML이다. 각 태스크의 "검증" 단계는 `npx serve .` 로 서버 실행 후 브라우저에서 직접 확인하는 방식으로 대체한다.

---

## File Map

| 파일 | 작업 |
|---|---|
| `disaster.html` | 신규 생성 — 전체 앱 (CSS + HTML + JS 인라인) |
| `index.html` | 수정 — 카드 1개 + 상단 nav 링크 1개 추가 |

---

### Task 1: HTML 뼈대 + CSS 전체

**Files:**
- Create: `disaster.html`

- [ ] **Step 1: `disaster.html` 파일 생성 — head + CSS + body 마크업**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>재난 대응 시뮬레이터</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚨</text></svg>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg:         #0a0f1e;
            --surface:    #0d1b2a;
            --surface-2:  #112240;
            --border:     #1e3a5f;
            --accent:     #ef4444;
            --accent-2:   #f97316;
            --text:       #e2e8f0;
            --text-2:     #94a3b8;
            --shelter:    #22d3ee;
            --recommend:  #a855f7;
            --risk-3:     #ef4444;
            --risk-2:     #f97316;
            --risk-1:     #eab308;
        }

        html, body { height: 100%; overflow: hidden; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); }

        /* ── 헤더 ── */
        .header {
            position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
            height: 56px; padding: 0 1.5rem;
            display: flex; align-items: center; gap: 1rem;
            background: rgba(13,27,42,0.92);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border);
        }
        .header-logo {
            display: flex; align-items: center; gap: 0.5rem;
            font-size: 0.9rem; font-weight: 800; letter-spacing: -0.02em;
            color: var(--text); text-decoration: none; margin-right: auto;
        }
        .header-logo span { color: var(--accent); }
        .header-back {
            font-size: 0.75rem; color: var(--text-2); text-decoration: none;
            padding: 0.3rem 0.7rem; border: 1px solid var(--border); border-radius: 6px;
            transition: color 0.15s, border-color 0.15s;
        }
        .header-back:hover { color: var(--text); border-color: var(--text-2); }
        .disaster-tabs { display: flex; gap: 0.4rem; }
        .disaster-tab {
            padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.78rem; font-weight: 600;
            border: 1px solid var(--border); background: transparent; color: var(--text-2);
            cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .disaster-tab:hover { color: var(--text); border-color: var(--text-2); }
        .disaster-tab.active { color: #fff; border-color: transparent; }

        /* ── 지도 ── */
        #map {
            position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
            z-index: 1;
        }
        /* Leaflet 타일을 어둡게 */
        .leaflet-tile { filter: brightness(0.45) saturate(0.6) hue-rotate(200deg); }

        /* ── 플로팅 컨트롤 ── */
        .float-ctrl {
            position: fixed; bottom: 80px; left: 1.5rem; z-index: 500;
            background: rgba(13,27,42,0.95);
            border: 1px solid var(--border); border-radius: 12px;
            padding: 1rem 1.2rem; width: 220px;
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .float-ctrl-title {
            font-size: 0.7rem; font-weight: 700; color: var(--text-2);
            text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;
        }
        .location-status {
            font-size: 0.78rem; color: var(--text-2); margin-bottom: 0.75rem;
            min-height: 1.2em;
        }
        .location-status.set { color: var(--shelter); }
        .ctrl-btn-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
        .ctrl-btn {
            flex: 1; padding: 0.45rem 0; border-radius: 8px; font-size: 0.74rem; font-weight: 600;
            border: 1px solid var(--border); background: var(--surface-2); color: var(--text);
            cursor: pointer; transition: background 0.15s;
        }
        .ctrl-btn:hover { background: #1a3050; }
        .run-btn {
            width: 100%; padding: 0.6rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700;
            border: none; background: var(--accent); color: #fff;
            cursor: pointer; transition: background 0.15s, opacity 0.15s;
        }
        .run-btn:hover { background: #dc2626; }
        .run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── 우측 슬라이드 패널 ── */
        .result-panel {
            position: fixed; top: 56px; right: 0; bottom: 0; z-index: 600;
            width: 340px; background: rgba(10,15,30,0.97);
            border-left: 1px solid var(--border);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex; flex-direction: column;
            overflow: hidden;
        }
        .result-panel.open { transform: translateX(0); }
        .panel-header {
            padding: 1rem 1.2rem 0.75rem;
            border-bottom: 1px solid var(--border);
            display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;
        }
        .panel-title { font-size: 0.88rem; font-weight: 700; flex: 1; }
        .panel-sub { font-size: 0.72rem; color: var(--text-2); }
        .panel-close {
            width: 28px; height: 28px; border-radius: 6px;
            border: 1px solid var(--border); background: transparent;
            color: var(--text-2); cursor: pointer; font-size: 0.9rem;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s;
        }
        .panel-close:hover { background: var(--surface-2); color: var(--text); }
        .panel-body { overflow-y: auto; padding: 0.75rem; flex: 1; }

        /* ── 추천 카드 ── */
        .rec-card {
            background: var(--surface-2); border: 1px solid var(--border);
            border-radius: 10px; padding: 0.9rem 1rem; margin-bottom: 0.65rem;
            cursor: pointer; transition: border-color 0.15s, background 0.15s;
        }
        .rec-card:hover { border-color: var(--recommend); background: #1a1240; }
        .rec-card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.6rem; }
        .rec-rank {
            width: 22px; height: 22px; border-radius: 50%; font-size: 0.7rem; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            background: var(--recommend); color: #fff; flex-shrink: 0;
        }
        .rec-name { font-size: 0.84rem; font-weight: 700; flex: 1; }
        .rec-score { font-size: 0.8rem; font-weight: 800; color: var(--recommend); }
        .score-rows { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.55rem; }
        .score-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; }
        .score-label { width: 36px; color: var(--text-2); flex-shrink: 0; }
        .score-bar-bg {
            flex: 1; height: 5px; background: var(--border); border-radius: 3px; overflow: hidden;
        }
        .score-bar-fill { height: 100%; border-radius: 3px; background: var(--recommend); }
        .score-val { width: 54px; text-align: right; color: var(--text-2); flex-shrink: 0; }
        .rec-reason {
            font-size: 0.7rem; color: var(--text-2); margin-bottom: 0.55rem;
            line-height: 1.5;
        }
        .rec-goto {
            width: 100%; padding: 0.38rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600;
            border: 1px solid var(--border); background: transparent; color: var(--text-2);
            cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .rec-goto:hover { background: var(--surface); color: var(--text); }

        /* ── 범례 ── */
        .legend {
            position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
            z-index: 500;
            display: flex; align-items: center; gap: 1rem;
            background: rgba(13,27,42,0.9); border: 1px solid var(--border);
            border-radius: 20px; padding: 0.45rem 1.2rem;
            font-size: 0.7rem; color: var(--text-2);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .legend-item { display: flex; align-items: center; gap: 0.35rem; }
        .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }

        /* ── Leaflet 커스텀 마커 ── */
        .shelter-icon {
            width: 28px; height: 28px; border-radius: 50%;
            background: var(--shelter); border: 2px solid rgba(255,255,255,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; box-shadow: 0 0 8px rgba(34,211,238,0.5);
        }
        .recommend-icon {
            width: 32px; height: 32px; border-radius: 50%;
            background: var(--recommend); border: 2px solid rgba(255,255,255,0.4);
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 800; color: #fff;
            box-shadow: 0 0 12px rgba(168,85,247,0.7);
        }
        .user-icon {
            width: 16px; height: 16px; border-radius: 50%;
            background: #60a5fa; border: 3px solid #fff;
            box-shadow: 0 0 0 4px rgba(96,165,250,0.3);
        }
    </style>
</head>
<body>

    <!-- 헤더 -->
    <header class="header">
        <a href="/" class="header-back">← 포트폴리오</a>
        <div class="header-logo">🚨 <span>재난</span>대응 시뮬레이터</div>
        <div class="disaster-tabs" id="disasterTabs"></div>
    </header>

    <!-- Leaflet 지도 -->
    <div id="map"></div>

    <!-- 플로팅 컨트롤 -->
    <div class="float-ctrl">
        <div class="float-ctrl-title">📍 내 위치 설정</div>
        <div class="location-status" id="locationStatus">지도를 클릭하거나 GPS를 사용하세요</div>
        <div class="ctrl-btn-row">
            <button class="ctrl-btn" id="gpsBtn">📡 GPS</button>
            <button class="ctrl-btn" id="clearLocBtn">✕ 초기화</button>
        </div>
        <button class="run-btn" id="runBtn" disabled>▶ 시뮬레이션 실행</button>
    </div>

    <!-- 우측 결과 패널 -->
    <div class="result-panel" id="resultPanel">
        <div class="panel-header">
            <div>
                <div class="panel-title">시뮬레이션 결과</div>
                <div class="panel-sub" id="panelSub"></div>
            </div>
            <button class="panel-close" id="panelClose">✕</button>
        </div>
        <div class="panel-body" id="panelBody"></div>
    </div>

    <!-- 범례 -->
    <div class="legend">
        <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div>위험</div>
        <div class="legend-item"><div class="legend-dot" style="background:#f97316"></div>경계</div>
        <div class="legend-item"><div class="legend-dot" style="background:#eab308"></div>주의</div>
        <div class="legend-item"><div class="legend-dot" style="background:#22d3ee; border-radius:50%"></div>대피소</div>
        <div class="legend-item"><div class="legend-dot" style="background:#a855f7; border-radius:50%"></div>추천 TOP3</div>
    </div>

    <script>
    // ── 데이터는 Task 2에서 추가 ──
    // ── 로직은 Task 3~10에서 추가 ──
    </script>
</body>
</html>
```

- [ ] **Step 2: 브라우저에서 레이아웃 확인**

```bash
npx serve .
```

`http://localhost:3000/disaster.html` 열기.
확인: 짙은 네이비 배경, 상단 헤더 표시, 플로팅 컨트롤 박스 좌하단 표시, 범례 하단 중앙 표시.

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 재난 시뮬레이터 HTML 뼈대 + CSS"
```

---

### Task 2: 정적 데이터 상수 정의

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 데이터 추가

- [ ] **Step 1: `<script>` 블록을 아래 내용으로 교체**

```html
<script>
// ══ 데이터 상수 ══════════════════════════════════════════

const DISASTERS = [
    { code: 'FLOOD',    name: '폭우',     color: '#3b82f6', icon: '🌧️' },
    { code: 'QUAKE',    name: '지진',     color: '#f97316', icon: '🌍' },
    { code: 'COLD',     name: '한파',     color: '#67e8f9', icon: '❄️' },
    { code: 'CHEMICAL', name: '화학사고', color: '#a855f7', icon: '☣️' }
];

const SHELTERS = [
    { id:1,  name:'강남구민체육관',      lat:37.5172, lng:127.0473, capacity:500, current:120, floorLvl:2, suitable:['FLOOD','COLD'],     operateYn:true },
    { id:2,  name:'서초문화예술회관',    lat:37.4836, lng:127.0323, capacity:300, current:210, floorLvl:4, suitable:['FLOOD','COLD'],     operateYn:true },
    { id:3,  name:'방배근린공원대피소',  lat:37.4765, lng:126.9972, capacity:150, current:30,  floorLvl:1, suitable:['COLD'],             operateYn:true },
    { id:4,  name:'마포아트센터',        lat:37.5497, lng:126.9121, capacity:400, current:80,  floorLvl:5, suitable:['QUAKE','COLD','CHEMICAL'], operateYn:true },
    { id:5,  name:'은평구민회관',        lat:37.6026, lng:126.9291, capacity:350, current:100, floorLvl:3, suitable:['QUAKE'],            operateYn:true },
    { id:6,  name:'노원문화예술회관',    lat:37.6549, lng:127.0568, capacity:600, current:50,  floorLvl:6, suitable:['COLD','QUAKE'],     operateYn:true },
    { id:7,  name:'성북구민체육관',      lat:37.5894, lng:127.0167, capacity:280, current:140, floorLvl:2, suitable:['QUAKE','COLD'],     operateYn:true },
    { id:8,  name:'관악구민체육관',      lat:37.4784, lng:126.9516, capacity:450, current:90,  floorLvl:2, suitable:['FLOOD','COLD'],     operateYn:true },
    { id:9,  name:'영등포구민체육관',    lat:37.5260, lng:126.8963, capacity:500, current:320, floorLvl:2, suitable:['CHEMICAL','FLOOD'], operateYn:true },
    { id:10, name:'구로구민체육관',      lat:37.4954, lng:126.8874, capacity:400, current:60,  floorLvl:2, suitable:['CHEMICAL'],         operateYn:true },
    { id:11, name:'용산구청체육관',      lat:37.5321, lng:126.9903, capacity:200, current:70,  floorLvl:3, suitable:['QUAKE'],            operateYn:true },
    { id:12, name:'중구민체육관',        lat:37.5636, lng:126.9976, capacity:300, current:180, floorLvl:3, suitable:['FLOOD','QUAKE'],    operateYn:true },
    { id:13, name:'성동구민체육관',      lat:37.5633, lng:127.0371, capacity:350, current:100, floorLvl:2, suitable:['FLOOD'],            operateYn:true },
    { id:14, name:'광진구민체육관',      lat:37.5384, lng:127.0822, capacity:400, current:150, floorLvl:2, suitable:['QUAKE','FLOOD'],    operateYn:true },
    { id:15, name:'동대문구민체육관',    lat:37.5744, lng:127.0397, capacity:350, current:80,  floorLvl:3, suitable:['COLD','QUAKE'],     operateYn:true },
    { id:16, name:'중랑구민체육관',      lat:37.6063, lng:127.0924, capacity:300, current:40,  floorLvl:2, suitable:['COLD'],             operateYn:false },
    { id:17, name:'도봉구민체육관',      lat:37.6688, lng:127.0470, capacity:500, current:90,  floorLvl:4, suitable:['COLD','QUAKE'],     operateYn:true },
    { id:18, name:'강북구민체육관',      lat:37.6398, lng:127.0257, capacity:280, current:60,  floorLvl:2, suitable:['COLD'],             operateYn:true },
    { id:19, name:'송파구민체육관',      lat:37.5145, lng:127.1059, capacity:600, current:200, floorLvl:2, suitable:['FLOOD'],            operateYn:true },
    { id:20, name:'강동구민체육관',      lat:37.5301, lng:127.1238, capacity:450, current:110, floorLvl:2, suitable:['FLOOD','QUAKE'],    operateYn:true }
];

// 위험지역: coords = [[lat, lng], ...] Leaflet polygon 배열
const DANGER_ZONES = {
    FLOOD: [
        { riskLevel:3, name:'강남 저지대',    coords:[[37.510,127.035],[37.510,127.060],[37.500,127.060],[37.500,127.035]] },
        { riskLevel:2, name:'잠원 침수우려',  coords:[[37.518,127.000],[37.518,127.025],[37.508,127.025],[37.508,127.000]] },
        { riskLevel:2, name:'영등포 저지대',  coords:[[37.530,126.880],[37.530,126.910],[37.515,126.910],[37.515,126.880]] },
        { riskLevel:1, name:'마포 하천변',    coords:[[37.548,126.920],[37.548,126.940],[37.538,126.940],[37.538,126.920]] }
    ],
    QUAKE: [
        { riskLevel:2, name:'은평 단층 인근', coords:[[37.615,126.915],[37.615,126.950],[37.595,126.950],[37.595,126.915]] },
        { riskLevel:2, name:'용산 구조물밀집',coords:[[37.538,126.975],[37.538,126.998],[37.525,126.998],[37.525,126.975]] },
        { riskLevel:1, name:'종로 노후건물',  coords:[[37.582,126.965],[37.582,126.992],[37.572,126.992],[37.572,126.965]] },
        { riskLevel:3, name:'서대문 단층대',  coords:[[37.568,126.930],[37.568,126.955],[37.555,126.955],[37.555,126.930]] }
    ],
    COLD: [
        { riskLevel:2, name:'노원 고령밀집',  coords:[[37.665,127.048],[37.665,127.072],[37.648,127.072],[37.648,127.048]] },
        { riskLevel:1, name:'강북 취약계층',  coords:[[37.645,127.018],[37.645,127.038],[37.632,127.038],[37.632,127.018]] },
        { riskLevel:1, name:'중구 노숙인밀집',coords:[[37.568,126.988],[37.568,127.005],[37.558,127.005],[37.558,126.988]] },
        { riskLevel:2, name:'도봉 독거노인',  coords:[[37.678,127.038],[37.678,127.058],[37.662,127.058],[37.662,127.038]] }
    ],
    CHEMICAL: [
        { riskLevel:3, name:'마포 산업단지',  coords:[[37.548,126.895],[37.548,126.920],[37.535,126.920],[37.535,126.895]] },
        { riskLevel:2, name:'구로 공단지역',  coords:[[37.500,126.875],[37.500,126.900],[37.485,126.900],[37.485,126.875]] },
        { riskLevel:2, name:'영등포 산업시설',coords:[[37.525,126.893],[37.525,126.915],[37.512,126.915],[37.512,126.893]] },
        { riskLevel:1, name:'성수 공장지대',  coords:[[37.548,127.050],[37.548,127.068],[37.538,127.068],[37.538,127.050]] }
    ]
};

const RISK_COLORS = { 3:'#ef4444', 2:'#f97316', 1:'#eab308' };
</script>
```

- [ ] **Step 2: 콘솔에서 데이터 확인**

브라우저 DevTools 콘솔 열기 → 입력:
```js
console.log(SHELTERS.length, Object.keys(DANGER_ZONES));
```
예상 출력: `20  ['FLOOD', 'QUAKE', 'COLD', 'CHEMICAL']`

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 재난 시뮬레이터 가상 데이터 상수 (대피소 20개, 위험지역 4유형)"
```

---

### Task 3: Leaflet 지도 초기화 + 재난유형 탭 렌더링

**Files:**
- Modify: `disaster.html` — `<script>` 블록 하단에 추가

- [ ] **Step 1: 지도 초기화 + 탭 렌더링 코드 추가**

데이터 상수 선언 아래에 이어서 추가:

```js
// ══ 상태 ══════════════════════════════════════════════════
let currentDisaster = 'FLOOD';
let userLat = null, userLng = null;
let userMarker = null;
let zoneLayer = null;
let shelterMarkers = [];
let recommendMarkers = [];

// ══ 지도 초기화 ═══════════════════════════════════════════
const map = L.map('map', { zoomControl: false }).setView([37.555, 127.000], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
}).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

// ══ 재난유형 탭 렌더링 ════════════════════════════════════
function renderTabs() {
    const container = document.getElementById('disasterTabs');
    container.innerHTML = '';
    DISASTERS.forEach(d => {
        const btn = document.createElement('button');
        btn.className = 'disaster-tab' + (d.code === currentDisaster ? ' active' : '');
        btn.textContent = d.icon + ' ' + d.name;
        if (d.code === currentDisaster) {
            btn.style.background = d.color;
            btn.style.borderColor = d.color;
        }
        btn.addEventListener('click', () => selectDisaster(d.code));
        container.appendChild(btn);
    });
}

function selectDisaster(code) {
    currentDisaster = code;
    renderTabs();
    renderZones();
    renderShelterMarkers();
    closePanel();
}

renderTabs();
```

- [ ] **Step 2: 브라우저 확인**

`http://localhost:3000/disaster.html` 새로고침.
확인: 헤더에 탭 4개(🌧️ 폭우, 🌍 지진, ❄️ 한파, ☣️ 화학사고), 폭우 탭이 파란색 활성화 상태, 서울 중심 지도 표시.

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: Leaflet 지도 초기화 + 재난유형 탭 렌더링"
```

---

### Task 4: 위험지역 Polygon 렌더링

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 추가

- [ ] **Step 1: `renderZones()` 함수 추가**

```js
// ══ 위험지역 Polygon ══════════════════════════════════════
function renderZones() {
    if (zoneLayer) map.removeLayer(zoneLayer);
    zoneLayer = L.layerGroup();
    const zones = DANGER_ZONES[currentDisaster] || [];
    zones.forEach(zone => {
        const color = RISK_COLORS[zone.riskLevel];
        const poly = L.polygon(zone.coords, {
            color: color,
            fillColor: color,
            fillOpacity: 0.25,
            weight: 1.5,
            opacity: 0.8
        });
        poly.bindTooltip(
            `<b>${zone.name}</b><br>위험도: ${'★'.repeat(zone.riskLevel)}`,
            { sticky: true, className: 'zone-tooltip' }
        );
        zoneLayer.addLayer(poly);
    });
    zoneLayer.addTo(map);
}

renderZones();
```

그리고 `<style>` 블록 끝에 툴팁 스타일 추가:

```css
.zone-tooltip {
    background: rgba(10,15,30,0.92) !important;
    border: 1px solid #1e3a5f !important;
    color: #e2e8f0 !important;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
}
.zone-tooltip::before { display: none !important; }
.leaflet-tooltip-top.zone-tooltip::before,
.leaflet-tooltip-bottom.zone-tooltip::before { display: none; }
```

- [ ] **Step 2: 브라우저 확인**

새로고침 후 확인:
- 폭우 선택 시: 강남/잠원/영등포/마포 위치에 빨강/주황 반투명 사각형 표시
- 재난유형 전환 시 Polygon이 해당 유형으로 교체
- Polygon 위에 마우스 올리면 이름·위험도 툴팁 표시

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 위험지역 Polygon 렌더링 (재난유형별 교체)"
```

---

### Task 5: 대피소 마커 렌더링

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 추가

- [ ] **Step 1: `renderShelterMarkers()` 함수 추가**

```js
// ══ 대피소 마커 ═══════════════════════════════════════════
function makeShelterIcon(isSuitable) {
    return L.divIcon({
        className: '',
        html: `<div class="shelter-icon" style="opacity:${isSuitable ? 1 : 0.4}">🏠</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14]
    });
}

function renderShelterMarkers() {
    shelterMarkers.forEach(m => map.removeLayer(m));
    shelterMarkers = [];
    SHELTERS.forEach(s => {
        const isSuitable = s.suitable.includes(currentDisaster);
        const marker = L.marker([s.lat, s.lng], { icon: makeShelterIcon(isSuitable) });
        const fillPct = Math.round((s.current / s.capacity) * 100);
        marker.bindPopup(`
            <div style="font-family:Inter,sans-serif;font-size:0.8rem;min-width:160px">
                <b style="font-size:0.88rem">${s.name}</b><br>
                <span style="color:#94a3b8">수용 현황</span> ${s.current}/${s.capacity}명 (${fillPct}%)<br>
                <span style="color:#94a3b8">적합 재난</span> ${s.suitable.join(', ')}<br>
                <span style="color:#94a3b8">운영 상태</span> ${s.operateYn ? '✅ 운영중' : '❌ 미운영'}
            </div>
        `, { className: 'dark-popup' });
        marker.addTo(map);
        shelterMarkers.push(marker);
    });
}

renderShelterMarkers();
```

그리고 `<style>` 블록에 팝업 스타일 추가:

```css
.dark-popup .leaflet-popup-content-wrapper {
    background: rgba(13,27,42,0.97) !important;
    border: 1px solid #1e3a5f !important;
    color: #e2e8f0 !important;
    border-radius: 10px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5) !important;
}
.dark-popup .leaflet-popup-tip {
    background: rgba(13,27,42,0.97) !important;
}
.dark-popup .leaflet-popup-close-button { color: #94a3b8 !important; }
```

- [ ] **Step 2: 브라우저 확인**

새로고침 후 확인:
- 서울 전역에 🏠 마커 20개 표시
- 현재 재난유형에 적합하지 않은 마커는 반투명(opacity 0.4)
- 마커 클릭 시 이름·수용·적합·운영 팝업 표시

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 대피소 마커 렌더링 + 팝업"
```

---

### Task 6: 사용자 위치 선택 (지도 클릭 + GPS)

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 추가

- [ ] **Step 1: 위치 관련 함수 + 이벤트 추가**

```js
// ══ 사용자 위치 ════════════════════════════════════════════
function makeUserIcon() {
    return L.divIcon({
        className: '',
        html: `<div class="user-icon"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8]
    });
}

function setUserLocation(lat, lng) {
    userLat = lat; userLng = lng;
    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.marker([lat, lng], { icon: makeUserIcon(), zIndexOffset: 1000 }).addTo(map);
    document.getElementById('locationStatus').textContent = `📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    document.getElementById('locationStatus').className = 'location-status set';
    document.getElementById('runBtn').disabled = false;
}

function clearLocation() {
    userLat = null; userLng = null;
    if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
    document.getElementById('locationStatus').textContent = '지도를 클릭하거나 GPS를 사용하세요';
    document.getElementById('locationStatus').className = 'location-status';
    document.getElementById('runBtn').disabled = true;
    closePanel();
}

// 지도 클릭으로 위치 지정
map.on('click', e => setUserLocation(e.latlng.lat, e.latlng.lng));

// GPS 버튼
document.getElementById('gpsBtn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert('이 브라우저는 GPS를 지원하지 않습니다.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        pos => {
            setUserLocation(pos.coords.latitude, pos.coords.longitude);
            map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        },
        () => alert('위치를 가져올 수 없습니다. 지도를 직접 클릭해 주세요.')
    );
});

// 초기화 버튼
document.getElementById('clearLocBtn').addEventListener('click', clearLocation);
```

- [ ] **Step 2: 브라우저 확인**

새로고침 후:
- 지도 아무 곳 클릭 → 파란 점 마커 표시, 좌표 텍스트 갱신, 실행 버튼 활성화
- "✕ 초기화" 클릭 → 마커 제거, 버튼 비활성화
- "📡 GPS" 클릭 → 브라우저 위치 권한 요청

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 사용자 위치 선택 (지도 클릭 + GPS)"
```

---

### Task 7: 시뮬레이션 알고리즘 (Haversine + 점수 계산)

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 추가

- [ ] **Step 1: Haversine + 점수 계산 + 추천 함수 추가**

```js
// ══ 시뮬레이션 로직 ════════════════════════════════════════
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcScore(shelter, distanceM, disasterCode) {
    const distScore   = 40 * Math.max(0, 1 - distanceM / 5000);
    const capScore    = shelter.capacity > 0
                        ? 25 * (1 - shelter.current / shelter.capacity) : 0;
    const suitScore   = shelter.suitable.includes(disasterCode) ? 20 : 5;
    const opScore     = shelter.operateYn ? 10 : 0;
    const floorBonus  = ['COLD', 'CHEMICAL'].includes(disasterCode) && shelter.floorLvl >= 3 ? 5 : 0;

    return {
        total: distScore + capScore + suitScore + opScore + floorBonus,
        dist: distScore, cap: capScore, suit: suitScore, op: opScore, bonus: floorBonus
    };
}

function buildReason(shelter, distanceM, disasterCode) {
    const parts = [];
    parts.push(shelter.suitable.includes(disasterCode) ? '재난유형 적합' : '재난유형 부적합 (차선)');
    const fillRatio = shelter.current / shelter.capacity;
    if (fillRatio < 0.3) parts.push('수용 여유 충분');
    else if (fillRatio > 0.7) parts.push('수용 거의 찼음');
    if (distanceM < 1000) parts.push(`도보 약 ${Math.round(distanceM / 80)}분`);
    else parts.push(`약 ${(distanceM / 1000).toFixed(1)}km 거리`);
    if (['COLD', 'CHEMICAL'].includes(disasterCode) && shelter.floorLvl >= 3) parts.push('고층 대피 유리');
    if (!shelter.operateYn) parts.push('현재 미운영');
    return parts.join(' · ');
}

function runSimulation() {
    if (userLat === null) return;

    const results = SHELTERS
        .filter(s => s.operateYn)
        .map(s => {
            const dist = haversine(userLat, userLng, s.lat, s.lng);
            const score = calcScore(s, dist, currentDisaster);
            const reason = buildReason(s, dist, currentDisaster);
            return { shelter: s, distanceM: dist, score, reason };
        })
        .filter(r => r.distanceM <= 5000)
        .sort((a, b) => b.score.total - a.score.total)
        .slice(0, 3);

    return results;
}
```

- [ ] **Step 2: 콘솔에서 알고리즘 검증**

브라우저에서 지도 클릭 후 콘솔 입력:
```js
const r = runSimulation(); console.table(r.map(x => ({ name: x.shelter.name, score: x.score.total.toFixed(1), dist: Math.round(x.distanceM) })));
```
예상: 점수 내림차순 3개 행 출력.

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 시뮬레이션 알고리즘 (haversine + 점수 계산 + 추천)"
```

---

### Task 8: 결과 패널 렌더링 + 추천 마커

**Files:**
- Modify: `disaster.html` — `<script>` 블록에 추가

- [ ] **Step 1: 패널 렌더링 + 추천 마커 함수 추가**

```js
// ══ 결과 패널 ══════════════════════════════════════════════
function makeRecommendIcon(rank) {
    return L.divIcon({
        className: '',
        html: `<div class="recommend-icon">${rank}</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16]
    });
}

function openPanel(results) {
    // 이전 추천 마커 제거
    recommendMarkers.forEach(m => map.removeLayer(m));
    recommendMarkers = [];

    // 패널 서브타이틀
    const d = DISASTERS.find(x => x.code === currentDisaster);
    document.getElementById('panelSub').textContent =
        `📍 내 위치 기준 · ${d.icon} ${d.name}`;

    // 카드 렌더링
    const body = document.getElementById('panelBody');
    body.innerHTML = '';
    results.forEach((r, i) => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.innerHTML = `
            <div class="rec-card-header">
                <div class="rec-rank">${i + 1}</div>
                <div class="rec-name">${r.shelter.name}</div>
                <div class="rec-score">${r.score.total.toFixed(1)}점</div>
            </div>
            <div class="score-rows">
                ${scoreRow('거리', r.score.dist, 40)}
                ${scoreRow('수용', r.score.cap, 25)}
                ${scoreRow('적합', r.score.suit, 20)}
                ${scoreRow('운영', r.score.op, 10)}
                ${r.score.bonus > 0 ? scoreRow('보너스', r.score.bonus, 5) : ''}
            </div>
            <div class="rec-reason">${r.reason}</div>
            <button class="rec-goto">📌 지도에서 보기</button>
        `;
        card.querySelector('.rec-goto').addEventListener('click', (e) => {
            e.stopPropagation();
            map.setView([r.shelter.lat, r.shelter.lng], 15);
        });
        body.appendChild(card);

        // 추천 마커 추가
        const marker = L.marker([r.shelter.lat, r.shelter.lng], {
            icon: makeRecommendIcon(i + 1),
            zIndexOffset: 500
        });
        marker.bindPopup(`
            <div style="font-family:Inter,sans-serif;font-size:0.8rem">
                <b>#${i + 1} ${r.shelter.name}</b><br>
                <span style="color:#a855f7;font-weight:700">${r.score.total.toFixed(1)}점</span><br>
                ${r.reason}
            </div>
        `, { className: 'dark-popup' });
        marker.addTo(map);
        recommendMarkers.push(marker);
    });

    // 패널 열기
    document.getElementById('resultPanel').classList.add('open');

    // fitBounds: 추천 3개 + 내 위치 포함
    if (results.length > 0) {
        const bounds = L.latLngBounds(
            results.map(r => [r.shelter.lat, r.shelter.lng])
        ).extend([userLat, userLng]);
        map.fitBounds(bounds, { padding: [60, 380] });
    }
}

function scoreRow(label, val, max) {
    const pct = Math.round((val / max) * 100);
    return `
        <div class="score-row">
            <div class="score-label">${label}</div>
            <div class="score-bar-bg">
                <div class="score-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="score-val">${val.toFixed(1)} / ${max}</div>
        </div>`;
}

function closePanel() {
    document.getElementById('resultPanel').classList.remove('open');
    recommendMarkers.forEach(m => map.removeLayer(m));
    recommendMarkers = [];
}

document.getElementById('panelClose').addEventListener('click', closePanel);

// 시뮬레이션 실행 버튼
document.getElementById('runBtn').addEventListener('click', () => {
    const results = runSimulation();
    if (!results || results.length === 0) {
        alert('반경 5km 내에 운영 중인 대피소가 없습니다.\n다른 위치를 선택해 보세요.');
        return;
    }
    openPanel(results);
});
```

- [ ] **Step 2: 전체 흐름 브라우저 확인**

1. 지도에서 서울 중심부 클릭 → 파란 점 표시, 실행 버튼 활성화
2. "▶ 시뮬레이션 실행" 클릭
3. 확인사항:
   - 우측 패널이 슬라이드인 (300ms)
   - 패널에 카드 최대 3개, 점수 게이지 바 표시
   - reason 텍스트 표시
   - 지도에 보라색 숫자 마커 1/2/3 표시
   - "📌 지도에서 보기" 클릭 시 지도 해당 위치로 이동
   - "✕" 클릭 시 패널 닫힘 + 보라 마커 제거
4. 재난유형 변경 시 패널 닫힘, 새 위험지역 표시 확인

- [ ] **Step 3: 커밋**

```bash
git add disaster.html
git commit -m "feat: 결과 패널 렌더링 + 점수 게이지 + 추천 마커"
```

---

### Task 9: index.html 카드 + nav 링크 추가

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 카드 그리드에 disaster.html 카드 추가**

`index.html`에서 커머스 시스템 카드 (`</a>` 닫힌 후 `</div>` 전) 바로 뒤에 추가:

```html
                <a href="/disaster.html" class="tool-card">
                    <div class="card-inner">
                        <span class="card-icon">🚨</span>
                        <div class="card-body">
                            <div class="card-name">재난 대응 시뮬레이터</div>
                            <div class="card-desc">재난유형 선택 후 주변 대피소 점수 기반 추천 — 폭우·지진·한파·화학사고</div>
                        </div>
                        <span class="card-live">Live</span>
                        <span class="card-arrow">→</span>
                    </div>
                </a>
```

- [ ] **Step 2: 상단 nav에 링크 추가**

`index.html`에서 nav 링크들 중 `/agents.html` 링크 뒤에 추가:

```html
        <a href="/disaster.html" class="topnav-link">재난 시뮬레이터</a>
```

- [ ] **Step 3: 브라우저 확인**

`http://localhost:3000/` 새로고침.
확인:
- 카드 그리드에 🚨 재난 대응 시뮬레이터 카드 표시
- 상단 nav에 "재난 시뮬레이터" 링크 표시
- 카드/링크 클릭 시 `disaster.html`로 이동

- [ ] **Step 4: 커밋**

```bash
git add index.html
git commit -m "feat: index.html에 재난 시뮬레이터 카드 + nav 링크 추가"
```

---

## 완료 기준 체크리스트

- [ ] `disaster.html` 열리면 짙은 네이비 배경 + 재난유형 탭 4개 표시
- [ ] 재난유형 탭 클릭 시 위험지역 Polygon 즉시 교체
- [ ] 지도 클릭 → 파란 점 마커 + 실행 버튼 활성화
- [ ] GPS 버튼 → 브라우저 위치 권한 요청 후 마커 표시
- [ ] 시뮬레이션 실행 → 우측 패널 슬라이드인
- [ ] 패널에 TOP3 카드 + 점수 게이지 바 + reason 텍스트
- [ ] 지도에 보라 숫자 마커 1/2/3 표시 + fitBounds
- [ ] 패널 카드 "지도에서 보기" → 해당 대피소로 pan
- [ ] 패널 닫기 → 보라 마커 제거
- [ ] `index.html` 카드 + nav 링크 동작
