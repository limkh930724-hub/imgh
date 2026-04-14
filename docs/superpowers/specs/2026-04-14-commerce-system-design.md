# Commerce System Design
**Date:** 2026-04-14  
**Status:** Approved  
**File:** `commerce.html` (기존 포트폴리오 레포에 추가)

## 개요

DB 없이 프론트엔드 상태 관리만으로 OMS(주문) + WMS(재고) + PLM(상품관리) 흐름을 구현하는 통합 커머스 시스템. 개발자 포트폴리오용 단일 HTML 파일로, React CDN + Babel Standalone 방식 (fear-greed.html과 동일한 패턴). 기존 포트폴리오 허브(`index.html`)에 카드 추가.

## 구현 방식

- **파일:** `commerce.html` (현재 레포에 추가)
- **React:** CDN (18.x) + Babel Standalone (인라인 JSX)
- **라우팅:** `window.location.hash` 기반 (`#/`, `#/product/:id`, `#/admin/orders` 등)
- **상태관리:** React Context API 단일 스토어 (`StoreContext`)
- **퍼시스턴스:** localStorage (새로고침 유지)
- **스타일:** 인라인 `<style>` (Inter 폰트, 기존 포트폴리오 다크 톱내비 패턴 유지)

## 데이터 모델

### products[]
```js
{
  id: 'p001',
  name: '무선 키보드',
  category: '전자기기',          // '전자기기' | '가구' | '소모품'
  status: 'active',             // 'active' | 'suspended' | 'discontinued'
  price: { b2c: 89000, b2b: 72000 },
  emoji: '⌨️',
  description: '...'
}
```

### inventory{}
```js
// productId를 키로 O(1) 조회
{ p001: { qty: 50 }, p002: { qty: 3 } }
```

### orders[]
```js
{
  id: 'o1744000000000',
  userId: 'u001',
  userType: 'B2C',
  items: [
    { productId: 'p001', name: '무선 키보드', qty: 2, unitPrice: 89000 }
  ],
  totalAmount: 178000,
  status: 'paid',               // 'paid' | 'shipping' | 'delivered' | 'cancelled'
  createdAt: '2026-04-14T10:00:00.000Z'
}
```

### users[] / currentUser
```js
{ id: 'u001', name: '홍길동', type: 'B2C' }
{ id: 'u002', name: '(주)예시코퍼레이션', type: 'B2B' }
// currentUser: localStorage 'cms-user' 에 저장, 헤더 토글로 전환
```

### 관계
`orders[].items[].productId` → `products[].id` → `inventory[productId]`

## StoreContext

### 상태
```js
const [products, setProducts]       = useState(loadOrInit('cms-products', INIT_PRODUCTS));
const [inventory, setInventory]     = useState(loadOrInit('cms-inventory', INIT_INVENTORY));
const [orders, setOrders]           = useState(loadOrInit('cms-orders', []));
const [currentUser, setCurrentUser] = useState(loadOrInit('cms-user', USERS[0]));
```

localStorage 자동 동기화: 각 상태마다 `useEffect` → `localStorage.setItem`.

### 핵심 액션

#### placeOrder(cartItems)
1. 모든 아이템 재고 검증 (하나라도 부족 → 전체 실패, Error throw)
2. 재고 일괄 차감 (`setInventory` 한 번 호출)
3. 주문 생성 (`status: 'paid'`, 현재 userType 기록, 현재 가격 스냅샷)
4. `setOrders` 추가

#### updateOrderStatus(orderId, newStatus)
```js
const TRANSITIONS = {
  paid:      ['shipping', 'cancelled'],
  shipping:  ['delivered'],
  delivered: [],
  cancelled: []
};
```
- 허용된 전이만 적용, 무효 전이 무시
- `cancelled` 전이 시 → `restoreInventory(order.items)` 재고 복구

#### updateInventory(productId, qty)
- 관리자 직접 수정, `Math.max(0, qty)` 하한 보정

#### saveProduct(product) / deleteProduct(productId)
- 추가(id 없음) / 수정(id 있음) 분기
- 삭제 시 inventory에서도 해당 키 제거

### 가격 헬퍼
```js
function getPrice(product, userType) {
  return product.price[userType.toLowerCase()]; // 'B2C' → b2c
}
```

## 라우팅 (해시 기반)

```
#/                    → ShopPage (상품 목록)
#/product/:id         → ProductDetailPage (상품 상세 + 주문)
#/orders              → MyOrdersPage (내 주문 내역)
#/admin/orders        → AdminOrdersPage
#/admin/products      → AdminProductsPage
#/admin/inventory     → AdminInventoryPage
```

`useHash` 커스텀 훅: `window.addEventListener('hashchange')` + `useState`로 현재 경로 추적.

## 화면 구성

### 공통 TopNav
- 로고(`🛒 CommerceLab`) + `상품목록` + `내주문` + `관리자▼` 드롭다운 + B2C↔B2B 토글
- B2B 전환 즉시 전체 가격 반영 (Context 구독)

### ShopPage (`#/`)
- 카테고리 필터 탭 (전체 / 전자기기 / 가구 / 소모품)
- 상품 카드 그리드 (3열 → 1열 반응형)
- 재고 0 → 카드 흐리게 + "품절" 뱃지
- 판매중지/단종 → 뱃지 표시, [상세보기] 비활성

### ProductDetailPage (`#/product/:id`)
- 가격 표시 (현재 userType 강조, 상대방 회색)
- 수량 ± 버튼 (상한: 재고 수량)
- 주문하기 → placeOrder() → 성공: 토스트 + #/orders 이동 / 실패: 에러 메시지

### MyOrdersPage (`#/orders`)
- currentUser의 주문만 필터
- 상태 뱃지 색상: paid(파랑) / shipping(주황) / delivered(초록) / cancelled(회색)

### AdminOrdersPage (`#/admin/orders`)
- 전체 주문 목록 테이블
- 상태 필터 (전체 / 결제완료 / 배송중 / 완료 / 취소)
- TRANSITIONS 기준 버튼 동적 노출 ([배송시작] [취소] / [배송완료] 등)

### AdminProductsPage (`#/admin/products`)
- 상품 테이블 + [+ 상품 추가] 버튼
- 추가/수정: 인라인 모달 (이름, 카테고리, B2C가격, B2B가격, 상태)
- 삭제: confirm 후 제거

### AdminInventoryPage (`#/admin/inventory`)
- 상품별 재고 수량 직접 수정 (± 버튼 + 입력 + [저장])
- 재고 0 → 행 빨간 강조

## 시드 데이터

상품 8개 (카테고리 3종), 초기 재고 설정, 사용자 2명 (B2C/B2B), 주문 3건 미리 생성 → 첫 실행부터 빈 화면 없음.

초기 로드 시 localStorage 값이 없으면 시드 데이터 사용, 있으면 localStorage 값 사용.

## 포트폴리오 설명 문구

> DB 없이 프론트엔드 상태 관리만으로 OMS(주문), WMS(재고), PLM(상품관리) 흐름을 구현했습니다.
> 특히, **주문 시 재고 자동 차감 로직**, **사용자 유형(B2B/B2C)에 따른 가격 정책**, **주문 상태 흐름 관리**를 통해 실제 커머스 시스템 구조를 반영했습니다.

## index.html 추가 카드

```html
<a href="/commerce.html" class="tool-card live">
  <div class="tool-card-top">
    <span class="tool-icon">🛒</span>
    <span class="tool-tag tag-live">Live</span>
  </div>
  <div class="tool-info">
    <div class="tool-name">커머스 시스템</div>
    <div class="tool-desc">OMS·WMS·PLM 통합 — 주문·재고·상품 흐름을 프론트 상태관리로 구현</div>
  </div>
</a>
```

## sw.js 업데이트

- `CACHE_NAME`: `fg-cache-v8`
- PRECACHE에 `/commerce.html` 추가
