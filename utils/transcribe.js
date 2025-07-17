const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function transcribeAudio(audioUrl) {
  const audioBlob = await fetch(audioUrl).then((res) => res.blob());

  const transcription = await openai.audio.transcriptions.create({
    file: audioBlob,
    model: "whisper-1"
  });

  return transcription.text;
}

module.exports = { transcribeAudio };
