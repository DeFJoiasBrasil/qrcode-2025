
const { createOpenAI } = require("openai");

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
    const transcription = await openai.audio.transcriptions.create({
        file: await fetch(audioUrl).then(r => r.blob()),
        model: "whisper-1"
    });
    return transcription.text;
}

module.exports = { transcribeAudio };
