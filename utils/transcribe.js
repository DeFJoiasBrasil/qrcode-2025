const fs = require('fs');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

async function transcribeAudio(audioUrl) {
  const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);

  const transcription = await openai.createTranscription(
    buffer,
    'whisper-1'
  );

  return transcription.data.text;
}

module.exports = { transcribeAudio };