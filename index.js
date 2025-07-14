require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const { transcribeAudio } = require('./utils/transcribe');
const { OpenAI } = require('openai');

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let qrImageUrl = null;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async qr => {
    const qrDataUrl = await qrcode.toDataURL(qr);
    qrImageUrl = qrDataUrl;
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado com sucesso!');
});

client.on('message', async msg => {
    try {
        const isAudio = msg.hasMedia && msg.type === 'audio';

        let userMessage = msg.body;

        if (isAudio) {
            const media = await msg.downloadMedia();
            const buffer = Buffer.from(media.data, 'base64');
            const tempPath = path.join(__dirname, 'temp.ogg');
            fs.writeFileSync(tempPath, buffer);
            userMessage = await transcribeAudio(tempPath);
            fs.unlinkSync(tempPath);
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Você é um atendente virtual da D&F Joias, especialista em responder com empatia e foco em vendas. 
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
Use emojis quando necessário. Responda como se fosse humano.`
                },
                { role: "user", content: userMessage }
            ]
        });

        const aiReply = response.choices[0].message.content;
        msg.reply(aiReply);
    } catch (error) {
        console.error("Erro ao responder mensagem:", error);
        msg.reply("Desculpe, houve um erro ao processar sua mensagem. Tente novamente.");
    }
});

client.initialize();

app.get('/', (req, res) => {
    if (qrImageUrl) {
        res.render('qr', { imageUrl: qrImageUrl });
    } else {
        res.send('<h1>Gerando QR Code... atualize em alguns segundos.</h1>');
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
