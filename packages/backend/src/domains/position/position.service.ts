import { DrizzleClient } from "../../db/pg.js";
import { accounts, positions } from "@repo/database";
import { eq, sql } from "drizzle-orm";

export class PositionService {
    constructor(private db: DrizzleClient) { }

    async getPositions(userId: string) {

        // Return all positions across all accounts owned by this user.
        return this.db
            .select({
                id: positions.id,
                accountId: positions.accountId,
                symbol: positions.symbol,
                side: positions.side,
                quantity: positions.quantity,
                entryPrice: positions.entryPrice,
                unrealizedPnl: positions.unrealizedPnl,
                realizedPnl: positions.realizedPnl,
                updatedAt: positions.updatedAt,
            })
            .from(positions)
            .innerJoin(accounts, eq(positions.accountId, accounts.id))
            .where(eq(accounts.userId, userId));
    }

    async updatePosition(accountId: string, symbol: string, side: "buy" | "sell", quantity: number, price: number): Promise<void> {
        // Calculate change
        // For Spot:
        // Buy 1 BTC: Increase BTC position. (Cost handled by Ledger usually, or decremented cash separately).
        // Sell 1 BTC: Decrease BTC position.

        // Note: The schemas use `numeric`. Drizzle returns string. We pass number.
        // Need to be careful with precision. For this MVP refactor, sticking to number is okay but risky.

        const qtyStr = quantity.toString();

        const change = side === "buy" ? quantity : -quantity;

        // Upsert
        // We use ON CONFLICT DO UPDATE
        // Postgres: INSERT INTO positions ... ON CONFLICT (account_id, symbol) DO UPDATE ...

        await this.db.insert(positions).values({
            accountId,
            symbol,
            side: 'long', // Spot positions are usually 'long' assets. 'short' implies margin. Assumed 'long'.
            quantity: qtyStr,
            // entryPrice: update average entry price? Complex. Skip for now or simple weighted avg.
        }).onConflictDoUpdate({
            target: [positions.accountId, positions.symbol],
            set: {
                // quantity: positions.quantity + change
                quantity: sql`${positions.quantity} + ${change}`
            }
        });
    }
}
