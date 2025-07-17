const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const transcription = await openai.audio.transcriptions.create({
        file: blob,
        model: "whisper-1"
    });
    return transcription.text;
}

module.exports = { transcribeAudio };