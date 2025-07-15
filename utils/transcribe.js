const OpenAI = require("openai");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioUrl) {
  const response = await fetch(audioUrl);
  const buffer = await response.buffer();

  const tempPath = path.join(__dirname, "temp_audio.ogg");
  fs.writeFileSync(tempPath, buffer);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(tempPath),
    model: "whisper-1"
  });

  fs.unlinkSync(tempPath); // Apaga o arquivo temporário

  return transcription.text;
}

module.exports = { transcribeAudio };
