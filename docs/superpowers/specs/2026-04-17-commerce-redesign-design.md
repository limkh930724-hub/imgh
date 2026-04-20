# Commerce UI 리디자인 — Design Spec
Date: 2026-04-17

## Summary

`commerce.html` 전체 UI를 기업용 ERP 런처 스타일로 완전 개편. 다크 슬레이트 히어로 패널 + 3×3 타일 그리드 홈, 풀페이지 전환 방식의 서브뷰, 인디고 강조색 통일.

## Decisions

| 항목 | 결정 |
|---|---|
| 범위 | 전체 앱 — 홈 + 모든 서브뷰 동일 스타일 |
| 컬러 | 다크 슬레이트(`#0f172a`/`#1e293b`) 히어로 + 인디고(`#6366f1`) 강조 |
| 홈 타일 | 9개 서브 기능 타일 (3×3 그리드) |
| 네비게이션 | 풀페이지 전환 — 타일 클릭 → 서브뷰로 교체, ← 홈 복귀 |

## Design Tokens

```css
--hero-from:   #0f172a   /* 히어로 패널 진한 끝 */
--hero-to:     #1e293b   /* 히어로 패널 밝은 끝 */
--accent:      #6366f1   /* 인디고 강조색 */
--accent-dim:  #818cf8   /* 히어로 내 텍스트 강조 */
--accent-bg:   #ede9fe   /* 뱃지·선택 배경 */
--bg:          #f1f5f9   /* 페이지 배경 */
--surface:     #ffffff   /* 카드·테이블 */
--border:      #e2e8f0   /* 구분선 */
--text:        #0f172a   /* 본문 */
--text-2:      #64748b   /* 보조 텍스트 */
--text-3:      #94a3b8   /* 라벨·플레이스홀더 */
```

## Home Screen

### 레이아웃
```
TopNav (기존 다크 상단 바 유지)
└─ .home-body (bg: --bg, padding: 1.5rem)
   └─ .home-grid (flex, gap: 1rem, height: calc(100vh - topnav))
      ├─ .hero-panel  (width: 34%, border-radius: 16px)
      └─ .tile-grid   (flex: 1, display: grid 3×3, gap: 0.75rem)
```

### Hero Panel
- 배경: `linear-gradient(145deg, --hero-from, --hero-to)`
- 장식: 반투명 원형 2개 (우상단, 좌하단) — `rgba(99,102,241,0.15/0.08)`
- 상단: 시스템 태그 (`Commerce System v2`), 타이틀 (`OMS · WMS / PLM 통합 관리`), 한 줄 설명
- 하단: 유저 카드 — 아바타(인디고 그라디언트) + 이름 + 역할, 반투명 박스
- 강조 텍스트(`PLM` 등): `--accent-dim`

### Tile Grid (3×3)
타일 9개 — 실제 라우트 매핑:

| 아이콘 | 이름 | 서브 레이블 | navigate() 경로 |
|---|---|---|---|
| 📦 | 상품관리 | OMS | `/shop` (ShopPage) |
| 🛒 | 주문관리 | OMS | `/admin/orders` (AdminOrdersPage) |
| 🚚 | 배송관리 | OMS | `/admin/orders` + 배송중 상태 필터 프리셋 |
| 🏭 | 재고관리 | WMS | `/admin/inventory` (AdminInventoryPage) |
| 📥 | 입고관리 | WMS | `/admin/inventory` + 입고 탭 활성 |
| 📤 | 출고관리 | WMS | `/admin/inventory` + 출고 탭 활성 |
| 📐 | 제품관리 | PLM | `/admin/products` (AdminProductsPage) |
| 📊 | 대시보드 | 통계 | `/` (DashboardPage) |
| ⚙️ | 설정 | 시스템 | toast("준비 중입니다") |

> 배송관리·입고관리·출고관리는 별도 뷰 없이 기존 뷰에 `initialFilter` prop을 전달해 필터를 프리셋한다. AdminInventoryPage에 탭(재고현황/입고/출고) 추가가 필요하다.

타일 스타일:
- 기본: `background: --surface`, `border: 1px solid --border`, `border-radius: 10px`
- 호버: `border-color: --accent`, `box-shadow: 0 0 0 3px rgba(99,102,241,0.1)`, `translateY(-2px)`
- 아이콘(font-size: 1.6rem) + 이름(0.78rem, 700, --text) + 서브 레이블(0.62rem, --text-3)

## Sub-view (서브뷰 공통 구조)

```
TopNav (동일)
└─ .sub-body (bg: --bg, padding: 1.5rem)
   ├─ .breadcrumb  ("← 홈" 클릭 → 홈 복귀)
   ├─ .sub-header  (타이틀 + 액션 버튼)
   ├─ .stat-row    (미니 스탯 카드 3~4개, grid)
   └─ .content-card (테이블 or 카드 그리드)
```

### Breadcrumb
- `← 홈` (색: --accent, font-weight: 700) `/` 현재 뷰명
- 클릭 시 JS `showView('home')` 호출

### Sub-header
- 왼쪽: `{아이콘} {뷰명}` (1rem, 800)
- 오른쪽: 보조 버튼(ghost) + 주요 액션(--accent filled)

### Stat Cards
- `background: --surface`, `border: 1px solid --border`, `border-radius: 8px`
- label(0.65rem, uppercase, --text-3) + value(1.1rem, 800)
- 강조: accent(인디고), warn(amber), ok(emerald), 기본(--text)

### Content Card
- `background: --surface`, `border-radius: 12px`, `border: 1px solid --border`
- 내부 헤더: 제목 + 검색 인풋
- 테이블: th(0.65rem, uppercase, --text-3, bg: #f8fafc), td(0.75rem, --text)
- 뱃지: 기존 badge-* 클래스 유지, 색만 토큰으로 정리

## Navigation (JS)

```js
// 현재 구조: React Context의 currentView 상태로 관리
// 변경: showView(viewName) 함수로 홈 ↔ 서브뷰 전환
// viewName: 'home' | 'products' | 'orders' | 'shipping' |
//           'inventory' | 'inbound' | 'outbound' | 'plm' | 'dashboard'
```

- 홈 → 서브뷰: 타일 클릭 → `showView(name)`
- 서브뷰 → 홈: breadcrumb `← 홈` 클릭 → `showView('home')`
- 기존 TopNav 드롭다운 메뉴도 동일 함수 사용

## Preserved

- TopNav 구조 및 동작 그대로 유지
- 기존 React Context 상태 (cart, orders, inventory, plm 데이터) 유지
- 각 서브뷰의 기능(CRUD, 필터, 검색 등) 유지 — 스타일만 변경
- localStorage 키 유지

## Out of Scope

- 설정(⚙️) 뷰 신규 구현 — 타일은 표시하되 "준비 중" toast
- 모바일 반응형 최적화 (기존 수준 유지)
- 다크모드 토글 (TopNav 다크 + 콘텐츠 라이트 고정)
