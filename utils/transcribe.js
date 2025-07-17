const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const path = require("path");

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

async function transcribeAudio(buffer) {
  const tempPath = path.join(__dirname, "temp_audio.ogg");
  fs.writeFileSync(tempPath, buffer);
  const resp = await openai.createTranscription(
    fs.createReadStream(tempPath),
    "whisper-1"
  );
  fs.unlinkSync(tempPath);
  return resp.data.text;
}

module.exports = { transcribeAudio };
