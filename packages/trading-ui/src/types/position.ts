/**
 * Position Types
 * 
 * Defines position and P&L related types.
 */

import type { OrderSide } from './order';

/** Position status */
export type PositionStatus = 'open' | 'closed' | 'liquidated';

/** Open position */
export interface Position {
    /** Position ID */
    id: string;

    /** User ID */
    userId: string;

    /** Symbol */
    symbol: string;

    /** Position side (long = buy, short = sell) */
    side: OrderSide;

    /** Position quantity */
    quantity: number;

    /** Average entry price */
    entryPrice: number;

    /** Current market price */
    currentPrice: number;

    /** Stop loss price (if set) */
    stopLoss?: number;

    /** Take profit price (if set) */
    takeProfit?: number;

    /** Leverage used */
    leverage: number;

    /** Margin used for this position */
    margin: number;

    /** Unrealized P&L in quote currency */
    unrealizedPnl: number;

    /** Unrealized P&L as percentage */
    unrealizedPnlPercent: number;

    /** Realized P&L (from partial closes) */
    realizedPnl: number;

    /** Swap/rollover fees accumulated */
    swap: number;

    /** Commission paid */
    commission: number;

    /** Position status */
    status: PositionStatus;

    /** Open timestamp */
    openedAt: string;

    /** Close timestamp (if closed) */
    closedAt?: string;

    /** Close price (if closed) */
    closePrice?: number;

    /** Comment */
    comment?: string;
}

/** Position close request */
export interface ClosePositionRequest {
    /** Position ID */
    positionId: string;

    /** Quantity to close (partial close if less than full) */
    quantity?: number;

    /** Close at market or limit price */
    type: 'market' | 'limit';

    /** Limit price (if type is limit) */
    limitPrice?: number;
}

/** Position modification request */
export interface ModifyPositionRequest {
    /** Position ID */
    positionId: string;

    /** New stop loss (null to remove) */
    stopLoss?: number | null;

    /** New take profit (null to remove) */
    takeProfit?: number | null;
}

/** Trade history entry (closed position) */
export interface TradeHistory {
    /** Trade ID */
    id: string;

    /** Position ID */
    positionId: string;

    /** Symbol */
    symbol: string;

    /** Trade side */
    side: OrderSide;

    /** Quantity traded */
    quantity: number;

    /** Entry price */
    entryPrice: number;

    /** Exit price */
    exitPrice: number;

    /** Realized P&L */
    pnl: number;

    /** P&L percentage */
    pnlPercent: number;

    /** Open timestamp */
    openedAt: string;

    /** Close timestamp */
    closedAt: string;

    /** Duration in seconds */
    duration: number;

    /** Close reason */
    closeReason: 'manual' | 'stop_loss' | 'take_profit' | 'liquidation' | 'margin_call';
}

/** P&L summary */
export interface PnLSummary {
    /** Total unrealized P&L */
    unrealized: number;

    /** Total realized P&L (today) */
    realizedToday: number;

    /** Total realized P&L (all time) */
    realizedTotal: number;

    /** Total fees/commissions */
    totalFees: number;

    /** Net P&L (realized - fees) */
    netPnl: number;
}
