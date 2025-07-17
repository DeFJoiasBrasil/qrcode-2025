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

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

const promptBase = `
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
`;

let qrCodeImage = '';

create({
  sessionId: "dfjoias-session",
  multiDevice: true,
  qrTimeout: 0,
  authTimeout: 0,
  headless: true,
  useChrome: true
}).then(client => {
  console.log("✅ WhatsApp conectado com sucesso!");
  client.onMessage(async message => {
    let userMessage = message.body;
    if (message.mimetype === 'audio/ogg; codecs=opus' && message.isMedia) {
      const media = await client.decryptFile(message);
      const audioBuffer = Buffer.from(media);
      const transcription = await transcribeAudio(audioBuffer);
      userMessage = transcription;
    }

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: promptBase },
        { role: "user", content: userMessage }
      ]
    });

    const reply = response.data.choices[0].message.content;
    await client.sendText(message.from, reply);
  });

  client.onAnyMessage(message => {
    console.log("📩 Mensagem recebida:", message.body);
  });

}).catch(err => {
  console.error("Erro ao iniciar WhatsApp:", err);
});

app.get("/", (req, res) => {
  if (!qrCodeImage) {
    res.send("Gerando QR Code... atualize em alguns segundos.");
  } else {
    res.render("qr", { imageUrl: qrCodeImage });
  }
});

app.post("/qr", (req, res) => {
  qrCodeImage = req.body.imageUrl;
  res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
