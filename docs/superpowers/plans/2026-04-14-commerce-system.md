# Commerce System (commerce.html) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 `commerce.html` 파일에 React CDN + Context API로 OMS·WMS·PLM 통합 커머스 시스템 구현

**Architecture:** fear-greed.html과 동일한 정적 HTML 패턴. `<script type="text/babel">` 내 단일 StoreContext가 products/orders/inventory/currentUser 상태를 관리하며 localStorage에 자동 동기화. 해시 기반 라우팅(`#/`, `#/product/:id`, `#/admin/*`)으로 6개 페이지 전환.

**Tech Stack:** React 18 CDN, Babel Standalone, localStorage, Inter font (Google Fonts)

---

### Task 1: HTML 스캐폴드 (head + CDN + 전체 스타일)

**Files:**
- Create: `commerce.html`

- [ ] **Step 1: commerce.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>커머스 시스템 | 임광호 포트폴리오</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛒</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #f8f7f4; color: #1a1a1a; min-height: 100vh; }

    /* ── TopNav ── */
    .topnav { position: sticky; top: 0; z-index: 200; background: rgba(9,9,14,0.97); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0 2rem; display: flex; align-items: center; gap: 0.5rem; height: 54px; }
    .topnav-logo { font-weight: 800; font-size: 0.9rem; color: #fff; text-decoration: none; margin-right: auto; display: flex; align-items: center; gap: 0.4rem; cursor: pointer; }
    .topnav-link { font-size: 0.79rem; font-weight: 500; color: rgba(255,255,255,0.45); text-decoration: none; padding: 0.35rem 0.65rem; border-radius: 7px; cursor: pointer; transition: color 0.15s, background 0.15s; white-space: nowrap; }
    .topnav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }
    .topnav-link.active { color: #a5b4fc; background: rgba(99,102,241,0.15); font-weight: 600; }
    .nav-dropdown { position: relative; }
    .nav-dropdown-menu { position: absolute; top: calc(100% + 6px); right: 0; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0.4rem; min-width: 150px; display: none; flex-direction: column; gap: 0.15rem; z-index: 300; }
    .nav-dropdown:hover .nav-dropdown-menu { display: flex; }
    .nav-dropdown-item { font-size: 0.79rem; color: rgba(255,255,255,0.65); padding: 0.45rem 0.75rem; border-radius: 7px; cursor: pointer; }
    .nav-dropdown-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .user-toggle { display: flex; align-items: center; background: rgba(255,255,255,0.07); border-radius: 20px; padding: 0.2rem 0.3rem; gap: 0.1rem; }
    .user-toggle-btn { font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.4); padding: 0.2rem 0.6rem; border-radius: 14px; cursor: pointer; transition: all 0.15s; }
    .user-toggle-btn.active { background: #6366f1; color: #fff; }

    /* ── Layout ── */
    .page-wrap { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }
    .page-title { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1.5rem; }
    .page-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .back-link { color: #6366f1; font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-bottom: 1.25rem; display: inline-flex; align-items: center; gap: 0.25rem; }

    /* ── Filter Bar ── */
    .filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-btn { border: 1px solid #e0e0e0; background: #fff; color: #666; border-radius: 20px; padding: 0.4rem 1rem; font: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.12s; }
    .filter-btn.active { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #4338ca; }

    /* ── Product Grid & Card ── */
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
    @media (max-width: 768px) { .card-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .card-grid { grid-template-columns: 1fr; } }
    .product-card { background: #fff; border-radius: 16px; padding: 1.25rem; border: 1px solid #ebebeb; transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; position: relative; }
    .product-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.09); transform: translateY(-2px); }
    .product-card.unavailable { opacity: 0.55; cursor: default; }
    .product-card.unavailable:hover { box-shadow: none; transform: none; }
    .card-badge-wrap { position: absolute; top: 1rem; right: 1rem; }
    .product-emoji { font-size: 2.5rem; margin-bottom: 0.75rem; display: block; }
    .product-name { font-weight: 700; font-size: 0.98rem; margin-bottom: 0.25rem; }
    .product-category { font-size: 0.74rem; color: #999; margin-bottom: 0.75rem; }
    .product-price { font-size: 1.1rem; font-weight: 800; color: #1a1a1a; margin-bottom: 0.3rem; }
    .product-stock { font-size: 0.78rem; color: #888; margin-bottom: 1rem; }
    .product-stock.low { color: #d97706; font-weight: 600; }
    .product-stock.zero { color: #dc2626; font-weight: 700; }

    /* ── Badges ── */
    .badge { display: inline-flex; align-items: center; font-size: 0.68rem; font-weight: 700; padding: 0.18rem 0.5rem; border-radius: 20px; }
    .badge-sold-out    { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .badge-suspended   { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
    .badge-discontinued{ background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
    .badge-paid        { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .badge-shipping    { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
    .badge-delivered   { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .badge-cancelled   { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
    .badge-active      { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

    /* ── Buttons ── */
    .btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.55rem 1.1rem; border-radius: 9px; font: inherit; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
    .btn-primary { background: #6366f1; color: #fff; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-primary:disabled { background: #c7d2fe; cursor: not-allowed; }
    .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .btn-secondary:hover { background: #e2e8f0; }
    .btn-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .btn-danger:hover { background: #fee2e2; }
    .btn-sm { padding: 0.28rem 0.65rem; font-size: 0.76rem; border-radius: 7px; }
    .btn-qty { width: 32px; height: 32px; padding: 0; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; font-size: 1rem; cursor: pointer; font-family: inherit; }
    .btn-qty:hover { background: #e2e8f0; }
    .btn-qty:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Product Detail ── */
    .detail-wrap { max-width: 640px; }
    .detail-emoji { font-size: 4rem; display: block; margin-bottom: 0.75rem; }
    .detail-name { font-size: 1.8rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 0.35rem; }
    .detail-category { color: #888; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .price-row { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .price-item { padding: 0.75rem 1.1rem; border-radius: 12px; border: 2px solid #e5e7eb; min-width: 130px; }
    .price-item.active { border-color: #6366f1; background: rgba(99,102,241,0.05); }
    .price-label { font-size: 0.71rem; font-weight: 700; color: #888; margin-bottom: 0.2rem; letter-spacing: 0.04em; }
    .price-value { font-size: 1.2rem; font-weight: 800; color: #1a1a1a; }
    .price-item.active .price-value { color: #4f46e5; }
    .stock-info { font-size: 0.85rem; color: #666; margin-bottom: 1.5rem; }
    .qty-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .qty-display { font-size: 1.1rem; font-weight: 700; min-width: 2rem; text-align: center; }
    .order-total { font-size: 0.92rem; color: #666; margin-bottom: 1.5rem; }
    .order-total strong { font-size: 1.35rem; font-weight: 800; color: #1a1a1a; }
    .detail-desc { color: #666; line-height: 1.75; font-size: 0.9rem; margin-bottom: 1.5rem; border-top: 1px solid #f0f0f0; padding-top: 1.5rem; }
    .error-msg { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.85rem; margin-bottom: 1rem; }

    /* ── Order Cards ── */
    .order-card { background: #fff; border: 1px solid #ebebeb; border-radius: 14px; padding: 1.25rem 1.5rem; margin-bottom: 0.85rem; }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem; }
    .order-meta { font-size: 0.76rem; color: #aaa; font-family: monospace; }
    .order-items-text { font-size: 0.88rem; color: #555; margin-bottom: 0.75rem; line-height: 1.6; }
    .order-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
    .order-amount { font-size: 1rem; font-weight: 800; }
    .empty-state { text-align: center; padding: 4rem 1rem; color: #aaa; }
    .empty-state-icon { font-size: 3rem; margin-bottom: 1rem; }

    /* ── Table ── */
    .table-wrap { overflow-x: auto; border-radius: 14px; border: 1px solid #ebebeb; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th { background: #f8f9fa; font-size: 0.76rem; font-weight: 700; color: #666; text-align: left; padding: 0.75rem 1rem; border-bottom: 1px solid #ebebeb; white-space: nowrap; }
    td { font-size: 0.86rem; padding: 0.85rem 1rem; border-bottom: 1px solid #f5f5f5; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr.row-zero td { background: #fff8f8; }
    .action-btns { display: flex; gap: 0.4rem; flex-wrap: wrap; }

    /* ── Modal ── */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 500; padding: 1rem; }
    .modal { background: #fff; border-radius: 18px; padding: 1.75rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-title { font-size: 1.1rem; font-weight: 800; margin-bottom: 1.5rem; }
    .form-row { margin-bottom: 1rem; }
    .form-label { font-size: 0.76rem; font-weight: 700; color: #555; margin-bottom: 0.35rem; display: block; }
    .form-input, .form-select { width: 100%; border: 1px solid #e2e8f0; border-radius: 9px; padding: 0.6rem 0.85rem; font: inherit; font-size: 0.88rem; background: #fff; }
    .form-input:focus, .form-select:focus { outline: none; border-color: #6366f1; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }

    /* ── Inventory ── */
    .inv-qty-wrap { display: flex; align-items: center; gap: 0.45rem; }
    .inv-qty-input { width: 72px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.32rem 0.5rem; text-align: center; font: inherit; font-size: 0.9rem; font-weight: 700; }

    /* ── Toast ── */
    .toast { position: fixed; bottom: 2rem; right: 2rem; padding: 0.85rem 1.2rem; border-radius: 12px; font-size: 0.87rem; font-weight: 600; z-index: 999; box-shadow: 0 8px 30px rgba(0,0,0,0.14); animation: slideUp 0.25s ease; max-width: 320px; }
    .toast-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
    .toast-error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    function App() { return <div style={{padding:'2rem'}}>🛒 CommerceLab 로딩 중...</div>; }
    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
```

- [ ] **Step 2: 브라우저 확인**

```bash
npx serve .
```
`http://localhost:3000/commerce.html` → "🛒 CommerceLab 로딩 중..." 텍스트, 콘솔 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: commerce.html 스캐폴드 (CDN + 전체 스타일)"
```

---

### Task 2: 상수, 시드 데이터, 헬퍼

**Files:**
- Modify: `commerce.html` — `<script type="text/babel">` 안, `function App()` 위에 삽입

- [ ] **Step 1: 추가**

```jsx
const { useState, useEffect, useContext, createContext } = React;

// ── 상수 ──
const CATEGORIES = ['전체', '전자기기', '가구', '소모품'];

const TRANSITIONS = {
  paid:      ['shipping', 'cancelled'],
  shipping:  ['delivered'],
  delivered: [],
  cancelled: [],
};
const STATUS_LABEL       = { paid:'결제완료', shipping:'배송중', delivered:'배송완료', cancelled:'취소' };
const STATUS_BADGE       = { paid:'badge-paid', shipping:'badge-shipping', delivered:'badge-delivered', cancelled:'badge-cancelled' };
const STATUS_ACTION_LABEL= { shipping:'배송시작', delivered:'배송완료', cancelled:'취소' };
const PRODUCT_STATUS_LABEL= { active:'판매중', suspended:'판매중지', discontinued:'단종' };
const PRODUCT_STATUS_BADGE= { active:'badge-active', suspended:'badge-suspended', discontinued:'badge-discontinued' };

// ── 시드 데이터 ──
const USERS = [
  { id:'u001', name:'홍길동', type:'B2C' },
  { id:'u002', name:'(주)예시코퍼레이션', type:'B2B' },
];

const INIT_PRODUCTS = [
  { id:'p001', name:'무선 키보드',   category:'전자기기', status:'active', price:{b2c:89000, b2b:72000},  emoji:'⌨️',  description:'2.4GHz 무선 연결, 풀배열, 멤브레인 방식의 사무용 키보드입니다.' },
  { id:'p002', name:'모니터 27"',   category:'전자기기', status:'active', price:{b2c:320000,b2b:256000}, emoji:'🖥️',  description:'27인치 IPS 패널, 144Hz, QHD 해상도 게이밍 모니터입니다.' },
  { id:'p003', name:'노트북 거치대', category:'전자기기', status:'active', price:{b2c:45000, b2b:36000},  emoji:'💻',  description:'알루미늄 합금 소재, 높이·각도 조절 가능한 접이식 거치대입니다.' },
  { id:'p004', name:'웹캠 HD',      category:'전자기기', status:'active', price:{b2c:68000, b2b:54000},  emoji:'📷',  description:'1080p/30fps, 내장 마이크, 플러그앤플레이 USB 웹캠입니다.' },
  { id:'p005', name:'무선 마우스',  category:'전자기기', status:'active', price:{b2c:35000, b2b:28000},  emoji:'🖱️',  description:'2.4GHz 무선, 3단계 DPI 조절, 배터리 수명 18개월.' },
  { id:'p006', name:'사무용 의자',  category:'가구',     status:'active', price:{b2c:280000,b2b:224000}, emoji:'🪑',  description:'요추 지지대, 높이·팔걸이·등받이 각도 조절 가능한 메쉬 의자입니다.' },
  { id:'p007', name:'스탠딩 데스크',category:'가구',     status:'active', price:{b2c:450000,b2b:360000}, emoji:'🗃️',  description:'전동 높이 조절(68~118cm), 메모리 4단계, 탑재 하중 80kg.' },
  { id:'p008', name:'A4 복사용지', category:'소모품',    status:'active', price:{b2c:12000, b2b:9600},   emoji:'📄',  description:'80g/m² 500매, 레이저·잉크젯 공용, 백색도 163CIE.' },
];

const INIT_INVENTORY = {
  p001:{qty:50}, p002:{qty:3},  p003:{qty:20},
  p004:{qty:8},  p005:{qty:35}, p006:{qty:5},
  p007:{qty:2},  p008:{qty:0},
};

const SEED_ORDERS = [
  { id:'o_seed_1', userId:'u001', userType:'B2C', items:[{productId:'p001',name:'무선 키보드',qty:2,unitPrice:89000}],   totalAmount:178000, status:'delivered', createdAt:'2026-04-10T09:00:00.000Z' },
  { id:'o_seed_2', userId:'u002', userType:'B2B', items:[{productId:'p002',name:'모니터 27"',qty:1,unitPrice:256000}],  totalAmount:256000, status:'shipping',  createdAt:'2026-04-12T14:30:00.000Z' },
  { id:'o_seed_3', userId:'u001', userType:'B2C', items:[{productId:'p005',name:'무선 마우스',qty:3,unitPrice:35000}],  totalAmount:105000, status:'paid',      createdAt:'2026-04-14T08:00:00.000Z' },
];

// ── 헬퍼 ──
function loadOrInit(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function getPrice(product, userType) {
  return product.price[userType.toLowerCase()];
}
function fmt(n) { return Number(n).toLocaleString('ko-KR') + '원'; }
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
}
```

- [ ] **Step 2: 브라우저 콘솔 확인**

새로고침 후 콘솔:
```js
INIT_PRODUCTS.length  // 8
SEED_ORDERS.length    // 3
fmt(89000)            // "89,000원"
```

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: 시드 데이터 + 헬퍼 함수"
```

---

### Task 3: StoreContext — 상태 + 전체 액션

**Files:**
- Modify: `commerce.html` — 헬퍼 아래, `function App()` 위에 삽입

- [ ] **Step 1: StoreContext + StoreProvider + useStore 추가**

```jsx
// ── Store ──
const StoreContext = createContext(null);

function StoreProvider({ children }) {
  const [products,    setProducts]    = useState(() => loadOrInit('cms-products',  INIT_PRODUCTS));
  const [inventory,   setInventory]   = useState(() => loadOrInit('cms-inventory', INIT_INVENTORY));
  const [orders,      setOrders]      = useState(() => loadOrInit('cms-orders',    SEED_ORDERS));
  const [currentUser, setCurrentUser] = useState(() => loadOrInit('cms-user',      USERS[0]));

  useEffect(() => { save('cms-products',  products);    }, [products]);
  useEffect(() => { save('cms-inventory', inventory);   }, [inventory]);
  useEffect(() => { save('cms-orders',    orders);      }, [orders]);
  useEffect(() => { save('cms-user',      currentUser); }, [currentUser]);

  function restoreInventory(items) {
    setInventory(prev => {
      const next = { ...prev };
      items.forEach(item => {
        next[item.productId] = { qty: (next[item.productId]?.qty ?? 0) + item.qty };
      });
      return next;
    });
  }

  function placeOrder(product, qty) {
    const stock = inventory[product.id]?.qty ?? 0;
    if (stock < qty) throw new Error(`재고 부족: 남은 수량 ${stock}개`);
    setInventory(prev => ({ ...prev, [product.id]: { qty: prev[product.id].qty - qty } }));
    const unitPrice = getPrice(product, currentUser.type);
    const order = {
      id: `o${Date.now()}`,
      userId: currentUser.id,
      userType: currentUser.type,
      items: [{ productId: product.id, name: product.name, qty, unitPrice }],
      totalAmount: unitPrice * qty,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => [order, ...prev]);
    return order;
  }

  function updateOrderStatus(orderId, newStatus) {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      if (!TRANSITIONS[o.status].includes(newStatus)) return o;
      if (newStatus === 'cancelled') restoreInventory(o.items);
      return { ...o, status: newStatus };
    }));
  }

  function updateInventory(productId, qty) {
    setInventory(prev => ({ ...prev, [productId]: { qty: Math.max(0, Number(qty)) } }));
  }

  function saveProduct(product) {
    if (product.id) {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } else {
      const np = { ...product, id: `p${Date.now()}` };
      setProducts(prev => [...prev, np]);
      setInventory(prev => ({ ...prev, [np.id]: { qty: 0 } }));
    }
  }

  function deleteProduct(productId) {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setInventory(prev => { const n = { ...prev }; delete n[productId]; return n; });
  }

  return (
    <StoreContext.Provider value={{
      products, inventory, orders, currentUser, setCurrentUser,
      placeOrder, updateOrderStatus, updateInventory, saveProduct, deleteProduct,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

function useStore() { return useContext(StoreContext); }
```

- [ ] **Step 2: App에 StoreProvider 감싸기**

기존 `ReactDOM.createRoot(...)` 라인을 교체:

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
  <StoreProvider><App /></StoreProvider>
);
```

- [ ] **Step 3: 브라우저 콘솔 확인**

```js
JSON.parse(localStorage.getItem('cms-orders')).length    // 3
JSON.parse(localStorage.getItem('cms-products')).length  // 8
JSON.parse(localStorage.getItem('cms-inventory'))        // {p001:{qty:50}, ...}
```

- [ ] **Step 4: 커밋**

```bash
git add commerce.html
git commit -m "feat: StoreContext + 6개 액션 (placeOrder, updateOrderStatus, 재고 복구 등)"
```

---

### Task 4: useHash + TopNav + App 라우터

**Files:**
- Modify: `commerce.html` — StoreProvider 아래, `function App()` 위에 추가

- [ ] **Step 1: useHash + navigate + 플레이스홀더 페이지들 추가**

```jsx
// ── 라우팅 ──
function useHash() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  useEffect(() => {
    const h = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);
  return hash;
}
function navigate(path) { window.location.hash = '#' + path; }

// ── 플레이스홀더 (Task 5~10에서 교체) ──
function ShopPage()           { return <div className="page-wrap"><p>ShopPage</p></div>; }
function ProductDetailPage()  { return <div className="page-wrap"><p>ProductDetailPage</p></div>; }
function MyOrdersPage()       { return <div className="page-wrap"><p>MyOrdersPage</p></div>; }
function AdminOrdersPage()    { return <div className="page-wrap"><p>AdminOrdersPage</p></div>; }
function AdminProductsPage()  { return <div className="page-wrap"><p>AdminProductsPage</p></div>; }
function AdminInventoryPage() { return <div className="page-wrap"><p>AdminInventoryPage</p></div>; }
```

- [ ] **Step 2: TopNav 컴포넌트 추가 (플레이스홀더 위에)**

```jsx
function TopNav({ currentPath }) {
  const { currentUser, setCurrentUser } = useStore();
  const isAdmin = currentPath.startsWith('/admin');

  return (
    <nav className="topnav">
      <span className="topnav-logo" onClick={() => navigate('/')}>🛒 CommerceLab</span>

      <span className={`topnav-link${currentPath === '/' ? ' active' : ''}`}
            onClick={() => navigate('/')}>상품목록</span>

      <span className={`topnav-link${currentPath === '/orders' ? ' active' : ''}`}
            onClick={() => navigate('/orders')}>내 주문</span>

      <div className="nav-dropdown">
        <span className={`topnav-link${isAdmin ? ' active' : ''}`}>관리자 ▾</span>
        <div className="nav-dropdown-menu">
          <span className="nav-dropdown-item" onClick={() => navigate('/admin/orders')}>주문 관리</span>
          <span className="nav-dropdown-item" onClick={() => navigate('/admin/products')}>상품 관리</span>
          <span className="nav-dropdown-item" onClick={() => navigate('/admin/inventory')}>재고 관리</span>
        </div>
      </div>

      <div className="user-toggle">
        {USERS.map(u => (
          <span key={u.type}
                className={`user-toggle-btn${currentUser.type === u.type ? ' active' : ''}`}
                onClick={() => setCurrentUser(u)}>{u.type}</span>
        ))}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: App 라우터로 교체**

기존 `function App()` 전체를 교체:

```jsx
function App() {
  const hash = useHash();
  const path = hash.replace(/^#/, '') || '/';
  const productMatch = path.match(/^\/product\/(.+)$/);
  const productId = productMatch ? productMatch[1] : null;

  function renderPage() {
    if (productId)                   return <ProductDetailPage productId={productId} />;
    if (path === '/orders')          return <MyOrdersPage />;
    if (path === '/admin/orders')    return <AdminOrdersPage />;
    if (path === '/admin/products')  return <AdminProductsPage />;
    if (path === '/admin/inventory') return <AdminInventoryPage />;
    return <ShopPage />;
  }

  return <div><TopNav currentPath={path} />{renderPage()}</div>;
}
```

- [ ] **Step 4: 브라우저 확인**

- 다크 TopNav 렌더링 확인
- 각 링크 클릭 → URL 해시 변경 확인 (`#/orders`, `#/admin/orders` 등)
- B2C/B2B 토글 클릭 → 버튼 색상 전환 확인

- [ ] **Step 5: 커밋**

```bash
git add commerce.html
git commit -m "feat: 해시 라우터 + TopNav (B2B/B2C 토글, 관리자 드롭다운)"
```

---

### Task 5: ShopPage + ProductCard

**Files:**
- Modify: `commerce.html` — `function ShopPage()` 플레이스홀더 교체, `ProductCard` 추가

- [ ] **Step 1: ProductCard + ShopPage로 플레이스홀더 교체**

```jsx
function ProductCard({ product }) {
  const { inventory, currentUser } = useStore();
  const stock = inventory[product.id]?.qty ?? 0;
  const isOutOfStock  = stock === 0;
  const isUnavailable = isOutOfStock || product.status !== 'active';

  function BadgeEl() {
    if (isOutOfStock)                      return <span className="badge badge-sold-out">품절</span>;
    if (product.status === 'suspended')    return <span className="badge badge-suspended">판매중지</span>;
    if (product.status === 'discontinued') return <span className="badge badge-discontinued">단종</span>;
    return null;
  }

  return (
    <div className={`product-card${isUnavailable ? ' unavailable' : ''}`}
         onClick={() => !isUnavailable && navigate(`/product/${product.id}`)}>
      <div className="card-badge-wrap"><BadgeEl /></div>
      <span className="product-emoji">{product.emoji}</span>
      <div className="product-name">{product.name}</div>
      <div className="product-category">{product.category}</div>
      <div className="product-price">{fmt(getPrice(product, currentUser.type))}</div>
      <div className={`product-stock${stock === 0 ? ' zero' : stock <= 5 ? ' low' : ''}`}>
        {stock === 0 ? '재고 없음' : stock <= 5 ? `재고 ${stock}개 (품절 임박)` : `재고 ${stock}개`}
      </div>
      <button className="btn btn-primary btn-sm" disabled={isUnavailable} style={{marginTop:'auto'}}>
        {isUnavailable ? '구매 불가' : '상세보기 →'}
      </button>
    </div>
  );
}

function ShopPage() {
  const { products } = useStore();
  const [activeCat, setActiveCat] = useState('전체');
  const filtered = activeCat === '전체' ? products : products.filter(p => p.category === activeCat);

  return (
    <div className="page-wrap">
      <div className="page-title">상품 목록</div>
      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`filter-btn${activeCat === cat ? ' active' : ''}`}
                  onClick={() => setActiveCat(cat)}>{cat}</button>
        ))}
      </div>
      <div className="card-grid">
        {filtered.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div>해당 카테고리에 상품이 없습니다.</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

- 상품 8개 카드 그리드 확인
- 카테고리 필터 작동 확인
- A4 복사용지 → "품절" 뱃지 + 카드 흐림 확인
- B2B 토글 → 모든 카드 가격 즉시 변경 확인
- 카드 클릭 → `#/product/p001` 이동 (플레이스홀더 페이지) 확인

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: ShopPage + ProductCard (카테고리 필터, 품절 뱃지)"
```

---

### Task 6: ProductDetailPage + Toast

**Files:**
- Modify: `commerce.html` — Toast 추가, `ProductDetailPage` 플레이스홀더 교체

- [ ] **Step 1: Toast + ProductDetailPage로 플레이스홀더 교체**

```jsx
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`toast toast-${type}`} onClick={onClose}>{message}</div>;
}

function ProductDetailPage({ productId }) {
  const { products, inventory, currentUser, placeOrder } = useStore();
  const [qty, setQty]     = useState(1);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const product = products.find(p => p.id === productId);
  if (!product) return (
    <div className="page-wrap">
      <span className="back-link" onClick={() => navigate('/')}>← 목록으로</span>
      <p>상품을 찾을 수 없습니다.</p>
    </div>
  );

  const stock     = inventory[product.id]?.qty ?? 0;
  const price     = getPrice(product, currentUser.type);
  const isOrderable = product.status === 'active' && stock > 0;

  function handleOrder() {
    setError('');
    try {
      placeOrder(product, qty);
      setToast({ message: `✅ 주문 완료! ${product.name} × ${qty}`, type: 'success' });
      setTimeout(() => navigate('/orders'), 1500);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="page-wrap">
      <span className="back-link" onClick={() => navigate('/')}>← 목록으로</span>
      <div className="detail-wrap">
        <span className="detail-emoji">{product.emoji}</span>
        <div className="detail-name">{product.name}</div>
        <div className="detail-category">
          {product.category} ·{' '}
          <span className={`badge ${PRODUCT_STATUS_BADGE[product.status]}`}>
            {PRODUCT_STATUS_LABEL[product.status]}
          </span>
        </div>

        <div className="price-row">
          {['B2C','B2B'].map(type => (
            <div key={type} className={`price-item${currentUser.type === type ? ' active' : ''}`}>
              <div className="price-label">{type} {type === 'B2C' ? '일반가' : '기업가'}</div>
              <div className="price-value">{fmt(product.price[type.toLowerCase()])}</div>
            </div>
          ))}
        </div>

        <div className="stock-info">
          현재 재고: <strong>{stock}개</strong>
          {stock <= 5 && stock > 0 && <span style={{color:'#d97706',marginLeft:'0.5rem'}}>⚠ 재고 부족</span>}
          {stock === 0 && <span style={{color:'#dc2626',marginLeft:'0.5rem'}}>품절</span>}
        </div>

        <div className="detail-desc">{product.description}</div>

        {isOrderable ? (
          <>
            <div className="qty-row">
              <button className="btn-qty" onClick={() => setQty(q => Math.max(1, q-1))} disabled={qty<=1}>−</button>
              <span className="qty-display">{qty}</span>
              <button className="btn-qty" onClick={() => setQty(q => Math.min(stock, q+1))} disabled={qty>=stock}>+</button>
              <span style={{fontSize:'0.78rem',color:'#aaa'}}>최대 {stock}개</span>
            </div>
            <div className="order-total">
              합계: <strong>{fmt(price * qty)}</strong>
              <span style={{fontSize:'0.76rem',color:'#aaa',marginLeft:'0.5rem'}}>({currentUser.type} 가격 기준)</span>
            </div>
            {error && <div className="error-msg">⚠ {error}</div>}
            <button className="btn btn-primary" onClick={handleOrder}
                    style={{width:'100%',justifyContent:'center',padding:'0.8rem'}}>
              주문하기
            </button>
          </>
        ) : (
          <div className="error-msg">
            {stock === 0 ? '재고가 없어 주문할 수 없습니다.' : '현재 주문할 수 없는 상품입니다.'}
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

1. 상품 카드 클릭 → 상세 페이지 이동
2. B2C/B2B 강조 박스 전환 확인
3. 수량 + 버튼 → 재고 상한 작동 확인
4. "주문하기" → 토스트 → `/orders` 이동 확인
5. 콘솔: `JSON.parse(localStorage.getItem('cms-inventory')).p001.qty` → 48 (50-2)
6. A4 복사용지 (재고 0) → "재고가 없어 주문할 수 없습니다." 확인

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: ProductDetailPage + Toast + placeOrder 연결 (재고 차감, 에러 처리)"
```

---

### Task 7: MyOrdersPage

**Files:**
- Modify: `commerce.html` — `MyOrdersPage` 플레이스홀더 교체

- [ ] **Step 1: MyOrdersPage 교체**

```jsx
function MyOrdersPage() {
  const { orders, currentUser } = useStore();
  const myOrders = orders.filter(o => o.userId === currentUser.id);

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <div className="page-title">내 주문 내역</div>
        <span style={{fontSize:'0.85rem',color:'#888'}}>{currentUser.name} ({currentUser.type})</span>
      </div>

      {myOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div>아직 주문 내역이 없습니다.</div>
          <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => navigate('/')}>
            쇼핑하러 가기
          </button>
        </div>
      ) : myOrders.map(order => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <span className="order-meta">#{order.id.slice(-8)}</span>
            <span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span>
          </div>
          <div className="order-items-text">
            {order.items.map(item => (
              <div key={item.productId}>{item.name} × {item.qty} — {fmt(item.unitPrice * item.qty)}</div>
            ))}
          </div>
          <div className="order-footer">
            <span className="order-amount">총 {fmt(order.totalAmount)}</span>
            <span className="order-meta">{fmtDate(order.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

- B2C(홍길동) → 시드 주문 2건 (delivered, paid) 표시 확인
- B2B 전환 → 시드 주문 1건 (shipping) 표시 확인
- 상태 뱃지 색상 (paid=파랑, shipping=주황, delivered=초록) 확인

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: MyOrdersPage (사용자별 주문 내역, 상태 뱃지)"
```

---

### Task 8: AdminOrdersPage

**Files:**
- Modify: `commerce.html` — `AdminOrdersPage` 플레이스홀더 교체

- [ ] **Step 1: AdminOrdersPage 교체**

```jsx
function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState('전체');
  const STATUS_FILTERS = ['전체', 'paid', 'shipping', 'delivered', 'cancelled'];
  const filtered = statusFilter === '전체' ? orders : orders.filter(o => o.status === statusFilter);

  return (
    <div className="page-wrap">
      <div className="page-title">주문 관리</div>
      <div className="filter-bar">
        {STATUS_FILTERS.map(f => (
          <button key={f} className={`filter-btn${statusFilter === f ? ' active' : ''}`}
                  onClick={() => setStatusFilter(f)}>
            {f === '전체' ? '전체' : STATUS_LABEL[f]}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th>주문번호</th><th>사용자</th><th>유형</th>
            <th>상품</th><th>금액</th><th>일시</th><th>상태</th><th>액션</th>
          </tr></thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id}>
                <td style={{fontFamily:'monospace',fontSize:'0.74rem',color:'#aaa'}}>#{order.id.slice(-8)}</td>
                <td>{USERS.find(u => u.id === order.userId)?.name ?? order.userId}</td>
                <td><span className={`badge ${order.userType==='B2B'?'badge-shipping':'badge-paid'}`}>{order.userType}</span></td>
                <td>{order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                <td style={{fontWeight:700}}>{fmt(order.totalAmount)}</td>
                <td style={{color:'#aaa',fontSize:'0.78rem'}}>{fmtDate(order.createdAt)}</td>
                <td><span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span></td>
                <td>
                  <div className="action-btns">
                    {TRANSITIONS[order.status].map(next => (
                      <button key={next}
                              className={`btn btn-sm ${next==='cancelled'?'btn-danger':'btn-secondary'}`}
                              onClick={() => updateOrderStatus(order.id, next)}>
                        {STATUS_ACTION_LABEL[next]}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="empty-state" style={{paddingTop:'2rem'}}><div>해당 상태의 주문이 없습니다.</div></div>}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

1. `#/admin/orders` → 3건 테이블 확인
2. `o_seed_3` (paid) → [배송시작] [취소] 버튼 확인
3. [배송시작] → "배송중" 변경, [배송완료]만 남음 확인
4. [취소] → "취소" 변경, 재고 복구 확인: `JSON.parse(localStorage.getItem('cms-inventory')).p005.qty` → 38 (35+3)

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: AdminOrdersPage (상태 전이 버튼, 취소 시 재고 복구)"
```

---

### Task 9: AdminProductsPage

**Files:**
- Modify: `commerce.html` — `AdminProductsPage` 플레이스홀더 교체

- [ ] **Step 1: AdminProductsPage 교체**

```jsx
function AdminProductsPage() {
  const { products, saveProduct, deleteProduct } = useStore();
  const EMPTY = { id:'', name:'', category:'전자기기', status:'active', price:{b2c:'',b2b:''}, emoji:'📦', description:'' };
  const [modal, setModal] = useState(null);

  function handleSave() {
    if (!modal.name.trim()) return alert('상품명을 입력하세요.');
    if (!modal.price.b2c || !modal.price.b2b) return alert('가격을 입력하세요.');
    saveProduct({ ...modal, price: { b2c: Number(modal.price.b2c), b2b: Number(modal.price.b2b) } });
    setModal(null);
  }

  function setField(key, val) { setModal(prev => ({ ...prev, [key]: val })); }
  function setPriceField(key, val) { setModal(prev => ({ ...prev, price: { ...prev.price, [key]: val } })); }

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <div className="page-title">상품 관리</div>
        <button className="btn btn-primary" onClick={() => setModal({ ...EMPTY })}>+ 상품 추가</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>상품</th><th>카테고리</th><th>B2C</th><th>B2B</th><th>상태</th><th>액션</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.emoji} {p.name}</td>
                <td>{p.category}</td>
                <td>{fmt(p.price.b2c)}</td>
                <td>{fmt(p.price.b2b)}</td>
                <td><span className={`badge ${PRODUCT_STATUS_BADGE[p.status]}`}>{PRODUCT_STATUS_LABEL[p.status]}</span></td>
                <td>
                  <div className="action-btns">
                    <button className="btn btn-sm btn-secondary"
                            onClick={() => setModal({ ...p, price:{ b2c:p.price.b2c, b2b:p.price.b2b } })}>수정</button>
                    <button className="btn btn-sm btn-danger"
                            onClick={() => window.confirm(`"${p.name}" 삭제?`) && deleteProduct(p.id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal.id ? '상품 수정' : '상품 추가'}</div>
            <div className="form-row-2">
              <div className="form-row" style={{marginBottom:0}}>
                <label className="form-label">이모지</label>
                <input className="form-input" value={modal.emoji} onChange={e => setField('emoji', e.target.value)} style={{width:'70px'}} />
              </div>
              <div className="form-row" style={{marginBottom:0}}>
                <label className="form-label">상품명 *</label>
                <input className="form-input" value={modal.name} onChange={e => setField('name', e.target.value)} placeholder="상품명" />
              </div>
            </div>
            <div className="form-row" style={{marginTop:'1rem'}}>
              <label className="form-label">설명</label>
              <input className="form-input" value={modal.description} onChange={e => setField('description', e.target.value)} placeholder="상품 설명" />
            </div>
            <div className="form-row-2" style={{marginTop:'0.75rem'}}>
              <div>
                <label className="form-label">카테고리</label>
                <select className="form-select" value={modal.category} onChange={e => setField('category', e.target.value)}>
                  {['전자기기','가구','소모품'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">상태</label>
                <select className="form-select" value={modal.status} onChange={e => setField('status', e.target.value)}>
                  <option value="active">판매중</option>
                  <option value="suspended">판매중지</option>
                  <option value="discontinued">단종</option>
                </select>
              </div>
            </div>
            <div className="form-row-2" style={{marginTop:'0.75rem'}}>
              <div>
                <label className="form-label">B2C 가격 (원) *</label>
                <input className="form-input" type="number" value={modal.price.b2c} onChange={e => setPriceField('b2c', e.target.value)} placeholder="89000" />
              </div>
              <div>
                <label className="form-label">B2B 가격 (원) *</label>
                <input className="form-input" type="number" value={modal.price.b2b} onChange={e => setPriceField('b2b', e.target.value)} placeholder="72000" />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

1. `#/admin/products` → 8개 테이블 확인
2. [+ 상품 추가] → 모달, 입력 후 [저장] → 목록 추가 확인
3. [수정] → 기존 값 채워짐, 변경 후 [저장] 확인
4. [삭제] → confirm 후 제거 확인
5. 새로고침 → localStorage에서 유지 확인

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: AdminProductsPage (상품 CRUD, 추가/수정 모달)"
```

---

### Task 10: AdminInventoryPage

**Files:**
- Modify: `commerce.html` — `AdminInventoryPage` 플레이스홀더 교체

- [ ] **Step 1: AdminInventoryPage 교체**

```jsx
function AdminInventoryPage() {
  const { products, inventory, updateInventory } = useStore();
  const [localQty, setLocalQty] = useState(() => {
    const init = {};
    Object.keys(inventory).forEach(id => { init[id] = inventory[id].qty; });
    return init;
  });

  function adjust(productId, delta) {
    setLocalQty(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] ?? 0) + delta) }));
  }

  return (
    <div className="page-wrap">
      <div className="page-title">재고 관리</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>상품</th><th>카테고리</th><th>현재 재고</th><th>수정</th><th></th></tr></thead>
          <tbody>
            {products.map(p => {
              const current  = inventory[p.id]?.qty ?? 0;
              const editQty  = localQty[p.id] ?? 0;
              const isDirty  = editQty !== current;
              return (
                <tr key={p.id} className={current === 0 ? 'row-zero' : ''}>
                  <td>{p.emoji} {p.name}</td>
                  <td>{p.category}</td>
                  <td style={{fontWeight:700, color: current===0?'#dc2626':'#1a1a1a'}}>
                    {current}개
                    {current === 0 && <span className="badge badge-sold-out" style={{marginLeft:'0.5rem'}}>품절</span>}
                  </td>
                  <td>
                    <div className="inv-qty-wrap">
                      <button className="btn-qty" onClick={() => adjust(p.id, -1)} disabled={editQty<=0}>−</button>
                      <input className="inv-qty-input" type="number" min="0" value={editQty}
                             onChange={e => setLocalQty(prev => ({ ...prev, [p.id]: Number(e.target.value) }))} />
                      <button className="btn-qty" onClick={() => adjust(p.id, 1)}>+</button>
                    </div>
                  </td>
                  <td>
                    <button className={`btn btn-sm ${isDirty?'btn-primary':'btn-secondary'}`}
                            disabled={!isDirty}
                            onClick={() => updateInventory(p.id, editQty)}>저장</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 브라우저 확인**

1. `#/admin/inventory` → 8개 행, A4 복사용지 행 빨간 배경 확인
2. 수량 변경 → [저장] 버튼 파랑 활성화 확인
3. [저장] → "현재 재고" 열 변경 확인
4. `#/` 이동 → 해당 상품 재고 반영 확인

- [ ] **Step 3: 커밋**

```bash
git add commerce.html
git commit -m "feat: AdminInventoryPage (재고 직접 수정, dirty 상태)"
```

---

### Task 11: index.html 카드 + sw.js + CLAUDE.md

**Files:**
- Modify: `index.html`
- Modify: `sw.js`
- Modify: `CLAUDE.md`

- [ ] **Step 1: index.html — agents.html 카드 아래에 추가**

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

- [ ] **Step 2: sw.js — 캐시 버전 + PRECACHE 업데이트**

`sw.js` 상단 두 줄을 교체:

```js
const CACHE_NAME = 'fg-cache-v8';
const PRECACHE = ['/', '/index.html', '/fear-greed.html', '/asset.html', '/compound.html', '/goal.html', '/journal.html', '/backtest.html', '/workout.html', '/agents.html', '/commerce.html', '/manifest.json', '/icon.svg'];
```

- [ ] **Step 3: CLAUDE.md 파일 테이블 업데이트**

CLAUDE.md의 파일 테이블에 행 추가:

```
| `commerce.html` | 커머스 시스템 — OMS+WMS+PLM, React CDN + Context API | ~TBD |
```

sw.js 버전을 `v7` → `v8`로 업데이트.

- [ ] **Step 4: 브라우저 확인**

`http://localhost:3000/` → "커머스 시스템" 카드 표시, 클릭 → `commerce.html` 이동 확인

- [ ] **Step 5: 커밋**

```bash
git add index.html sw.js CLAUDE.md
git commit -m "feat: index.html 커머스 카드 추가, sw.js v8, CLAUDE.md 업데이트"
```

---

## 스펙 커버리지

| 요구사항 | 구현 태스크 |
|---|---|
| 상품 목록/상세 조회 | Task 5 ShopPage, Task 6 ProductDetailPage |
| 상품 CRUD + 상태 관리 | Task 9 AdminProductsPage |
| B2B/B2C 가격 분리 | Task 2 getPrice, Task 4 TopNav 토글, Task 5/6 UI |
| 주문 생성 + 재고 자동 차감 | Task 3 placeOrder, Task 6 연결 |
| 재고 부족 시 주문 차단 | Task 3 throw Error, Task 6 error UI |
| 주문 상태 전이 | Task 3 TRANSITIONS + updateOrderStatus, Task 8 |
| 주문 취소 시 재고 복구 | Task 3 restoreInventory, Task 8 확인 |
| 내 주문 내역 | Task 7 MyOrdersPage |
| 재고 직접 수정 (관리자) | Task 10 AdminInventoryPage |
| localStorage 유지 | Task 3 useEffect 동기화 |
| 시드 데이터 (첫 실행 빈 화면 없음) | Task 2 SEED_ORDERS |
| index.html 카드 | Task 11 |
| sw.js 업데이트 | Task 11 |
