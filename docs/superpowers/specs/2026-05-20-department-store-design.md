# 백화점형 이커머스 — Design Spec
Date: 2026-05-20

## Summary

`commerce.html`을 백화점 온라인몰 스타일로 전면 교체. 모던 클린(화이트/블랙, 산세리프) 비주얼, React CDN + Babel, 단일 `StoreContext`, 탭 4뷰 구조. mockData 기반 가상 브랜드 5개 + 상품 15개로 포트폴리오 수준의 완성도 구현.

## Decisions

| 항목 | 결정 |
|---|---|
| 파일 | `commerce.html` 교체 |
| 스타일 | 모던 클린 — 화이트 배경, 블랙/그레이 타이포, 산세리프(Inter) |
| 기술 | React 18 CDN + Babel Standalone (기존 방식 유지) |
| 상태 | 단일 `StoreContext` — products / inventory / cart / orders |
| 구조 | 탭 4뷰: 홈 / 쇼핑몰 / 장바구니·주문 / 관리자 |
| 데이터 | 가상 브랜드 5개, 상품 15개, 시드 주문 5건 |

## Design Tokens

```css
--bg:        #ffffff
--bg-2:      #f8f8f8   /* 섹션 배경 */
--bg-3:      #f1f1f1   /* 카드 이미지 영역 */
--ink:       #111111   /* 헤딩 */
--ink-2:     #555555   /* 본문 */
--ink-3:     #999999   /* 보조 텍스트 */
--border:    #e5e5e5
--accent:    #111111   /* 주요 버튼, 인디케이터 — 블랙 */
--accent-bg: #f0f0f0   /* 선택 배경 */
--ok:        #16a34a   /* 재고 정상 */
--warn:      #d97706   /* 재고 경고 */
--danger:    #dc2626   /* 재고 부족 / 취소 */
--radius:    8px
```

## mockData 구조

### 브랜드 (5개)

```js
const BRANDS = [
  { id: 'b1', name: 'LUMI',   tagline: '빛나는 피부를 위한',   category: '뷰티',    color: '#f9a8d4' },
  { id: 'b2', name: 'ARCO',   tagline: '현대적인 남성 스타일', category: '남성패션', color: '#93c5fd' },
  { id: 'b3', name: 'VELO',   tagline: '움직임의 자유',        category: '스포츠',  color: '#6ee7b7' },
  { id: 'b4', name: 'MASO',   tagline: '공간을 완성하는',      category: '리빙',    color: '#fcd34d' },
  { id: 'b5', name: 'ELLE.K', tagline: '여성의 우아함',        category: '여성패션', color: '#c4b5fd' },
];
```

### 상품 (15개 — 브랜드당 3개)

```js
{
  id: string,           // 'p01'~'p15'
  brandId: string,      // 'b1'~'b5'
  category: string,     // '뷰티'|'남성패션'|'스포츠'|'리빙'|'여성패션'
  name: string,
  price: number,        // 판매가
  originalPrice: number,// 정가 (price와 같으면 할인 없음)
  discount: number,     // % (0이면 할인 배지 숨김)
  description: string,
  rating: number,       // 1.0–5.0
  reviewCount: number,
  tags: string[],       // ['베스트', '신상', '한정'] 카드 뱃지용
}
```

### 재고

```js
// { [productId]: { qty: number, threshold: number } }
// qty <= threshold → 경고 / qty === 0 → 품절
const INIT_INVENTORY = {
  p01: { qty: 42, threshold: 5 },
  ...
};
```

### 장바구니 아이템

```js
{
  productId: string,
  name: string,
  brandName: string,
  price: number,        // 구매 시점 가격 고정
  qty: number,
  brandColor: string,   // 이미지 영역 배경색
}
```

### 주문

```js
{
  id: string,           // 'ORD-{timestamp}-{random}'
  items: [{ productId, name, price, qty }],
  totalAmount: number,
  status: 'paid' | 'shipping' | 'delivered' | 'cancelled',
  createdAt: string,    // ISO 8601
}
```

## 화면 구조

### TopNav

```
[DEPT°]   홈   쇼핑몰   장바구니·주문   관리자        🛒 (n)
```

- `position: sticky; top: 0` — 흰 배경, 하단 1px border
- 탭 active: 폰트 굵기 증가 + 하단 2px 블랙 인디케이터 (`border-bottom`)
- 장바구니 아이콘: `cartItems.length > 0`일 때 적색 뱃지 표시
- localStorage 키 충돌 방지: `dept-*` 접두사 사용

---

### ① 홈 탭 (`HomeTab`)

```
[히어로 배너]
  배경: 다크 그라디언트 (#111 → #333)
  타이틀: "2026 Summer Collection" + 서브 문구
  CTA 버튼: "지금 쇼핑하기" → ShopTab 이동

[브랜드 스트립]
  5개 브랜드 카드 (가로 스크롤)
  각 카드: 브랜드 컬러 원형 + 이름 + 태그라인
  클릭 → ShopTab으로 이동 + 해당 브랜드 필터 자동 적용

[추천 상품 — "이번 주 베스트"]
  브랜드당 1개 씩 5개 상품 카드 (가로 스크롤)
  카드 클릭 → 상품 상세 모달

[카테고리 퀵링크]
  6개 (전체/여성패션/남성패션/뷰티/리빙/스포츠) 아이콘+레이블
  클릭 → ShopTab + 카테고리 필터 자동 적용
```

---

### ② 쇼핑몰 탭 (`ShopTab`)

**레이아웃**
```
[검색바]  상단 전폭

[사이드바 200px]          [상품 그리드 3열]
  브랜드 체크박스 (5)       상품 카드
  카테고리 라디오 (6)       (필터 결과 없으면 빈 상태 메시지)
  가격대 버튼 그룹
  [필터 초기화]
```

**상품 카드**
- 상단 영역: 브랜드 컬러 배경 + 브랜드 이니셜 텍스트 (이미지 대체)
- 브랜드명 (소문자, `--ink-3`)
- 상품명 (굵게)
- 가격: 할인가 블랙 + 정가 취소선 + 할인율 배지
- `[장바구니 담기]` 버튼 — 품절 시 disabled
- 태그 배지 (`베스트`, `신상`, `한정`)
- 클릭 → `ProductModal` 열기

**ProductModal**
- 오버레이 + 중앙 패널 (max-width 560px)
- 좌: 이미지 영역 (브랜드 컬러 배경)
- 우: 브랜드명, 상품명, 평점(★)+리뷰수, 가격, 설명, 재고 표시
- 수량 선택 (−/+, min 1, max 재고)
- `[장바구니 담기]` → toast 알림 + 수량 뱃지 업데이트
- `[×]` 또는 오버레이 클릭 → 닫기

**필터 로직**
- 브랜드 필터: 체크된 브랜드 중 하나라도 일치하면 표시 (OR)
- 카테고리 필터: 선택된 카테고리와 일치
- 가격대: 선택된 범위 내
- 검색: 상품명 + 브랜드명 포함 여부 (대소문자 무시)
- 모든 필터 AND 조합

---

### ③ 장바구니·주문 탭 (`CartTab`)

**장바구니 섹션**
```
상품 행:
  [컬러 썸네일]  브랜드명 + 상품명  단가  [−] 수량 [+]  소계  [삭제]

품목 없을 때: "장바구니가 비어 있습니다" + "쇼핑몰 가기" 버튼

우측 주문 요약 카드:
  상품 합계
  배송비 (3만원 이상 무료, 미만 3,000원)
  ──────────────
  총 결제금액
  [주문하기] 버튼
  → 재고 확인 후 차감, 주문 생성, 장바구니 비움
  → 재고 부족 시 에러 toast
```

**주문 내역 섹션** (장바구니 아래)
```
테이블:
  주문번호 | 날짜 | 상품 | 금액 | 상태

상태 뱃지 색상:
  paid      → 파랑 (결제완료)
  shipping  → 앰버 (배송중)
  delivered → 그린 (배송완료)
  cancelled → 레드 (취소)
```

---

### ④ 관리자 탭 (`AdminTab`)

**통계 카드 (4개 가로)**
```
총 상품 수  |  총 재고량  |  주문 건수  |  총 매출액
```
- 매출 = `orders.filter(o => o.status !== 'cancelled').totalAmount` 합산

**매출 차트**
- `<canvas>` 기반 바 차트 (vanilla canvas, React 불필요)
- mockData 기준 월별 7일치 일별 매출 데이터 (seed 데이터로 고정)
- x축: 날짜, y축: 금액, 바 색상: `--ink`

**상품 관리 테이블**
```
브랜드 | 상품명 | 판매가 | 할인율 | 재고 | [수정] [삭제]
상단: [+ 상품 등록] 버튼
```
- 등록/수정: `ProductFormModal`
  - 필드: 브랜드(select), 카테고리(select), 상품명, 가격, 정가, 할인율, 설명, 태그
  - 등록 시 `id` 자동 생성, 재고 초기값 10 설정
  - 수정 시 기존 값 pre-fill
- 삭제 시 `confirm()` 대화상자 확인 후 처리. 장바구니에 있는 상품이면 함께 제거.

**재고 관리 테이블**
```
상품명 | 브랜드 | 현재 재고 | 임계값 | [−5][−1][+1][+5] | 상태
```
- 상태 뱃지: `qty === 0` → 품절(레드), `qty <= threshold` → 부족(앰버), 그 외 → 정상(그린)

## 헬퍼 함수

```js
function loadOrInit(key, fallback) { ... }   // localStorage 로드
function save(key, value) { ... }             // localStorage 저장
function fmt(n) { return n.toLocaleString('ko-KR') + '원'; }
function fmtDate(iso) { ... }                 // 'MM.DD HH:mm'
function makeOrderId() { return `ORD-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`; }
function getBrand(brandId) { return BRANDS.find(b => b.id === brandId); }
function toast(msg, type = 'info') { ... }   // 우하단 3초 토스트
```

## 모달 관리

`StoreContext`에 `modal` 상태 하나로 통합:
```js
// null = 닫힘
// { type: 'product', product } = 상품 상세
// { type: 'productForm', product: null | Product } = 등록/수정 폼
modal: null
setModal(val)
```

## 네비게이션

```js
// StoreContext 내
const [currentTab, setCurrentTab] = useState('home');
// 홈 브랜드 클릭, 카테고리 퀵링크 → setCurrentTab('shop') + filter 프리셋
const [shopFilter, setShopFilter] = useState({ brands: [], category: '전체', priceRange: 'all', search: '' });
```

## localStorage 키

| 키 | 내용 |
|---|---|
| `dept-products` | 상품 목록 |
| `dept-inventory` | 재고 |
| `dept-cart` | 장바구니 |
| `dept-orders` | 주문 내역 |

## Out of Scope

- 실제 결제 연동
- 회원가입/로그인 (B2C 단일 사용자 가정)
- 모바일 완전 반응형 (기본 수준 유지)
- 다크모드 토글
- 주문 상태 변경 (배송중→완료 등 관리자 기능 v2)
- 상품 이미지 업로드 (브랜드 컬러 배경으로 대체)
