const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const MODEL_NAME = 'gemini-pro';
const API_KEY = 'AIzaSyDvB7PBnlSaeootaAoGwRBnwjuk5Ah80KY'; // Ganti dengan API Key Google Generative AI Anda

const chatHistory = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/sendMessage', async (req, res) => {
  const userInput = req.body.userInput;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 3000,
  };

  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;

  chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
  chatHistory.push({ role: 'model', parts: [{ text: response.text() }] });

  res.json({ text: response.text(), chatHistory });
});

let server;

const startServer = () => {
  server = app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('Terjadi pengecualian yang tidak tertangkap:', err);
  console.log('Merestart server...');
  server.close(() => {
    startServer();
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Penolakan yang tidak tertangkap di:', promise, 'alasan:', reason);
  console.log('Merestart server...');
  server.close(() => {
    startServer();
  });
});
