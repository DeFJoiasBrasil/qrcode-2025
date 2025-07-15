require('dotenv').config();
const express = require('express');
const { transcribeAudio } = require('./utils/transcribe');
const qrcode = require('qrcode-terminal');
const { create } = require('@wppconnect-team/wppconnect');
const { Configuration, OpenAIApi } = require('openai');
const path = require('path');

const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const promptBase = \`
Você é um atendente virtual da D&F Joias, especialista em responder com empatia e foco em vendas. 
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
Use emojis quando necessário. Responda como se fosse humano.
\`;

let qrImage = '';

create({
  session: 'sessionName',
  catchQR: (base64Qrimg) => {
    qrImage = 'data:image/png;base64,' + base64Qrimg;
  }
}).then((client) => {
  client.onMessage(async (message) => {
    if (message.type === 'ptt') return;

    const userMessage = message.body;

    const response = await openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: promptBase },
        { role: 'user', content: userMessage }
      ]
    });

    const reply = response.data.choices[0].message.content;
    client.sendText(message.from, reply);
  });
});

app.get('/', (req, res) => {
  if (!qrImage) {
    res.send('<h1>Gerando QR Code... atualize em alguns segundos.</h1>');
  } else {
    res.render('qr', { imageUrl: qrImage });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});