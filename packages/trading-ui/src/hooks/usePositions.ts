/**
 * usePositions Hook
 * 
 * Manages position and order state.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Position, Order, Account, TradeHistory } from '../types';
import {
    generateMockPositions,
    generateMockOrders,
    generateMockAccount,
    generateMockTradeHistory
} from '../mocks';
import { calculateEquity, calculateTotalMargin, calculateUnrealizedPnl } from '../utils';

interface UsePositionsOptions {
    /** Initial positions count */
    initialPositions?: number;
    /** Initial orders count */
    initialOrders?: number;
    /** Whether to auto-update P&L */
    autoUpdatePnl?: boolean;
    /** P&L update interval */
    pnlUpdateInterval?: number;
}

interface UsePositionsReturn {
    /** Open positions */
    positions: Position[];
    /** Pending orders */
    orders: Order[];
    /** Account summary */
    account: Account;
    /** Trade history */
    history: TradeHistory[];
    /** Close a position */
    closePosition: (positionId: string) => void;
    /** Modify a position (SL/TP) */
    modifyPosition: (positionId: string, updates: Partial<Position>) => void;
    /** Cancel an order */
    cancelOrder: (orderId: string) => void;
    /** Refresh all data */
    refresh: () => void;
    /** Total unrealized P&L */
    totalUnrealizedPnl: number;
    /** Total margin used */
    totalMargin: number;
}

/**
 * Hook for managing positions and orders.
 * 
 * @param options - Configuration options
 * @returns Position/order data and actions
 * 
 * @example
 * ```tsx
 * const { positions, orders, account, closePosition } = usePositions();
 * ```
 */
export function usePositions(
    options: UsePositionsOptions = {}
): UsePositionsReturn {
    const {
        initialPositions = 3,
        initialOrders = 2,
        autoUpdatePnl = true,
        pnlUpdateInterval = 1000,
    } = options;

    const [positions, setPositions] = useState<Position[]>(() =>
        generateMockPositions(initialPositions)
    );
    const [orders, setOrders] = useState<Order[]>(() =>
        generateMockOrders(initialOrders)
    );
    const [account, setAccount] = useState<Account>(() =>
        generateMockAccount()
    );
    const [history, setHistory] = useState<TradeHistory[]>(() =>
        generateMockTradeHistory(10)
    );

    // Calculate totals
    const totalUnrealizedPnl = useMemo(() =>
        positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0),
        [positions]
    );

    const totalMargin = useMemo(() =>
        calculateTotalMargin(positions),
        [positions]
    );

    // Auto-update P&L to simulate real-time
    useEffect(() => {
        if (!autoUpdatePnl) return;

        const intervalId = setInterval(() => {
            setPositions(prevPositions =>
                prevPositions.map(pos => {
                    // Simulate price movement
                    const priceChange = (Math.random() - 0.5) * pos.currentPrice * 0.001;
                    const newPrice = pos.currentPrice + priceChange;
                    const newPnl = calculateUnrealizedPnl(
                        pos.side,
                        pos.entryPrice,
                        newPrice,
                        pos.quantity
                    );
                    const newPnlPercent = (newPnl / (pos.entryPrice * pos.quantity)) * 100;

                    return {
                        ...pos,
                        currentPrice: Number(newPrice.toFixed(5)),
                        unrealizedPnl: Number(newPnl.toFixed(2)),
                        unrealizedPnlPercent: Number(newPnlPercent.toFixed(2)),
                    };
                })
            );

            // Update account equity
            setAccount(prev => ({
                ...prev,
                unrealizedPnl: positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0),
                equity: prev.balance + positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0),
                lastUpdate: new Date().toISOString(),
            }));
        }, pnlUpdateInterval);

        return () => clearInterval(intervalId);
    }, [autoUpdatePnl, pnlUpdateInterval, positions]);

    const closePosition = useCallback((positionId: string) => {
        setPositions(prev => {
            const position = prev.find(p => p.id === positionId);
            if (position) {
                // Add to history
                const trade: TradeHistory = {
                    id: `TRD-${Date.now()}`,
                    positionId: position.id,
                    symbol: position.symbol,
                    side: position.side,
                    quantity: position.quantity,
                    entryPrice: position.entryPrice,
                    exitPrice: position.currentPrice,
                    pnl: position.unrealizedPnl,
                    pnlPercent: position.unrealizedPnlPercent,
                    openedAt: position.openedAt,
                    closedAt: new Date().toISOString(),
                    duration: Math.floor((Date.now() - new Date(position.openedAt).getTime()) / 1000),
                    closeReason: 'manual',
                };
                setHistory(prevHistory => [trade, ...prevHistory]);

                // Update account
                setAccount(prevAccount => ({
                    ...prevAccount,
                    balance: prevAccount.balance + position.unrealizedPnl,
                    realizedPnlToday: prevAccount.realizedPnlToday + position.unrealizedPnl,
                    openPositions: prevAccount.openPositions - 1,
                }));
            }
            return prev.filter(p => p.id !== positionId);
        });
    }, []);

    const modifyPosition = useCallback((positionId: string, updates: Partial<Position>) => {
        setPositions(prev =>
            prev.map(pos =>
                pos.id === positionId
                    ? { ...pos, ...updates }
                    : pos
            )
        );
    }, []);

    const cancelOrder = useCallback((orderId: string) => {
        setOrders(prev => {
            const order = prev.find(o => o.id === orderId);
            if (order) {
                setAccount(prevAccount => ({
                    ...prevAccount,
                    pendingOrders: prevAccount.pendingOrders - 1,
                }));
            }
            return prev.filter(o => o.id !== orderId);
        });
    }, []);

    const refresh = useCallback(() => {
        setPositions(generateMockPositions(initialPositions));
        setOrders(generateMockOrders(initialOrders));
        setAccount(generateMockAccount());
        setHistory(generateMockTradeHistory(10));
    }, [initialPositions, initialOrders]);

    return {
        positions,
        orders,
        account,
        history,
        closePosition,
        modifyPosition,
        cancelOrder,
        refresh,
        totalUnrealizedPnl,
        totalMargin,
    };
}
