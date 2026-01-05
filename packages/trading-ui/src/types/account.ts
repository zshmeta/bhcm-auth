/**
 * Account Types
 * 
 * Defines account and margin related types.
 */

/** Account currency */
export type AccountCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'BTC';

/** Account summary */
export interface Account {
    /** Account ID */
    id: string;

    /** User ID */
    userId: string;

    /** Account currency */
    currency: AccountCurrency;

    /** Cash balance (excluding unrealized P&L) */
    balance: number;

    /** Equity (balance + unrealized P&L) */
    equity: number;

    /** Used margin */
    usedMargin: number;

    /** Free margin (available for trading) */
    freeMargin: number;

    /** Margin level percentage (equity / usedMargin * 100) */
    marginLevel: number;

    /** Unrealized P&L across all positions */
    unrealizedPnl: number;

    /** Realized P&L today */
    realizedPnlToday: number;

    /** Total commission paid today */
    commissionToday: number;

    /** Swap/rollover charges today */
    swapToday: number;

    /** Number of open positions */
    openPositions: number;

    /** Number of pending orders */
    pendingOrders: number;

    /** Account leverage setting */
    leverage: number;

    /** Margin call level (percentage) */
    marginCallLevel: number;

    /** Stop out level (percentage) */
    stopOutLevel: number;

    /** Whether margin call is active */
    isMarginCall: boolean;

    /** Last update timestamp */
    lastUpdate: string;
}

/** Account equity history point */
export interface EquityHistoryPoint {
    /** Timestamp */
    timestamp: string;

    /** Equity value */
    equity: number;

    /** Balance value */
    balance: number;
}

/** Trading statistics */
export interface TradingStats {
    /** Total number of trades */
    totalTrades: number;

    /** Number of winning trades */
    winningTrades: number;

    /** Number of losing trades */
    losingTrades: number;

    /** Win rate percentage */
    winRate: number;

    /** Average winning trade P&L */
    avgWin: number;

    /** Average losing trade P&L */
    avgLoss: number;

    /** Profit factor (gross profit / gross loss) */
    profitFactor: number;

    /** Largest winning trade */
    largestWin: number;

    /** Largest losing trade */
    largestLoss: number;

    /** Average trade duration in seconds */
    avgTradeDuration: number;

    /** Total volume traded */
    totalVolume: number;

    /** Total commission paid */
    totalCommission: number;

    /** Net P&L */
    netPnl: number;
}

/** Margin requirement */
export interface MarginRequirement {
    /** Symbol */
    symbol: string;

    /** Required margin per lot */
    marginPerLot: number;

    /** Current margin rate */
    marginRate: number;

    /** Maximum allowed leverage */
    maxLeverage: number;
}
