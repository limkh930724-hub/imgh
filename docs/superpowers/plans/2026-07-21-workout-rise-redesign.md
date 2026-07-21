# workout.html RISE식 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `workout.html`을 RISE식 루틴 목록/생성 + 실시간 운동 모드 + 기록/통계를 갖춘 반응형 단일 페이지 앱으로 재설계한다.

**Architecture:** 단일 정적 HTML 파일. 상태(`state = {routines, logs}`)를 `localStorage('fg-workout-v2')`에 저장하고, `activeTab` 하나로 3탭(루틴/기록/통계)을 전환하며, 운동 모드는 풀스크린 오버레이로 렌더한다. 렌더는 상태→DOM 단방향(`render()`가 탭별 렌더 함수 호출).

**Tech Stack:** Vanilla HTML/CSS/JS, 외부 라이브러리 없음. 폰트 Inter(기존 유지). 차트는 순수 canvas 2D.

## Global Constraints

- 빌드/번들/패키지 매니저 없음. 모든 로직·스타일·마크업은 `workout.html` 단일 파일 인라인.
- 들여쓰기 4 spaces, JS는 camelCase, CSS는 kebab-case.
- 이중 언어 UI 패턴 유지(한국어 표면 텍스트 + 영어 eyebrow 등 기존 톤).
- 라이트 전용. 다크모드 없음.
- 액센트 색: 에메랄드 `#10b981`(hover/짙게 `#059669`), 완료 상태 틴트 `rgba(16,185,129,0.12)`.
- 배경 `#f4f6f8`, 카드 흰색 `#fff`, radius 14px, 카드 그림자 `0 6px 20px rgba(15,23,42,0.06)`, 보더 `#e8eae6`.
- 모든 사용자 입력 텍스트(루틴명·운동명·메모)는 렌더 시 `esc()` 처리.
- `alert()`/`confirm()` 금지 — 인라인 UI로 검증·확인.
- localStorage 저장 키는 반드시 `fg-workout-v2`.
- 커밋 메시지: Conventional Commit 접두 + 한국어 요약. 각 커밋 끝에 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- 검증은 브라우저: `npx serve . -l 8080` 후 `http://localhost:8080/workout.html`. Node 없으면 `python -m http.server 8080`.

---

## File Structure

- Modify(전면 재작성): `workout.html` — 앱 전체(셸/데이터/3탭/편집기/운동모드/통계차트).
- Modify: `sw.js` — `CACHE_NAME` 범프.
- Modify: `CLAUDE.md` — Workout 섹션 재작성 + localStorage 키 표 수정.
- Modify: `AGENTS.md` — 위 내용과 동기화(해당 항목이 있으면).

`workout.html` 내부 `<script>` 함수 구성(최종 형태):
- 데이터: `loadState()`, `persist()`, `migrateFromLegacy()`, `uid()`, `esc()`, `todayKey()`, `weekStart()`.
- 파생: `sessionVolume(log)`, `weekLogs()`, `streak()`, `topRoutine()`, `prByExercise()`.
- 렌더 디스패치: `render()`, `switchTab(id)`.
- 루틴 탭: `renderRoutines()`, `routineCardHTML(r)`, `openRoutineDetail(id)`.
- 편집기: `openEditor(id?)`, `editorAddExercise()`, `editorAddSet(exIdx)`, `saveRoutine()`, `closeEditor()`.
- 카드 액션: `duplicateRoutine(id)`, `deleteRoutine(id)`.
- 운동 모드: `startWorkout(routineId|null)`, `toggleSet(exIdx,setIdx)`, `workoutAddExercise()`, `finishWorkout()`, `cancelWorkout()`, `tickTimer()`.
- 기록: `renderHistory()`, `weekStripHTML()`.
- 통계: `renderStats()`, `drawVolumeChart()`.

---

## Task 1: 셸 + 데이터 레이어 + 탭 스캐폴딩

**Files:**
- Modify(전면 교체): `workout.html`

**Interfaces:**
- Produces:
  - `state` (전역 객체 `{routines:Array, logs:Array}`)
  - `loadState(): {routines, logs}` — `fg-workout-v2` 파싱, 없으면 `migrateFromLegacy()` 결과, 그래도 없으면 `{routines:[], logs:[]}`
  - `persist(): void` — `state`를 `fg-workout-v2`에 저장
  - `migrateFromLegacy(): {routines, logs} | null` — `fg-workout-dashboard`의 `sessions[]`를 `logs[]`로 변환
  - `uid(): string` — 고유 id
  - `esc(v): string` — HTML 이스케이프
  - `switchTab(id): void` — `activeTab` 설정 후 `render()`
  - `render(): void` — `activeTab`에 따라 탭 렌더 함수 호출 + 탭바 active 갱신
  - HTML: `#tab-routines`, `#tab-history`, `#tab-stats` 컨테이너, `.tabbar` 하단 탭바, `.app-header`

- [ ] **Step 1: `<head>` 교체 — 메타/폰트/스타일 토큰**

`workout.html`의 `<head>`를 아래로 교체(메타 태그는 기존 og/description 유지, title 유지). `<style>` 안 상단에 토큰과 셸 스타일을 넣는다:

```html
<style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    :root{
        --bg:#f4f6f8; --card:#fff; --line:#e8eae6; --ink:#161616; --muted:#6b7280;
        --accent:#10b981; --accent-dark:#059669; --accent-tint:rgba(16,185,129,0.12);
        --radius:14px; --shadow:0 6px 20px rgba(15,23,42,0.06);
    }
    body{
        font-family:'Inter','Segoe UI',Arial,'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;
        background:var(--bg); color:var(--ink); min-height:100vh; word-break:keep-all; overflow-wrap:break-word;
        padding-bottom:76px; /* 하단 탭바 공간 */
    }
    .app-header{
        position:sticky; top:0; z-index:50; background:rgba(255,255,255,0.9);
        backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
        border-bottom:1px solid var(--line); height:52px; display:flex; align-items:center;
        gap:.75rem; padding:0 1rem;
    }
    .app-back{ color:var(--muted); text-decoration:none; font-size:.85rem; font-weight:600; }
    .app-logo{ font-weight:800; font-size:1.05rem; letter-spacing:-.02em;
        background:linear-gradient(90deg,#3b82f6,#10b981); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .app-shell{ max-width:460px; margin:0 auto; padding:1rem; }
    .tab-panel{ display:none; }
    .tab-panel.active{ display:block; }
    .tabbar{
        position:fixed; bottom:0; left:0; right:0; z-index:60; height:64px;
        background:rgba(255,255,255,0.96); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
        border-top:1px solid var(--line); display:flex; justify-content:center;
    }
    .tabbar-inner{ width:100%; max-width:460px; display:flex; }
    .tabbtn{ flex:1; border:none; background:none; cursor:pointer; display:flex; flex-direction:column;
        align-items:center; justify-content:center; gap:2px; color:var(--muted); font-size:.7rem; font-weight:700; }
    .tabbtn .ico{ font-size:1.15rem; line-height:1; }
    .tabbtn.active{ color:var(--accent-dark); }
    /* 데스크톱: 넓은 대시보드 */
    @media (min-width:900px){
        body{ padding-bottom:0; }
        .app-shell{ max-width:1080px; padding:1.5rem; }
        .tabbar{ position:sticky; top:52px; height:auto; border-top:none; border-bottom:1px solid var(--line); background:transparent; }
        .tabbar-inner{ max-width:1080px; margin:0 auto; padding:.5rem 1.5rem; gap:.5rem; }
        .tabbtn{ flex:0 0 auto; flex-direction:row; gap:.4rem; padding:.5rem .9rem; border-radius:999px; font-size:.85rem; }
        .tabbtn.active{ background:var(--accent-tint); }
    }
    @keyframes pageIn{ from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:none;} }
    body{ animation:pageIn .35s cubic-bezier(.22,1,.36,1) both; }
    /* 이후 Task들에서 카드/편집기/운동모드/차트 스타일 추가 */
</style>
```

- [ ] **Step 2: `<body>` 마크업 교체 — 셸 + 3탭 컨테이너 + 탭바**

기존 `.topnav` ~ `.page-wrap` 전체를 아래로 교체:

```html
<header class="app-header">
    <a href="/" class="app-back">← 포트폴리오</a>
    <span class="app-logo">RISE</span>
</header>
<nav class="tabbar">
    <div class="tabbar-inner">
        <button class="tabbtn active" data-tab="routines" onclick="switchTab('routines')"><span class="ico">🏋️</span>루틴</button>
        <button class="tabbtn" data-tab="history" onclick="switchTab('history')"><span class="ico">📒</span>기록</button>
        <button class="tabbtn" data-tab="stats" onclick="switchTab('stats')"><span class="ico">📊</span>통계</button>
    </div>
</nav>
<main class="app-shell">
    <section id="tab-routines" class="tab-panel active"></section>
    <section id="tab-history" class="tab-panel"></section>
    <section id="tab-stats" class="tab-panel"></section>
</main>
```

> 참고: 모바일에서는 `.tabbar`가 화면 하단 고정, 데스크톱에서는 헤더 아래 상단 탭으로 나타난다(위 CSS 미디어쿼리). 마크업은 동일.

- [ ] **Step 3: `<script>` 상단 교체 — 데이터 레이어 + 렌더 디스패치**

기존 첫 번째 `<script>` 블록(앱 로직) 전체를 아래로 교체. 두 번째 `<script>`(페이지 전환 오버레이 `#pg-ov`)는 `.topnav` 대신 `.app-header`를 참조하도록 `querySelector('.app-header')`로 바꾸고 나머지는 그대로 둔다.

```javascript
const STORAGE_KEY = 'fg-workout-v2';
const LEGACY_KEY = 'fg-workout-dashboard';
const DAY_LABELS = ['일','월','화','수','목','금','토'];
let activeTab = 'routines';

function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function esc(v){ return String(v).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function migrateFromLegacy(){
    let legacy;
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY)); } catch { return null; }
    if(!legacy || !Array.isArray(legacy.sessions) || !legacy.sessions.length) return null;
    const logs = legacy.sessions.map(function(s){
        return { id: uid(), date: s.date || new Date().toISOString(), routineId: null,
            emoji: '🏋️', name: s.name || '이전 기록',
            exercises: [], durationMin: Number(s.minutes)||0, note: s.note || '' };
    });
    return { routines: [], logs: logs };
}
function loadState(){
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw){ const p = JSON.parse(raw); return { routines:p.routines||[], logs:p.logs||[] }; }
    } catch {}
    const migrated = migrateFromLegacy();
    if(migrated){ localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)); return migrated; }
    return { routines: [], logs: [] };
}
function persist(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch(e){ console.warn('운동 기록 저장 실패:', e); }
}
const state = loadState();

function switchTab(id){ activeTab = id; render(); }
function render(){
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.querySelectorAll('.tabbtn').forEach(function(b){ b.classList.toggle('active', b.dataset.tab===activeTab); });
    const panel = document.getElementById('tab-' + activeTab);
    if(panel) panel.classList.add('active');
    if(activeTab==='routines') renderRoutines();
    else if(activeTab==='history') renderHistory();
    else if(activeTab==='stats') renderStats();
}
// 이후 Task에서 정의되는 렌더 함수들의 임시 스텁(Task 2~7에서 교체):
function renderRoutines(){ document.getElementById('tab-routines').innerHTML = '<p>루틴</p>'; }
function renderHistory(){ document.getElementById('tab-history').innerHTML = '<p>기록</p>'; }
function renderStats(){ document.getElementById('tab-stats').innerHTML = '<p>통계</p>'; }
render();
```

- [ ] **Step 4: 페이지 전환 오버레이 스크립트의 셀렉터 수정**

두 번째 `<script>`의 `document.querySelector('.topnav')`를 `document.querySelector('.app-header')`로 변경(나머지 로직 유지).

- [ ] **Step 5: 브라우저 검증**

Run: `npx serve . -l 8080` → `http://localhost:8080/workout.html`
확인:
- 콘솔 에러 없음.
- 헤더에 "RISE" 워드마크 + "← 포트폴리오" 링크 보임.
- 하단(모바일 폭) / 상단(데스크톱 폭) 탭바에서 루틴/기록/통계 클릭 시 각 패널 텍스트가 바뀌고 active 스타일이 이동.
- 900px 이상으로 창을 넓히면 탭바가 상단 pill 형태로 바뀜.

- [ ] **Step 6: Commit**

```bash
git add workout.html
git commit -m "feat: workout 셸·데이터 레이어·3탭 스캐폴딩 (RISE 재설계 1/8)"
```

---

## Task 2: 루틴 탭 — 목록/빈 상태/카드

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.routines`, `esc()`, `switchTab()`
- Produces:
  - `renderRoutines(): void` — 루틴 카드 목록 + `+ 루틴 만들기` + `▶ 자유 운동 시작` 렌더
  - `routineCardHTML(r): string` — 루틴 1개 카드 마크업
  - `routineMinutes(r): number` — 루틴 예상 시간(운동수×4 + 세트수×0.5, 반올림) — 대략치
  - 전역 클릭 핸들러가 부를 함수 이름: `openEditor`, `openRoutineDetail`, `startWorkout`, `toggleMenu`(Task 3~5에서 구현; 여기선 `window.openEditor` 등이 없으면 무시되지 않도록 Task 순서상 Task 5까지 완료 후 최종 동작)

- [ ] **Step 1: 루틴 카드/버튼 CSS 추가**

`<style>` 하단(Task 1 주석 자리)에 추가:

```css
.list-card{ background:var(--card); border:1px solid var(--line); border-radius:var(--radius);
    box-shadow:var(--shadow); padding:.9rem 1rem; margin-bottom:.6rem; display:flex; align-items:center; gap:.8rem; cursor:pointer; }
.list-card .emoji{ font-size:1.4rem; width:2rem; text-align:center; flex-shrink:0; }
.list-card .lc-body{ flex:1; min-width:0; }
.list-card .lc-name{ font-weight:700; font-size:.95rem; }
.list-card .lc-sub{ color:var(--muted); font-size:.78rem; margin-top:.15rem; }
.lc-menu{ border:none; background:none; cursor:pointer; color:var(--muted); font-size:1.2rem; padding:.2rem .4rem; flex-shrink:0; }
.add-card{ border:1px dashed var(--line); border-radius:var(--radius); background:#fbfbfa; color:var(--muted);
    padding:.9rem 1rem; width:100%; text-align:left; font-weight:700; cursor:pointer; margin-bottom:.6rem; }
.cta-free{ margin-top:.4rem; width:100%; border:none; border-radius:var(--radius); padding:.95rem;
    background:var(--accent-tint); color:var(--accent-dark); font-weight:800; cursor:pointer; font-size:.95rem; }
.panel-title{ font-size:1.3rem; font-weight:800; letter-spacing:-.02em; margin:.2rem 0 1rem; }
.empty{ border:1px dashed var(--line); border-radius:var(--radius); padding:1.4rem 1rem; color:var(--muted);
    text-align:center; font-size:.86rem; background:#fbfbfa; margin-bottom:.6rem; }
.rc-menu-pop{ position:relative; }
```

- [ ] **Step 2: `renderRoutines`/`routineCardHTML`/`routineMinutes` 구현(스텁 교체)**

Task 1의 `renderRoutines` 스텁을 아래로 교체하고 헬퍼 추가:

```javascript
function routineMinutes(r){
    const sets = r.exercises.reduce(function(a,e){ return a + e.sets.length; }, 0);
    return Math.round(r.exercises.length*4 + sets*0.5);
}
function routineCardHTML(r){
    return '<div class="list-card" onclick="openRoutineDetail(\'' + r.id + '\')">' +
        '<div class="emoji">' + esc(r.emoji||'🏋️') + '</div>' +
        '<div class="lc-body"><div class="lc-name">' + esc(r.name) + '</div>' +
        '<div class="lc-sub">운동 ' + r.exercises.length + '개 · 예상 ' + routineMinutes(r) + '분</div></div>' +
        '<button class="lc-menu" onclick="event.stopPropagation(); openRoutineMenu(\'' + r.id + '\')">⋮</button>' +
        '</div>';
}
function renderRoutines(){
    const el = document.getElementById('tab-routines');
    let html = '<h1 class="panel-title">한 눈에 보는 내 루틴</h1>';
    if(!state.routines.length){
        html += '<div class="empty">아직 루틴이 없어요.<br>첫 루틴을 만들어 시작해보세요.</div>';
    } else {
        html += state.routines.map(routineCardHTML).join('');
    }
    html += '<button class="add-card" onclick="openEditor()">＋ 루틴 만들기</button>';
    html += '<button class="cta-free" onclick="startWorkout(null)">▶ 자유 운동 시작</button>';
    el.innerHTML = html;
}
// Task 3~5에서 실제 구현되기 전까지 안전한 임시 스텁:
function openEditor(){ console.log('openEditor (Task 3)'); }
function openRoutineDetail(){ console.log('openRoutineDetail (Task 4)'); }
function openRoutineMenu(){ console.log('openRoutineMenu (Task 4)'); }
function startWorkout(){ console.log('startWorkout (Task 5)'); }
```

- [ ] **Step 3: 임시 시드로 렌더 확인**

브라우저 콘솔에서 임시 데이터 주입 후 목록 렌더 확인:
```js
state.routines.push({id:'t1',emoji:'🌱',name:'테스트 루틴',note:'',exercises:[{id:'e1',name:'스쿼트',sets:[{weight:60,reps:10},{weight:60,reps:8}]}]}); render();
```
확인: "테스트 루틴 / 운동 1개 · 예상 5분" 카드 + `＋ 루틴 만들기` + `▶ 자유 운동 시작` 표시. `⋮`/카드 클릭 시 콘솔 로그. 새로고침(주입 데이터는 persist 안 했으므로 사라짐) 시 빈 상태 안내 표시.

- [ ] **Step 4: Commit**

```bash
git add workout.html
git commit -m "feat: 루틴 탭 목록·빈 상태·카드 렌더 (RISE 재설계 2/8)"
```

---

## Task 3: 루틴 편집기 (생성/수정)

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.routines`, `persist()`, `esc()`, `uid()`, `render()`
- Produces:
  - `openEditor(id?): void` — id 있으면 수정, 없으면 신규. `editorDraft` 초기화 후 오버레이 렌더
  - `editorDraft` (전역) — `{id, emoji, name, note, exercises:[{id,name,sets:[{weight,reps}]}]}`
  - `saveRoutine(): void` — 검증 후 `state.routines`에 upsert, persist, 닫기, `render()`
  - `closeEditor(): void`
  - `editorAddExercise()`, `editorRemoveExercise(i)`, `editorAddSet(i)`, `editorRemoveSet(i,j)` — draft 조작 후 재렌더
  - HTML 오버레이: `#editor-ov`

- [ ] **Step 1: 편집기/오버레이 공통 CSS 추가**

```css
.overlay{ position:fixed; inset:0; z-index:100; background:var(--bg); overflow-y:auto;
    display:none; flex-direction:column; }
.overlay.on{ display:flex; }
.ov-header{ position:sticky; top:0; background:var(--card); border-bottom:1px solid var(--line);
    height:52px; display:flex; align-items:center; gap:.6rem; padding:0 1rem; z-index:2; }
.ov-header .ov-title{ font-weight:800; flex:1; }
.ov-btn{ border:none; background:none; cursor:pointer; font-weight:700; font-size:.9rem; padding:.4rem .6rem; border-radius:8px; }
.ov-btn.primary{ background:var(--accent); color:#fff; }
.ov-btn.ghost{ color:var(--muted); }
.ov-body{ max-width:460px; margin:0 auto; width:100%; padding:1rem; }
.field{ display:flex; flex-direction:column; gap:.35rem; margin-bottom:.8rem; }
.field label{ font-size:.76rem; font-weight:700; color:var(--muted); }
.field input, .field textarea{ border:1px solid var(--line); border-radius:10px; padding:.7rem .8rem; font:inherit; background:#fff; }
.emoji-row{ display:flex; flex-wrap:wrap; gap:.4rem; }
.emoji-opt{ border:1px solid var(--line); background:#fff; border-radius:10px; width:2.4rem; height:2.4rem;
    font-size:1.2rem; cursor:pointer; }
.emoji-opt.sel{ border-color:var(--accent); background:var(--accent-tint); }
.ex-block{ border:1px solid var(--line); border-radius:var(--radius); padding:.8rem; margin-bottom:.7rem; background:#fff; }
.ex-top{ display:flex; gap:.5rem; align-items:center; margin-bottom:.5rem; }
.ex-top input{ flex:1; border:1px solid var(--line); border-radius:8px; padding:.5rem .6rem; font:inherit; }
.set-row{ display:flex; gap:.5rem; align-items:center; margin-bottom:.4rem; }
.set-row .set-idx{ width:1.4rem; color:var(--muted); font-size:.8rem; font-weight:700; }
.set-row input{ width:5rem; border:1px solid var(--line); border-radius:8px; padding:.45rem .5rem; font:inherit; }
.mini-btn{ border:1px solid var(--line); background:#fbfbfa; border-radius:8px; padding:.45rem .7rem;
    cursor:pointer; font-size:.8rem; font-weight:700; color:var(--muted); }
.mini-btn.danger{ color:#b91c1c; }
.field-err{ color:#b91c1c; font-size:.78rem; margin-top:.3rem; min-height:1rem; }
const EMOJI_CHOICES = ['🏋️','🌱','🌹','🧸','🐢','👊','🔥','💪','🦵','🏃','🧘','⚡'];
```

> 주의: 마지막 `const EMOJI_CHOICES` 줄은 CSS가 아니라 JS다. `<style>`이 아닌 `<script>` 데이터 영역(상수 정의부)에 넣는다. 나머지 위 블록만 `<style>`에 넣을 것.

- [ ] **Step 2: 편집기 오버레이 마크업 추가**

`</main>` 다음, 스크립트 앞에 추가:

```html
<div id="editor-ov" class="overlay">
    <div class="ov-header">
        <button class="ov-btn ghost" onclick="closeEditor()">취소</button>
        <span class="ov-title" id="editor-title">루틴 만들기</span>
        <button class="ov-btn primary" onclick="saveRoutine()">저장</button>
    </div>
    <div class="ov-body" id="editor-body"></div>
</div>
```

- [ ] **Step 3: 편집기 로직 구현(스텁 `openEditor` 교체)**

```javascript
let editorDraft = null;
function openEditor(id){
    const existing = id ? state.routines.find(function(r){ return r.id===id; }) : null;
    editorDraft = existing
        ? JSON.parse(JSON.stringify(existing))
        : { id: uid(), emoji:'🏋️', name:'', note:'', exercises:[] };
    document.getElementById('editor-title').textContent = existing ? '루틴 수정' : '루틴 만들기';
    renderEditor();
    document.getElementById('editor-ov').classList.add('on');
}
function closeEditor(){ document.getElementById('editor-ov').classList.remove('on'); editorDraft=null; }
function renderEditor(){
    const d = editorDraft;
    let h = '';
    h += '<div class="field"><label>이모지</label><div class="emoji-row">' +
        EMOJI_CHOICES.map(function(e){ return '<button type="button" class="emoji-opt' + (e===d.emoji?' sel':'') +
            '" onclick="editorSetEmoji(\'' + e + '\')">' + e + '</button>'; }).join('') + '</div></div>';
    h += '<div class="field"><label>루틴명</label><input id="ed-name" value="' + esc(d.name) +
        '" placeholder="예: 이두 루틴" oninput="editorDraft.name=this.value"></div>';
    h += '<div class="field"><label>설명(선택)</label><input id="ed-note" value="' + esc(d.note) +
        '" placeholder="간단한 메모" oninput="editorDraft.note=this.value"></div>';
    h += '<div id="ed-err" class="field-err"></div>';
    d.exercises.forEach(function(ex, i){
        h += '<div class="ex-block"><div class="ex-top">' +
            '<input value="' + esc(ex.name) + '" placeholder="운동명" oninput="editorDraft.exercises[' + i + '].name=this.value">' +
            '<button class="mini-btn danger" onclick="editorRemoveExercise(' + i + ')">삭제</button></div>';
        ex.sets.forEach(function(s, j){
            h += '<div class="set-row"><span class="set-idx">' + (j+1) + '</span>' +
                '<input type="number" min="0" value="' + s.weight + '" placeholder="kg" oninput="editorDraft.exercises[' + i + '].sets[' + j + '].weight=Number(this.value)">' +
                '<input type="number" min="0" value="' + s.reps + '" placeholder="회" oninput="editorDraft.exercises[' + i + '].sets[' + j + '].reps=Number(this.value)">' +
                '<button class="mini-btn danger" onclick="editorRemoveSet(' + i + ',' + j + ')">×</button></div>';
        });
        h += '<button class="mini-btn" onclick="editorAddSet(' + i + ')">＋ 세트</button></div>';
    });
    h += '<button class="mini-btn" onclick="editorAddExercise()">＋ 운동 추가</button>';
    document.getElementById('editor-body').innerHTML = h;
}
function editorSetEmoji(e){ editorDraft.emoji=e; renderEditor(); }
function editorAddExercise(){ editorDraft.exercises.push({ id:uid(), name:'', sets:[{weight:0,reps:0}] }); renderEditor(); }
function editorRemoveExercise(i){ editorDraft.exercises.splice(i,1); renderEditor(); }
function editorAddSet(i){ editorDraft.exercises[i].sets.push({weight:0,reps:0}); renderEditor(); }
function editorRemoveSet(i,j){ editorDraft.exercises[i].sets.splice(j,1); renderEditor(); }
function saveRoutine(){
    const d = editorDraft;
    if(!d.name.trim()){ document.getElementById('ed-err').textContent='루틴명을 입력해주세요.'; return; }
    if(!d.exercises.length){ document.getElementById('ed-err').textContent='운동을 하나 이상 추가해주세요.'; return; }
    d.name = d.name.trim();
    const idx = state.routines.findIndex(function(r){ return r.id===d.id; });
    if(idx>=0) state.routines[idx]=d; else state.routines.push(d);
    persist(); closeEditor(); render();
}
```

- [ ] **Step 4: 브라우저 검증**

Run: `npx serve . -l 8080` → workout.html
확인:
- `＋ 루틴 만들기` → 편집기 오버레이 열림.
- 이모지 선택 시 하이라이트 이동. 운동 추가 → 세트 추가 → 무게/횟수 입력.
- 루틴명 비우고 저장 → "루틴명을 입력해주세요." 인라인 에러(alert 아님).
- 정상 입력 후 저장 → 목록에 카드 표시, **새로고침 후에도 유지**(persist 확인).
- 다시 `⋮`는 Task 4 전이므로 콘솔 로그만.

- [ ] **Step 5: Commit**

```bash
git add workout.html
git commit -m "feat: 루틴 편집기 생성·수정 (RISE 재설계 3/8)"
```

---

## Task 4: 루틴 상세 + ⋮ 메뉴(수정/복제/삭제)

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.routines`, `persist()`, `render()`, `esc()`, `openEditor()`, `startWorkout()`
- Produces:
  - `openRoutineDetail(id): void` — 운동/세트 미리보기 오버레이 + `운동 시작`
  - `openRoutineMenu(id): void` — 인라인 액션 시트(수정/복제/삭제/닫기)
  - `duplicateRoutine(id): void`
  - `deleteRoutine(id): void` — 인라인 확인 후 삭제
  - HTML 오버레이: `#detail-ov`, `#sheet-ov`

- [ ] **Step 1: 상세/액션시트 CSS 추가**

```css
.detail-ex{ border:1px solid var(--line); border-radius:12px; padding:.7rem .8rem; margin-bottom:.5rem; background:#fff; }
.detail-ex .de-name{ font-weight:700; margin-bottom:.3rem; }
.detail-ex .de-sets{ color:var(--muted); font-size:.82rem; }
.start-cta{ position:sticky; bottom:0; padding:1rem 0; background:linear-gradient(transparent,var(--bg) 30%); }
.start-cta button{ width:100%; border:none; border-radius:var(--radius); padding:1rem; background:var(--accent);
    color:#fff; font-weight:800; font-size:1rem; cursor:pointer; }
.sheet-ov{ position:fixed; inset:0; z-index:120; background:rgba(0,0,0,.35); display:none; align-items:flex-end; justify-content:center; }
.sheet-ov.on{ display:flex; }
.sheet{ background:#fff; width:100%; max-width:460px; border-radius:16px 16px 0 0; padding:.6rem; }
.sheet button{ width:100%; border:none; background:none; padding:1rem; font-size:.95rem; font-weight:700;
    text-align:left; cursor:pointer; border-radius:10px; }
.sheet button:hover{ background:#f4f6f8; }
.sheet button.danger{ color:#b91c1c; }
.sheet .confirm-row{ display:flex; gap:.5rem; padding:.5rem; }
.sheet .confirm-row button{ text-align:center; border-radius:10px; }
.sheet .confirm-row .yes{ background:#b91c1c; color:#fff; }
```

- [ ] **Step 2: 상세/시트 마크업 추가(편집기 오버레이 옆)**

```html
<div id="detail-ov" class="overlay">
    <div class="ov-header">
        <button class="ov-btn ghost" onclick="document.getElementById('detail-ov').classList.remove('on')">← 닫기</button>
        <span class="ov-title" id="detail-title"></span>
    </div>
    <div class="ov-body" id="detail-body"></div>
</div>
<div id="sheet-ov" class="sheet-ov" onclick="if(event.target===this)this.classList.remove('on')">
    <div class="sheet" id="sheet-inner"></div>
</div>
```

- [ ] **Step 3: 로직 구현(스텁 교체)**

```javascript
function openRoutineDetail(id){
    const r = state.routines.find(function(x){ return x.id===id; });
    if(!r) return;
    document.getElementById('detail-title').textContent = r.emoji + ' ' + r.name;
    let h = '';
    if(r.note) h += '<p style="color:var(--muted);margin-bottom:.8rem;font-size:.86rem">' + esc(r.note) + '</p>';
    h += r.exercises.map(function(ex){
        const sets = ex.sets.map(function(s){ return s.weight + 'kg×' + s.reps; }).join('  ·  ');
        return '<div class="detail-ex"><div class="de-name">' + esc(ex.name) + '</div>' +
            '<div class="de-sets">' + (sets||'세트 없음') + '</div></div>';
    }).join('');
    h += '<div class="start-cta"><button onclick="startWorkout(\'' + r.id + '\')">▶ 운동 시작</button></div>';
    document.getElementById('detail-body').innerHTML = h;
    document.getElementById('detail-ov').classList.add('on');
}
function openRoutineMenu(id){
    const inner = document.getElementById('sheet-inner');
    inner.innerHTML =
        '<button onclick="closeSheet();openEditor(\'' + id + '\')">수정</button>' +
        '<button onclick="closeSheet();duplicateRoutine(\'' + id + '\')">복제</button>' +
        '<button class="danger" onclick="confirmDelete(\'' + id + '\')">삭제</button>' +
        '<button onclick="closeSheet()">닫기</button>';
    document.getElementById('sheet-ov').classList.add('on');
}
function closeSheet(){ document.getElementById('sheet-ov').classList.remove('on'); }
function confirmDelete(id){
    document.getElementById('sheet-inner').innerHTML =
        '<div style="padding:.8rem;font-weight:700">이 루틴을 삭제할까요?</div>' +
        '<div class="confirm-row"><button onclick="closeSheet()">취소</button>' +
        '<button class="yes" onclick="deleteRoutine(\'' + id + '\')">삭제</button></div>';
}
function duplicateRoutine(id){
    const r = state.routines.find(function(x){ return x.id===id; });
    if(!r) return;
    const copy = JSON.parse(JSON.stringify(r));
    copy.id = uid(); copy.name = r.name + ' (복사본)';
    state.routines.push(copy); persist(); render();
}
function deleteRoutine(id){
    state.routines = state.routines.filter(function(x){ return x.id!==id; });
    persist(); closeSheet(); render();
}
```

- [ ] **Step 4: 브라우저 검증**

확인:
- 카드 클릭 → 상세 오버레이(운동·세트 미리보기 + 운동 시작 버튼).
- `⋮` → 액션 시트. 수정 → 편집기 열림. 복제 → "(복사본)" 카드 추가·유지.
- 삭제 → "삭제할까요?" 인라인 확인(confirm 아님) → 삭제 후 목록 갱신·유지.
- `운동 시작`은 Task 5 전이므로 콘솔 로그.

- [ ] **Step 5: Commit**

```bash
git add workout.html
git commit -m "feat: 루틴 상세·액션 메뉴(수정/복제/삭제) (RISE 재설계 4/8)"
```

---

## Task 5: 운동 모드 오버레이 (실행·세트 체크·타이머·저장)

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.routines`, `state.logs`, `persist()`, `render()`, `esc()`, `uid()`
- Produces:
  - `startWorkout(routineId|null): void` — `workoutSession` 초기화 후 오버레이. null=자유 운동
  - `workoutSession` (전역) — `{routineId, emoji, name, startMs, exercises:[{name,sets:[{weight,reps,done}]}]}`
  - `toggleSet(i,j)`, `workoutEditSet(i,j,field,val)`, `workoutAddExercise()`, `workoutAddSet(i)`
  - `finishWorkout(): void` — done 세트 집계, `logs`에 저장, 오버레이 닫고 기록 탭으로
  - `cancelWorkout(): void` — 인라인 확인 후 종료(저장 안 함)
  - `tickTimer(): void` — 경과 시간 갱신(1s interval)
  - HTML 오버레이: `#workout-ov`

- [ ] **Step 1: 운동 모드 CSS 추가**

```css
.wo-timer{ font-variant-numeric:tabular-nums; font-weight:800; color:var(--accent-dark); }
.wo-ex{ border:1px solid var(--line); border-radius:var(--radius); padding:.8rem; margin-bottom:.7rem; background:#fff; }
.wo-ex .we-name{ font-weight:700; margin-bottom:.5rem; }
.wo-set{ display:flex; gap:.5rem; align-items:center; margin-bottom:.4rem; }
.wo-set .s-idx{ width:1.4rem; color:var(--muted); font-size:.8rem; font-weight:700; }
.wo-set input{ width:4.5rem; border:1px solid var(--line); border-radius:8px; padding:.45rem .5rem; font:inherit; }
.wo-set .s-unit{ color:var(--muted); font-size:.78rem; }
.wo-check{ margin-left:auto; width:2rem; height:2rem; border-radius:8px; border:1px solid var(--line);
    background:#fff; cursor:pointer; font-size:1rem; }
.wo-set.done .wo-check{ background:var(--accent); border-color:var(--accent); color:#fff; }
.wo-set.done input{ opacity:.55; }
.wo-finish{ position:sticky; bottom:0; padding:1rem 0; background:linear-gradient(transparent,var(--bg) 30%); display:flex; gap:.5rem; }
.wo-finish button{ flex:1; border:none; border-radius:var(--radius); padding:1rem; font-weight:800; cursor:pointer; }
.wo-finish .end{ background:var(--accent); color:#fff; }
.wo-finish .cancel{ background:#fff; border:1px solid var(--line); color:var(--muted); }
```

- [ ] **Step 2: 운동 모드 마크업 추가**

```html
<div id="workout-ov" class="overlay">
    <div class="ov-header">
        <span class="ov-title" id="wo-title"></span>
        <span class="wo-timer" id="wo-timer">00:00</span>
    </div>
    <div class="ov-body" id="wo-body"></div>
</div>
```

- [ ] **Step 3: 운동 모드 로직 구현(스텁 `startWorkout` 교체)**

```javascript
let workoutSession = null;
let workoutTimer = null;
function startWorkout(routineId){
    const r = routineId ? state.routines.find(function(x){ return x.id===routineId; }) : null;
    workoutSession = {
        routineId: routineId || null,
        emoji: r ? r.emoji : '⚡',
        name: r ? r.name : '자유 운동',
        startMs: Date.now(),
        exercises: r ? r.exercises.map(function(ex){
            return { name: ex.name, sets: ex.sets.map(function(s){ return {weight:s.weight, reps:s.reps, done:false}; }) };
        }) : []
    };
    document.getElementById('detail-ov').classList.remove('on');
    document.getElementById('wo-title').textContent = workoutSession.emoji + ' ' + workoutSession.name;
    renderWorkout();
    document.getElementById('workout-ov').classList.add('on');
    if(workoutTimer) clearInterval(workoutTimer);
    workoutTimer = setInterval(tickTimer, 1000); tickTimer();
}
function tickTimer(){
    if(!workoutSession) return;
    const sec = Math.floor((Date.now()-workoutSession.startMs)/1000);
    const mm = String(Math.floor(sec/60)).padStart(2,'0'), ss = String(sec%60).padStart(2,'0');
    document.getElementById('wo-timer').textContent = mm + ':' + ss;
}
function renderWorkout(){
    let h = '';
    workoutSession.exercises.forEach(function(ex, i){
        h += '<div class="wo-ex"><div class="we-name">' +
            '<input value="' + esc(ex.name) + '" placeholder="운동명" style="border:none;font:inherit;font-weight:700;width:100%" oninput="workoutSession.exercises[' + i + '].name=this.value"></div>';
        ex.sets.forEach(function(s, j){
            h += '<div class="wo-set' + (s.done?' done':'') + '"><span class="s-idx">' + (j+1) + '</span>' +
                '<input type="number" min="0" value="' + s.weight + '" oninput="workoutEditSet(' + i + ',' + j + ',\'weight\',this.value)"><span class="s-unit">kg</span>' +
                '<input type="number" min="0" value="' + s.reps + '" oninput="workoutEditSet(' + i + ',' + j + ',\'reps\',this.value)"><span class="s-unit">회</span>' +
                '<button class="wo-check" onclick="toggleSet(' + i + ',' + j + ')">' + (s.done?'✓':'') + '</button></div>';
        });
        h += '<button class="mini-btn" onclick="workoutAddSet(' + i + ')">＋ 세트</button></div>';
    });
    h += '<button class="mini-btn" onclick="workoutAddExercise()">＋ 운동 추가</button>';
    h += '<div class="wo-finish"><button class="cancel" onclick="cancelWorkout()">취소</button>' +
         '<button class="end" onclick="finishWorkout()">운동 종료</button></div>';
    document.getElementById('wo-body').innerHTML = h;
}
function toggleSet(i,j){ const s=workoutSession.exercises[i].sets[j]; s.done=!s.done; renderWorkout(); }
function workoutEditSet(i,j,field,val){ workoutSession.exercises[i].sets[j][field]=Number(val); }
function workoutAddSet(i){ workoutSession.exercises[i].sets.push({weight:0,reps:0,done:false}); renderWorkout(); }
function workoutAddExercise(){ workoutSession.exercises.push({name:'', sets:[{weight:0,reps:0,done:false}]}); renderWorkout(); }
function closeWorkout(){
    document.getElementById('workout-ov').classList.remove('on');
    if(workoutTimer){ clearInterval(workoutTimer); workoutTimer=null; }
    workoutSession=null;
}
function cancelWorkout(){
    const anyDone = workoutSession.exercises.some(function(ex){ return ex.sets.some(function(s){ return s.done; }); });
    if(anyDone && !document.getElementById('wo-confirm')){
        const bar = document.querySelector('.wo-finish');
        bar.insertAdjacentHTML('beforebegin',
            '<div id="wo-confirm" style="background:#fff;border:1px solid var(--line);border-radius:12px;padding:.8rem;margin-bottom:.6rem">' +
            '기록하지 않고 종료할까요?<div class="confirm-row" style="display:flex;gap:.5rem;margin-top:.6rem">' +
            '<button class="mini-btn" onclick="document.getElementById(\'wo-confirm\').remove()">계속</button>' +
            '<button class="mini-btn danger" onclick="closeWorkout()">종료</button></div></div>');
        return;
    }
    closeWorkout();
}
function finishWorkout(){
    const doneEx = workoutSession.exercises
        .map(function(ex){ return { name: ex.name.trim()||'운동', sets: ex.sets.filter(function(s){ return s.done; }) }; })
        .filter(function(ex){ return ex.sets.length; });
    const durationMin = Math.max(1, Math.round((Date.now()-workoutSession.startMs)/60000));
    state.logs.push({
        id: uid(), date: new Date().toISOString(), routineId: workoutSession.routineId,
        emoji: workoutSession.emoji, name: workoutSession.name,
        exercises: doneEx, durationMin: durationMin, note: ''
    });
    persist(); closeWorkout(); switchTab('history');
}
```

- [ ] **Step 4: 브라우저 검증**

확인:
- 루틴 상세 → `운동 시작` → 운동 모드 오버레이, 타이머 00:00부터 증가.
- 세트 `✓` 토글 시 done 스타일. 무게/횟수 수정 가능. 운동/세트 추가 가능.
- 자유 운동 시작 → 빈 상태에서 운동 추가·세트 체크 가능.
- `취소`: done 세트 있으면 인라인 확인 → 종료 시 기록 안 남음.
- `운동 종료` → 기록 탭으로 전환(다음 Task에서 목록 표시). `state.logs`에 push되고 새로고침 유지.

- [ ] **Step 5: Commit**

```bash
git add workout.html
git commit -m "feat: 운동 모드(세트 체크·타이머·기록 저장) (RISE 재설계 5/8)"
```

---

## Task 6: 기록 탭 (로그 리스트 + 주간 스트립)

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.logs`, `esc()`, `DAY_LABELS`
- Produces:
  - `renderHistory(): void`
  - `sessionVolume(log): number` — Σ(weight×reps) over log.exercises[].sets
  - `weekStart(date): Date` — 해당 주 일요일 00:00
  - `weekStripHTML(): string` — 이번 주 7칸(●=로그 있음 / ○ 없음)

- [ ] **Step 1: 기록 CSS 추가**

```css
.week-strip{ display:flex; gap:.4rem; margin-bottom:1rem; }
.week-day{ flex:1; text-align:center; border:1px solid var(--line); border-radius:10px; padding:.6rem .2rem; background:#fff; }
.week-day.done{ background:var(--accent-tint); border-color:var(--accent); }
.week-day .dow{ font-size:.68rem; color:var(--muted); font-weight:700; margin-bottom:.2rem; }
.week-day .mark{ font-weight:800; }
.log-card{ background:var(--card); border:1px solid var(--line); border-radius:var(--radius); box-shadow:var(--shadow);
    padding:.9rem 1rem; margin-bottom:.6rem; }
.log-top{ display:flex; align-items:center; gap:.5rem; }
.log-top .emoji{ font-size:1.2rem; }
.log-top .lg-name{ font-weight:700; flex:1; }
.log-top .lg-date{ color:var(--muted); font-size:.76rem; }
.log-meta{ color:var(--muted); font-size:.8rem; margin-top:.35rem; }
```

- [ ] **Step 2: 로직 구현(스텁 `renderHistory` 교체)**

```javascript
function sessionVolume(log){
    return log.exercises.reduce(function(a,ex){
        return a + ex.sets.reduce(function(b,s){ return b + (Number(s.weight)||0)*(Number(s.reps)||0); }, 0);
    }, 0);
}
function weekStart(date){ const d=new Date(date); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); return d; }
function weekStripHTML(){
    const start = weekStart(new Date());
    let h = '<div class="week-strip">';
    for(let i=0;i<7;i++){
        const day = new Date(start); day.setDate(start.getDate()+i);
        const key = day.getFullYear()+'-'+String(day.getMonth()+1).padStart(2,'0')+'-'+String(day.getDate()).padStart(2,'0');
        const has = state.logs.some(function(l){ return l.date.slice(0,10)===key; });
        h += '<div class="week-day' + (has?' done':'') + '"><div class="dow">' + DAY_LABELS[day.getDay()] +
            '</div><div class="mark">' + (has?'●':'○') + '</div></div>';
    }
    return h + '</div>';
}
function renderHistory(){
    const el = document.getElementById('tab-history');
    let h = '<h1 class="panel-title">기록</h1>' + weekStripHTML();
    const logs = state.logs.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    if(!logs.length){ h += '<div class="empty">아직 완료한 운동이 없어요.<br>루틴 탭에서 운동을 시작해보세요.</div>'; }
    else {
        h += logs.map(function(l){
            const setCount = l.exercises.reduce(function(a,ex){ return a+ex.sets.length; }, 0);
            return '<div class="log-card"><div class="log-top"><span class="emoji">' + esc(l.emoji||'🏋️') +
                '</span><span class="lg-name">' + esc(l.name) + '</span><span class="lg-date">' + esc(l.date.slice(0,10)) +
                '</span></div><div class="log-meta">볼륨 ' + sessionVolume(l).toLocaleString() + 'kg · ' +
                l.durationMin + '분 · ' + setCount + '세트</div></div>';
        }).join('');
    }
    el.innerHTML = h;
}
```

- [ ] **Step 3: 브라우저 검증**

확인:
- Task 5에서 종료한 운동이 기록 탭에 카드로 나타남(볼륨·시간·세트수).
- 이번 주 요일 스트립에 오늘이 ●.
- 로그 없을 때 빈 상태 안내.
- 마이그레이션 검증: 콘솔에서 레거시 주입 후 새 키 삭제·리로드로 이관 확인:
  ```js
  localStorage.setItem('fg-workout-dashboard', JSON.stringify({sessions:[{name:'옛 상체',category:'상체',minutes:40,intensity:'보통',note:'test',date:new Date().toISOString()}],checks:{}}));
  localStorage.removeItem('fg-workout-v2'); location.reload();
  ```
  → 기록 탭에 "옛 상체 · 40분" 로그가 보이면 마이그레이션 정상.

- [ ] **Step 4: Commit**

```bash
git add workout.html
git commit -m "feat: 기록 탭(로그 리스트·주간 스트립·레거시 이관) (RISE 재설계 6/8)"
```

---

## Task 7: 통계 탭 (요약 타일 + 볼륨 차트 + PR)

**Files:**
- Modify: `workout.html`

**Interfaces:**
- Consumes: `state.logs`, `sessionVolume()`, `weekStart()`
- Produces:
  - `renderStats(): void`
  - `weekLogs(): Array` — 이번 주 로그
  - `streak(): number` — 오늘 기준 연속 운동 일수
  - `topRoutine(): string` — 최다 name
  - `prByExercise(): Array<{name, weight}>` — 운동별 최고 무게 상위 5
  - `drawVolumeChart(): void` — 최근 8주 볼륨 막대(canvas 2D)
  - HTML: `#volChart` canvas

- [ ] **Step 1: 통계 CSS 추가**

```css
.stat-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:.6rem; margin-bottom:1rem; }
.stat-tile{ background:var(--card); border:1px solid var(--line); border-radius:var(--radius); box-shadow:var(--shadow); padding:.9rem 1rem; }
.stat-tile .st-label{ color:var(--muted); font-size:.72rem; font-weight:700; letter-spacing:.03em; }
.stat-tile .st-value{ font-size:1.5rem; font-weight:800; letter-spacing:-.02em; margin-top:.3rem; }
.chart-card{ background:var(--card); border:1px solid var(--line); border-radius:var(--radius); box-shadow:var(--shadow); padding:1rem; margin-bottom:1rem; }
.chart-card .cc-title{ font-weight:700; margin-bottom:.6rem; font-size:.9rem; }
.chart-card canvas{ width:100%; height:160px; display:block; }
.pr-row{ display:flex; justify-content:space-between; padding:.5rem 0; border-bottom:1px solid var(--line); font-size:.86rem; }
.pr-row:last-child{ border-bottom:none; }
.pr-row .pr-w{ font-weight:800; color:var(--accent-dark); }
@media (min-width:900px){ .stat-grid{ grid-template-columns:repeat(4,1fr); } }
```

- [ ] **Step 2: 로직 + 차트 구현(스텁 `renderStats` 교체)**

```javascript
function weekLogs(){
    const start = weekStart(new Date()), end = new Date(start); end.setDate(start.getDate()+7);
    return state.logs.filter(function(l){ const d=new Date(l.date); return d>=start && d<end; });
}
function streak(){
    const days = Array.from(new Set(state.logs.map(function(l){ return l.date.slice(0,10); }))).sort().reverse();
    if(!days.length) return 0;
    let count=0; const cur=new Date(); cur.setHours(0,0,0,0);
    while(true){
        const key = cur.getFullYear()+'-'+String(cur.getMonth()+1).padStart(2,'0')+'-'+String(cur.getDate()).padStart(2,'0');
        if(days.indexOf(key)===-1) break;
        count++; cur.setDate(cur.getDate()-1);
    }
    return count;
}
function topRoutine(){
    const freq={}; state.logs.forEach(function(l){ freq[l.name]=(freq[l.name]||0)+1; });
    const keys=Object.keys(freq); if(!keys.length) return '-';
    return keys.sort(function(a,b){ return freq[b]-freq[a]; })[0];
}
function prByExercise(){
    const best={};
    state.logs.forEach(function(l){ l.exercises.forEach(function(ex){ ex.sets.forEach(function(s){
        const w=Number(s.weight)||0; if(!best[ex.name] || w>best[ex.name]) best[ex.name]=w;
    }); }); });
    return Object.keys(best).map(function(n){ return {name:n, weight:best[n]}; })
        .filter(function(p){ return p.weight>0; })
        .sort(function(a,b){ return b.weight-a.weight; }).slice(0,5);
}
function renderStats(){
    const el = document.getElementById('tab-stats');
    const wl = weekLogs();
    const weekVol = wl.reduce(function(a,l){ return a+sessionVolume(l); }, 0);
    const weekMin = wl.reduce(function(a,l){ return a+(l.durationMin||0); }, 0);
    let h = '<h1 class="panel-title">통계</h1>';
    h += '<div class="stat-grid">' +
        '<div class="stat-tile"><div class="st-label">THIS WEEK 볼륨</div><div class="st-value">' + weekVol.toLocaleString() + '<span style="font-size:.9rem">kg</span></div></div>' +
        '<div class="stat-tile"><div class="st-label">THIS WEEK 시간</div><div class="st-value">' + weekMin + '<span style="font-size:.9rem">분</span></div></div>' +
        '<div class="stat-tile"><div class="st-label">STREAK</div><div class="st-value">' + streak() + '<span style="font-size:.9rem">일</span></div></div>' +
        '<div class="stat-tile"><div class="st-label">최다 루틴</div><div class="st-value" style="font-size:1.05rem">' + esc(topRoutine()) + '</div></div>' +
        '</div>';
    h += '<div class="chart-card"><div class="cc-title">최근 8주 볼륨</div><canvas id="volChart"></canvas></div>';
    const prs = prByExercise();
    if(prs.length){
        h += '<div class="chart-card"><div class="cc-title">개인 기록(PR)</div>' +
            prs.map(function(p){ return '<div class="pr-row"><span>' + esc(p.name) + '</span><span class="pr-w">' + p.weight + 'kg</span></div>'; }).join('') +
            '</div>';
    }
    el.innerHTML = h;
    requestAnimationFrame(drawVolumeChart);
}
function drawVolumeChart(){
    const cv = document.getElementById('volChart'); if(!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, hgt = cv.clientHeight;
    cv.width = w*dpr; cv.height = hgt*dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr,dpr); ctx.clearRect(0,0,w,hgt);
    // 최근 8주 버킷
    const weeks=[]; const cur=weekStart(new Date());
    for(let i=7;i>=0;i--){ const s=new Date(cur); s.setDate(cur.getDate()-i*7); weeks.push(s); }
    const vols = weeks.map(function(ws){
        const we=new Date(ws); we.setDate(ws.getDate()+7);
        return state.logs.filter(function(l){ const d=new Date(l.date); return d>=ws && d<we; })
            .reduce(function(a,l){ return a+sessionVolume(l); }, 0);
    });
    const max = Math.max(1, Math.max.apply(null, vols));
    const pad=8, gap=8, bw=(w-pad*2-gap*7)/8;
    vols.forEach(function(v,i){
        const bh=(hgt-pad*2)*(v/max);
        const x=pad+i*(bw+gap), y=hgt-pad-bh;
        ctx.fillStyle = i===7 ? '#10b981' : 'rgba(16,185,129,0.35)';
        ctx.beginPath();
        if(ctx.roundRect) ctx.roundRect(x,y,bw,bh,4); else ctx.rect(x,y,bw,bh);
        ctx.fill();
    });
}
window.addEventListener('resize', function(){ if(activeTab==='stats') drawVolumeChart(); });
```

- [ ] **Step 3: 브라우저 검증**

확인:
- 통계 탭에 4개 타일(볼륨/시간/스트릭/최다 루틴).
- "최근 8주 볼륨" 막대차트 렌더(마지막 주 진한 색). 창 리사이즈 시 다시 그림.
- 기록이 있으면 PR 목록(운동별 최고 무게 상위 5).
- 기록 없을 때 값 0/− 및 빈 차트라도 콘솔 에러 없음.

- [ ] **Step 4: Commit**

```bash
git add workout.html
git commit -m "feat: 통계 탭(요약 타일·볼륨 차트·PR) (RISE 재설계 7/8)"
```

---

## Task 8: 배포/문서 마무리 (sw.js · CLAUDE.md · AGENTS.md)

**Files:**
- Modify: `sw.js`
- Modify: `CLAUDE.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: 없음(문서/캐시)
- Produces: 캐시 무효화 + 갱신된 문서

- [ ] **Step 1: `sw.js` 캐시 범프**

`sw.js`에서 `const CACHE_NAME = 'fg-cache-v9';`을 `'fg-cache-v10';`으로 변경. `PRECACHE`에 `/workout.html`이 이미 있으면 그대로, 없으면 배열에 `'/workout.html'` 추가.

Run(확인): `grep -n "fg-cache" sw.js` → `fg-cache-v10` 출력.

- [ ] **Step 2: `CLAUDE.md` Workout 섹션 재작성**

`### Workout (workout.html)` 섹션 본문을 새 구조로 교체:
- `localStorage('fg-workout-v2')`에 `{routines, logs}` 저장.
- 3탭(루틴/기록/통계) + 운동 모드 풀스크린 오버레이.
- 루틴=운동 목록, 운동=세트별 무게·횟수. logs에서 볼륨/스트릭/PR 파생.
- 레거시 `fg-workout-dashboard` → `fg-workout-v2` 1회 마이그레이션(원본 백업 유지).
- 라이트 전용, 에메랄드 액센트, 반응형(모바일 하단 탭바 / 데스크톱 상단 탭).

그리고 "localStorage key map" 표에서 `fg-workout` 행을 `fg-workout-v2 | workout.html | {routines, logs}` 로 수정하고, 필요 시 `fg-workout-dashboard`(레거시·백업) 주석 행 추가.

- [ ] **Step 3: `AGENTS.md` 동기화**

`AGENTS.md`에 workout / localStorage 관련 언급이 있으면 Step 2와 동일하게 갱신. 없으면 변경 없음(그대로 둠).

- [ ] **Step 4: 전체 회귀 검증**

Run: `npx serve . -l 8080`
확인:
- `workout.html`: 루틴 생성→운동 실행→기록→통계 전체 플로우 무사.
- 다른 페이지에서 workout 링크 이동 및 뒤로가기 정상(페이지 전환 오버레이 `.app-header` 셀렉터 반영).
- 콘솔 에러 없음. 하드 리프레시(캐시 v10) 후에도 정상.

- [ ] **Step 5: Commit**

```bash
git add sw.js CLAUDE.md AGENTS.md
git commit -m "chore: SW 캐시 v10 범프·문서 갱신(workout 재설계) (RISE 재설계 8/8)"
```

---

## Self-Review 결과

- **스펙 커버리지**: 데이터 모델(T1) / 마이그레이션(T1·검증 T6) / 3탭(T1) / 루틴 목록·빈상태(T2) / 편집기(T3) / 상세·메뉴(T4) / 운동 모드·세트·타이머(T5) / 기록·주간스트립(T6) / 통계·볼륨차트·PR(T7) / 라이트톤·반응형(T1 CSS 전반) / alert 제거·esc(T3·T5 전반) / sw.js·CLAUDE.md·AGENTS.md(T8) — 스펙 전 항목 대응됨.
- **플레이스홀더**: 각 스텁은 후속 Task에서 교체되는 명시적 임시 함수이며 최종 상태엔 남지 않음(교체 지시 포함). "implement later"류 없음.
- **타입/이름 일관성**: `sessionVolume`, `weekStart`, `startWorkout`, `finishWorkout`, `renderRoutines/renderHistory/renderStats`, `openEditor`, `openRoutineDetail`, `openRoutineMenu`, `state.routines/state.logs` 명칭이 전 Task에서 일치. 상태 저장 키 `fg-workout-v2` 전 구간 통일.
