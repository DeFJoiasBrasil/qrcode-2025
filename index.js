require('dotenv').config();
const express = require('express');
const { transcribeAudio } = require('./utils/transcribe');
const { createOpenAI } = require('openai');

const app = express();
app.use(express.json());

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

app.post('/webhook', async (req, res) => {
    const { message, isAudio } = req.body;

    try {
        let userMessage = message;

        if (isAudio) {
            userMessage = await transcribeAudio(message); // URL do áudio
        }

        const response = await openai.chat.completions.create({
            messages: [
                { role: "system", content: promptBase },
                { role: "user", content: userMessage }
            ],
            model: "gpt-4o"
        });

        const aiReply = response.choices[0].message.content;
        res.json({ reply: aiReply });
    } catch (error) {
        console.error("Erro no atendimento:", error.message);
        res.status(500).json({ error: "Erro ao processar mensagem" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));