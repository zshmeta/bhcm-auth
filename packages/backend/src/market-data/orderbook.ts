import { logger } from "./logger.js";

export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";

export interface Order {
    id: string;
    symbol: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    quantity: number;
    filled: number;
    timestamp: number;
}

export class OrderBook {
    public bids: Order[] = [];
    public asks: Order[] = [];

    constructor(public symbol: string) { }

    public addOrder(order: Order) {
        if (order.side === "buy") {
            this.bids.push(order);
            this.bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp); // Highest price first
        } else {
            this.asks.push(order);
            this.asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp); // Lowest price first
        }
        this.matchOrders();
    }

    public matchOrders() {
        while (this.bids.length > 0 && this.asks.length > 0) {
            const bestBid = this.bids[0]!;
            const bestAsk = this.asks[0]!;

            if (bestBid.price >= bestAsk.price) {
                const quantity = Math.min(bestBid.quantity - bestBid.filled, bestAsk.quantity - bestAsk.filled);

                bestBid.filled += quantity;
                bestAsk.filled += quantity;

                logger.info({
                    symbol: this.symbol,
                    price: bestAsk.price,
                    quantity,
                    buyer: bestBid.id,
                    seller: bestAsk.id
                }, "Match executed");

                if (bestBid.filled >= bestBid.quantity) {
                    this.bids.shift();
                }
                if (bestAsk.filled >= bestAsk.quantity) {
                    this.asks.shift();
                }
            } else {
                break;
            }
        }
    }

    public getDepth(levels = 10) {
        return {
            symbol: this.symbol,
            bids: this.bids.slice(0, levels).map(o => ({ price: o.price, quantity: o.quantity - o.filled })),
            asks: this.asks.slice(0, levels).map(o => ({ price: o.price, quantity: o.quantity - o.filled }))
        };
    }
}

const books: Record<string, OrderBook> = {};

export function getOrderBook(symbol: string) {
    if (!books[symbol]) {
        books[symbol] = new OrderBook(symbol);
    }
    return books[symbol];
}
