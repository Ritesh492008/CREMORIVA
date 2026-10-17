const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURI(req.url.split('?')[0]);
  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  // Local API handler for order submission to manager
  if (req.method === 'POST' && reqUrl === '/api/order') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const orderData = JSON.parse(body || '{}');
        console.log(`\n🍨 [CREMORIVA ORDER LOGGED]`);
        console.log(`   Order Ref: ${orderData.orderRef}`);
        console.log(`   Customer: ${orderData.customer?.name} (${orderData.customer?.phone}, ${orderData.customer?.email})`);
        console.log(`   Delivery: ${orderData.customer?.address}`);
        console.log(`   Items: ${orderData.items?.length} items | Total: $${orderData.total}`);
        console.log(`   Manager Target: rahekrishn07@gmail.com\n`);
        
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({
          success: true,
          orderRef: orderData.orderRef,
          managerEmail: 'rahekrishn07@gmail.com',
          message: 'Order manifest received and logged for manager'
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  let safePath = path.normalize(path.join(PUBLIC_DIR, reqUrl));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end('403 Forbidden');
    return;
  }

  // Handle transparent fallback for background-animation folder vs background-animation.agignore
  if (!fs.existsSync(safePath) && reqUrl.includes('background-animation')) {
    const altReqUrl = reqUrl.includes('background-animation.agignore')
      ? reqUrl.replace('background-animation.agignore', 'background-animation')
      : reqUrl.replace('background-animation', 'background-animation.agignore');
    const altPath = path.normalize(path.join(PUBLIC_DIR, altReqUrl));
    if (fs.existsSync(altPath)) {
      safePath = altPath;
    }
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Cache images for high performance
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': stats.size });
    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CREMORIVA Server running at: http://localhost:${PORT}`);
});
