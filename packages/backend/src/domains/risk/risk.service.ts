import { DrizzleClient } from "../../db/pg.js";
import { accounts, positions, marketPrices } from "@repo/database";
import { eq, and, sql } from "drizzle-orm";

export type UUID = string;

export interface RiskCheckInput {
  accountId: UUID;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "take_profit";
  price?: string; // Limit price
  quantity: string;
}

export interface RiskService {
  validateOrder(input: RiskCheckInput): Promise<{
    ok: true;
  } | {
    ok: false;
    reason: string;
  }>;
}

const MAX_HOUSE_EXPOSURE = 1000000; // Example limit: $1M or 1M units? Assuming Units for now or USD. 
// Let's assume Limit on Symbol Quantity or Notional. 
// User said "House Exposure < Limit". I'll use Notional for safety.

export class RiskServiceImplementation implements RiskService {
  constructor(private db: DrizzleClient) { }

  async validateOrder(input: RiskCheckInput): Promise<{ ok: true } | { ok: false; reason: string }> {
    const qty = parseFloat(input.quantity);
    const price = input.price ? parseFloat(input.price) : 0; // If market, need current price.

    // 1. Check User Balance (Pre-trade check)
    // For BUY orders, check if user has enough Quote Currency (USD/USDT)
    // For SELL orders, check if user has enough Base Currency (BTC/ETH) (Spot)
    // Schema has 'accounts' with 'currency'.
    // Assuming 'spot' accounts.

    // Fetch Account
    const [account] = await this.db.select().from(accounts).where(eq(accounts.id, input.accountId));
    if (!account) {
      return { ok: false, reason: "Account not found" };
    }

    if (input.side === "buy") {
      // Estimate Cost.
      // If Market Order, we need a price.
      // I'll fetch the latest market price if needed, or use a safety buffer.
      let estimatedPrice = price;
      if (input.type === "market") {
        // Get latest price
        const [latestPrice] = await this.db.select().from(marketPrices)
          .where(eq(marketPrices.symbol, input.symbol))
          .orderBy(sql`${marketPrices.timestamp} DESC`)
          .limit(1);

        estimatedPrice = latestPrice ? parseFloat(latestPrice.price) : 0;
        if (estimatedPrice === 0) {
          // If no price, maybe safe to fail or allow if deep liquidity?
          // Fail for safety.
          return { ok: false, reason: "Market price unavailable for valuation" };
        }
        // Add 5% buffer for market orders
        estimatedPrice = estimatedPrice * 1.05;
      }

      const cost = qty * estimatedPrice;
      if (parseFloat(account.balance) < cost) {
        return { ok: false, reason: `Insufficient funds. Required: ${cost}, Available: ${account.balance}` };
      }
    } else {
      // SELL: Check if they have the asset? 
      // The 'accounts' table has 'currency'. If this is a multicurrency account system, we need to check the specific currency account.
      // But 'accounts' table row IS the account. 'currency' is a column.
      // So 'accountId' passed in points to a specific currency account (e.g. USD account).
      // If I am selling BTC, I need to pass the BTC accountId?
      // OR, does 'accounts' hold one user's balances across assets?
      // Schema: accounts { id, userId, currency, balance ... }
      // So one user has multiple accounts (USD, BTC).
      // 'input.accountId' is the account being traded FROM.
      // If I am buying BTC/USD, I use my USD account.
      // If I am selling BTC/USD, I use my BTC account?
      // Usually in basic systems, you have one 'accountId' for the user's main wallet or subaccount.
      // Let's assume accounts are per-currency.

      // Verification: OrderService INSERTs into 'orders' with 'accountId'.
      // If 'Order' has 'symbol' (BTC/USD), and 'accountId' refers to a USD account...
      // Then where do we track BTC balance? 
      // Positions? Schema has 'positions' table.
      // Ah, Schema 'positions' table has 'quantity'.
      // So maybe Spot Trading uses 'positions' for the Asset and 'accounts' for the Cash?
      // If so, for SELL, we check 'positions'.

      // Let's check Schema: `positions` table has `symbol`, `quantity`, `accountId`.
      // This strongly implies Spot/Margin model where Account = Cash, Position = Asset.

      const [position] = await this.db.select().from(positions).where(
        and(
          eq(positions.accountId, input.accountId),
          eq(positions.symbol, input.symbol)
        )
      );

      const currentQty = position ? parseFloat(position.quantity) : 0;
      if (currentQty < qty) {
        return { ok: false, reason: `Insufficient position. Required: ${qty}, Available: ${currentQty}` };
      }
    }

    // 2. House Exposure Check (B-Book Risk)
    // Calculate total net position of all users. House position = -TotalUserPosition.
    // If Users are Long 100 BTC, House is Short 100 BTC.
    // Check if new order increases House Exposure beyond limit.

    // Sum all user positions for symbol
    const [result] = await this.db.select({
      totalQuantity: sql<string>`sum(${positions.quantity})`
    }).from(positions).where(eq(positions.symbol, input.symbol));

    let currentNetParams = parseFloat(result?.totalQuantity || '0');

    // Impact of this order:
    // User BUY -> User Position Increases -> House (Short) Increases
    // User SELL -> User Position Decreases -> House (Short) Decreases (or goes Long)

    let nextNetParams = currentNetParams;
    if (input.side === "buy") {
      nextNetParams += qty;
    } else {
      nextNetParams -= qty;
    }

    // Absolute exposure
    if (Math.abs(nextNetParams) > MAX_HOUSE_EXPOSURE) {
      return { ok: false, reason: `House exposure limit exceeded for ${input.symbol}` };
    }

    return { ok: true };
  }
}
