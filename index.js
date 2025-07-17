require('dotenv').config();
const express = require('express');
const { transcribeAudio } = require('./utils/transcribe');
const { Configuration, OpenAIApi } = require('openai');
const { create } = require('@open-wa/wa-automate');
const path = require('path');

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let qrCodeBase64 = null;

create({
  sessionId: 'session',
  multiDevice: true,
  qrTimeout: 0,
  useChrome: false,
  headless: true,
  qrRefreshS: 15,
  killProcessOnBrowserClose: true,
  disableSpins: true,
  disableWelcome: true,
  disableLogs: true,
  logConsole: false,
  popup: false,
  authTimeout: 60,
  qrLogSkip: false,
  cacheEnabled: false
}).then(client => start(client))
  .catch(e => console.log('Erro ao iniciar:', e));

function start(client) {
  console.log('✅ WhatsApp conectado com sucesso!');

  client.onMessage(async message => {
    if (message.body || message.mimetype?.includes('audio')) {
      const isAudio = message.mimetype?.includes('audio');
      const content = isAudio ? await client.decryptFile(message) : message.body;

      let finalInput = content;
      if (isAudio) {
        finalInput = await transcribeAudio(content);
      }

      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
      });
      const openai = new OpenAIApi(configuration);

      const promptBase = `Você é um atendente virtual da D&F Joias, especialista em responder com empatia e foco em vendas.
Baseie-se nas informações abaixo para responder de forma persuasiva e clara.

- Vendemos alianças feitas com moedas antigas, com o mesmo brilho e tom do ouro.
- As alianças não desbotam, não descascam e não enferrujam.
- Temos todos os tamanhos prontos para entrega.
- Entregamos presencialmente em algumas cidades, e por Correios nas demais.
- Nunca diga que entregamos em todo o Brasil. Pergunte sempre a cidade e o bairro.
- Se o cliente perguntar sobre medidas, diga que levamos todos os tamanhos.
- Garantia permanente da cor.
- A caixa é vendida separadamente e deve ser mencionada apenas se o cliente perguntar.

Fale com leveza, simpatia, segurança e sempre conduza o cliente até a decisão de compra.
Use emojis quando necessário. Responda como se fosse humano.`;

      const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: promptBase },
          { role: 'user', content: finalInput }
        ]
      });

      const reply = response.data.choices[0].message.content;
      client.sendText(message.from, reply);
    }
  });

  client.onAnyMessage((msg) => {
    if (msg && msg.qr) {
      qrCodeBase64 = msg.qr;
    }
  });
}

app.get('/', (req, res) => {
  if (!qrCodeBase64) return res.send('<h1>Gerando QR Code... atualize em alguns segundos.</h1>');
  res.render('qr', { imageUrl: qrCodeBase64 });
});

app.listen(process.env.PORT || 8080, () => {
  console.log('🚀 Servidor rodando na porta 8080');
});
