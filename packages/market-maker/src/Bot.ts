import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

interface Config {
    apiUrl: string;
    wsUrl: string;
    email: string;
    password: string;
    symbol: string;
}

export class MarketMakerBot {
    private api: AxiosInstance;
    private socket: Socket;
    private token: string | null = null;
    private userId: string | null = null;
    private running: boolean = false;
    private config: Config;

    // State
    private midPrice: number = 50000; // Default start
    private orders: string[] = []; // Track order IDs to cancel

    constructor(config: Config) {
        this.config = config;
        this.api = axios.create({ baseURL: config.apiUrl });
        this.socket = io(config.wsUrl, {
            autoConnect: false,
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });
    }

    async start() {
        console.log(`Starting Market Maker for ${this.config.symbol}...`); // Add emojis if needed
        try {
            await this.login();
            this.connectSocket();
            this.running = true;
            this.loop();
        } catch (error) {
            console.error("Failed to start:", error);
            // Retry start logic or exit
        }
    }

    private async login() {
        const maxRetries = 10;
        const delay = 2000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Logging in... (Attempt ${i + 1}/${maxRetries})`);
                const res = await this.api.post('/auth/login', {
                    email: this.config.email,
                    password: this.config.password
                });
                this.token = res.data.tokens.accessToken;
                this.userId = res.data.user.id;
                this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                console.log("Logged in as User ID:", this.userId);
                return;
            } catch (e: any) {
                const isRefused = e.code === 'ECONNREFUSED' || e.message.includes('ECONNREFUSED');
                if (isRefused && i < maxRetries - 1) {
                    console.log(`Connection refused, backend might be starting up. Retrying in ${delay / 1000}s...`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }

                console.error("Login failed", e.response?.data || e.message);
                throw e;
            }
        }
    }

    private connectSocket() {
        this.socket.connect();
        this.socket.on('connect', () => {
            console.log("WS Connected");
            this.socket.emit('subscribe', [this.config.symbol]);
        });

        this.socket.on('disconnect', () => {
            console.log("WS Disconnected");
            // Socket.io auto-reconnects, but we might want to pause trading
        });

        this.socket.on('price_update', (data) => {
            // Validate Data
        });
    }

    private async loop() {
        let lastPrice = this.midPrice;

        while (this.running) {
            if (!this.socket.connected) {
                console.log("Waiting for WS...");
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            // Emergency Check
            const drift = Math.abs((this.midPrice - lastPrice) / lastPrice);
            if (drift > 0.05) { // 5% move in one cycle?
                console.error(`EMERGENCY STOP: Price moved ${drift * 100}% in one cycle! Stopping.`);
                this.running = false;
                break;
            }
            lastPrice = this.midPrice;

            try {
                await this.cycle();
            } catch (e: any) {
                console.error("Cycle error:", e.message);
            }
            // Wait 2 seconds
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    // ... existing cycle and placeOrder methods ... use replace helper to keep them
    private async cycle() {
        // Random Walk
        const change = (Math.random() - 0.5) * 100; // +/- $50
        this.midPrice += change;
        if (this.midPrice < 1000) this.midPrice = 1000; // Safety floor

        // Spread
        const spread = 20 + Math.random() * 10; // $20-30 spread
        const bidPrice = this.midPrice - (spread / 2);
        const askPrice = this.midPrice + (spread / 2);

        // Place Buy (Bid)
        await this.placeOrder('buy', bidPrice, 0.1);

        // Place Sell (Ask)
        await this.placeOrder('sell', askPrice, 0.1);

        // Occasionally place a crossing trade to print a trade on the tape
        if (Math.random() > 0.7) {
            const side = Math.random() > 0.5 ? 'buy' : 'sell';
            // Cross the spread
            const price = side === 'buy' ? askPrice + 1 : bidPrice - 1;
            await this.placeOrder(side, price, 0.05);
            // console.log(`Placed TAKING ${side} at ${price.toFixed(2)}`);
        } else {
            console.log(`Placed MAKER Bid: ${bidPrice.toFixed(2)} / Ask: ${askPrice.toFixed(2)} [Mid: ${this.midPrice.toFixed(2)}]`);
        }
    }

    private async placeOrder(side: 'buy' | 'sell', price: number, quantity: number) {
        if (!this.userId) return;
        try {
            await this.api.post('/orders', {
                userId: this.userId,
                symbol: this.config.symbol,
                side,
                type: 'limit',
                quantity,
                price
            });
        } catch (e: any) {
            // console.error("Place order failed:", e.message);
        }
    }
}
