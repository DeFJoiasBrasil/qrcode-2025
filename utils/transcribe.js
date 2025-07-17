const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function transcribeAudio(buffer) {
  const tmpFilePath = "/tmp/audio.ogg";
  fs.writeFileSync(tmpFilePath, buffer);

  const response = await openai.createTranscription(
    fs.createReadStream(tmpFilePath),
    "whisper-1"
  );

  return response.data.text;
}

module.exports = { transcribeAudio };
