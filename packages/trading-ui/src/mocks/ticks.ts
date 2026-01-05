/**
 * Mock Tick Generator
 * 
 * Generates realistic real-time price ticks with random walk simulation.
 */

import type { Tick } from '../types';
import { INITIAL_PRICES, VOLATILITY, getInstrumentBySymbol } from './symbols';

/** Current price state */
const priceState: Record<string, { bid: number; ask: number; last: number }> = {};

/** Initialize price state for a symbol */
function initializePriceState(symbol: string): void {
    const instrument = getInstrumentBySymbol(symbol);
    if (!instrument) return;

    const basePrice = INITIAL_PRICES[symbol] || 100;
    const spread = instrument.typicalSpread * (instrument.category === 'fx' ? instrument.decimals === 5 ? 0.0001 : 0.01 : 1);

    priceState[symbol] = {
        bid: basePrice - spread / 2,
        ask: basePrice + spread / 2,
        last: basePrice,
    };
}

/** Generate a single random price movement */
function generatePriceMovement(symbol: string): number {
    const volatility = VOLATILITY[symbol] || 0.01;
    const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
    const trend = Math.random() > 0.5 ? 1 : -1; // Slight trend bias
    return randomFactor * volatility * (1 + trend * 0.1);
}

/**
 * Generate a mock tick for a symbol.
 * Simulates realistic price movement with spread.
 */
export function generateTick(symbol: string): Tick {
    // Initialize if needed
    if (!priceState[symbol]) {
        initializePriceState(symbol);
    }

    const instrument = getInstrumentBySymbol(symbol);
    const state = priceState[symbol];

    if (!state || !instrument) {
        // Fallback for unknown symbols
        return {
            symbol,
            bid: 100,
            ask: 100.01,
            spread: 0.01,
            last: 100,
            timestamp: Date.now(),
            direction: 'unchanged',
        };
    }

    // Generate price movement
    const movement = generatePriceMovement(symbol);
    const previousLast = state.last;

    // Calculate new prices
    const spreadAmount = instrument.typicalSpread * (instrument.category === 'fx' && instrument.decimals === 5 ? 0.0001 : instrument.category === 'fx' ? 0.01 : 1);

    state.last = state.last + movement;
    state.bid = state.last - spreadAmount / 2;
    state.ask = state.last + spreadAmount / 2;

    // Ensure prices don't go negative
    if (state.last <= 0) {
        state.last = Math.abs(movement);
        state.bid = state.last - spreadAmount / 2;
        state.ask = state.last + spreadAmount / 2;
    }

    // Determine direction
    let direction: 'up' | 'down' | 'unchanged' = 'unchanged';
    if (state.last > previousLast) direction = 'up';
    else if (state.last < previousLast) direction = 'down';

    return {
        symbol,
        bid: Number(state.bid.toFixed(instrument.decimals)),
        ask: Number(state.ask.toFixed(instrument.decimals)),
        spread: Number((state.ask - state.bid).toFixed(instrument.decimals)),
        last: Number(state.last.toFixed(instrument.decimals)),
        timestamp: Date.now(),
        volume: Math.floor(Math.random() * 1000) + 100,
        direction,
    };
}

/**
 * Generate multiple ticks for multiple symbols.
 */
export function generateTicks(symbols: string[]): Record<string, Tick> {
    const ticks: Record<string, Tick> = {};
    for (const symbol of symbols) {
        ticks[symbol] = generateTick(symbol);
    }
    return ticks;
}

/**
 * Create a tick stream that calls the callback at a specified interval.
 * Returns a cleanup function to stop the stream.
 */
export function createTickStream(
    symbols: string[],
    callback: (ticks: Record<string, Tick>) => void,
    intervalMs: number = 500
): () => void {
    // Generate initial ticks immediately
    callback(generateTicks(symbols));

    // Set up interval
    const intervalId = setInterval(() => {
        callback(generateTicks(symbols));
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
}

/**
 * Reset price state for a symbol (useful for testing).
 */
export function resetPriceState(symbol?: string): void {
    if (symbol) {
        delete priceState[symbol];
    } else {
        Object.keys(priceState).forEach(key => delete priceState[key]);
    }
}

/**
 * Get current price state (for debugging/testing).
 */
export function getCurrentPriceState(): Record<string, { bid: number; ask: number; last: number }> {
    return { ...priceState };
}
