require('dotenv').config();
const express = require('express');
const { create } = require('@open-wa/wa-automate');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let qrCodeBase64 = '';

create({
  qrTimeout: 0,
  headless: true,
  authTimeout: 60,
  qrRefreshS: 10,
  killProcessOnBrowserClose: true,
  useChrome: true,
  args: ['--no-sandbox'],
  multiDevice: true
}).then(client => {
  console.log('✅ WhatsApp conectado com sucesso!');

  client.onStateChanged(state => {
    console.log('Estado do cliente:', state);
  });

  client.onQR((qr) => {
    QRCode.toDataURL(qr, (err, url) => {
      qrCodeBase64 = url;
    });
  });

}).catch(error => {
  console.error('Erro ao iniciar o WhatsApp:', error);
});

app.get('/', (req, res) => {
  res.render('qr', { imageUrl: qrCodeBase64 });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));