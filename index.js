require('dotenv').config();
const express = require('express');
const { create } = require('@open-wa/wa-automate');

const app = express();
const PORT = process.env.PORT || 8080;

function start(client) {
  client.onMessage(async message => {
    if (message.body === 'Oi' && message.isGroupMsg === false) {
      await client.sendText(message.from, 'Olá! 👋 Como posso te ajudar?');
    }
  });
}

create({
  sessionId: 'defjoias',
  useChrome: true,
  headless: true,
  qrTimeout: 0,
  qrRefreshS: 10,
  qrLogSkip: false,
  disableSpins: true,
  logConsole: true
}).then(client => start(client));

app.get('/', (req, res) => {
  res.send('Servidor online! Escaneie o QR Code no terminal.');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
