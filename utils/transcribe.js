const { OpenAI } = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
    const audioFile = await fetch(audioUrl).then(r => r.blob());
    const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1"
    });
    return transcription.text;
}

module.exports = { transcribeAudio };
