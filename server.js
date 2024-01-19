// Import modul yang diperlukan
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

// Membuat aplikasi Express
const app = express();
const port = 3000;

// Konstanta untuk Google Generative AI
const MODEL_NAME = 'gemini-pro';
const API_KEY = 'API_KEY_ANDA'; // API Key Google untuk layanan Google Generative AI

// Menggunakan middleware body-parser untuk memproses permintaan JSON
app.use(bodyParser.json());

// Array untuk menyimpan riwayat obrolan
const chatHistory = [];

// Mengirimkan file index.html pada path root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Menangani permintaan POST ke endpoint /sendMessage
app.post('/sendMessage', async (req, res) => {
  const userInput = req.body.userInput;

  // Membuat instance Google Generative AI dan mengambil model
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  // Konfigurasi untuk menghasilkan respons
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 3000,
  };

  // Pengaturan keselamatan untuk memblokir konten berbahaya
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  ];

  // Mengambil riwayat obrolan lengkap dari permintaan
  const chatHistory = req.body.chatHistory || [];

  // Memulai sesi obrolan baru dengan Google Generative AI
  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });

  // Mengirim input pengguna ke model obrolan dan mendapatkan respons
  const result = await chat.sendMessage(userInput);
  const response = result.response;

  // Memperbarui riwayat obrolan dengan input pengguna dan respons model
  chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
  chatHistory.push({ role: 'model', parts: [{ text: response.text() }] });

  // Mengirim respons model dan riwayat obrolan yang diperbarui sebagai JSON
  res.json({ text: response.text(), chatHistory });
});

// Inisialisasi server dan mulai mendengarkan pada port yang ditentukan
let server;

const startServer = () => {
  server = app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
};

startServer();

// Menangani pengecualian yang tidak tertangkap dan penolakan yang tidak tertangkap
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
