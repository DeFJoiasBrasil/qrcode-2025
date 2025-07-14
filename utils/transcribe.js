const fs = require('fs');
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioPath) {
    const file = fs.createReadStream(audioPath);
    const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1"
    });
    return transcription.text;
}

module.exports = { transcribeAudio };
