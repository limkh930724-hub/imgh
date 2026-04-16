const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = 8080;
const host = '0.0.0.0';

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    const filePath = path.join(root, reqPath.replace(/^\/+/, ''));
    if (!filePath.startsWith(root)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': mime[ext] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        });
        res.end(data);
    });
});

server.listen(port, host, () => {
    console.log(`server-ready http://localhost:${port}`);
});
