// 프록시를 통과시킬 상류 도메인 화이트리스트 — 여기 없는 주소는 403.
// 새 도메인을 fetch하려면 접두사를 여기에 먼저 추가할 것.
// 호출 측은 상류 URL 전체를 encodeURIComponent로 감싸야 한다. 인코딩하지 않으면
// URL 안의 &가 별도 쿼리 파라미터로 파싱되어 req.query.url에 잘린 주소만 들어온다.
const ALLOWED = [
    'https://production.dataviz.cnn.io/',
    'https://query1.finance.yahoo.com/',
    'https://open.er-api.com/',
];

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) return res.status(400).json({ error: 'Missing url parameter' });

    const isAllowed = ALLOWED.some((prefix) => url.startsWith(prefix));
    if (!isAllowed) return res.status(403).json({ error: 'Domain not allowed' });

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, */*',
            },
        });

        const contentType = response.headers.get('content-type') || 'application/json';
        const body = await response.arrayBuffer();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        res.setHeader('Content-Type', contentType);
        res.status(response.status).send(Buffer.from(body));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
