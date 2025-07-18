const { create, ev } = require('@open-wa/wa-automate');
const http = require('http');

let latestQRCode = null;

create({
  headless: true,
  useChrome: true,
  qrTimeout: 0,
  killProcessOnBrowserClose: true,
  qrRefreshS: 10,
  authTimeout: 0,
  multiDevice: true,
}).then(async (client) => {
  console.log('🤖 Bot iniciado com sucesso!');
  await client.onMessage(async (message) => {
    if (message.body === 'oi' || message.body === 'Oi') {
      await client.sendText(message.from, 'Olá! Seja bem-vindo à D&F Joias 💍');
    }
  });
});

ev.on('qr.**', async (qrcode) => {
  latestQRCode = qrcode;
  console.log('[QR] Código atualizado');
});

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>QR Code do WhatsApp</title></head>
        <body>
          <h2>Escaneie o QR Code abaixo:</h2>
          ${latestQRCode ? `<img src="${latestQRCode}" alt="QR Code do WhatsApp" />` : '<p>Gerando QR Code... atualize em alguns segundos.</p>'}
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Página não encontrada');
  }
});

server.listen(8080, () => {
  console.log('🚀 Servidor rodando na porta 8080');
});
