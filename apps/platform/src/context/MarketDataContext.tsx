import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:8081';

export interface MarketData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    [key: string]: any;
}

interface MarketDataContextType {
    latestData: Record<string, MarketData>;
    subscribe: (symbol: string) => void;
    unsubscribe: (symbol: string) => void;
    isConnected: boolean;
}

const MarketDataContext = createContext<MarketDataContextType | undefined>(undefined);

export const MarketDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [latestData, setLatestData] = useState<Record<string, MarketData>>({});
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const subCounts = useRef<Record<string, number>>({});

    useEffect(() => {
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('WS Connected');
            setIsConnected(true);
            // Resubscribe on reconnect
            Object.keys(subCounts.current).forEach(sym => {
                if (subCounts.current[sym] > 0) socket.emit('subscribe', sym);
            });
        });

        socket.on('disconnect', () => {
            console.log('WS Disconnected');
            setIsConnected(false);
        });

        socket.on('price_update', (data: MarketData) => {
            setLatestData(prev => ({ ...prev, [data.symbol]: data }));
        });

        socket.on('market_snapshot', (snapshot: any) => {
            // Check if snapshot is flat or categorized
            // Assuming categorized based on previous viewer analysis
            const flat: Record<string, MarketData> = {};
            if (snapshot && typeof snapshot === 'object') {
                Object.values(snapshot).forEach((category: any) => {
                    if (typeof category === 'object') {
                        Object.values(category).forEach((item: any) => {
                            if (item && item.symbol) flat[item.symbol] = item;
                        });
                    }
                });
            }
            setLatestData(prev => ({ ...prev, ...flat }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const subscribe = (symbol: string) => {
        if (!subCounts.current[symbol]) subCounts.current[symbol] = 0;
        subCounts.current[symbol]++;
        if (subCounts.current[symbol] === 1 && socketRef.current?.connected) {
            socketRef.current?.emit('subscribe', symbol);
        }
    };

    const unsubscribe = (symbol: string) => {
        if (!subCounts.current[symbol]) return;
        subCounts.current[symbol]--;
        if (subCounts.current[symbol] <= 0) {
            subCounts.current[symbol] = 0;
            if (socketRef.current?.connected) {
                socketRef.current?.emit('unsubscribe', symbol);
            }
        }
    };

    return (
        <MarketDataContext.Provider value={{ latestData, subscribe, unsubscribe, isConnected }}>
            {children}
        </MarketDataContext.Provider>
    );
};

export const useMarketDataContext = () => {
    const context = useContext(MarketDataContext);
    if (!context) throw new Error("useMarketDataContext must be used within MarketDataProvider");
    return context;
};
