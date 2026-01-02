import { OrderSide, OrderType } from "./order.types.js";

// Engine-specific Order interface using numbers for calculation
export interface EngineOrder {
    id: string;
    side: OrderSide;
    type: OrderType;
    price: number; // Limit price (0 for market)
    quantity: number;
    filledQuantity: number;
    timestamp: number;
}

export interface Trade {
    makerOrderId: string;
    takerOrderId: string;
    price: number;
    quantity: number;
    timestamp: number;
}

export class OrderMatchingEngine {
    private bids: EngineOrder[] = []; // Descending price
    private asks: EngineOrder[] = []; // Ascending price

    constructor(private symbol: string) { }

    public processOrder(order: EngineOrder): { trades: Trade[]; filled: boolean } {
        const trades: Trade[] = [];

        if (order.type === "market") {
            this.matchMarketOrder(order, trades);
        } else if (order.type === "limit") {
            this.matchLimitOrder(order, trades);
        }

        const filled = order.filledQuantity >= order.quantity;

        // If not filled and it's a Limit order, add to book
        if (!filled && order.type === "limit") {
            this.addToBook(order);
        }

        return { trades, filled };
    }

    public addExistingOrder(order: EngineOrder) {
        this.addToBook(order);
    }

    private matchMarketOrder(order: EngineOrder, trades: Trade[]) {
        const book = order.side === "buy" ? this.asks : this.bids;

        while (order.filledQuantity < order.quantity && book.length > 0) {
            const bestMatch = book[0]!;
            const tradePrice = bestMatch.price;

            const quantityNeeded = order.quantity - order.filledQuantity;
            const quantityAvailable = bestMatch.quantity - bestMatch.filledQuantity;
            const tradeQuantity = Math.min(quantityNeeded, quantityAvailable);

            trades.push({
                makerOrderId: bestMatch.id,
                takerOrderId: order.id,
                price: tradePrice,
                quantity: tradeQuantity,
                timestamp: Date.now(),
            });

            order.filledQuantity += tradeQuantity;
            bestMatch.filledQuantity += tradeQuantity;

            if (bestMatch.filledQuantity >= bestMatch.quantity) {
                book.shift(); // Remove filled order
            }
        }
    }

    private matchLimitOrder(order: EngineOrder, trades: Trade[]) {
        const isBuy = order.side === "buy";
        const book = isBuy ? this.asks : this.bids;

        while (order.filledQuantity < order.quantity && book.length > 0) {
            const bestMatch = book[0]!;

            // Check price crossing
            // Buy Limit: Match if Best Ask <= Limit Price
            // Sell Limit: Match if Best Bid >= Limit Price
            const canMatch = isBuy
                ? bestMatch.price <= order.price
                : bestMatch.price >= order.price;

            if (!canMatch) break;

            const tradePrice = bestMatch.price; // Maker sets the price
            const quantityNeeded = order.quantity - order.filledQuantity;
            const quantityAvailable = bestMatch.quantity - bestMatch.filledQuantity;
            const tradeQuantity = Math.min(quantityNeeded, quantityAvailable);

            trades.push({
                makerOrderId: bestMatch.id,
                takerOrderId: order.id,
                price: tradePrice,
                quantity: tradeQuantity,
                timestamp: Date.now(),
            });

            order.filledQuantity += tradeQuantity;
            bestMatch.filledQuantity += tradeQuantity;

            if (bestMatch.filledQuantity >= bestMatch.quantity) {
                book.shift();
            }
        }
    }

    private addToBook(order: EngineOrder) {
        if (order.side === "buy") {
            this.bids.push(order);
            // Sort Bids: Highest Price First
            this.bids.sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
        } else {
            this.asks.push(order);
            // Sort Asks: Lowest Price First
            this.asks.sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
        }
    }

    public getBook() {
        return {
            bids: this.bids.map(o => ({ ...o })),
            asks: this.asks.map(o => ({ ...o })),
        };
    }
}
