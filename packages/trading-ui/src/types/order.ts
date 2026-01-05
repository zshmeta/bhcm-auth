/**
 * Order Types
 * 
 * Defines order-related types for trading operations.
 */

/** Order side */
export type OrderSide = 'buy' | 'sell';

/** Order type */
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

/** Order status */
export type OrderStatus =
    | 'pending'     // Not yet submitted
    | 'open'        // Active in the market
    | 'filled'      // Fully executed
    | 'partial'     // Partially filled
    | 'cancelled'   // Cancelled by user
    | 'rejected'    // Rejected by system
    | 'expired';    // Time-based expiration

/** Time in force options */
export type TimeInForce =
    | 'gtc'   // Good Till Cancelled
    | 'day'   // Day order
    | 'ioc'   // Immediate or Cancel
    | 'fok';  // Fill or Kill

/** Order request (for placing new orders) */
export interface OrderRequest {
    /** Symbol to trade */
    symbol: string;

    /** Buy or sell */
    side: OrderSide;

    /** Order type */
    type: OrderType;

    /** Quantity to trade */
    quantity: number;

    /** Limit price (for limit and stop_limit orders) */
    limitPrice?: number;

    /** Stop price (for stop and stop_limit orders) */
    stopPrice?: number;

    /** Stop loss price */
    stopLoss?: number;

    /** Take profit price */
    takeProfit?: number;

    /** Leverage multiplier (1 = no leverage) */
    leverage?: number;

    /** Time in force */
    timeInForce?: TimeInForce;

    /** Client-side order ID */
    clientOrderId?: string;

    /** Optional comment */
    comment?: string;
}

/** Order (after submission) */
export interface Order extends OrderRequest {
    /** Server-assigned order ID */
    id: string;

    /** User ID */
    userId: string;

    /** Current status */
    status: OrderStatus;

    /** Filled quantity */
    filledQuantity: number;

    /** Remaining quantity */
    remainingQuantity: number;

    /** Average fill price */
    avgFillPrice?: number;

    /** Order creation timestamp */
    createdAt: string;

    /** Last update timestamp */
    updatedAt: string;

    /** Fill timestamp (if filled) */
    filledAt?: string;

    /** Cancellation timestamp (if cancelled) */
    cancelledAt?: string;

    /** Rejection reason (if rejected) */
    rejectionReason?: string;
}

/** Order fill/execution */
export interface OrderFill {
    /** Fill ID */
    id: string;

    /** Order ID */
    orderId: string;

    /** Fill price */
    price: number;

    /** Fill quantity */
    quantity: number;

    /** Fill timestamp */
    timestamp: string;

    /** Commission charged */
    commission: number;

    /** Commission currency */
    commissionCurrency: string;
}

/** Order modification request */
export interface OrderModification {
    /** Order ID to modify */
    orderId: string;

    /** New limit price */
    limitPrice?: number;

    /** New stop price */
    stopPrice?: number;

    /** New stop loss */
    stopLoss?: number;

    /** New take profit */
    takeProfit?: number;

    /** New quantity (if reducing) */
    quantity?: number;
}
