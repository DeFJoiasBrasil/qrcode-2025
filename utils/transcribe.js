const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transcription = await openai.audio.transcriptions.create({
        file: buffer,
        model: "whisper-1",
        filename: "audio.ogg",
        mimeType: "audio/ogg"
    });

    return transcription.text;
}

module.exports = { transcribeAudio };
