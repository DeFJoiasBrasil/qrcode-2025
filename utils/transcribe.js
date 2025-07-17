const OpenAI = require("openai");
const fetch = require("node-fetch");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function transcribeAudio(audioUrl) {
  const audioBuffer = await fetch(audioUrl).then(res => res.buffer());

  const transcription = await openai.audio.transcriptions.create({
    file: audioBuffer,
    model: "whisper-1"
  });

  return transcription.text;
}

module.exports = { transcribeAudio };