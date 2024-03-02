# Gemini-Pro Chatbot

Gemini-Pro Chatbot adalah chatbot interaktif yang didukung oleh Google Generative AI. Ini menggunakan model Gemini-Pro untuk berinteraksi dalam percakapan dan memberikan respon terhadap masukan pengguna. Proyek ini juga dilengkapi dengan antarmuka pengguna berbasis web yang sederhana untuk berkomunikasi dengan chatbot.

## Fitur

- Integrasi dengan Google Generative AI menggunakan model Gemini-Pro.
- Antarmuka web yang ramah pengguna untuk berkomunikasi dengan chatbot.
- Pengaturan keamanan untuk memblokir kategori konten berbahaya seperti pelecehan, ujaran kebencian, konten eksplisit secara seksual, dan konten berbahaya.

## Persyaratan

Sebelum memulai, pastikan Anda telah menginstal hal-hal berikut:

1. Node.js: [Download Node.js](https://nodejs.org/)
2. npm (Node Package Manager): Secara otomatis diinstal bersamaan dengan Node.js.
3. Git: [Download Git](https://git-scm.com/)

## Instalasi

1. Clone repository:

   ```bash
   git clone https://github.com/syahrilakbar63/gemini-pro-chatbot.git
   ```

2. Masuk ke direktori proyek:

   ```bash
   cd gemini-pro-chatbot
   ```

3. Inisialisasikan proyek dan instal dependensi:

   ```bash
   npm init -y
   npm install express body-parser @google/generative-ai
   ```

4. Dapatkan API Key Google untuk layanan Google Generative AI. Gantilah `API_KEY` pada `server.js` dengan API Key Anda yang sebenarnya.

5. Mulai server:

   ```bash
   node server.js
   ```

   Server akan berjalan di http://localhost:3000.

6. Buka peramban web Anda dan kunjungi http://localhost:3000 untuk mengakses antarmuka chatbot.

7. Ketik pesan Anda dalam kotak input dan tekan Enter atau klik tombol "Kirim" untuk berinteraksi dengan chatbot.

## Penggunaan

- Untuk memulai sesi obrolan baru, klik tombol "Mulai Obrolan Baru."

## Catatan Tambahan

- Pastikan bahwa Node.js versi yang digunakan mendukung fitur-fitur yang diperlukan oleh proyek. Jika ada masalah, pertimbangkan untuk menggunakan versi Node.js yang lebih stabil atau sesuai dengan persyaratan proyek.

## Lisensi

Proyek ini dilisensikan di bawah [MIT license](LICENSE).
