const ALLOWED = [
    'https://production.dataviz.cnn.io',
    'https://query1.finance.yahoo.com',
    'https://open.er-api.com',
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
