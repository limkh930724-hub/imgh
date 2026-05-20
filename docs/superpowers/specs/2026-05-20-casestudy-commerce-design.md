# 커머스 시스템 케이스 스터디 — Design Spec
Date: 2026-05-20

## Summary

`casestudy.html` — 커머스 시스템(백화점형 이커머스) 구축 과정을 기획자·개발자 모두에게 읽히는 케이스 스터디 페이지로 제작. Vanilla JS 단일 HTML, 4탭 구조(배경 / 고민과 결정 / 화면 설계 / 완성). 스펙 문서(`2026-05-20-department-store-design.md`)와 실제 커밋 히스토리를 원재료로 사용.

## Decisions

| 항목 | 결정 |
|---|---|
| 파일 | `casestudy.html` (신규), `index.html` 카드 추가 |
| 기술 | Vanilla JS + CSS, 단일 HTML (React 불필요) |
| 구조 | 4탭: 배경 / 고민과 결정 / 화면 설계 / 완성 |
| 스타일 | 기존 포트폴리오 CSS 변수 체계 동일 적용, 라이트/다크 지원 |
| 대상 독자 | 채용 담당자·개발팀·기획자 모두 (기획+기술 균형) |

## 페이지 구조

### 헤더 (sticky, 56px)
```
← 포트폴리오    커머스 시스템 케이스 스터디    ☀
```
- 기존 포트폴리오 topnav 스타일 동일
- 테마 토글 버튼 포함

### 탭 바 (sticky, 헤더 바로 아래)
```
  배경   고민과 결정   화면 설계   완성
  ────
```
- active 탭: `border-bottom: 2px solid var(--ink)` 인디케이터
- JS로 탭 패널 show/hide (`display: none` ↔ `block`)

---

## 탭 1 — 배경

### 히어로 섹션
```
커머스 시스템
"백화점형 이커머스 — 기획부터 구현까지"
                              [라이브 보기 →]
```

### 문제 정의 (2~3 문단)
- 기존 `commerce.html`은 OMS·WMS·PLM 관리 도구에 가까웠음
- 실제 쇼핑 경험(상품 탐색 → 장바구니 → 주문)이 없었음
- "직접 써보고 싶은 커머스"를 만들고 싶다는 동기

### 규모 수치 칩 (4개 pill)
```
[ 개발 기간  1일 ]  [ 구현 기능  10개 ]  [ 컴포넌트  12개 ]  [ 코드  ~1,200줄 ]
```
- `border: 1px solid var(--border-2)`, border-radius: 999px
- 숫자만 `font-weight: 800`

---

## 탭 2 — 고민과 결정

결정 카드 4개. 각 카드 구조:
```
│  [결정 제목]
│  고민: "~~~한 문제가 있었다"
│  선택지: A  vs  B
│  → 선택: A  /  이유: ~~~
```

CSS: `border-left: 3px solid var(--accent)`, 배경 `var(--bg-2)`, `border-radius: 0 8px 8px 0`

### 결정 1: 기술 선택
- **고민:** 빌드 없이 컴포넌트 기반 UI를 만들 수 있나
- **A** React CDN + Babel  vs  **B** Vanilla JS
- **선택: A** — 상품·재고·장바구니·주문이 서로 연동되어 상태 복잡도가 높아 컴포넌트 모델이 필요했음

### 결정 2: 상태 관리 구조
- **고민:** 장바구니와 재고가 여러 탭에서 동시에 읽힘
- **A** 단일 StoreContext  vs  **B** 탭별 로컬 상태
- **선택: A** — 재고 차감(관리자) → 품절 표시(쇼핑몰) → 주문 검증(장바구니)이 한 흐름이므로 전역 상태 필요

### 결정 3: 데이터 설계
- **고민:** 백엔드 없이 실제 DB처럼 동작하게 하려면
- **A** localStorage + 시드 데이터(INIT_PRODUCTS, INIT_INVENTORY, SEED_ORDERS)  vs  **B** 단순 하드코딩
- **선택: A** — 새로고침 후에도 상태 유지, 관리자 CRUD가 실시간 반영되어야 포트폴리오 가치가 있음

### 결정 4: 화면 구조
- **고민:** 기능이 많아서 페이지를 분리해야 하나
- **A** 단일 HTML 4탭 SPA  vs  **B** 기능별 멀티페이지
- **선택: A** — 포트폴리오의 "단일 HTML 원칙" 유지. 탭 전환으로 충분히 커버 가능

---

## 탭 3 — 화면 설계

### 4탭 구조 다이어그램 (순수 CSS div)
```
┌──────┐  ┌──────┐  ┌────────┐  ┌──────┐
│  홈  │  │쇼핑몰│  │장바구니│  │관리자│
│      │  │      │  │  주문  │  │      │
└──┬───┘  └──┬───┘  └────┬───┘  └──┬───┘
   └──────────┴────────────┴──────────┘
                 StoreContext
         products / inventory / cart / orders
```
- `<div>` + flexbox + monospace 폰트로 구현
- 박스: `border: 1px solid var(--border-2)`, `border-radius: 8px`
- 하단 연결선: pseudo-element 또는 단순 텍스트 표현

### 데이터 흐름 설명 (2~3줄)
StoreContext가 4개 상태(products/inventory/cart/orders)를 소유하고, 각 탭은 읽기만 함. 쓰기는 반드시 Context의 액션 함수(addToCart, placeOrder, adjustInventory 등)를 통해서만 가능.

### UX 결정 2가지

**모달 통합:**
`modal: { type: 'product' | 'productForm', product }` 단일 객체로 모달 상태 관리. 여러 모달 상태를 따로 관리하면 동시에 두 모달이 열리는 버그 가능성 → 단일 객체로 원천 차단.

**Toast 알림:**
장바구니 담기, 주문 완료, 재고 부족 오류 모두 우하단 toast로 즉시 피드백. setTimeout 3초 자동 제거.

---

## 탭 4 — 완성

### 구현 기능 체크리스트 (2열 그리드)
```
✅ 상품 목록 / 필터 / 검색    ✅ 상품 상세 모달
✅ 장바구니 담기 / 수량 조절  ✅ 주문하기 / 재고 차감
✅ 주문 내역 조회             ✅ 관리자 상품 CRUD
✅ 재고 수량 조정             ✅ 매출 통계 canvas 차트
✅ localStorage 영속성        ✅ Toast 알림 시스템
```

### 라이브 보기 버튼
```
[→ 커머스 시스템 열기]
```
- `href="/commerce.html"`, `.btn-primary` 스타일

### 회고 (2~3줄 텍스트)
단일 HTML 안에서 React 설계 원칙(단방향 데이터 흐름, Context 분리)을 지키는 것이 가장 어려운 제약이었다. 빌드 도구 없이 Babel Standalone만으로 JSX를 쓰는 방식은 포트폴리오 특성상 최선의 트레이드오프였다.

---

## 컴포넌트 구조 (JS)

```js
// 상태
let activeTab = 'background'; // 'background' | 'decisions' | 'design' | 'result'

// 함수
function switchTab(tabId)     // 탭 전환, URL hash 업데이트
function initTheme()          // 라이트/다크 초기화 (localStorage 'hub-theme' 재사용)

// DOM 이벤트
tabButtons.forEach → switchTab
themeBtn → toggleTheme
window.onhashchange → switchTab (뒤로가기 지원)
```

## CSS 토큰 (기존 포트폴리오 변수 재사용)

```css
/* 별도 선언 없이 동일 :root 변수 사용 */
--bg, --bg-2, --ink, --ink-2, --ink-3, --border, --border-2, --accent
```

결정 카드 전용 추가:
```css
.decision-card {
  border-left: 3px solid var(--accent);
  background: var(--bg-2);
  border-radius: 0 8px 8px 0;
  padding: 1.25rem 1.5rem;
}
```

## index.html 수정

`card-list`에 케이스 스터디 카드 1개 추가:
```html
<a href="/casestudy.html" class="tool-card">
  <div class="card-inner">
    <span class="card-icon">📝</span>
    <div class="card-body">
      <div class="card-name">기획 케이스 스터디</div>
      <div class="card-desc">커머스 시스템 — 왜 만들었나 · 어떻게 설계했나 · 무엇을 배웠나</div>
    </div>
    <span class="card-live">New</span>
    <span class="card-arrow">→</span>
  </div>
</a>
```

## Out of Scope

- 다른 툴의 케이스 스터디 (추후 확장 가능하도록 URL 구조만 열어둠)
- 실제 이미지/스크린샷 (텍스트+CSS 다이어그램으로 대체)
- 댓글/공유 기능
- 애니메이션 (fade-in 정도만 허용)
