import { useEffect } from "react";
import { useMarketDataContext, type MarketData } from "../context/MarketDataContext";

export type { MarketData };

export const useMarketData = (symbols: string[]) => {
    const { subscribe, unsubscribe, latestData } = useMarketDataContext();

    useEffect(() => {
        symbols.forEach(s => subscribe(s));
        return () => {
            symbols.forEach(s => unsubscribe(s));
        };
    }, [symbols, subscribe, unsubscribe]);

    // Filter latestData to only return requested symbols
    const result: Record<string, MarketData> = {};
    symbols.forEach(s => {
        if (latestData[s]) result[s] = latestData[s];
    });

    return result;
};
