// index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

const app = express();
const port = 3000;

const MODEL_NAME = 'gemini-pro';
const API_KEY = 'AIzaSyDvB7PBnlSaeootaAoGwRBnwjuk5Ah80KY';

app.use(bodyParser.json());

const chatHistory = [];

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  // Retrieve the entire chat history
  const chatHistory = req.body.chatHistory || [];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;

  // Update the chat history
  chatHistory.push({
    role: 'user',
    parts: [{ text: userInput }],
  });
  chatHistory.push({
    role: 'model',
    parts: [{ text: response.text() }],
  });

  res.json({ text: response.text(), chatHistory });
});

let server;

const startServer = () => {
  server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught exception:', err);
  console.log('Restarting the server...');
  server.close(() => {
    startServer();
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.log('Restarting the server...');
  server.close(() => {
    startServer();
  });
});
