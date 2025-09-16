import http from 'node:http';

const PORT = Number(process.env.PORT ?? 4000);

function createMessage() {
  return JSON.stringify({ status: 'ok', service: 'core-api', version: '0.0.0' });
}

export function startServer() {
  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end('Bad Request');
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(createMessage());
  });

  server.listen(PORT, () => {
    console.log(`Core API listening on http://localhost:${PORT}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}
