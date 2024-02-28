const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GoogleGenerativeAIResponseError,
} = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const MODEL_NAME = 'gemini-1.0-pro';
const API_KEY = 'AIzaSyAXLSv9cHScvHzxon0fOHxe22Z_zHI6_Ww'; // Ganti dengan API Key Google Generative AI Anda

let server;
let genAI;
let model;
let chat;
const chatHistory = [];

const startServer = async () => {
    server = app.listen(port, () => {
        console.log(`Server berjalan di http://localhost:${port}`);
    });

    // Clear state and initialize variables
    clearState();
};

const clearState = () => {
    chatHistory.length = 0;
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const generationConfig = {
        temperature: 0.5,
        topK: 20,
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

    chat = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory,
    });
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/sendMessage', async (req, res) => {
    const userInput = req.body.userInput;

    try {
        const result = await chat.sendMessage(userInput);
        const response = result.response;

        chatHistory.push({ role: 'user', parts: [{ text: userInput }] });
        chatHistory.push({ role: 'model', parts: [{ text: response.text() }] });

        res.json({ text: response.text(), chatHistory });
    } catch (error) {
        if (error instanceof GoogleGenerativeAIResponseError) {
            console.error('Terjadi kesalahan pada GoogleGenerativeAI:', error.message);
            console.log('Merestart server...');
            // Bersihkan state dan restart server
            clearState();
            server.close(() => {
                startServer();
            });
        } else {
            console.error('Terjadi kesalahan lain:', error.message);
            res.status(500).json({ error: 'Terjadi kesalahan saat mengirim pesan.' });
        }
    }
});

startServer();

process.on('uncaughtException', (err) => {
    console.error('Terjadi pengecualian yang tidak tertangkap:', err);
    console.log('Merestart server...');
    // Bersihkan state dan restart server
    clearState();
    server.close(() => {
        startServer();
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(
        'Penolakan yang tidak tertangkap di:',
        promise,
        'alasan:',
        reason
    );
    console.log('Merestart server...');
    // Bersihkan state dan restart server
    clearState();
    server.close(() => {
        startServer();
    });
});
