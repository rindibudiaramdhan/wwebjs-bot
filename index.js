const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const app = express();
const port = 3000;

app.use(express.json()); // Biar bisa baca JSON body

const client = new Client({
    authStrategy: new LocalAuth()
});

// === WHATSAPP HANDLER ===
client.on('qr', (qr) => {
    console.log('Scan QR code below:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.initialize();

// === API Endpoint ===
app.post('/send-otp', async (req, res) => {
    const { number, message } = req.body;

    // Pastikan format nomor: 62xxxxxxxxxx@c.us
    if (!number || !message) {
        return res.status(400).json({ status: false, message: 'Number and message are required.' });
    }

    const chatId = number.endsWith('@c.us') ? number : `${number}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.status(200).json({ status: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Failed to send message:', error);
        res.status(500).json({ status: false, message: 'Failed to send message', error: error.toString() });
    }
});

// === Start Server ===
app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
});
