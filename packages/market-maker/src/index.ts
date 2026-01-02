import dotenv from 'dotenv';
import { MarketMakerBot } from './Bot.js';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:8080';
const WS_URL = process.env.WS_URL || 'http://localhost:8081'; // Socket.io usually same port
const EMAIL = process.env.MM_EMAIL || 'mm@bhc.com';
const PASSWORD = process.env.MM_PASSWORD || 'marketmaker';

async function main() {
    const bot = new MarketMakerBot({
        apiUrl: API_URL,
        wsUrl: WS_URL,
        email: EMAIL,
        password: PASSWORD,
        symbol: 'BTC-USD'
    });

    await bot.start();
}

main();
