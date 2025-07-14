const OpenAI = require("openai").OpenAI;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
    const transcription = await openai.audio.transcriptions.create({
        file: await fetch(audioUrl).then(r => r.blob()),
        model: "whisper-1"
    });
    return transcription.text;
}

module.exports = { transcribeAudio };