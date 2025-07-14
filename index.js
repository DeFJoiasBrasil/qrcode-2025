require('dotenv').config();
const express = require('express');
const { transcribeAudio } = require('./utils/transcribe');
const { OpenAI } = require('openai');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let qrCodeImage = null;

const promptBase = `
Você é um atendente virtual da D&F Joias, especialista em responder com empatia e foco em vendas.
Baseie-se nas informações abaixo para responder de forma persuasiva e clara:

- Vendemos alianças feitas com moedas antigas, com o mesmo brilho e tom do ouro.
- As alianças não desbotam, não descascam e não enferrujam.
- Temos todos os tamanhos prontos para entrega.
- Entregamos presencialmente em algumas cidades, e por Correios nas demais.
- Nunca diga que entregamos em todo o Brasil. Pergunte sempre a cidade e o bairro.
- Se o cliente perguntar sobre medidas, diga que levamos todos os tamanhos.
- Garantia permanente da cor.
- A caixa é vendida separadamente e deve ser mencionada apenas se o cliente perguntar.

Fale com leveza, simpatia, segurança e sempre conduza o cliente até a decisão de compra.
Use emojis quando necessário. Responda como se fosse humano.
`;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', async (qr) => {
  qrCodeImage = await qrcode.toDataURL(qr);
  console.log('✅ QR gerado com sucesso');
});

client.on('ready', () => {
  console.log('✅ WhatsApp conectado com sucesso!');
});

client.on('message', async (msg) => {
  try {
    let content = msg.body;
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media.mimetype.startsWith('audio/')) {
        const buffer = Buffer.from(media.data, 'base64');
        const audioUrl = `data:${media.mimetype};base64,${media.data}`;
        content = await transcribeAudio(audioUrl);
      }
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: promptBase },
        { role: 'user', content }
      ]
    });

    const resposta = completion.choices[0].message.content;
    msg.reply(resposta);
  } catch (err) {
    console.error('❌ Erro ao processar mensagem:', err.message);
    msg.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes.');
  }
});

client.initialize();

// ROTA PÁGINA COM QR CODE
app.get('/', (req, res) => {
  if (qrCodeImage) {
    res.render('qr', { imageUrl: qrCodeImage });
  } else {
    res.send('<h2>Gerando QR Code... atualize em alguns segundos.</h2>');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
