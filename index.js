require('dotenv').config();
const express = require('express');
const { create, ev } = require('@open-wa/wa-automate');
const { transcribeAudio } = require('./utils/transcribe');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

create().then(client => {
    client.onMessage(async message => {
        try {
            let userMessage = message.body;
            if (message.mimetype === 'audio/ogg; codecs=opus') {
                const mediaData = await client.decryptFile(message);
                const audioBase64 = Buffer.from(mediaData).toString('base64');
                const audioUrl = `data:audio/ogg;base64,${audioBase64}`;
                userMessage = await transcribeAudio(audioUrl);
            }

            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: promptBase },
                    { role: 'user', content: userMessage }
                ]
            });

            await client.sendText(message.from, response.choices[0].message.content);
        } catch (err) {
            console.error('Erro ao responder mensagem:', err);
        }
    });
});

app.listen(process.env.PORT || 8080, () => {
    console.log('🚀 Servidor rodando na porta 8080');
});