/**
 * Trading Calculations
 * 
 * P&L, margin, and position calculation utilities.
 */

import type { Position, OrderSide, AnyInstrument } from '../types';

/**
 * Calculate unrealized P&L for a position.
 */
export function calculateUnrealizedPnl(
    side: OrderSide,
    entryPrice: number,
    currentPrice: number,
    quantity: number
): number {
    const direction = side === 'buy' ? 1 : -1;
    return (currentPrice - entryPrice) * quantity * direction;
}

/**
 * Calculate P&L percentage.
 */
export function calculatePnlPercent(
    pnl: number,
    entryPrice: number,
    quantity: number
): number {
    const invested = entryPrice * quantity;
    if (invested === 0) return 0;
    return (pnl / invested) * 100;
}

/**
 * Calculate required margin for a position.
 */
export function calculateMargin(
    price: number,
    quantity: number,
    leverage: number
): number {
    return (price * quantity) / leverage;
}

/**
 * Calculate margin level percentage.
 */
export function calculateMarginLevel(
    equity: number,
    usedMargin: number
): number {
    if (usedMargin === 0) return 0;
    return (equity / usedMargin) * 100;
}

/**
 * Calculate free margin.
 */
export function calculateFreeMargin(
    equity: number,
    usedMargin: number
): number {
    return equity - usedMargin;
}

/**
 * Calculate position size from risk amount.
 */
export function calculatePositionSize(
    riskAmount: number,
    entryPrice: number,
    stopLoss: number,
    side: OrderSide
): number {
    const direction = side === 'buy' ? 1 : -1;
    const riskPerUnit = Math.abs(entryPrice - stopLoss) * direction;
    if (riskPerUnit === 0) return 0;
    return riskAmount / Math.abs(riskPerUnit);
}

/**
 * Calculate pip value for FX pairs.
 */
export function calculatePipValue(
    pipSize: number,
    quantity: number,
    quoteCurrency: string,
    accountCurrency: string = 'USD',
    exchangeRate: number = 1
): number {
    // For pairs where USD is quote currency
    if (quoteCurrency === accountCurrency) {
        return pipSize * quantity * 100000; // Standard lot
    }
    // For pairs where USD is base currency or cross pairs
    return pipSize * quantity * 100000 * exchangeRate;
}

/**
 * Calculate distance to stop loss/take profit in pips.
 */
export function calculateDistanceInPips(
    currentPrice: number,
    targetPrice: number,
    pipSize: number
): number {
    return Math.abs(currentPrice - targetPrice) / pipSize;
}

/**
 * Calculate risk-reward ratio.
 */
export function calculateRiskReward(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    side: OrderSide
): number {
    const direction = side === 'buy' ? 1 : -1;
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);

    if (risk === 0) return 0;
    return reward / risk;
}

/**
 * Check if a price crosses stop loss.
 */
export function isStopLossHit(
    side: OrderSide,
    currentPrice: number,
    stopLoss: number
): boolean {
    if (side === 'buy') {
        return currentPrice <= stopLoss;
    }
    return currentPrice >= stopLoss;
}

/**
 * Check if a price crosses take profit.
 */
export function isTakeProfitHit(
    side: OrderSide,
    currentPrice: number,
    takeProfit: number
): boolean {
    if (side === 'buy') {
        return currentPrice >= takeProfit;
    }
    return currentPrice <= takeProfit;
}

/**
 * Calculate total equity from positions.
 */
export function calculateEquity(
    balance: number,
    positions: Position[]
): number {
    const totalUnrealizedPnl = positions.reduce(
        (sum, pos) => sum + pos.unrealizedPnl,
        0
    );
    return balance + totalUnrealizedPnl;
}

/**
 * Calculate total used margin from positions.
 */
export function calculateTotalMargin(positions: Position[]): number {
    return positions.reduce((sum, pos) => sum + pos.margin, 0);
}

/**
 * Validate order parameters.
 */
export function validateOrder(params: {
    quantity: number;
    price?: number;
    stopLoss?: number;
    takeProfit?: number;
    side: OrderSide;
    instrument: AnyInstrument;
    freeMargin: number;
    leverage: number;
}): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check minimum quantity
    if (params.quantity < params.instrument.minQuantity) {
        errors.push(`Minimum quantity is ${params.instrument.minQuantity}`);
    }

    // Check quantity step
    const remainder = params.quantity % params.instrument.quantityStep;
    if (remainder !== 0) {
        errors.push(`Quantity must be in steps of ${params.instrument.quantityStep}`);
    }

    // Check leverage
    if (params.leverage > params.instrument.maxLeverage) {
        errors.push(`Maximum leverage is ${params.instrument.maxLeverage}x`);
    }

    // Check margin
    if (params.price) {
        const requiredMargin = calculateMargin(params.price, params.quantity, params.leverage);
        if (requiredMargin > params.freeMargin) {
            errors.push('Insufficient margin');
        }
    }

    // Validate stop loss direction
    if (params.stopLoss && params.price) {
        if (params.side === 'buy' && params.stopLoss >= params.price) {
            errors.push('Stop loss must be below entry price for buy orders');
        }
        if (params.side === 'sell' && params.stopLoss <= params.price) {
            errors.push('Stop loss must be above entry price for sell orders');
        }
    }

    // Validate take profit direction
    if (params.takeProfit && params.price) {
        if (params.side === 'buy' && params.takeProfit <= params.price) {
            errors.push('Take profit must be above entry price for buy orders');
        }
        if (params.side === 'sell' && params.takeProfit >= params.price) {
            errors.push('Take profit must be below entry price for sell orders');
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
