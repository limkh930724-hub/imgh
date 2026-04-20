# Commerce UI 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `commerce.html` 전체 UI를 다크 슬레이트 히어로 패널 + 3×3 타일 런처 홈 + 통일된 서브뷰 스타일로 재구축한다.

**Architecture:** 단일 HTML 파일 내 React CDN + Babel 구조 유지. 해시 기반 라우팅(`#/`, `#/shop`, `#/admin/orders` 등)에 `/dashboard`, `/admin/orders/shipping`, `/admin/inventory/inbound`, `/admin/inventory/outbound` 신규 경로를 추가. `/` 는 새 `HomeLauncherPage`를 렌더하고, 기존 `DashboardPage`는 `/dashboard`로 이동.

**Tech Stack:** Vanilla HTML/CSS, React 18 (CDN), Babel Standalone (JSX), hash routing, localStorage

---

## File Map

| 파일 | 작업 |
|---|---|
| `commerce.html:14-229` | CSS — 디자인 토큰 + 홈 + 서브뷰 공통 스타일로 전면 교체 |
| `commerce.html:442-452` | useHash() / navigate() — 변경 없음 |
| `commerce.html:499-497` | OnboardingBanner — 제거 |
| `commerce.html:499+` | HomeLauncherPage 신규 추가 |
| `commerce.html:DashboardPage` | `/dashboard` 경로 서브뷰로 리스타일 |
| `commerce.html:AdminOrdersPage` | shipping filter 프리셋 + 새 레이아웃 |
| `commerce.html:AdminInventoryPage` | 탭(재고현황/입고/출고) + 새 레이아웃 |
| `commerce.html:AdminProductsPage` | 새 레이아웃 |
| `commerce.html:ShopPage` | 새 레이아웃 |
| `commerce.html:TopNav` | 새 경로 active 판정 + 설정 toast |
| `commerce.html:renderPage()` | 새 경로 추가 |

---

## Task 1: CSS — 디자인 토큰 + 홈 스타일

**Files:**
- Modify: `commerce.html` — `<style>` 블록 상단에 토큰 추가, 홈 관련 클래스 추가

- [ ] **Step 1: `<style>` 최상단(line 15 직후)에 디자인 토큰 삽입**

`*, *::before, *::after { ... }` 바로 위에 삽입:

```css
:root {
  --hero-from:  #0f172a;
  --hero-to:    #1e293b;
  --accent:     #6366f1;
  --accent-dim: #818cf8;
  --accent-bg:  #ede9fe;
  --bg:         #f1f5f9;
  --surface:    #ffffff;
  --border:     #e2e8f0;
  --text:       #0f172a;
  --text-2:     #64748b;
  --text-3:     #94a3b8;
}
```

- [ ] **Step 2: `body` 배경색을 토큰으로 교체**

기존:
```css
body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #f8f7f4; color: #1a1a1a; min-height: 100vh; }
```
변경:
```css
body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
```

- [ ] **Step 3: 홈 화면 CSS 추가** — `.page-wrap` 정의 직후에 삽입

```css
/* ── Home Launcher ── */
.home-body { background: var(--bg); padding: 1.5rem; height: calc(100vh - 54px); display: flex; align-items: stretch; }
.home-grid { display: flex; gap: 1rem; width: 100%; }
.hero-panel {
  width: 34%; background: linear-gradient(145deg, var(--hero-from) 0%, var(--hero-to) 60%, #1e3a5f 100%);
  border-radius: 16px; padding: 1.5rem; color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden; flex-shrink: 0;
}
.hero-panel::before {
  content: ''; position: absolute; top: -40px; right: -40px;
  width: 130px; height: 130px; background: rgba(99,102,241,0.15); border-radius: 50%;
}
.hero-panel::after {
  content: ''; position: absolute; bottom: 30px; left: -25px;
  width: 90px; height: 90px; background: rgba(99,102,241,0.08); border-radius: 50%;
}
.hero-tag { font-size: 0.65rem; color: var(--accent-dim); font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 0.5rem; }
.hero-title { font-size: 1.35rem; font-weight: 800; line-height: 1.25; }
.hero-title .hl { color: var(--accent-dim); }
.hero-desc { font-size: 0.72rem; color: rgba(255,255,255,0.5); line-height: 1.6; margin-top: 0.6rem; }
.hero-user { display: flex; align-items: center; gap: 0.6rem; background: rgba(255,255,255,0.07); border-radius: 10px; padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.08); }
.hero-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg,var(--accent),var(--accent-dim)); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; flex-shrink: 0; }
.hero-user-name { font-size: 0.72rem; font-weight: 700; }
.hero-user-role { font-size: 0.6rem; color: rgba(255,255,255,0.45); }
.tile-area { flex: 1; display: flex; flex-direction: column; }
.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; flex: 1; }
.tile {
  background: var(--surface); border-radius: 12px; border: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.4rem; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  padding: 1rem 0.5rem;
}
.tile:hover { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); transform: translateY(-2px); }
.tile-icon { font-size: 1.7rem; line-height: 1; }
.tile-name { font-size: 0.78rem; font-weight: 700; color: var(--text); }
.tile-sub { font-size: 0.62rem; color: var(--text-3); }
```

- [ ] **Step 4: 브라우저에서 `/` 경로가 홈처럼 보이는지 확인하기 위해 서버 실행**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
> 아직 HomeLauncherPage 컴포넌트가 없으니 기존 화면이 뜨는 게 정상. CSS 오류만 없으면 OK.

- [ ] **Step 5: Commit**

```bash
cd D:/intellij_2024/fear-and-greed
git add commerce.html
git commit -m "style: commerce 디자인 토큰 + 홈 CSS 추가"
```

---

## Task 2: HomeLauncherPage 컴포넌트 + 라우팅

**Files:**
- Modify: `commerce.html` — OnboardingBanner 제거, HomeLauncherPage 추가, renderPage() 수정

- [ ] **Step 1: OnboardingBanner 함수 전체 삭제** (lines 454-472)

`// ── OnboardingBanner ──` 부터 닫는 `}` 까지 삭제.

- [ ] **Step 2: `// ── DashboardPage ──` 바로 위에 HomeLauncherPage 삽입**

```jsx
// ── HomeLauncherPage ──
const TILES = [
  { icon:'📦', name:'상품관리', sub:'OMS',  path:'/shop' },
  { icon:'🛒', name:'주문관리', sub:'OMS',  path:'/admin/orders' },
  { icon:'🚚', name:'배송관리', sub:'OMS',  path:'/admin/orders/shipping' },
  { icon:'🏭', name:'재고관리', sub:'WMS',  path:'/admin/inventory' },
  { icon:'📥', name:'입고관리', sub:'WMS',  path:'/admin/inventory/inbound' },
  { icon:'📤', name:'출고관리', sub:'WMS',  path:'/admin/inventory/outbound' },
  { icon:'📐', name:'제품관리', sub:'PLM',  path:'/admin/products' },
  { icon:'📊', name:'대시보드', sub:'통계', path:'/dashboard' },
  { icon:'⚙️', name:'설정',    sub:'시스템', path:null },
];

function HomeLauncherPage() {
  const { currentUser } = useStore();
  const [settingToast, setSettingToast] = useState(false);

  function handleTile(tile) {
    if (!tile.path) { setSettingToast(true); return; }
    navigate(tile.path);
  }

  return (
    <div className="home-body">
      <div className="home-grid">
        <div className="hero-panel">
          <div>
            <div className="hero-tag">Commerce System v2</div>
            <div className="hero-title">
              OMS · WMS<br /><span className="hl">PLM</span> 통합 관리
            </div>
            <div className="hero-desc">
              주문부터 창고·제품까지<br />
              실시간 데이터로 보이는<br />
              현장관리를 실현합니다.
            </div>
          </div>
          <div className="hero-user">
            <div className="hero-avatar">{currentUser?.name?.[0] ?? '관'}</div>
            <div>
              <div className="hero-user-name">{currentUser?.name ?? '관리자'}</div>
              <div className="hero-user-role">{currentUser?.type === 'admin' ? '시스템 관리자' : currentUser?.type === 'B2B' ? 'B2B 거래처' : '일반 고객'}</div>
            </div>
          </div>
        </div>
        <div className="tile-area">
          <div className="tile-grid">
            {TILES.map(tile => (
              <div key={tile.name} className="tile" onClick={() => handleTile(tile)}>
                <div className="tile-icon">{tile.icon}</div>
                <div className="tile-name">{tile.name}</div>
                <div className="tile-sub">{tile.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {settingToast && <Toast message="⚙️ 설정 기능은 준비 중입니다." type="info" onClose={() => setSettingToast(false)} />}
    </div>
  );
}
```

- [ ] **Step 3: Toast 컴포넌트에 `toast-info` 스타일 추가**

기존 `.toast-success`, `.toast-error` 옆에:
```css
.toast-info    { background: #3730a3; }
```

- [ ] **Step 4: renderPage() 라우트 테이블 수정**

기존:
```js
function renderPage() {
  if (productId)                   return <ProductDetailPage productId={productId} />;
  if (path === '/shop')            return <ShopPage />;
  if (path === '/cart')            return <CartPage />;
  if (path === '/orders')          return <MyOrdersPage />;
  if (path === '/admin/orders')    return <AdminOrdersPage />;
  if (path === '/admin/products')  return <AdminProductsPage />;
  if (path === '/admin/inventory') return <AdminInventoryPage />;
  return <DashboardPage />;
}
```
변경:
```js
function renderPage() {
  if (productId)                              return <ProductDetailPage productId={productId} />;
  if (path === '/shop')                       return <ShopPage />;
  if (path === '/cart')                       return <CartPage />;
  if (path === '/orders')                     return <MyOrdersPage />;
  if (path === '/dashboard')                  return <DashboardPage />;
  if (path === '/admin/orders')               return <AdminOrdersPage initialFilter="전체" />;
  if (path === '/admin/orders/shipping')      return <AdminOrdersPage initialFilter="shipping" />;
  if (path === '/admin/products')             return <AdminProductsPage />;
  if (path === '/admin/inventory')            return <AdminInventoryPage initialTab="재고현황" />;
  if (path === '/admin/inventory/inbound')    return <AdminInventoryPage initialTab="입고" />;
  if (path === '/admin/inventory/outbound')   return <AdminInventoryPage initialTab="출고" />;
  return <HomeLauncherPage />;
}
```

- [ ] **Step 5: 서버 실행해서 홈 런처 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
`http://localhost:8080/commerce.html` 접속 → 히어로 패널 + 타일 그리드 확인.  
각 타일 클릭 → URL hash 변경 확인.  
설정 타일 클릭 → "설정 기능은 준비 중입니다." toast 확인.

- [ ] **Step 6: Commit**

```bash
git add commerce.html
git commit -m "feat: commerce HomeLauncherPage + 신규 라우트 추가"
```

---

## Task 3: 서브뷰 공통 CSS + Breadcrumb 컴포넌트

**Files:**
- Modify: `commerce.html` — 서브뷰 공통 CSS + Breadcrumb React 컴포넌트

- [ ] **Step 1: 서브뷰 공통 CSS 추가** — Task 1에서 추가한 홈 CSS 아래에 삽입

```css
/* ── Sub-view Shell ── */
.sv-body { background: var(--bg); padding: 1.5rem; min-height: calc(100vh - 54px); }
.sv-breadcrumb { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 1rem; font-size: 0.72rem; color: var(--text-3); }
.sv-breadcrumb .sv-back { color: var(--accent); font-weight: 700; cursor: pointer; }
.sv-breadcrumb .sv-back:hover { text-decoration: underline; }
.sv-breadcrumb .sv-sep { color: var(--border); }
.sv-breadcrumb .sv-cur { color: var(--text); font-weight: 600; }
.sv-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
.sv-title { font-size: 1rem; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 0.4rem; }
.sv-actions { display: flex; gap: 0.4rem; }
.sv-stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
@media (max-width: 768px) { .sv-stat-row { grid-template-columns: repeat(2, 1fr); } }
.sv-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.75rem 1rem; }
.sv-stat-label { font-size: 0.62rem; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
.sv-stat-val { font-size: 1.2rem; font-weight: 800; color: var(--text); line-height: 1; }
.sv-stat-val.accent { color: var(--accent); }
.sv-stat-val.warn   { color: #f59e0b; }
.sv-stat-val.ok     { color: #10b981; }
.sv-stat-val.danger { color: #ef4444; }
.sv-card { background: var(--surface); border-radius: 12px; border: 1px solid var(--border); overflow: hidden; }
.sv-card-header { padding: 0.75rem 1rem; border-bottom: 1px solid var(--bg); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.sv-card-title { font-size: 0.82rem; font-weight: 700; color: var(--text-2); }
.sv-search { background: var(--bg); border: 1px solid var(--border); border-radius: 7px; padding: 0.3rem 0.7rem 0.3rem 1.8rem; font: inherit; font-size: 0.78rem; color: var(--text); width: 180px; }
.sv-search-wrap { position: relative; }
.sv-search-icon { position: absolute; left: 0.5rem; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-3); pointer-events: none; }
/* Tabs */
.sv-tabs { display: flex; gap: 0.15rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border); background: var(--surface); }
.sv-tab { padding: 0.3rem 0.85rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; color: var(--text-3); cursor: pointer; transition: all 0.12s; }
.sv-tab.active { background: var(--accent-bg); color: var(--accent); }
.sv-tab:hover:not(.active) { background: var(--bg); color: var(--text-2); }
```

- [ ] **Step 2: `// ── Toast ──` 바로 위에 Breadcrumb 컴포넌트 추가**

```jsx
// ── Breadcrumb ──
function Breadcrumb({ current }) {
  return (
    <div className="sv-breadcrumb">
      <span className="sv-back" onClick={() => navigate('/')}>← 홈</span>
      <span className="sv-sep">/</span>
      <span className="sv-cur">{current}</span>
    </div>
  );
}
```

- [ ] **Step 3: 서버에서 CSS 오류 없음 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
브라우저 콘솔에 오류 없으면 OK.

- [ ] **Step 4: Commit**

```bash
git add commerce.html
git commit -m "style: commerce 서브뷰 공통 CSS + Breadcrumb 컴포넌트"
```

---

## Task 4: DashboardPage + AdminOrdersPage 리스타일

**Files:**
- Modify: `commerce.html` — DashboardPage, AdminOrdersPage

- [ ] **Step 1: DashboardPage를 서브뷰 레이아웃으로 교체**

기존 DashboardPage return 블록 전체를 교체:

```jsx
function DashboardPage() {
  const { orders, products, inventory } = useStore();

  const totalOrders   = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipping').length;
  const totalRevenue  = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const lowStockCount = products.filter(p => (inventory[p.id]?.qty ?? 0) < (MIN_QTY[p.id] ?? 5)).length;

  const recentOrders = [...orders].sort((a,b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="sv-body">
      <Breadcrumb current="📊 대시보드" />
      <div className="sv-header">
        <div className="sv-title">📊 대시보드</div>
      </div>
      <div className="sv-stat-row">
        <div className="sv-stat">
          <div className="sv-stat-label">전체 주문</div>
          <div className="sv-stat-val accent">{totalOrders}</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-label">처리 중</div>
          <div className="sv-stat-val warn">{pendingOrders}</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-label">총 매출</div>
          <div className="sv-stat-val ok" style={{fontSize:'0.95rem'}}>{fmt(totalRevenue)}</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-label">재고 경보</div>
          <div className={`sv-stat-val ${lowStockCount > 0 ? 'danger' : 'ok'}`}>{lowStockCount}</div>
        </div>
      </div>
      <div className="sv-card">
        <div className="sv-card-header">
          <div className="sv-card-title">최근 주문</div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/admin/orders')}>전체 보기</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>주문번호</th><th>상품</th>
              <th style={{textAlign:'right'}}>금액</th><th>상태</th>
            </tr></thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{fontFamily:'monospace',fontSize:'0.73rem',color:'#bbb'}}>{o.id}</td>
                  <td style={{color:'var(--text-2)'}}>{o.items.map(i=>`${i.name}×${i.qty}`).join(', ')}</td>
                  <td style={{textAlign:'right',fontWeight:800}}>{fmt(o.totalAmount)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: AdminOrdersPage에 `initialFilter` prop + 서브뷰 레이아웃 적용**

기존 `function AdminOrdersPage()` 전체를 교체:

```jsx
function AdminOrdersPage({ initialFilter = '전체' }) {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const STATUS_FILTERS = ['전체', 'paid', 'shipping', 'delivered', 'cancelled'];

  const filtered = orders
    .filter(o => statusFilter === '전체' || o.status === statusFilter)
    .filter(o => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q)
        || o.items.some(i => i.name.toLowerCase().includes(q))
        || (USERS.find(u => u.id === o.userId)?.name ?? '').toLowerCase().includes(q);
    });

  function handleStatus(orderId, newStatus) {
    const cancelledItems = updateOrderStatus(orderId, newStatus);
    if (newStatus === 'cancelled' && cancelledItems) {
      const names = cancelledItems.map(i => `${i.name} ×${i.qty}`).join(', ');
      setToast({ message: `취소 완료 — ${names} 재고 복구됨`, type: 'success' });
    } else if (newStatus === 'shipping') {
      setToast({ message: '배송이 시작되었습니다 🚚', type: 'success' });
    } else if (newStatus === 'delivered') {
      setToast({ message: '배송 완료 처리되었습니다 ✅', type: 'success' });
    }
  }

  const pageName = initialFilter === 'shipping' ? '🚚 배송관리' : '🛒 주문관리';

  return (
    <div className="sv-body">
      <Breadcrumb current={pageName} />
      <div className="sv-header">
        <div className="sv-title">{pageName}</div>
        <div className="sv-actions">
          <div className="filter-bar" style={{marginBottom:0}}>
            {STATUS_FILTERS.map(f => (
              <button key={f} className={`filter-btn${statusFilter === f ? ' active' : ''}`}
                      onClick={() => setStatusFilter(f)}>
                {f === '전체' ? '전체' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="sv-stat-row" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        {STATUS_FILTERS.slice(1).map(s => (
          <div key={s} className="sv-stat">
            <div className="sv-stat-label">{STATUS_LABEL[s]}</div>
            <div className={`sv-stat-val ${s==='paid'?'warn':s==='shipping'?'accent':s==='delivered'?'ok':'danger'}`}>
              {orders.filter(o=>o.status===s).length}
            </div>
          </div>
        ))}
      </div>
      <div className="sv-card">
        <div className="sv-card-header">
          <div className="sv-card-title">주문 목록 ({filtered.length}건)</div>
          <div className="sv-search-wrap">
            <span className="sv-search-icon">🔍</span>
            <input className="sv-search" placeholder="주문번호 · 상품 · 고객"
                   value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>주문번호</th><th>고객</th><th>유형</th>
              <th>상품</th><th style={{textAlign:'right'}}>금액</th>
              <th>일시</th><th>상태</th><th>액션</th>
            </tr></thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{fontFamily:'monospace',fontSize:'0.73rem',color:'#bbb'}}>{order.id}</td>
                  <td style={{fontWeight:500}}>{USERS.find(u=>u.id===order.userId)?.name ?? order.userId}</td>
                  <td><span className={`badge ${order.userType==='B2B'?'badge-b2b':'badge-active'}`}>{order.userType}</span></td>
                  <td style={{color:'var(--text-2)'}}>{order.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</td>
                  <td style={{fontWeight:800,textAlign:'right'}}>{fmt(order.totalAmount)}</td>
                  <td style={{color:'var(--text-3)',fontSize:'0.77rem',whiteSpace:'nowrap'}}>{fmtDate(order.createdAt)}</td>
                  <td><span className={`badge ${STATUS_BADGE[order.status]}`}>{STATUS_LABEL[order.status]}</span></td>
                  <td>
                    <div className="action-btns">
                      {TRANSITIONS[order.status].length > 0
                        ? TRANSITIONS[order.status].map(next => (
                            <button key={next}
                                    className={`btn btn-sm ${next==='cancelled'?'btn-danger':'btn-secondary'}`}
                                    onClick={() => handleStatus(order.id, next)}>
                              {STATUS_ACTION_LABEL[next]}
                            </button>
                          ))
                        : <span className="action-done">처리 완료</span>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state" style={{padding:'2rem'}}>
            <div>조건에 맞는 주문이 없습니다.</div>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 3: 브라우저에서 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
- `http://localhost:8080/commerce.html` → 홈 런처 표시
- 📊 대시보드 타일 클릭 → `#/dashboard` 이동 → 통계 + 최근 주문 표시
- 🛒 주문관리 타일 → `#/admin/orders` → 주문 목록 + 브레드크럼 확인
- 🚚 배송관리 타일 → `#/admin/orders/shipping` → "배송중" 필터 자동 적용 확인
- "← 홈" 클릭 → 홈 런처로 복귀

- [ ] **Step 4: Commit**

```bash
git add commerce.html
git commit -m "feat: DashboardPage·AdminOrdersPage 서브뷰 리스타일 + 배송관리 필터 프리셋"
```

---

## Task 5: AdminInventoryPage — 탭 + 리스타일

**Files:**
- Modify: `commerce.html` — AdminInventoryPage 전체 교체

- [ ] **Step 1: AdminInventoryPage 전체 교체**

기존 `function AdminInventoryPage()` 전체를 교체:

```jsx
function AdminInventoryPage({ initialTab = '재고현황' }) {
  const { products, inventory, updateInventory } = useStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [localQty, setLocalQty] = useState(() => {
    const init = {};
    Object.keys(inventory).forEach(id => { init[id] = inventory[id].qty; });
    return init;
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLocalQty(prev => {
      const next = { ...prev };
      Object.keys(inventory).forEach(id => {
        if (next[id] === undefined) next[id] = inventory[id].qty;
      });
      return next;
    });
  }, [inventory]);

  function adjust(productId, delta) {
    setLocalQty(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] ?? 0) + delta) }));
  }

  function handleSave(productId) {
    const newQty = localQty[productId] ?? 0;
    updateInventory(productId, newQty);
    const p = products.find(p => p.id === productId);
    setToast({ message: `✅ ${p?.name} 재고 업데이트 → ${newQty}개`, type: 'success' });
  }

  const alertCount = products.filter(p => (inventory[p.id]?.qty ?? 0) < (MIN_QTY[p.id] ?? 5)).length;
  const TABS = ['재고현황', '입고', '출고'];

  const tabIcons = { '재고현황': '🏭', '입고': '📥', '출고': '📤' };
  const pageName = `${tabIcons[activeTab]} ${activeTab === '재고현황' ? '재고관리' : activeTab + '관리'}`;

  return (
    <div className="sv-body">
      <Breadcrumb current={pageName} />
      <div className="sv-header">
        <div className="sv-title">{pageName}</div>
        {alertCount > 0 && (
          <span className="badge badge-sold-out">⚠ {alertCount}개 재고 경보</span>
        )}
      </div>
      <div className="sv-stat-row" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="sv-stat">
          <div className="sv-stat-label">전체 품목</div>
          <div className="sv-stat-val accent">{products.length}</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-label">재고 경보</div>
          <div className={`sv-stat-val ${alertCount > 0 ? 'danger' : 'ok'}`}>{alertCount}</div>
        </div>
        <div className="sv-stat">
          <div className="sv-stat-label">품절</div>
          <div className={`sv-stat-val ${products.filter(p=>(inventory[p.id]?.qty??0)===0).length > 0 ? 'danger' : 'ok'}`}>
            {products.filter(p => (inventory[p.id]?.qty ?? 0) === 0).length}
          </div>
        </div>
      </div>
      <div className="sv-card">
        <div className="sv-tabs">
          {TABS.map(tab => (
            <div key={tab} className={`sv-tab${activeTab === tab ? ' active' : ''}`}
                 onClick={() => setActiveTab(tab)}>
              {tabIcons[tab]} {tab}
            </div>
          ))}
        </div>
        {activeTab === '재고현황' && (
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>상품</th><th>카테고리</th><th>현재 재고</th><th>최소 기준</th><th>수량 수정</th><th></th>
              </tr></thead>
              <tbody>
                {products.map(p => {
                  const current = inventory[p.id]?.qty ?? 0;
                  const minQ    = MIN_QTY[p.id] ?? 5;
                  const editQty = localQty[p.id] ?? 0;
                  const isDirty = editQty !== current;
                  const isAlert = current < minQ;
                  return (
                    <tr key={p.id} className={current === 0 ? 'row-zero' : ''}>
                      <td style={{fontWeight:600}}>
                        {p.emoji} {p.name}
                        {isAlert && <span className="alert-dot" title="재고 기준치 미달" />}
                      </td>
                      <td style={{color:'var(--text-2)'}}>{p.category}</td>
                      <td style={{fontWeight:700,color:current===0?'#dc2626':isAlert?'#d97706':'var(--text)'}}>
                        {current}개
                        {current===0 && <span className="badge badge-sold-out" style={{marginLeft:'0.5rem'}}>품절</span>}
                      </td>
                      <td style={{color:'var(--text-3)',fontSize:'0.81rem'}}>{minQ}개</td>
                      <td>
                        <div className="inv-qty-wrap">
                          <button className="btn-qty" onClick={() => adjust(p.id, -1)} disabled={editQty<=0}>−</button>
                          <input className="inv-qty-input" type="number" min="0" value={editQty}
                                 onChange={e => setLocalQty(prev=>({...prev,[p.id]:Number(e.target.value)}))} />
                          <button className="btn-qty" onClick={() => adjust(p.id, 1)}>+</button>
                        </div>
                      </td>
                      <td>
                        <button className={`btn btn-sm ${isDirty?'btn-primary':'btn-secondary'}`}
                                disabled={!isDirty} onClick={() => handleSave(p.id)}>저장</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === '입고' && (
          <div style={{padding:'2rem',textAlign:'center',color:'var(--text-3)'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📥</div>
            <div style={{fontWeight:700,color:'var(--text-2)'}}>입고 내역</div>
            <div style={{fontSize:'0.8rem',marginTop:'0.25rem'}}>재고 수량을 조정하면 입고 처리됩니다. 재고현황 탭에서 수정하세요.</div>
            <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => setActiveTab('재고현황')}>
              재고현황 탭으로 이동
            </button>
          </div>
        )}
        {activeTab === '출고' && (
          <div style={{padding:'2rem',textAlign:'center',color:'var(--text-3)'}}>
            <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📤</div>
            <div style={{fontWeight:700,color:'var(--text-2)'}}>출고 내역</div>
            <div style={{fontSize:'0.8rem',marginTop:'0.25rem'}}>출고는 주문 배송 처리 시 자동으로 반영됩니다. 주문관리에서 확인하세요.</div>
            <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => navigate('/admin/orders/shipping')}>
              배송관리로 이동
            </button>
          </div>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
```

- [ ] **Step 2: 브라우저에서 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
- 🏭 재고관리 타일 → `#/admin/inventory` → "재고현황" 탭 활성 확인
- 📥 입고관리 타일 → `#/admin/inventory/inbound` → "입고" 탭 활성 확인
- 📤 출고관리 타일 → `#/admin/inventory/outbound` → "출고" 탭 활성 확인
- 탭 전환 동작 확인
- 재고 수정 → 저장 toast 확인

- [ ] **Step 3: Commit**

```bash
git add commerce.html
git commit -m "feat: AdminInventoryPage 탭(재고현황/입고/출고) + 서브뷰 리스타일"
```

---

## Task 6: AdminProductsPage + ShopPage 리스타일

**Files:**
- Modify: `commerce.html` — AdminProductsPage return, ShopPage return

- [ ] **Step 1: AdminProductsPage의 return 블록 최상단을 sv-body로 교체**

기존 `return ( <div className="page-wrap">` 시작 부분을 찾아:

```jsx
// AdminProductsPage의 return 블록 — <div className="page-wrap"> 를 아래로 교체
return (
  <div className="sv-body">
    <Breadcrumb current="📐 제품관리 (PLM)" />
    <div className="sv-header">
      <div className="sv-title">📐 제품관리 (PLM)</div>
      <div className="sv-actions">
        <button className="btn btn-primary" onClick={() => setModal({ ...EMPTY })}>+ 상품 추가</button>
      </div>
    </div>
    <div className="sv-stat-row" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
      <div className="sv-stat">
        <div className="sv-stat-label">전체 상품</div>
        <div className="sv-stat-val accent">{products.length}</div>
      </div>
      <div className="sv-stat">
        <div className="sv-stat-label">판매 중</div>
        <div className="sv-stat-val ok">{products.filter(p=>p.status==='active').length}</div>
      </div>
      <div className="sv-stat">
        <div className="sv-stat-label">중단/단종</div>
        <div className="sv-stat-val warn">{products.filter(p=>p.status!=='active').length}</div>
      </div>
    </div>
    <div className="sv-card">
      <div className="sv-card-header">
        <div className="sv-card-title">상품 목록</div>
      </div>
      {/* 기존 card-grid + product-card 마크업 그대로 유지 */}
      <div style={{padding:'1rem'}}>
        <div className="card-grid">
          {products.map(product => { /* 기존 product card JSX 그대로 */ })}
        </div>
      </div>
    </div>
    {/* 기존 modal, confirmDel JSX 그대로 */}
  </div>
);
```

> **주의:** AdminProductsPage 내부 카드 렌더링 JSX, modal, confirmDel 부분은 변경하지 않는다. `<div className="page-wrap">` 래퍼와 `.page-header-row` / `.page-title` 를 위 sv-body 구조로 대체하는 것만 변경.

실제 교체 시: 기존 AdminProductsPage의 `return (` 부터 첫 `<div className="page-wrap">` 다음 `<div className="page-header-row">...</div>` 영역까지를 위 sv-body + sv-header 구조로 바꾸고, 나머지(card-grid 및 modal)는 sv-card 래퍼 안에 이동.

- [ ] **Step 2: ShopPage return 블록 교체**

기존 ShopPage의 `return (` 블록 전체를 교체:

```jsx
function ShopPage() {
  const { products, cartItems, addToCart, currentUser } = useStore();
  const isB2B = currentUser?.type === 'B2B';

  return (
    <div className="sv-body">
      <Breadcrumb current="📦 상품관리" />
      <div className="sv-header">
        <div className="sv-title">📦 상품 목록</div>
        <div className="sv-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
            🛒 장바구니 {cartItems.length > 0 && `(${cartItems.reduce((s,i)=>s+i.qty,0)})`}
          </button>
        </div>
      </div>
      <div className="sv-card">
        <div className="sv-card-header">
          <div className="sv-card-title">상품 목록 ({products.length}개)</div>
        </div>
        <div style={{padding:'1rem'}}>
          <div className="card-grid">
            {products.map(product => {
              const isUnavailable = product.status !== 'active';
              const currentPrice  = isB2B ? product.price.b2b : product.price.b2c;
              const stockQty      = 0; /* inventory는 ShopPage에서 직접 쓰지 않음 */
              return (
                <div key={product.id}
                     className={`product-card${isUnavailable?' unavailable':''}`}
                     onClick={() => !isUnavailable && navigate(`/product/${product.id}`)}>
                  <div className="product-emoji-box" style={{background:'var(--bg)'}}>
                    {product.emoji}
                  </div>
                  <div style={{fontSize:'0.82rem',fontWeight:700,marginBottom:'0.25rem',color:'var(--text)'}}>
                    {product.name}
                  </div>
                  <div style={{fontSize:'0.72rem',color:'var(--text-3)',marginBottom:'0.5rem'}}>
                    {product.category}
                  </div>
                  <div style={{fontSize:'0.9rem',fontWeight:800,color:'var(--accent)',marginBottom:'0.5rem'}}>
                    {fmt(currentPrice)}
                  </div>
                  {isUnavailable
                    ? <span className={`badge ${product.status==='sold_out'?'badge-sold-out':product.status==='suspended'?'badge-suspended':'badge-discontinued'}`}>
                        {product.status==='sold_out'?'품절':product.status==='suspended'?'판매중단':'단종'}
                      </span>
                    : <button className="btn btn-primary btn-sm"
                              onClick={e=>{e.stopPropagation();addToCart(product.id,1,currentPrice);}}>
                        장바구니 담기
                      </button>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 브라우저에서 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```
- 📦 상품관리 타일 → `#/shop` → 서브뷰 레이아웃 + 상품 카드 확인
- 📐 제품관리 타일 → `#/admin/products` → 서브뷰 레이아웃 + PLM 기능 확인
- 상품 추가 modal 동작 확인

- [ ] **Step 4: Commit**

```bash
git add commerce.html
git commit -m "feat: AdminProductsPage·ShopPage 서브뷰 리스타일"
```

---

## Task 7: TopNav 업데이트 + 기타 정리

**Files:**
- Modify: `commerce.html` — TopNav, `.page-wrap` 관련 CSS 정리, CartPage/MyOrdersPage 최소 리스타일

- [ ] **Step 1: TopNav active 판정 로직 수정**

TopNav 컴포넌트 내 `currentPath` 기반 active 판정을 새 경로에 맞게 수정:

```jsx
// TopNav 내부 — path 파싱 (useHash 결과에서 # 제거)
// 기존: const isAdmin = currentPath.startsWith('/admin');
// 변경: 홈(/)은 항상 '홈' active

// 대시보드 링크: navigate('/dashboard')
// 상품 목록 링크: navigate('/shop')
// 관리자 드롭다운: navigate('/admin/orders'), navigate('/admin/products'), navigate('/admin/inventory')
// 홈 로고 클릭: navigate('/')
```

TopNav의 `<a href="/" className="topnav-logo">` 를:
```jsx
<span className="topnav-logo" onClick={() => navigate('/')}>🛒 CommerceLab</span>
```

기존 대시보드 `<span>` 을:
```jsx
<span className={`topnav-link${currentPath === '/dashboard' ? ' active' : ''}`}
      onClick={() => navigate('/dashboard')}>대시보드</span>
```

- [ ] **Step 2: CartPage + MyOrdersPage 최소 래퍼 교체**

CartPage 와 MyOrdersPage 의 `<div className="page-wrap">` 을 각각 `<div className="sv-body">` 로 교체하고 `.page-title` 앞에 Breadcrumb 추가:

CartPage:
```jsx
// return 첫 줄 page-wrap → sv-body, page-title 앞에 삽입
<Breadcrumb current="🛒 장바구니" />
```

MyOrdersPage:
```jsx
<Breadcrumb current="📋 내 주문" />
```

- [ ] **Step 3: `.page-wrap` CSS에서 기존 `background: #f8f7f4` 하드코딩 제거 확인**

CSS에 `background: #f8f7f4` 가 남아있으면 `var(--bg)` 로 교체.

- [ ] **Step 4: 전체 기능 최종 확인**

```bash
npx serve D:/intellij_2024/fear-and-greed -p 8080
```

체크리스트:
- [ ] 홈 런처: 타일 9개 표시, 호버 효과
- [ ] 각 타일 → 올바른 페이지 이동
- [ ] 설정 타일 → "준비 중" toast
- [ ] 배송관리 → 배송중 필터 프리셋
- [ ] 입고/출고 → 올바른 탭 활성
- [ ] "← 홈" 브레드크럼 → 홈 복귀
- [ ] 주문 상태 변경 기능 동작
- [ ] 재고 수량 수정/저장 기능 동작
- [ ] 상품 추가/수정/삭제 modal 동작
- [ ] 장바구니 → 주문 flow 동작
- [ ] localStorage 데이터 유지 (새로고침 후 상태 유지)
- [ ] TopNav 로고 클릭 → 홈 복귀

- [ ] **Step 5: 최종 Commit**

```bash
git add commerce.html
git commit -m "feat: commerce UI 리디자인 완성 — 런처 홈 + 서브뷰 통일"
```

---

## 자체 검토

**스펙 커버리지:**
- ✅ 홈: 다크 슬레이트 히어로 패널 (Task 1, 2)
- ✅ 홈: 3×3 타일 9개 (Task 2)
- ✅ 타일 navigate 매핑 전체 (Task 2)
- ✅ 배송관리 initialFilter 프리셋 (Task 4)
- ✅ AdminInventoryPage 탭 (재고현황/입고/출고) (Task 5)
- ✅ 서브뷰 공통 Breadcrumb + sv-body (Task 3)
- ✅ 서브뷰 stat 카드 + sv-card 테이블 (Task 4-6)
- ✅ 설정 타일 toast (Task 2)
- ✅ 디자인 토큰 CSS 변수 (Task 1)
- ✅ TopNav 유지 + 경로 수정 (Task 7)
- ✅ localStorage/기존 기능 유지 (각 Task에서 기능 로직 미변경)

**누락 없음.**
