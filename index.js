require('dotenv').config();
const express = require('express');
const path = require('path');
const QRCode = require('qrcode');
const { transcribeAudio } = require('./utils/transcribe');
const { OpenAI } = require("openai");

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

// Gera e exibe QR Code
app.get('/', async (req, res) => {
    const whatsappUrl = "https://wa.me/5561999999999";
    const imageUrl = await QRCode.toDataURL(whatsappUrl);
    res.render('qr', { imageUrl });
});

app.post('/webhook', async (req, res) => {
    const { message, isAudio } = req.body;

    try {
        let userMessage = message;
        if (isAudio) {
            userMessage = await transcribeAudio(message);
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: promptBase },
                { role: "user", content: userMessage }
            ]
        });

        const aiReply = completion.choices[0].message.content;
        res.json({ reply: aiReply });
    } catch (error) {
        console.error("Erro no atendimento:", error.message);
        res.status(500).json({ error: "Erro ao processar mensagem" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
