// PRECACHE를 수정하면 이 버전도 반드시 올릴 것 — 이름이 그대로면 activate 단계에서
// 옛 캐시를 지우지 않아 배포 후에도 사용자에게 이전 페이지가 계속 서빙된다.
const CACHE_NAME = 'fg-cache-v13';

// 시세·환율 같은 API 응답은 앱 셸과 절대 같은 칸에 두지 말 것.
// 한 칸에 섞으면 (1) 배포할 때 데이터까지 날아가고 (2) 만료가 없어 오프라인에서
// 몇 달 전 값이 현재 값처럼 나온다. 나이 표시는 아래 X-From-Cache 헤더로 한다.
const DATA_CACHE = 'fg-data-v1';

// Static assets to cache on install
// 새 페이지를 추가하면 여기에도 넣고 CACHE_NAME을 올린다.
// portfolio_tracker.html은 비밀번호 게이트가 걸린 비공개 페이지라 의도적으로 제외.
// Certificate.html은 ~875KB라 제외 — 둘 다 오프라인에서는 offline.html로 안내된다.
const PRECACHE = ['/', '/index.html', '/offline.html', '/fear-greed.html', '/finance.html', '/asset.html', '/compound.html', '/goal.html', '/journal.html', '/backtest.html', '/workout.html', '/agents.html', '/commerce.html', '/disaster.html', '/casestudy.html', '/casestudy-commerce.html', '/casestudy-feargreed.html', '/casestudy-disaster.html', '/casestudy-asset.html', '/casestudy-backtest.html', '/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png', '/icon-180.png', '/icon-maskable.png'];

// 데이터로 취급할 upstream — 앱 셸이 아니라 DATA_CACHE로 간다
const DATA_PREFIXES = [
    'https://production.dataviz.cnn.io',
    'https://query1.finance.yahoo.com',
    'https://open.er-api.com',
];

// URL prefixes that use cache-first
const CACHE_FIRST_PREFIXES = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
];

// cache.addAll은 하나라도 실패하면 전체가 무산된다 — 그러면 offline.html까지 같이 날아가서
// 정작 오프라인일 때 보여줄 게 없어진다. 한 건씩 넣고 실패는 흘려보낸다.
// 리다이렉트된 응답은 cache.put이 거부하므로 본문만 꺼내 새 Response로 다시 만든다.
async function precacheOne(cache, url) {
    try {
        const res = await fetch(url, { cache: 'reload' });
        if (!res.ok) return;
        const body = await res.blob();
        await cache.put(url, new Response(body, { status: 200, headers: res.headers }));
    } catch {
        /* 한 건 실패가 나머지를 막지 않는다 */
    }
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            Promise.all(PRECACHE.map((url) => precacheOne(cache, url)))
        )
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            // DATA_CACHE는 배포와 무관하게 남긴다 — 여기서 지우면 오프라인 첫 화면이 빈다
            Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== DATA_CACHE).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { url } = event.request;

    if (DATA_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(dataFirst(event.request));
        return;
    }
    if (CACHE_FIRST_PREFIXES.some((p) => url.startsWith(p))) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    if (event.request.method !== 'GET') return;

    // /api/proxy 뒤의 실제 목적지도 데이터다 — 프록시 경유라고 앱 셸에 섞지 말 것
    if (new URL(url).pathname.startsWith('/api/')) {
        event.respondWith(dataFirst(event.request));
        return;
    }

    // Own origin: prefer fresh content, then fall back to cache
    event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        // 설치된 앱 안에서는 주소창이 없다 — 브라우저 기본 오류를 띄우면 빠져나갈 길이 없다
        if (request.mode === 'navigate') {
            const offline = await caches.match('/offline.html');
            if (offline) return offline;
        }
        return Response.error();
    }
}

async function dataFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(DATA_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const hit = await caches.match(request, { cacheName: DATA_CACHE });
        if (!hit) return Response.error();
        // 오래된 값을 주는 건 괜찮다 — 오래됐다고 말하지 않는 게 문제다.
        // 호출부가 이 헤더를 보고 "N시간 전 값" 배지를 띄운다.
        const headers = new Headers(hit.headers);
        headers.set('X-From-Cache', '1');
        return new Response(await hit.blob(), { status: hit.status, statusText: hit.statusText, headers });
    }
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return Response.error();
    }
}
