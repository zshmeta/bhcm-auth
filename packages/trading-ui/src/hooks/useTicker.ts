/**
 * useTicker Hook
 * 
 * Provides real-time price ticker data for symbols.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Tick } from '../types';
import { createTickStream, generateTicks } from '../mocks';

interface UseTickerOptions {
    /** Update interval in milliseconds */
    intervalMs?: number;
    /** Whether to start the stream immediately */
    autoStart?: boolean;
}

interface UseTickerReturn {
    /** Current tick data by symbol */
    ticks: Record<string, Tick>;
    /** Whether the ticker is running */
    isRunning: boolean;
    /** Start the ticker stream */
    start: () => void;
    /** Stop the ticker stream */
    stop: () => void;
    /** Get tick for a specific symbol */
    getTick: (symbol: string) => Tick | undefined;
}

/**
 * Hook for real-time price ticker data.
 * 
 * @param symbols - Array of symbol strings to track
 * @param options - Configuration options
 * @returns Ticker data and controls
 * 
 * @example
 * ```tsx
 * const { ticks, isRunning } = useTicker(['EURUSD', 'BTCUSD']);
 * const eurTick = ticks['EURUSD'];
 * ```
 */
export function useTicker(
    symbols: string[],
    options: UseTickerOptions = {}
): UseTickerReturn {
    const { intervalMs = 500, autoStart = true } = options;

    const [ticks, setTicks] = useState<Record<string, Tick>>(() =>
        generateTicks(symbols)
    );
    const [isRunning, setIsRunning] = useState(false);

    const cleanupRef = useRef<(() => void) | null>(null);
    const symbolsRef = useRef(symbols);

    // Update symbols ref when they change
    useEffect(() => {
        symbolsRef.current = symbols;
    }, [symbols]);

    const start = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        cleanupRef.current = createTickStream(
            symbolsRef.current,
            (newTicks) => setTicks(newTicks),
            intervalMs
        );
        setIsRunning(true);
    }, [intervalMs]);

    const stop = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setIsRunning(false);
    }, []);

    const getTick = useCallback((symbol: string): Tick | undefined => {
        return ticks[symbol];
    }, [ticks]);

    // Auto-start on mount if enabled
    useEffect(() => {
        if (autoStart) {
            start();
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [autoStart, start]);

    // Restart when symbols change
    useEffect(() => {
        if (isRunning) {
            start();
        }
    }, [symbols.join(','), isRunning, start]);

    return {
        ticks,
        isRunning,
        start,
        stop,
        getTick,
    };
}
