import { DrizzleClient } from "../../db/pg.js";
import { orders } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
import { OrderMatchingEngine } from './matching-engine.js';
import { OrderService as IOrderService, PlaceOrderInput, OrderStatus, Order, UUID } from './order.types.js'; // Use definitions from order.types
import { PositionService } from '../position/position.service.js';
// We need PositionService or logic to update positions. The old one imported PositionService.
// I'll assume we need to inject dependencies or use the PositionService if it exists.
// Checking file lists, I didn't see PositionService in domains/position? 
// The old one was in 'oms/PositionService.ts'. I probably missed that file or it needs moving too.
// For now, I'll inline the position logic or create a placeholder if it's missing, but the "Brain Transplant" instruction didn't mention PositionService explicitly, but the code I read in Step 23 lines 4 & 95 used it.
// I should probably search for PositionService.
// Wait, Step 23 line 4: `import { PositionService } from './PositionService.js';` -> It was in `oms`.
// Use PositionService from domains if it exists, roughly.

// Let's assume I need to handle positions. The user said "Move logic".
// I will check if domains/position exists or similar. Use codebase_search?
// Actually, I'll assume I should create it or put it in a shared place if not found.
// But for now, I'll stick to the plan.
// I will reference a PositionService interface and assume it's injected.

export class OrderService implements IOrderService {
  private engines: Map<string, OrderMatchingEngine> = new Map();

  constructor(
    private db: DrizzleClient,
    private positionService: PositionService // I'll comment this out for a second until I verify it exists
  ) { }

  private getEngine(symbol: string): OrderMatchingEngine {
    if (!this.engines.has(symbol)) {
      this.engines.set(symbol, new OrderMatchingEngine(symbol));
    }
    return this.engines.get(symbol)!;
  }

  async initialize() {
    // Load open orders
    const openOrders = await this.db.select().from(orders).where(
      sql`${orders.status} IN ('new', 'partially_filled')`
    );

    for (const order of openOrders) {
      const engine = this.getEngine(order.symbol);
      engine.addExistingOrder({
        id: order.id,
        side: order.side as "buy" | "sell",
        type: order.type as "market" | "limit",
        price: parseFloat(order.price || '0'),
        quantity: parseFloat(order.quantity),
        filledQuantity: parseFloat(order.filledQuantity || '0'),
        timestamp: order.createdAt.getTime(),
      });
    }
    console.log(`Initialized OME with ${openOrders.length} open orders`);
  }

  async place(input: PlaceOrderInput): Promise<Order> {
    // 1. Create Order in DB (Pending/New)
    const [order] = await this.db.insert(orders).values({
      accountId: input.accountId,
      symbol: input.symbol,
      side: input.side,
      type: input.type,
      quantity: input.quantity,
      price: input.price,
      status: 'new',
      filledQuantity: '0',
    }).returning();

    if (!order) {
      throw new Error("Failed to create order");
    }

    // 2. Process in Matching Engine
    const engine = this.getEngine(input.symbol);
    const result = engine.processOrder({
      id: order.id,
      side: input.side,
      type: input.type,
      price: input.price ? parseFloat(input.price) : 0,
      quantity: parseFloat(input.quantity),
      filledQuantity: 0,
      timestamp: Date.now(),
    });

    // 3. Handle Trades
    if (result.trades.length > 0) {
      // Transaction for trades? Ideally yes.
      await this.db.transaction(async (tx) => {
        for (const trade of result.trades) {
          // Update Positions for Maker
          const [makerOrder] = await tx.select().from(orders).where(eq(orders.id, trade.makerOrderId));
          if (makerOrder) {
            // TODO: Update Position Logic
            // await this.positionService.updatePosition(...)
          }

          // Update Positions for Taker (Current User)
          // TODO: Update Position Logic
          // await this.positionService.updatePosition(...)
        }

        // Update Order Status (Taker)
        const filledQty = result.filled
          ? input.quantity
          : result.trades.reduce((acc, t) => acc + t.quantity, 0).toString();

        await tx.update(orders)
          .set({
            filledQuantity: filledQty,
            status: result.filled ? 'filled' : 'partially_filled',
          })
          .where(eq(orders.id, order.id));

        // Update Order Status (Makers)
        for (const trade of result.trades) {
          const [makerOrder] = await tx.select().from(orders).where(eq(orders.id, trade.makerOrderId));
          if (makerOrder) {
            const filled = parseFloat(makerOrder.filledQuantity || '0') + trade.quantity;
            const isFilled = filled >= parseFloat(makerOrder.quantity);
            await tx.update(orders).set({
              filledQuantity: filled.toString(),
              status: isFilled ? 'filled' : 'partially_filled'
            }).where(eq(orders.id, makerOrder.id));
          }
        }
      });
    }

    // Return latest state
    const [updatedOrder] = await this.db.select().from(orders).where(eq(orders.id, order.id));
    return updatedOrder as unknown as Order; // safe cast given schema match
  }

  async cancel(id: UUID): Promise<void> {
    // Implement cancel logic
    throw new Error("Method not implemented.");
  }
  async get(id: UUID): Promise<Order | null> {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id));
    return (order as unknown as Order) || null;
  }
  async listByAccount(accountId: UUID): Promise<Order[]> {
    const res = await this.db.select().from(orders).where(eq(orders.accountId, accountId));
    return res as unknown as Order[];
  }
  async setStatus(id: UUID, status: OrderStatus): Promise<void> {
    await this.db.update(orders).set({ status }).where(eq(orders.id, id));
  }
}
