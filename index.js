
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

let qrCodeBase64 = null;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
  qrCodeBase64 = await qrcode.toDataURL(qr);
  console.log('✅ QR gerado. Acesse / para escanear.');
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado com sucesso!');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', reason => {
  console.warn('⚠️ Cliente desconectado:', reason);
});

client.initialize();

app.get('/', (req, res) => {
  if (qrCodeBase64) {
    res.render('qr', { qrCode: qrCodeBase64 });
  } else {
    res.send('QR ainda não gerado. Atualize em alguns segundos...');
  }
});

app.post('/message/sendWhatsappText/default', async (req, res) => {
  const { number, text } = req.body;

  if (!number || !text) {
    return res.status(400).json({ error: 'Parâmetros ausentes: number ou text' });
  }

  try {
    await client.sendMessage(`${number}@c.us`, text);
    console.log(`📤 Mensagem enviada para ${number}: ${text}`);
    res.status(200).json({ status: 'Mensagem enviada com sucesso', to: number, text });
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem:', err.message);
    res.status(500).json({ error: 'Erro ao enviar mensagem', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
