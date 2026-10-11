# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Tool
When spawning subagents via the Agent tool, always set `model: "haiku"` unless the task explicitly requires a more capable model.

## Running the app

No build step, no package manager — all files are static HTML.

```bash
# If Node is available (recommended)
npx serve . -l 8080

# If Python is available
python -m http.server 8080
```

Open `http://localhost:8080` in a browser.

There is no test suite, linter, or CI. Verification is manual: serve the repo, open the affected page at desktop and mobile widths, and check the browser console. For pages with persisted state, also reload once to confirm the `localStorage` round-trip still works.

Two things that make local edits look like they did nothing:
- A service worker registered by an earlier visit to `fear-greed.html` on the same origin will keep serving precached pages on `localhost`. If a change doesn't show up, check **Application → Service Workers** and tick *Update on reload* (or unregister).
- `/api/proxy` and `/api/real-estate` are Vercel serverless functions and **do not exist** under a plain static server — any page that fetches through them will fall back to its error/mock path locally. Use `vercel dev` if you need the API paths to actually run.

## Architecture

This is a **multi-page portfolio hub**. Each page is a self-contained HTML file (no modules, no bundler). All logic, styles, and markup are inline per file.

| File | Purpose |
|---|---|
| `index.html` | 이직용 포트폴리오 랜딩 — 5-섹션 스크롤 스냅, Hero·Career·Skills·Projects·Contact |
| `fear-greed.html` | CNN Fear & Greed Index app (main app) |
| `fg.html` | 공포탐욕 모바일 앱 — 시장·환율·게이지만 떼어낸 PWA (자체 `fg-manifest.json` + `fg-icon*` 아이콘(계기판 디자인), 라이트=가을 노을 카페 톤·다크 토글, `?gauge`는 게이지만 표시, noindex) |
| `finance.html` | 금융 도구 통합 허브 — 4 tabs: backtest, compound, goal, journal |
| `asset.html` | Redirect stub → `/finance.html?tab=compound` |
| `compound.html` | Redirect stub → `/finance.html?tab=compound` |
| `goal.html` | Redirect stub → `/finance.html?tab=goal` |
| `journal.html` | Redirect stub → `/finance.html?tab=journal` |
| `backtest.html` | Redirect stub → `/finance.html?tab=backtest` |
| `workout.html` | 운동 트래커 — RISE 스타일, 루틴/기록/통계 3탭 + 운동 모드 |
| `agents.html` | AI 에이전트 부동산 조회 (Seoul map real estate search) |
| `commerce.html` | 커머스 시스템 — OMS+WMS+PLM, React CDN + Context API, 단일 HTML |
| `disaster.html` | 재난 대응 시뮬레이터 — 대피소 지도, 재난문자 시뮬레이션, 경보·경로 |
| `Certificate.html` | 정보처리기사 문제풀이 — 퀴즈 앱, 다크/라이트 토글, 문항 데이터 인라인(1줄 ~853 KB) |
| `portfolio_tracker.html` | 개인 주식 포트폴리오 트래커 — 비밀번호 게이트, 스냅샷 기반 수익률 추적 |
| `casestudy.html` | 기획 케이스 스터디 갤러리 — 카드 그리드, 각 케이스 상세 페이지로 링크 |
| `casestudy-commerce.html` | 커머스 시스템 기획 케이스 스터디 상세 |
| `casestudy-feargreed.html` | 공포탐욕지수 기획 케이스 스터디 상세 |
| `casestudy-disaster.html` | 재난 대응 시뮬레이터 기획 케이스 스터디 상세 |
| `casestudy-asset.html` | 자산 계산기 기획 케이스 스터디 상세 |
| `casestudy-backtest.html` | 백테스트 비교기 기획 케이스 스터디 상세 |

Each HTML file is structured: `<head>` (font import + inline `<style>`) → `<body>` (markup) → `<script>` (all app logic).

### Third-party libraries (CDN only)

There is no `package.json` and nothing is vendored — every library is a `<script src>` from a CDN, so a version bump is a one-line edit in the page that uses it. Which page pulls what:

| Library | Pages | Notes |
|---|---|---|
| Chart.js 4 (+ `chartjs-adapter-date-fns@3`) | `fear-greed.html` (Indicators tab), `finance.html` | Lazy-loaded on first tab click in `fear-greed.html` |
| Leaflet 1.9.4 (JS + CSS) | `agents.html`, `disaster.html` | OpenStreetMap raster tiles, no API key |
| React 18.3.1 UMD + ReactDOM + `@babel/standalone` | `commerce.html` | JSX is compiled **in the browser** — the two app scripts are `type="text/babel"` |
| flatpickr | `finance.html`, `casestudy-backtest.html` | Date inputs |

`index.html`, `workout.html`, `portfolio_tracker.html`, `Certificate.html`, and the case-study pages have **zero** JS dependencies — their charts are hand-rolled canvas 2D. Keep it that way unless there's a reason not to.

### Adding a new page — cross-file checklist

Nothing wires pages together automatically. A new page is only "done" once every one of these is updated:

1. `sw.js` — add the path to `PRECACHE` **and** bump `CACHE_NAME` (`fg-cache-vN` → `vN+1`). Skipping the bump means the old cache survives `activate` and users keep getting the previous build.
2. `sitemap.xml` — add a `<url>` entry (public pages only).
3. `robots.txt` — add a `Disallow` line if the page is private.
4. `index.html` — add a `.project-card` to `#projects`, plus a thumbnail at `assets/thumbs/thumb-<slug>.webp`.
5. `casestudy.html` — add a `.cs-card` if the page gets a case study, and create `casestudy-<slug>.html` from an existing detail page.
6. `api/proxy.js` — if the page fetches a new upstream domain, add its prefix to `ALLOWED`.

Current coverage gaps that are intentional, not oversights: `Certificate.html` and `agents.html` are in `sitemap.xml` but are **not** linked from `index.html`; `portfolio_tracker.html` is linked from `index.html` but excluded from both `sitemap.xml` and `PRECACHE`.

### Portfolio Landing (`index.html`)

이직용 단일 페이지 스크롤 포트폴리오. 폰트: **Plus Jakarta Sans** (body) + **JetBrains Mono** (numbers/code). 다크/라이트 토글: `data-theme` on `<html>`, `localStorage('hub-theme')`, 기본 라이트.

**디자인 언어 — 설계 도면(2026-09 개편)**: 페이지 전체가 한 장의 도면이다. `html`이 26px 격자 배경(`--grid`)을 깔고, 각 섹션이 `::before`로 좌측 척추선을 그리며, 섹션 라벨(`.s-label`)이 그 선 위에 노드 점으로 얹힌다. 카드류는 모두 각진 모서리 + `--border-2` 실선. **세 값은 한 몸이다** — 격자 26px / `.section__inner`의 `padding-left: 46px` / `.section::before`의 `left: max(3rem, calc(50% - 563px))`. 하나만 바꾸면 노드 점이 척추선에서 떨어진다.

**섹션 구조** (`scroll-snap-type: y proximity`):
1. `#hero` — `.hero-frame`(코너 틱 4개)로 감싼 2-column (left: 이름·도메인·치수선·철학·CTA / right: 스탯). 스탯은 균등 4개가 아니라 `.stat-lead`(6년) 하나 + `.stat-row` 셋. 카운터는 접미사를 `<span>`에서만 읽으므로 `60<span>+</span>` 형태를 유지할 것.
2. `#career` — flex 2-column + 가운데 `.career-conn`(SM→SI 화살표), 아래 `.career-span` 치수선. `.career-card:first-child/:last-child`가 좌/우 슬라이드 리빌을 잡으므로 연결선은 반드시 두 카드 **사이**에 둘 것.
3. `#skills` — 3-col skill card grid, 각 카드에 `S-01`~`S-06` 인덱스 + `.skill-card__mark`(주력/차별점). 카드 진입 시 내부 태그 stagger(`--i` CSS variable).
4. `#projects` — 6개 프로젝트 카드, `section--free`. 3열 격자에서 **첫 카드만 `.project-card--lead`로 2열×2행**(대표작 배지 + 큰 썸네일), 2·3번째 카드는 썸네일을 `16/7`로 눌러 1·2행 높이를 잡는다 — 이 둘을 `16/10`으로 되돌리면 2행을 걸친 대표작 썸네일이 800px 넘게 자란다. ≤900px에서는 대표작이 전체 폭, 나머지는 균등. 카드는 `<div class="project-card">`(중첩 앵커 방지를 위해 `<a>`에서 변경), 상단 썸네일(`assets/thumbs/thumb-<slug>.webp`, slug: feargreed/commerce/finance/disaster/workout/pt, 16:10 cover, lazy) + 3px 컬러 strip + 푸터 `Live ↗ · 케이스 스터디 →` 2링크(케이스 스터디는 4개 카드만: feargreed/commerce/backtest/disaster), 3D tilt 유지. 섹션 부제: casestudy.html 갤러리로 링크. **썸네일 재캡처**: 프로덕션(imgh-one.vercel.app)에서 라이트 테마·1280×800 캡처 → sharp `.resize(1280,800,{fit:'cover',position:'top'}).webp({quality:80})` → `assets/thumbs/` (Node 18은 sharp@0.32 필요).
5. `#contact` — 2-col (left: 링크 목록 / right: `.contact-card` = 도면 표제란, 라벨 칸 + 값 칸의 행 테이블, ≤900px 숨김).

**고정 UI**: `.titleblock`(상단 고정 표제란 — 이름·직무·지역·재직 상태. 히어로에서 같은 정보를 반복하지 말 것), `.theme-toggle`(표제란 아래, `top: 4rem`), `.dot-nav`(right side, 5 dots), `#cursorDot`+`#cursorRing`(custom cursor, desktop only), `.perf-widget`(bottom-right).

**성능 모니터링 위젯** (`.perf-widget`): fixed bottom-right ⚡ badge (`#perfBadge`) showing a live score; click toggles `#perfPanel`. All measurement via `PerformanceObserver` wrapped in `safeObserve()` (silently skips unsupported entry types). Panel sections: Core Web Vitals chips (LCP/CLS/INP — INP observer uses `durationThreshold: 40`), loading metrics (FCP/TTFB/DCL from the navigation entry on `load`), runtime (FPS via rAF loop with 250ms windows — the rAF loop and a 1s `renderPanel()` interval run only while the panel is open; Long Task count + TBT = Σ max(0, duration−50)), and resource timing (top-5 slowest by duration + per-type CSS/JS/img/etc totals; resource names inserted via `textContent`, not innerHTML — keep it that way). Score formula: `LCP×0.4 + CLS×0.3 + INP×0.3`, each scored 100→0 linearly across Google's good/poor thresholds (2500/4000ms, 0.1/0.25, 200/500ms). Badge bands: ≥90 good, ≥50 mid, else poor (`data-band` attribute drives color).

**스크롤 리빌 시스템**: `[data-reveal]` 속성 요소에 `IntersectionObserver`로 `.revealed` 클래스 추가. `--reveal-delay` CSS 변수로 stagger 제어. `.career-card`는 좌/우 slideIn, `.skill-card.revealed`는 내부 태그 stagger.

**모바일(≤768px)**: `scroll-snap-type` 해제, 모든 섹션 `min-height:100vh` 강제. 척추선(`.section::before`)과 `.section__inner`의 padding-left를 끄고 FIG 라벨의 노드 점만 남긴다. `.career-conn`은 세로 화살표로 전환. 표제란은 지역·`SI 고도화`를 감춘다. dot-nav 숨김, custom cursor 숨김, 3D tilt 비활성.

**구조 및 스타일**: `.section__inner` max-width는 1126px(콘텐츠 1080 + 척추선 여백 46). 스킬 태그 위계: `.tag--core`(그린 틴트, 6개 핵심 태그). 스킬 헤더·contact 아이콘은 인라인 스트로크 SVG(24×24 viewBox, `currentColor`).

### Finance Hub (`finance.html`)

Integrated hub combining four financial tools into one page with a tab bar (`?tab=backtest|compound|goal|journal`). `initMainTabs()` resolves the active tab in order: URL `?tab=` → `localStorage('fg-finance-active-tab')` → `'backtest'`, validating against `ALLOWED_TABS` at each step. Activating a tab writes the key back and rewrites the URL via `history.replaceState` (no navigation).

Backtest markup is live from page load; the other three tools are **lazily initialized on first activation** by `initCompoundTool()` / `initGoalTool()` / `initJournalTool()`, each guarded by a `*Inited` boolean. Anything that must exist before a tab is opened cannot live inside those init functions.

The old individual pages (`asset.html`, `compound.html`, `goal.html`, `journal.html`, `backtest.html`) all redirect here with the appropriate `?tab=` param.

### Backtest tab (`finance.html?tab=backtest`)

Supports up to 3 tickers (A, B, and optional C). Ticker C is dynamically added/removed. Charts, summary cards, and comparison table all handle 3-ticker data. The diff column in the comparison table uses 1st-place vs last-place as the reference. (`backtest.html` in root is just a redirect stub to this tab.)

Ticker inputs (`#sym-a/b/c`) accept any Yahoo Finance symbol directly (e.g. `005930.KS`), and also support Korean-name autocomplete via `KR_STOCKS` — a small curated list of major KOSPI/KOSDAQ names mapped to their `.KS`/`.KQ` tickers (`setupKrAutocomplete()`). Typing a Korean name shows a dropdown (`.sym-suggest`); selecting an entry fills the ticker and triggers `fetchSymbolName()` to resolve the display name. This list is not exhaustive — extend `KR_STOCKS` to add more names.

### Portfolio Tracker (`portfolio_tracker.html`)

Password-gated private portfolio tracker. Key architecture:

- **Password gate** — full-screen overlay (`#pt-gate`, `position:fixed;z-index:9999`) rendered before `.app`. Gate JS runs in a blocking IIFE in `<head>` area of body, using `crypto.subtle.digest('SHA-256', ...)` to compare against the stored hash. `sessionStorage('pt-auth')` persists auth for the browser session. 비밀번호를 바꾸려면 `portfolio_tracker.html`의 `const HASH=` (≈377줄) 값을 새 SHA-256 hex로 교체하면 된다 — 평문은 저장소 어디에도 없다.
- **Data** — all snapshots are hardcoded in the `snapshots` array (no API calls). Each snapshot: `{date, label, totalAsset, totalEval, totalPnl, returnPct, sections[]}`. Add new data by appending to `snapshots`.
- **KPI Banner** — full-width 4-column strip (총투자자산 / 현재평가액 / 수익률 / 총손익) rendered by `renderKpiBanner()`. Rendered as large `28px` numbers above the main body.
- **Layout** — `.app` → `.topbar` → `.kpi-banner` → `#chart-section` (full-width trend chart) → `.body` (`.left` sidebar 260px + `.right-wrap` flex:1). Desktop: `height:100vh; overflow:hidden`. Mobile (`≤768px`): stacks vertically, scrolling enabled.
- **Trend chart** (`renderChart()`) — full-width `#chart-section` between the KPI banner and the body split; injects `trendCardHTML()` then calls `drawChart()` (interactive canvas with hover) via `requestAnimationFrame`. Redrawn on window resize.
- **Left panel** (`renderLeft()`) — donut SVG (asset allocation by section) + horizontal bar chart (P&L per section). Donut built from `rows[].amt`; bar from `rows[].pnl`.
- **Right panel** (`renderRight()`) — holdings cards filtered by `.itab` section tabs.
- **Render entry point** — `render()` = `renderKpiBanner()` → `renderLeft()` → `renderChart()` → `renderRight()`.
- **Calendar modal** — date picker to switch between snapshots. Days with data highlighted; clicking calls `pickDate(idx)`.
- **Color convention**: `--pos:#c0000a` (red = profit), `--neg:#1252a8` (blue = loss) — **inverted vs typical** financial convention.
- **Adding a new snapshot**: append an object to `snapshots[]` with the same shape as existing entries. `render()` auto-selects the last snapshot on load.

### Case Study Pages

- **`casestudy.html`** — gallery index page. 5-card grid (`.cs-grid`) — commerce / feargreed / disaster / asset / backtest — each card links to a detail page. Uses same `hub-theme` localStorage key as `index.html`. Add new case study by adding a `.cs-card` `<a>` element to `.cs-grid`.
- **Detail pages** (`casestudy-*.html`) — shared structure: sticky header with `← 케이스 스터디` back link + fixed FAB `↗ 라이브` button (bottom-right, links to the live tool). Tab bar (`.cs-tabs`) with `.cs-tabs-inner` wrapper for centering. Four tabs: 배경 / 고민과 결정 / 화면 설계 / 완성. Tab switching: `switchTab(id)` sets `location.hash`, `updateTabUI(id)` updates DOM — `hashchange` listener calls `updateTabUI()` only (not `switchTab()`) to avoid circular coupling.

### Workout (`workout.html`)

RISE 스타일 운동 트래커. 라이트 전용 테마, 에메랄드 액센트(`#10b981`), 반응형(모바일 ≤460px는 하단 고정 탭바 1컬럼 / 데스크톱 ≥900px는 상단 필 탭의 와이드 레이아웃).

State persisted to `localStorage('fg-workout-v2')` as `{routines: [], logs: []}`.
- `routines[]` — 사용자가 만든 루틴: `{id, emoji, name, note, exercises: [{id, name, sets: [{weight, reps}]}]}`
- `logs[]` — 완료된 운동 기록: `{id, date, routineId, emoji, name, exercises: [{name, sets: [{weight, reps, done}]}], durationMin, note}`
- **최초 1회 마이그레이션** — `fg-workout-v2`가 없고 레거시 `fg-workout-dashboard`가 있으면 그 `sessions[]`를 `logs[]`로 가져옴(세트 데이터 없이). 레거시 키는 백업으로 그대로 남겨둠.

**3탭 구조**:
- **루틴** — 루틴 목록 + 생성/수정 에디터 + 시작 버튼
- **기록** — 완료된 운동 히스토리 + 주간 스트립
- **통계** — 요약 타일 + 순수 canvas 기반 8주 볼륨 차트 + PR(운동별 최고 무게) 목록

플러스 **운동 모드**(fullscreen 오버레이) — 루틴 선택 또는 프리 운동으로 시작, 세트 체크, 무게·횟수 인라인 수정, 진행 타이머, 완료 시 `logs`에 저장.

**파생 통계**: 볼륨(완료된 세트의 Σ weight×reps), 스트릭, 주간 합계, 최다 루틴, PR(운동별 최고 무게). 외부 라이브러리 없음 — 차트는 순수 canvas 2D.

### Certificate quiz (`Certificate.html`)

정보처리기사 기출 문제풀이 앱. 다크/라이트 토글 있음 — `state.theme`이 비어 있으면 `prefers-color-scheme`을 따르고, `body.dataset.theme`으로 적용된다(`hub-theme`/`fg-theme`과는 별개 저장소).

**파일을 통째로 읽지 말 것.** 1164줄인데 용량은 ~875 KB다 — 635번째 **한 줄**에 모든 기출 문항이 JSON 배열(`exams`)로 들어 있어 그 한 줄만 853 KB다. 편집·조회는 `grep -n` + `sed -n '<범위>p'`로 그 줄을 피해서 할 것. 이게 `sw.js` PRECACHE에서 제외된 이유이기도 하다.

앱 로직은 636줄 이후에만 있다. 상태는 통째로 `defaultState` 한 객체이고 `save()`가 `q_study_app_v2` 키 하나에 직렬화한다. 대부분의 필드가 `{examId: ...}` 형태의 회차별 맵이라, 회차를 추가하면(`exams[]`에 항목 추가) 나머지는 자동으로 따라온다.

### Real Estate Map (`agents.html`)

Leaflet + OSM raster tiles, Seoul only (`minZoom:11`, `maxZoom:16`, `maxBounds` 고정). Filters persist to `localStorage('fg-seoul-map-filters-v3')`.

- **좌표는 API가 주지 않는다.** 하드코딩된 `ITEMS` 배열이 lat/lng의 유일한 출처다. `hydrateData()`는 `/api/real-estate.js` (확장자 포함 — Vercel이 그대로 함수로 라우팅한다) 응답을 `coordsKey(region|aptName|address)` → 실패 시 `aptName`+`region` 순으로 `ITEMS`에 매칭해 좌표를 붙이고, **매칭에 실패한 실거래 건은 조용히 버린다**. 새 단지를 지도에 띄우려면 `ITEMS`에 좌표를 먼저 추가해야 한다. API 호출이 실패하면 `currentItems`는 `ITEMS` 그대로 남는다.
- **자치구 경계**는 GitHub raw의 GeoJSON을 한 번만 받아 `localStorage('fg-seoul-boundary-cache-v1')`에 캐시한다. 실패 시 `addFallbackSeoulFocus()`가 사각형 테두리만 그린다. 경계 클릭 → `regionNameFromFeature()`가 `name`/`SIG_KOR_NM`/`sigungu_nm` 등 여러 프로퍼티 이름을 순서대로 시도해 `서울 OO구` 형태로 정규화(필터 `<select>`의 값과 정확히 일치해야 함).
- **렌더 루프**: `run()` → `save()` + `applyFilters()` + `sync()`. `sync()`가 현재 뷰포트(`map.getBounds()`) 안의 항목만 골라 마커·목록·상세·요약칩을 한 번에 다시 그린다. zoom < 13이면 `clusterVisible()`로 격자 클러스터링(zoom ≤ 11은 0.03°, 그 외 0.018°).
- **스타일 예외**: 이 파일의 JS는 한 줄에 함수 하나씩 압축된 형태다. 저장소의 4-space 규칙과 다르지만 의도적이므로 편집 시 주변 스타일을 따를 것.

### Disaster Simulator (`disaster.html`)

Leaflet 기반 재난 대응 시뮬레이터. **영속 상태 없음** — 모든 데이터가 스크립트 상단의 상수 테이블이고, 새로고침하면 초기화된다.

데이터는 전부 재난 코드(`DISASTERS[].code`)로 키가 잡힌 객체다: `SHELTERS`, `DANGER_ZONES`, `ALERT_LEVELS`, `DAMAGE_STATS`, `INCIDENTS`, `ALERTS`, `MESSAGES`. 재난을 하나 추가하려면 이 **모든** 테이블에 같은 코드로 항목을 넣어야 한다 — 빠뜨린 테이블은 조용히 빈 화면이 된다.

추천 로직: `haversine()`로 거리 → `calcScore(shelter, distanceM, disasterCode)`가 거리·수용률·재난 적합성을 합산해 순위를 매기고, `buildReason()`이 그 점수를 사람이 읽는 문장으로 바꾼다. 점수 계산식을 바꾸면 `scoreRow()`가 그리는 막대의 `max` 값도 같이 맞춰야 한다.

### Commerce (`commerce.html`)

React 18 UMD + Context API를 **빌드 없이** 굴리는 단일 파일. `@babel/standalone`이 브라우저에서 JSX를 컴파일하므로 앱 스크립트는 `type="text/babel"`이어야 하고, 그 안의 주석은 `//`가 아니라 `{/* ... */}`다.

OMS(주문) + WMS(재고) + PLM(상품)이 한 페이지에 들어 있고, 상태는 `dept-products` / `dept-inventory` / `dept-orders` / `dept-cart` 네 개의 localStorage 키로 나뉜다. 최초 실행 시 `INIT_PRODUCTS`, `SEED_ORDERS`로 시딩된다 — 시드 데이터를 바꿔도 이미 키가 있는 브라우저에는 반영되지 않으므로, 확인하려면 해당 키를 지우고 새로고침할 것.

### Fear & Greed app (`fear-greed.html`)

This is the main app. All globals and helper functions below refer to its `<script>` block.

### Key globals in the script block

| Variable | Purpose |
|---|---|
| `TRANSLATIONS` | i18n object with `en` and `ko` sub-objects containing all UI strings |
| `currentLang` | `'en'` or `'ko'`, persisted to `localStorage('fg-lang')` |
| `currentTheme` | `'light'` or `'dark'`, persisted to `localStorage('fg-theme')` |
| `CORS_PROXY` | `'/api/proxy?url='` — Vercel serverless proxy (`api/proxy.js`), prepended to all Yahoo/CNN fetches |
| `API_URL` | CNN Fear & Greed endpoint: `https://production.dataviz.cnn.io/index/fearandgreed/graphdata` |
| `historicalData` | Array of `{x: ms, y: score}` from CNN API, used by Timeline tab |
| `_cachedScores` | Last fetched scores; replayed on lang/theme switch without re-fetching |
| `_sp500Cache` | `{ts: number[], closes: number[]}` — S&P 500 daily closes (2y), ms timestamps |
| `sp500OverlayEnabled` | Boolean toggling the S&P 500 overlay on the Timeline canvas |
| `MKT_SYMBOLS` | Array of `{sym, name, fmt}` for market ticker chips: `^KS11`, `^IXIC`, `^GSPC`, `^DJI`, `BTC-USD` |
| `portfolioItems` | Array of `{sym, buyPrice, qty, loading}` for the portfolio calculator, persisted to `localStorage('fg-portfolio')` |
| `calendarYear` | Currently displayed year in the Calendar tab (default: current year) |
| `calendarDataMap` | `Map<'YYYY-MM-DD', score>` built from `historicalData`; nulled on data/theme/lang change to trigger redraw |
| `CAL_THIS_YEAR` | Module-level constant: `new Date().getFullYear()` — used by year selector buttons |

### Helper functions

- `t(key)` — returns `TRANSLATIONS[currentLang][key]` with English fallback
- `tc(light, dark)` — returns the correct value for the current theme
- `applyTranslations()` — updates all `data-i18n` elements in the DOM
- `applyTheme()` — toggles `body.dark` class and updates theme toggle button icon

### Data flow

```
fetchData()
  → CNN API (via CORS proxy)
  → applyData() → animateGauge() + renderHistory() + drawGauge()
  → historicalData (for Timeline tab)

fetchExchangeRates()           (24h refresh, open.er-api.com, no proxy needed)
fetchMarketTicker()            (24h refresh, Yahoo v8/chart per symbol, parallel)
fetchAndCacheSP500()           (on-demand when overlay toggled, Yahoo v8/chart range=2y)
```

### Canvas rendering

- **Gauge** (`drawGauge`, `animateGauge`) — `<canvas id="gaugeCanvas">`, draws colored arc zones, needle, and zone labels. Rotation formula: `rot = angle + Math.PI / 2` (do not add conditionals; that caused flipped labels).
- **Timeline** (`drawTimeline`, `initTimelineCanvas`) — `<canvas id="timelineCanvas">`, vanilla canvas with zone band fills, FG score line, optional S&P 500 orange overlay. `PADDING` constants control margins; `chartR` widens by 48px when SP500 overlay is active.
- **Indicators** — Chart.js line charts (lazy-loaded on first tab click).

### CORS proxy URL encoding rule

**Always** wrap the full Yahoo Finance URL in `encodeURIComponent` before appending to `CORS_PROXY`. Any `&` in the Yahoo URL that is not encoded will be parsed as a separate query parameter by the proxy handler, causing Yahoo to receive an incomplete URL:

```js
// Correct
const url = CORS_PROXY + encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?range=2y&interval=1d');

// Wrong — &interval=1d is parsed as a separate query param by the proxy handler, not forwarded to Yahoo
const url = `${CORS_PROXY}https://...?range=2y&interval=1d`;
```

If you add a new upstream domain to fetch via the proxy, also add it to the `ALLOWED` array in `api/proxy.js`.

### S&P 500 overlay matching

The FG historical timestamps (`historicalData[i].x`) are in **milliseconds**. `_sp500Cache.ts` stores Yahoo Finance timestamps converted to ms (`ts * 1000`). Matching uses nearest-neighbor within ±3 days — do not use date-string comparison (timezone offsets cause mismatches). SP500 is normalized to 0–100 using its own min/max for the filtered period, then drawn with `yPos()` (same coordinate system as FG), in orange (`#e65100` / `#fb923c` dark).

### Adding new i18n keys

Add to both `TRANSLATIONS.en` and `TRANSLATIONS.ko` blocks before `fxTitle`. Update `applyTranslations()` or use `data-i18n="keyName"` on HTML elements. For dynamic text (e.g. countdown), manually call `el.textContent = t('key')` in the lang/theme toggle handlers.

### Tab structure

Six tabs, in DOM order: **Overview** (gauge + history cards + score interpreter), **Timeline** (canvas chart with period buttons 1W/1M/3M/6M/1Y/All), **Indicators** (Chart.js lazy-loaded charts), **Calendar** (heatmap), **Watchlist** (localStorage-backed `fg-watchlist`, Yahoo Finance price fetch), **Portfolio** (P&L calculator). Tab switching is handled by a single `click` listener on `.tab` buttons using `data-tab` attributes.

Two sections worth calling out:

- **Score Interpreter** (`.interpreter`) — lives inside `#overviewView`, directly after the `.main-content` grid. Shows a 3-line market reading based on the current FG score, split into 5 zones (0–25 Extreme Fear → 75–100 Extreme Greed). Updated by `updateInterpreter(score)`.
- **Portfolio Calculator** (`.calc-section` inside `#portfolioView`) — its own tab. Lets the user add ticker symbols with buy price + quantity; fetches current price via Yahoo Finance (same proxy), computes P&L. State is in `portfolioItems` and saved to `localStorage('fg-portfolio')`. The `loading` field is excluded from what gets persisted.

### Calendar heatmap

- `<canvas id="calendarCanvas">` inside `.cal-wrapper` (`.calendarView`).
- `buildCalendarMap()` converts `historicalData` into `calendarDataMap` (keyed `'YYYY-MM-DD'`). Call `calendarDataMap = null` to force a rebuild on next render.
- `drawCalendar()` renders a GitHub-style grid: weeks as columns, Mon–Sun as rows, cells colored by `getZone(score).color`. Cells with no data use `--border-2`.
- Month labels use `t('months')[month]` — an array of 12 abbreviated month names in the current language.
- Mouse tooltip (`#calTooltip`) shows date + score + zone name; uses `t(getZone(score).labelKey)`.
- Must call `calendarDataMap = null` on theme change (colors change), lang change (zone labels change), and inside `applyData()` (new data arrived).
- Year selector: `#calBtnCurrent` / `#calBtnPrev`, labels updated by `updateCalYearBtnLabels()`.

### Share button

- `#shareBtn` (`.share-btn`) sits in `.gauge-footer` below the gauge, alongside `#lastUpdated`.
- Prefers `navigator.share` (mobile native sheet); falls back to `navigator.clipboard.writeText` on desktop.
- Label (`#shareBtnLabel`) and `title` reflect current language; call `document.getElementById('shareBtnLabel').textContent = t('shareTitle')` in the lang toggle handler.

### Refresh intervals

- Exchange rates (`FX_REFRESH`): 86400 seconds (24h)
- Market ticker (`MKT_REFRESH`): 86400 seconds (24h)

## localStorage key map

All persisted state lives in `localStorage` (or `sessionStorage` for auth). Keys by page:

| Key | Page | Contents |
|---|---|---|
| `hub-theme` | `index.html`, `casestudy.html` | `'light'` \| `'dark'` |
| `fg-lang` | `fear-greed.html` | `'en'` \| `'ko'` |
| `fg-theme` | `fear-greed.html` | `'light'` \| `'dark'` |
| `fg-portfolio` | `fear-greed.html` | `portfolioItems[]` (without `loading` field) |
| `fg-watchlist` | `fear-greed.html` (Watchlist tab) | watchlist ticker array |
| `fg-fx-cache` | `fear-greed.html`, `fg.html` | 환율 일일 캐시 `{date, values, prevDate, prevValues}` — 전일 대비 계산에 prev\* 필요 |
| `fg-app-theme` | `fg.html` | `'light'` \| `'dark'` — 없으면 라이트(시스템 설정 무시) |
| `fg-finance-active-tab` | `finance.html` | 마지막으로 연 탭 (`?tab=` 없을 때의 fallback) |
| `fg-journal` | `finance.html` (Journal tab) | 매매일지 엔트리 배열 |
| `fg-workout-v2` | `workout.html` | `{routines, logs}` |
| `fg-workout-dashboard` | `workout.html` (legacy) | old `{sessions, checks, categories}` shape — read-only, kept as backup source for the one-time migration into `fg-workout-v2` |
| `pt-auth` | `portfolio_tracker.html` | session auth flag (`sessionStorage`) |
| `q_study_app_v2` | `Certificate.html` | 진행 상태 전체 — 회차별 `answers`/`checked`/`bookmarks`/`notes`/`viewMode` + `theme` |
| `dept-products` | `commerce.html` | PLM product master (seeded from `INIT_PRODUCTS`) |
| `dept-inventory` | `commerce.html` | WMS stock per product `{qty, threshold}` |
| `dept-orders` | `commerce.html` | OMS order history (seeded from `SEED_ORDERS`) |
| `dept-cart` | `commerce.html` | cart line items |
| `fg-seoul-map-filters-v3` | `agents.html` | saved map filters (keyword/region/dealType/area/priceRange/sort) |
| `fg-seoul-boundary-cache-v1` | `agents.html` | cached Seoul district GeoJSON |

## Coding conventions

- **Indentation**: 4 spaces
- **JS**: `camelCase` for variables and functions
- **CSS**: `kebab-case` for class names
- **Bilingual UI**: preserve existing `en`/`ko` patterns when editing visible text
- **Commits**: short Conventional Commit prefix + concise Korean description, e.g. `fix: backtest 카드 정렬 보정`

### Comment conventions

The de-facto standard is what `fear-greed.html` already does — follow it in every hand-written file.

**Formats** (do not invent new divider styles):

```js
// ══════════════════════════════════════
//  SECTION NAME
// ══════════════════════════════════════
```
```css
/* ── Section Name ── */
```
```html
<!-- Section Name -->
```
JSX inside `commerce.html` (Babel `type="text/babel"`) must use `{/* ... */}`, not `//`.

**Language**: section/divider names in English, inline explanations in Korean. Matches current practice across the repo.

**What to write**: comment the *why*, not the *what*. Code that reads clearly needs no comment; a non-obvious constraint, a formula that must not be "fixed", a timezone/unit trap, or an inverted convention does.

```js
// ✗ 무엇 — 코드가 이미 말하고 있음
// 캔버스 초기화
ctx.clearRect(0, 0, w, h);

// ✓ 왜 — 코드가 말해주지 않음
// 날짜 문자열 비교는 타임존 오프셋 때문에 어긋남 → ±3일 최근접 매칭
```

**Density target**: roughly one inline comment per 40 lines of JS. Section banners for every major block. Do not add JSDoc `@param`/`@returns` — there is no build step, no type checker, and no team, so the annotations only rot.

**Invariant comments are mandatory.** Any rule in this file that says "do not do X" or "always do Y" must also appear as a comment at the code site it protects — CLAUDE.md is not loaded when someone edits the file directly.

**Do not comment**: `index.backup.html` (frozen snapshot) and anything under tool-generated directories (`.superpowers/`, `.codex-*`). `Certificate.html` is hand-maintained despite its bulk — normal conventions apply.

**Safety when editing comments**: `--` is illegal inside `<!-- -->`; `/* */` does not nest. A malformed comment silently breaks rendering in these single-file pages, so reload the affected page after touching them.

## Deployment

Deployed to Vercel. No `vercel.json` — Vercel's default static file serving handles all HTML pages. The `api/` directory is auto-detected as serverless functions (ESM, `export default async function handler`).

Environment variable required in Vercel:
- `DATA_GO_KR_API_KEY` (fallback name: `PUBLIC_DATA_API_KEY`) — 공공데이터포털 key for `api/real-estate.js`. Without it, the endpoint silently returns `MOCK_ITEMS`.

No other env vars are needed; all other external calls go through `api/proxy.js` which has no secrets.

### Serverless functions (`api/`)

- **`api/proxy.js`** — CORS proxy. `ALLOWED` array gates which upstream domains are permitted (CNN dataviz, Yahoo Finance, open.er-api.com). To proxy a new domain, add its prefix to `ALLOWED`. Responses are cached with `s-maxage=60, stale-while-revalidate=300`.
- **`api/real-estate.js`** — Korean apartment transaction data from 공공데이터포털 (data.go.kr), with `MOCK_ITEMS` fallback. Used by `agents.html`. 조회 가능한 지역은 파일 상단 `REGION_CODES`(구 이름 → 법정동코드) 맵이 전부다 — `?region=`이 없으면 맵의 모든 구를 순회하고, 맵에 없는 구는 조용히 빈 결과가 된다. 새 지역을 지원하려면 여기와 `agents.html`의 `ITEMS` 좌표를 **둘 다** 추가해야 한다.

### Service Worker (`sw.js`)

**두 개의 캐시를 쓴다.** `CACHE_NAME = 'fg-cache-v15'`은 앱 셸(HTML·아이콘·매니페스트), `DATA_CACHE = 'fg-data-v1'`은 API 응답 전용이다. **절대 다시 합치지 말 것** — 한 칸에 섞으면 배포할 때 데이터까지 날아가고, 만료가 없어 오프라인에서 몇 달 전 시세가 현재 값처럼 나온다. `activate`는 `CACHE_NAME`도 `DATA_CACHE`도 아닌 캐시만 지운다.

PRECACHE covers `/`, `index.html`, `offline.html`, `fear-greed.html`, `finance.html`, the five redirect stubs (`asset`/`compound`/`goal`/`journal`/`backtest`), `workout.html`, `agents.html`, `commerce.html`, `disaster.html`, the `casestudy.html` gallery **and** all five `casestudy-*.html` detail pages, plus `manifest.json`, `icon.svg`, and the four icon PNGs (`icon-192`/`icon-512`/`icon-180`/`icon-maskable`).

**Not in PRECACHE:** `Certificate.html` (~875 KB — too large to precache, but it *is* in `sitemap.xml`) and `portfolio_tracker.html` (password-gated private page, also blocked in `robots.txt`). Both exclusions are deliberate — 오프라인에서 이 둘을 열면 `offline.html`로 안내된다.

**설치는 `addAll`이 아니라 한 건씩 한다** (`precacheOne`). `cache.addAll`은 하나라도 실패하면 전체가 무산돼 `offline.html`까지 같이 날아간다. 또 리다이렉트된 응답은 `cache.put`이 거부하므로 본문만 꺼내 새 `Response`로 다시 만든다. 이 구조를 `addAll` 한 줄로 되돌리지 말 것.

When adding a new page, also add it to PRECACHE and bump `CACHE_NAME` to invalidate on deploy.

**Registration scope**: 앱 성격의 여섯 페이지(`index`, `fear-greed`, `finance`, `workout`, `commerce`, `disaster`)가 각각 `manifest`를 링크하고 `navigator.serviceWorker.register('/sw.js')`를 호출한다. 설치 프롬프트는 **그 페이지가 직접** 매니페스트와 SW를 들고 있어야 뜬다. 케이스 스터디·`agents`·`Certificate`·`portfolio_tracker`는 읽는 문서라 의도적으로 제외 — `viewport-fit`, `theme-color`, `apple-touch-icon`만 붙어 있다.

**Fetch strategy**: `DATA_PREFIXES`(CNN dataviz, Yahoo, open.er-api.com)와 `/api/` 경로는 `dataFirst` → `DATA_CACHE`. Google Fonts는 cache-first. 나머지 own-origin GET은 network-first이고, 실패한 요청이 내비게이션이면 `offline.html`을 돌려준다.

**`X-From-Cache` 헤더**: `dataFirst`가 오프라인에서 캐시로 응답할 때 이 헤더를 붙인다. `index.html`(라이브 티커)과 `fear-greed.html`(게이지)이 이 헤더 + 응답의 `date`를 읽어 "N시간 전 값 · 오프라인" 배지를 띄운다. 헤더 이름을 바꾸면 두 페이지의 호출부도 같이 고칠 것.

### Other files

- **`manifest.json`** + **`icon.svg`** + **`icon-192.png`** / **`icon-512.png`** / **`icon-180.png`** / **`icon-maskable.png`** — PWA 매니페스트와 아이콘. `icon-maskable.png`은 여백 20%를 준 버전으로, 없으면 안드로이드 런처가 사각 아이콘을 흰 원 안에 축소해 넣는다. `icon-180.png`은 `apple-touch-icon`용 — 없으면 iOS 홈 화면에 페이지 스크린샷이 박힌다. 넷 다 `sw.js` PRECACHE에 있다.
- **`offline.html`** — 네트워크·캐시가 모두 비었을 때 `sw.js`가 내비게이션 요청에 돌려주는 화면. 설치된 앱 안에는 주소창이 없어 브라우저 기본 오류가 뜨면 빠져나갈 길이 없다. `robots.txt`에서 차단, `sitemap.xml`에는 없음.
- **`robots.txt`** + **`sitemap.xml`** — crawl control (blocks `portfolio_tracker.html`) and sitemap for the production domain `imgh-one.vercel.app`. When adding a public page, add it to `sitemap.xml`.
- **`assets/og-image.png`** — 1200×630 Open Graph card used by pages without a project thumbnail. Every page has `meta description` + OG tags in `<head>`.
- **`index.backup.html`** — snapshot of `index.html` at an earlier redesign checkpoint; tracked in git but matched by `.gitignore`'s `*.backup.html`, so new backups will not be picked up. Not served, safe to ignore.
- **`임광호_포트폴리오.pdf`** — resume PDF served from root, linked from the `index.html` hero CTA (`이력서 PDF ↗` outline button, opens in new tab).
- **`*.png` files in root** — browser screenshots taken during development/verification; not served, safe to ignore.
- **`portfolio/`** — an unrelated IntelliJ Java scratch module (`portfolio.iml` + `src/Main.java`, still the IDE's Hello World template). Nothing to do with the site; ignored via `.gitignore`. IntelliJ opens this directory as its project root, so a session can start with `portfolio/` as the working directory — the site lives one level up, in the repo root.
- **`AGENTS.md`** — entry point for other coding agents (Codex etc.). 내용을 중복해서 담지 않고 이 파일을 가리키는 포인터 + 방향만 잡는 요약이다. **이 파일을 고칠 때 `AGENTS.md`는 건드릴 필요가 없다** — 빌드/스타일/커밋 규약 자체가 바뀔 때만 손대면 된다.
- **`.claude/`** — local skill packs installed by `npx skills add` plus `settings.local.json`. Entirely gitignored, untracked, and not served.
- **`.codex-*.html`** / **`.codex-*.js`** — temporary test artifacts generated by Codex; not served, safe to ignore.
- **`.superpowers/`** — brainstorm artifacts from the superpowers skill system; not served.
- **`skills-lock.json`** — lock file written by the `skills` CLI (`npx skills add`); the skills themselves land in `.claude/`. Untracked (added to `.gitignore`), safe to ignore.
- **`.gitignore` drift**: `.superpowers/`, `.codex-*`, `preview-*.png`, `final-*.png`, and `*.backup.html` are all listed in `.gitignore` but were committed before the rules were added, so they remain tracked. `git status` stays clean; the ignore rules only affect *new* files matching those patterns.
- **`docs/superpowers/specs/`** — design specs (`*-design.md`) for planned features.
- **`docs/superpowers/plans/`** — implementation plans generated from specs. Check this directory for pending feature plans before starting new work to avoid duplication.
