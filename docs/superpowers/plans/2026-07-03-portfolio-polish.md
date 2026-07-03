# Portfolio Landing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `index.html` 프로젝트 카드에 실제 앱 썸네일 + 케이스 스터디 링크를 추가하고, 레이아웃 폭 확대와 SVG 아이콘·태그 위계 폴리싱을 적용한다.

**Architecture:** 정적 단일 HTML 구조 유지. 썸네일은 프로덕션(https://imgh-one.vercel.app)에서 Playwright로 캡처 후 sharp로 webp 변환하여 `assets/thumbs/`에 커밋. 프로젝트 카드는 전체가 `<a>`인 현재 구조를 `<div>` + 내부 앵커 2개(썸네일→Live, 푸터→Live·케이스 스터디)로 개편 (중첩 앵커 방지).

**Tech Stack:** Vanilla HTML/CSS/JS, Playwright MCP (캡처), sharp via npm (webp 변환). 테스트 프레임워크 없음 — 브라우저 시각 검증으로 대체.

## Global Constraints

- 스펙: `docs/superpowers/specs/2026-07-03-portfolio-polish-design.md`
- 들여쓰기 4칸, CSS kebab-case, JS camelCase (CLAUDE.md)
- 커밋 메시지: Conventional Commit 접두사 + 한국어 설명
- 스크롤 스냅(`scroll-snap-type: y mandatory`), 모바일(≤768px) 동작, 리빌 애니메이션, 3D tilt는 **변경 금지**
- 썸네일: 라이트 테마, 1280×800, webp q80, 개당 40~80KB 목표 (120KB 초과 시 재조정)
- SVG 아이콘: 인라인, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`
- `index.html` 변경 완료 후 `sw.js` `CACHE_NAME` `fg-cache-v8` → `fg-cache-v9` 범프 (Task 6에서 1회)

---

### Task 1: 앱 썸네일 6개 캡처 및 webp 변환

**Files:**
- Create: `assets/thumbs/thumb-feargreed.webp`, `thumb-commerce.webp`, `thumb-finance.webp`, `thumb-disaster.webp`, `thumb-workout.webp`, `thumb-pt.webp`

**Interfaces:**
- Produces: 위 6개 webp 파일 경로 — Task 2의 `<img src="assets/thumbs/thumb-<slug>.webp">`가 참조

**캡처 공통 규칙:** Playwright MCP 브라우저를 `browser_resize`로 **1280×800**으로 설정. 각 페이지는 **프로덕션** `https://imgh-one.vercel.app/`에서 연다 (로컬 정적 서버는 `/api/proxy` 서버리스 함수가 없어 fear-greed 등이 데이터를 못 받음). 라이트 테마 기본값 유지 (테마 토글 건드리지 않음). 페이지당 데이터 로드 대기 후 `browser_take_screenshot`(type: png, scale: css, filename: `thumb-<slug>.png`)로 캡처 — 파일은 리포 루트에 저장됨.

- [ ] **Step 1: fear-greed 캡처**

`https://imgh-one.vercel.app/fear-greed.html` 이동 → 게이지 렌더 대기 (browser_evaluate로 2초 대기: `() => new Promise(r => setTimeout(r, 2000))`) → `thumb-feargreed.png` 캡처.

- [ ] **Step 2: commerce 캡처**

`https://imgh-one.vercel.app/commerce.html` 이동 → 1.5초 대기 → `thumb-commerce.png` 캡처.

- [ ] **Step 3: finance(백테스트 탭) 캡처**

`https://imgh-one.vercel.app/finance.html?tab=backtest` 이동. `browser_snapshot`으로 티커 입력(`#sym-a`, `#sym-b`)과 실행/비교 버튼을 확인하고, 기본값이 비어 있으면 `#sym-a`에 `SPY`, `#sym-b`에 `QQQ` 입력 후 실행 버튼 클릭 → 차트 렌더 대기(3초) → `thumb-finance.png` 캡처. 차트가 렌더되지 않으면(API 실패) 입력 폼 상태 그대로 캡처하고 Task 7 검증에서 재판단.

- [ ] **Step 4: disaster 캡처**

`https://imgh-one.vercel.app/disaster.html` 이동 → 지도 타일 로드 대기(3초) → `thumb-disaster.png` 캡처.

- [ ] **Step 5: workout 캡처 (데모 데이터 시딩)**

`https://imgh-one.vercel.app/workout.html` 이동. 빈 상태면 화면이 허전하므로 앱 자체 UI로 세션 2~3개 기록: `browser_snapshot`으로 템플릿 퀵필 버튼(상체/하체/유산소)과 기록 폼을 찾아 템플릿 클릭 → 저장을 2~3회 반복 (날짜 다르게 조작 불필요, 당일 기록으로 충분). 체크리스트 항목도 2~3개 체크 → `thumb-workout.png` 캡처.

- [ ] **Step 6: portfolio_tracker 캡처 (게이트 우회)**

`https://imgh-one.vercel.app/portfolio_tracker.html` 이동 → browser_evaluate:

```js
() => { sessionStorage.setItem('pt-auth', '1'); location.reload(); return 'reloaded'; }
```

→ 2초 대기 → 메인 대시보드(KPI 배너 + 차트 + 도넛) 확인 후 `thumb-pt.png` 캡처. **주의: 실계좌 금액이 노출되는 페이지다. 캡처 전 사용자에게 썸네일로 써도 되는지 이미 승인된 상태(스펙 승인)이지만, 최종 검증(Task 7)에서 한 번 더 육안 확인.**

- [ ] **Step 7: webp 변환 스크립트 작성**

스크래치패드가 아닌 리포 루트에서 임시 작업 (png가 루트에 있으므로). `D:/intellij_2024/fear-and-greed/.thumbwork/` 디렉토리 생성 후:

```bash
mkdir -p .thumbwork && cd .thumbwork && npm init -y && npm i sharp
```

`.thumbwork/convert.mjs` 작성:

```js
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';

mkdirSync('../assets/thumbs', { recursive: true });
const pngs = readdirSync('..').filter(f => /^thumb-.+\.png$/.test(f));
for (const f of pngs) {
    const out = '../assets/thumbs/' + f.replace(/\.png$/, '.webp');
    await sharp('../' + f)
        .resize(1280, 800, { fit: 'cover', position: 'top' })
        .webp({ quality: 80 })
        .toFile(out);
    console.log(out);
}
```

- [ ] **Step 8: 변환 실행 및 용량 확인**

```bash
cd .thumbwork && node convert.mjs && ls -la ../assets/thumbs/
```

Expected: webp 6개 생성. 각 파일 40~80KB 목표, 120KB 초과 파일이 있으면 해당 파일만 `quality: 70`으로 재변환.

- [ ] **Step 9: 임시 파일 정리 및 커밋**

```bash
cd D:/intellij_2024/fear-and-greed && rm -rf .thumbwork thumb-*.png
git add assets/thumbs && git commit -m "feat: 프로젝트 카드용 앱 썸네일 6종 추가"
```

---

### Task 2: 프로젝트 카드 개편 — 썸네일 + 케이스 스터디 링크

**Files:**
- Modify: `index.html` — CSS `~419-465` (PROJECTS 블록), 마크업 `~1121-1209` (`#projects` 섹션)

**Interfaces:**
- Consumes: Task 1의 `assets/thumbs/thumb-<slug>.webp` 6개
- Produces: `.project-card`가 `<div>`로 변경됨 (3D tilt JS는 클래스 셀렉터 기반이라 영향 없음 — `document.querySelectorAll` 대상 클래스 유지 확인)

- [ ] **Step 1: CSS 수정**

`index.html`의 PROJECTS CSS 블록에서 `.project-card__strip { height: 5px; }`을 `height: 3px;`로 변경, `.project-card__icon` 규칙 삭제, 아래 규칙을 `.project-card__strip` 앞에 추가:

```css
.project-card__thumb {
    display: block; aspect-ratio: 16 / 10; overflow: hidden;
    background: var(--bg-3);
}
.project-card__thumb img {
    width: 100%; height: 100%; object-fit: cover; object-position: top;
    display: block; transition: transform 0.35s ease;
}
.project-card:hover .project-card__thumb img { transform: scale(1.04); }
```

`.project-card__link` 규칙에서 `align-self: flex-start;`를 제거하고 `text-decoration: none;`을 추가한 뒤, 그 아래에 추가:

```css
.project-card__links {
    display: flex; align-items: center; gap: 0.7rem; margin-top: auto;
}
.project-card__link--cs { color: var(--text-2); }
.project-card__link--cs::after { content: '→'; }
.project-card__link--cs:hover { color: var(--accent); }
.projects-cs-all {
    color: var(--accent); font-weight: 700; text-decoration: none;
    white-space: nowrap; margin-left: 0.4rem;
}
.projects-cs-all:hover { text-decoration: underline; }
```

참고: `.project-card__sub`의 `flex: 1`은 유지 (링크 행이 카드 하단 정렬되도록 `margin-top: auto` 병행).

- [ ] **Step 2: 섹션 부제에 갤러리 링크 추가**

```html
<p class="projects-meta" data-reveal="up">업무 외 시간에 직접 기획·설계·개발한 개인 프로젝트입니다. 기획부터 배포까지 단독 수행. <a class="projects-cs-all" href="casestudy.html">기획 케이스 스터디 전체 보기 →</a></p>
```

- [ ] **Step 3: 카드 6개 마크업 교체**

기존 `<a class="project-card" ...>...</a>` 6개를 아래로 전량 교체 (`data-reveal`/`--reveal-delay` 유지):

```html
<div class="project-card" data-reveal="scale">
    <a class="project-card__thumb" href="fear-greed.html" aria-label="공포탐욕지수 열기">
        <img src="assets/thumbs/thumb-feargreed.webp" alt="공포탐욕지수 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--green"></div>
    <div class="project-card__body">
        <p class="project-card__name">공포탐욕지수</p>
        <p class="project-card__sub">CNN Fear & Greed Index 실시간 조회. 캘린더 히트맵, S&P500 오버레이, 포트폴리오 계산기.</p>
        <div class="project-card__tags">
            <span class="tag">Canvas API</span><span class="tag">Chart.js</span><span class="tag">Yahoo Finance</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="fear-greed.html">Live</a>
            <a class="project-card__link project-card__link--cs" href="casestudy-feargreed.html">케이스 스터디</a>
        </div>
    </div>
</div>

<div class="project-card" data-reveal="scale" style="--reveal-delay:0.08s">
    <a class="project-card__thumb" href="commerce.html" aria-label="커머스 시스템 열기">
        <img src="assets/thumbs/thumb-commerce.webp" alt="커머스 시스템 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--blue"></div>
    <div class="project-card__body">
        <p class="project-card__name">커머스 시스템</p>
        <p class="project-card__sub">OMS·WMS·PLM 통합 커머스. 관리자 대시보드, 장바구니·주문 플로우.</p>
        <div class="project-card__tags">
            <span class="tag">React CDN</span><span class="tag">Context API</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="commerce.html">Live</a>
            <a class="project-card__link project-card__link--cs" href="casestudy-commerce.html">케이스 스터디</a>
        </div>
    </div>
</div>

<div class="project-card" data-reveal="scale" style="--reveal-delay:0.16s">
    <a class="project-card__thumb" href="finance.html" aria-label="금융 도구 모음 열기">
        <img src="assets/thumbs/thumb-finance.webp" alt="금융 도구 모음 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--amber"></div>
    <div class="project-card__body">
        <p class="project-card__name">금융 도구 모음</p>
        <p class="project-card__sub">백테스트 비교기 · 복리 계산기 · 목표 자산 · 매매 일지 — 4탭 통합.</p>
        <div class="project-card__tags">
            <span class="tag">Yahoo Finance API</span><span class="tag">Chart.js</span><span class="tag">Flatpickr</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="finance.html">Live</a>
            <a class="project-card__link project-card__link--cs" href="casestudy-backtest.html">케이스 스터디</a>
        </div>
    </div>
</div>

<div class="project-card" data-reveal="scale" style="--reveal-delay:0.24s">
    <a class="project-card__thumb" href="disaster.html" aria-label="재난 대응 시뮬레이터 열기">
        <img src="assets/thumbs/thumb-disaster.webp" alt="재난 대응 시뮬레이터 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--red"></div>
    <div class="project-card__body">
        <p class="project-card__name">재난 대응 시뮬레이터</p>
        <p class="project-card__sub">대피소 지도, 재난문자 시뮬레이션, 경보·경로 안내. 실무 도메인 기반 기획.</p>
        <div class="project-card__tags">
            <span class="tag">GIS · Map</span><span class="tag">Vanilla JS</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="disaster.html">Live</a>
            <a class="project-card__link project-card__link--cs" href="casestudy-disaster.html">케이스 스터디</a>
        </div>
    </div>
</div>

<div class="project-card" data-reveal="scale" style="--reveal-delay:0.32s">
    <a class="project-card__thumb" href="workout.html" aria-label="운동 루틴 트래커 열기">
        <img src="assets/thumbs/thumb-workout.webp" alt="운동 루틴 트래커 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--violet"></div>
    <div class="project-card__body">
        <p class="project-card__name">운동 루틴 트래커</p>
        <p class="project-card__sub">세션 기록, 체크리스트, 주간 스트릭, 통계 대시보드.</p>
        <div class="project-card__tags">
            <span class="tag">localStorage</span><span class="tag">Vanilla JS</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="workout.html">Live</a>
        </div>
    </div>
</div>

<div class="project-card" data-reveal="scale" style="--reveal-delay:0.40s">
    <a class="project-card__thumb" href="portfolio_tracker.html" aria-label="포트폴리오 트래커 열기">
        <img src="assets/thumbs/thumb-pt.webp" alt="포트폴리오 트래커 스크린샷" loading="lazy">
    </a>
    <div class="project-card__strip strip--teal"></div>
    <div class="project-card__body">
        <p class="project-card__name">포트폴리오 트래커</p>
        <p class="project-card__sub">비밀번호 게이트, 스냅샷 기반 수익률 추적, 섹터 도넛 차트.</p>
        <div class="project-card__tags">
            <span class="tag">SHA-256 Auth</span><span class="tag">Canvas API</span>
        </div>
        <div class="project-card__links">
            <a class="project-card__link" href="portfolio_tracker.html">Live</a>
        </div>
    </div>
</div>
```

- [ ] **Step 4: 브라우저 확인**

로컬 서버(`npx serve . -l 8080`)에서 `#projects` 섹션 스크린샷: 썸네일 6개 로드, 비율 왜곡 없음, 스트립 3px 라인 표시, 호버 시 이미지 확대 + 카드 리프트, Live·케이스 스터디 링크 각각 정상 이동, 3D tilt 동작 유지.

- [ ] **Step 5: 커밋**

```bash
git add index.html && git commit -m "feat: 프로젝트 카드 썸네일 및 케이스 스터디 링크 추가"
```

---

### Task 3: 레이아웃 균형 — 콘텐츠 폭 확대

**Files:**
- Modify: `index.html` — `.section__inner` (~line 93), `.s-title` (~line 140)

**Interfaces:**
- Consumes: 없음 (독립)
- Produces: 없음

- [ ] **Step 1: 폭·타이틀 수정**

```css
.section__inner {
    width: 100%;
    max-width: 1080px;
}
```

```css
.s-title {
    font-size: clamp(1.9rem, 3.6vw, 2.75rem);
    font-weight: 800; letter-spacing: -0.03em; line-height: 1.15;
    color: var(--text); margin-bottom: 2rem;
}
```

- [ ] **Step 2: 브라우저 확인**

1440×900에서 Career/Skills 섹션: 카드가 넓어진 폭을 채우고 좌우 여백 비율 개선. 1280×800에서 오버플로/줄바꿈 깨짐 없음. 모바일 390px에서 기존과 동일 (모바일 미디어쿼리는 `.s-title` clamp를 덮어쓰므로 영향 없음 — line ~720 확인).

- [ ] **Step 3: 커밋**

```bash
git add index.html && git commit -m "style: 섹션 콘텐츠 폭 1080px 확대 및 타이틀 크기 조정"
```

---

### Task 4: 이모지 → 인라인 SVG 아이콘 교체

**Files:**
- Modify: `index.html` — hero 칩 (~line 910-913), 스킬 카드 아이콘 6개 (~line 1034-1104), contact 아이콘 3개 (~line 1226-1240), CSS `.chip`/`.skill-card__icon`/`.contact-link__icon`

**Interfaces:**
- Consumes: 없음
- Produces: 없음

모든 SVG는 Global Constraints의 공통 속성 사용. 아이콘 크기는 CSS로 제어.

- [ ] **Step 1: 아이콘 크기 CSS 추가**

`.chip` 규칙 아래에 추가:

```css
.chip svg { width: 13px; height: 13px; flex-shrink: 0; }
```

`.skill-card__icon` 규칙에서 `font-size: 0.85rem;` 제거하고 아래 추가 (아이콘 박스의 `color`는 `var(--accent)`가 되도록):

```css
.skill-card__icon { color: var(--accent); }
.skill-card__icon svg { width: 15px; height: 15px; }
```

`.contact-link__icon` 규칙 아래에 추가:

```css
.contact-link__icon svg { width: 17px; height: 17px; }
```

- [ ] **Step 2: hero 칩 4개 교체**

```html
<span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>서울</span>
<span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>공공 SI/SM</span>
<span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>Java</span>
<span class="chip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>GIS</span>
```

- [ ] **Step 3: 스킬 카드 아이콘 6개 교체**

각 `<div class="skill-card__icon">이모지</div>`의 이모지를 SVG로 교체 (박스 div는 유지):

Backend (☕→server):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
```

Database (🗄→database):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
```

GIS · Map (🗺→map):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
```

보안 · 인증 (🔒→lock):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
```

외부 연동 (🔗→link):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
```

서버 · Infra (🖥→terminal):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
```

- [ ] **Step 4: contact 아이콘 3개 교체**

`<span class="contact-link__icon">` 내부 이모지를 SVG로 교체:

✉️ (mail):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
```

🐙 (github):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
```

🌐 (globe):
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
```

- [ ] **Step 5: 브라우저 확인**

라이트/다크 각각: 칩·스킬 헤더·contact 아이콘이 이모지 없이 SVG로 렌더, 색상이 테마에 연동(`currentColor`), 크기·정렬이 기존 이모지와 유사. 아이콘 형태가 깨져 보이면(path 오류) 해당 아이콘만 단순한 대체 형태로 수정.

- [ ] **Step 6: 커밋**

```bash
git add index.html && git commit -m "style: 이모지 아이콘을 인라인 SVG로 통일"
```

---

### Task 5: 스킬 태그 위계 + 성능 배지 툴팁

**Files:**
- Modify: `index.html` — `.tag` CSS (~line 161) 아래, 스킬 태그 마크업 (~line 1036-1114), `#perfBadge` (~line 845)

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: `.tag--core` CSS 추가**

`.tag` 규칙 바로 아래:

```css
.tag--core {
    background: var(--accent-2);
    border-color: var(--accent-3);
    color: var(--accent);
}
```

- [ ] **Step 2: 핵심 태그 6개에 클래스 적용**

스킬 섹션에서 정확히 다음 6개만 `class="tag tag--core"`로 변경:
`Java 8`, `Spring MVC 3.2`, `eGovFramework 3.1` (Backend 카드), `Oracle`, `SQL Tuning` (Database 카드), `OpenLayers` (GIS·Map 카드).

주의: 동일 텍스트 태그가 career 카드(`career-tags`)에도 존재함 — **skills 섹션(`.skill-tags`) 내부만** 변경.

- [ ] **Step 3: 성능 배지 툴팁 보강**

`#perfBadge`의 `title="성능 모니터링"`을 `title="실시간 Core Web Vitals 점수"`로 변경 (aria-label은 유지).

- [ ] **Step 4: 브라우저 확인**

라이트/다크 각각 스킬 섹션: core 태그 6개가 그린 틴트로 구분되고 나머지는 기존 회색 유지. 대비 확보 확인.

- [ ] **Step 5: 커밋**

```bash
git add index.html && git commit -m "style: 핵심 스킬 태그 위계 표시 및 성능 배지 툴팁 보강"
```

---

### Task 6: Service Worker 캐시 범프 + CLAUDE.md 갱신

**Files:**
- Modify: `sw.js:1` — `CACHE_NAME`
- Modify: `CLAUDE.md` — Portfolio Landing 섹션

**Interfaces:**
- Consumes: Task 2~5의 index.html 변경 완료 상태
- Produces: 없음

- [ ] **Step 1: CACHE_NAME 범프**

```js
const CACHE_NAME = 'fg-cache-v9';
```

- [ ] **Step 2: CLAUDE.md 갱신**

Portfolio Landing(`index.html`) 섹션에 반영:
- 프로젝트 카드: 썸네일(`assets/thumbs/thumb-<slug>.webp`) + Live·케이스 스터디 2링크 구조, 카드가 `<div>`(중첩 앵커 방지)라는 점
- 썸네일 재캡처 절차 한 줄: "프로덕션에서 라이트 테마·1280×800 캡처 → sharp webp q80 → `assets/thumbs/`"
- `.section__inner` 1080px, `.tag--core`, SVG 아이콘 교체 사실
- 파일 테이블의 `index.html` 라인 수 갱신

- [ ] **Step 3: 커밋**

```bash
git add sw.js CLAUDE.md && git commit -m "chore: SW 캐시 v9 범프 및 CLAUDE.md 갱신"
```

---

### Task 7: 최종 시각 검증

**Files:** 없음 (검증 전용; 발견된 결함은 해당 파일 수정 후 개별 커밋)

**Interfaces:**
- Consumes: Task 1~6 전체

- [ ] **Step 1: 로컬 서버 기동**

```bash
cd D:/intellij_2024/fear-and-greed && npx -y serve . -l 8080
```

- [ ] **Step 2: 매트릭스 스크린샷**

Playwright로 3 뷰포트 × 2 테마 = 6조합 확인 (뷰포트: 1440×900, 1280×800, 390×844 / 테마: `.theme-toggle` 클릭으로 전환). 각 조합에서 hero→contact 전 섹션 스크롤 캡처.

- [ ] **Step 3: 체크리스트 판정**

- 썸네일 6개 로드·왜곡 없음, 호버 확대 동작 (데스크톱)
- 케이스 스터디 링크 4개 + "전체 보기" 링크가 각 페이지로 정상 이동
- 모바일에서 카드 푸터 2링크 정리, 썸네일 비율 유지
- core 태그·SVG 아이콘 라이트/다크 대비 확보
- 스크롤 스냅, 리빌 애니메이션, 3D tilt, dot-nav, 성능 배지 기존 동작 유지
- 콘솔 에러 0건 (404 포함 — 썸네일 경로 오타 검출)

- [ ] **Step 4: 결함 수정 및 마무리 커밋**

발견된 결함은 수정 후 `fix:` 커밋. 전부 통과하면 완료 보고.
