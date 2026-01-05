/**
 * useChartData Hook
 * 
 * Provides OHLC candlestick data for charts.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { OHLC, Timeframe } from '../types';
import { generateOHLCData, createChartDataStream } from '../mocks';

interface UseChartDataOptions {
    /** Initial timeframe */
    initialTimeframe?: Timeframe;
    /** Number of candles to generate */
    candleCount?: number;
    /** Whether to stream live updates */
    liveUpdates?: boolean;
    /** Update interval in milliseconds */
    updateInterval?: number;
}

interface UseChartDataReturn {
    /** OHLC data */
    data: OHLC[];
    /** Current timeframe */
    timeframe: Timeframe;
    /** Whether live updates are running */
    isLive: boolean;
    /** Change timeframe */
    setTimeframe: (tf: Timeframe) => void;
    /** Start live updates */
    startLive: () => void;
    /** Stop live updates */
    stopLive: () => void;
    /** Refresh data */
    refresh: () => void;
    /** Loading state */
    isLoading: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

/**
 * Hook for chart OHLC data.
 * 
 * @param symbol - Symbol to get data for
 * @param options - Configuration options
 * @returns Chart data and controls
 * 
 * @example
 * ```tsx
 * const { data, timeframe, setTimeframe } = useChartData('EURUSD');
 * ```
 */
export function useChartData(
    symbol: string,
    options: UseChartDataOptions = {}
): UseChartDataReturn {
    const {
        initialTimeframe = '1h',
        candleCount = 200,
        liveUpdates = true,
        updateInterval = 1000,
    } = options;

    const [data, setData] = useState<OHLC[]>([]);
    const [timeframe, setTimeframeState] = useState<Timeframe>(initialTimeframe);
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const cleanupRef = useRef<(() => void) | null>(null);

    // Load initial data
    const loadData = useCallback(() => {
        setIsLoading(true);
        const newData = generateOHLCData(symbol, timeframe, candleCount);
        setData(newData);
        setIsLoading(false);
        return newData;
    }, [symbol, timeframe, candleCount]);

    // Start live updates
    const startLive = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        const currentData = data.length > 0 ? data : loadData();

        cleanupRef.current = createChartDataStream(
            symbol,
            timeframe,
            currentData,
            (newData) => setData(newData),
            updateInterval
        );
        setIsLive(true);
    }, [symbol, timeframe, data, loadData, updateInterval]);

    // Stop live updates
    const stopLive = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        setIsLive(false);
    }, []);

    // Change timeframe
    const setTimeframe = useCallback((tf: Timeframe) => {
        setTimeframeState(tf);
    }, []);

    // Refresh data
    const refresh = useCallback(() => {
        const wasLive = isLive;
        if (wasLive) stopLive();
        loadData();
        if (wasLive && liveUpdates) startLive();
    }, [isLive, stopLive, loadData, liveUpdates, startLive]);

    // Load data on mount and when symbol/timeframe changes
    useEffect(() => {
        loadData();
    }, [symbol, timeframe]);

    // Start live updates if enabled
    useEffect(() => {
        if (liveUpdates && data.length > 0) {
            startLive();
        }

        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, [symbol, timeframe, liveUpdates]);

    return {
        data,
        timeframe,
        isLive,
        setTimeframe,
        startLive,
        stopLive,
        refresh,
        isLoading,
    };
}

// Export available timeframes
export { TIMEFRAMES };
