/**
 * TerminalPanel Component (Premium)
 * 
 * Professional tabbed panel for positions, orders, and history.
 * Features:
 * - Animated tab indicator
 * - Badge counts with pulse animation
 * - Sortable tables
 * - Responsive design
 */

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { Position, Order, TradeHistory } from '../../types';
import { PositionsTable } from '../Positions';
import { formatPrice, formatCurrency, formatPercent, formatRelativeTime } from '../../utils';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS, SIZING } from '../../theme';

// =============================================================================
// ANIMATIONS
// =============================================================================

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${COLORS.bg.tertiary};
  border-radius: ${EFFECTS.borderRadius.md};
  overflow: hidden;
  font-family: ${TYPOGRAPHY.fontFamily.sans};
`;

const TabsHeader = styled.div`
  display: flex;
  align-items: center;
  background: ${COLORS.bg.secondary};
  border-bottom: 1px solid ${COLORS.border.subtle};
  position: relative;
`;

const TabList = styled.div`
  display: flex;
  position: relative;
`;

const TabIndicator = styled.div<{ $left: number; $width: number }>`
  position: absolute;
  bottom: 0;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  height: 2px;
  background: ${COLORS.semantic.info.main};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Tab = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
  padding: ${SPACING[3]} ${SPACING[4]};
  border: none;
  background: transparent;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${EFFECTS.transition.base};
  color: ${({ $active }) => $active ? COLORS.text.primary : COLORS.text.tertiary};
  white-space: nowrap;
  
  &:hover {
    color: ${COLORS.text.primary};
    background: ${COLORS.bg.hover};
  }
`;

const TabBadge = styled.span<{ $active?: boolean; $hasItems?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 ${SPACING[1]};
  border-radius: ${EFFECTS.borderRadius.full};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  background: ${({ $active }) => $active ? COLORS.semantic.info.main : COLORS.bg.elevated};
  color: ${({ $active }) => $active ? '#fff' : COLORS.text.tertiary};
  transition: ${EFFECTS.transition.base};
  
  ${({ $hasItems, $active }) => $hasItems && !$active && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
  animation: ${slideIn} 0.2s ease;
`;

const TableWrapper = styled.div`
  height: 100%;
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.border.default};
    border-radius: 3px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const Thead = styled.thead`
  position: sticky;
  top: 0;
  background: ${COLORS.bg.secondary};
  z-index: 1;
`;

const Th = styled.th<{ $align?: 'left' | 'right' | 'center' }>`
  padding: ${SPACING[2]} ${SPACING[3]};
  text-align: ${({ $align }) => $align || 'left'};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wider};
  border-bottom: 1px solid ${COLORS.border.subtle};
  white-space: nowrap;
`;

const Tr = styled.tr`
  &:hover {
    background: ${COLORS.bg.hover};
  }
  
  &:not(:last-child) td {
    border-bottom: 1px solid ${COLORS.border.subtle};
  }
`;

const Td = styled.td<{ $align?: 'left' | 'right' | 'center' }>`
  padding: ${SPACING[2]} ${SPACING[3]};
  text-align: ${({ $align }) => $align || 'left'};
  color: ${COLORS.text.primary};
  white-space: nowrap;
  vertical-align: middle;
`;

const SymbolText = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const SideBadge = styled.span<{ $side: 'buy' | 'sell' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: ${EFFECTS.borderRadius.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  background: ${({ $side }) =>
        $side === 'buy' ? COLORS.semantic.positive.bg : COLORS.semantic.negative.bg
    };
  color: ${({ $side }) =>
        $side === 'buy' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
    };
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: ${EFFECTS.borderRadius.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  text-transform: uppercase;
  background: ${({ $status }) => {
        switch ($status) {
            case 'open': return COLORS.semantic.info.bg;
            case 'filled': return COLORS.semantic.positive.bg;
            case 'cancelled': return COLORS.semantic.negative.bg;
            default: return COLORS.bg.elevated;
        }
    }};
  color: ${({ $status }) => {
        switch ($status) {
            case 'open': return COLORS.semantic.info.main;
            case 'filled': return COLORS.semantic.positive.main;
            case 'cancelled': return COLORS.semantic.negative.main;
            default: return COLORS.text.secondary;
        }
    }};
`;

const PnLCell = styled.div<{ $positive: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const PnLAmount = styled.span<{ $positive: boolean }>`
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $positive }) =>
        $positive ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
    };
`;

const PnLPercent = styled.span<{ $positive: boolean }>`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $positive }) =>
        $positive ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
    };
  opacity: 0.8;
`;

const ReasonBadge = styled.span<{ $reason: string }>`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  padding: 2px 6px;
  border-radius: ${EFFECTS.borderRadius.sm};
  text-transform: capitalize;
  background: ${({ $reason }) => {
        switch ($reason) {
            case 'take_profit': return COLORS.semantic.positive.bg;
            case 'stop_loss': return COLORS.semantic.negative.bg;
            default: return COLORS.bg.elevated;
        }
    }};
  color: ${({ $reason }) => {
        switch ($reason) {
            case 'take_profit': return COLORS.semantic.positive.main;
            case 'stop_loss': return COLORS.semantic.negative.main;
            default: return COLORS.text.secondary;
        }
    }};
`;

const ActionButton = styled.button`
  padding: ${SPACING[1]} ${SPACING[2]};
  border: 1px solid ${COLORS.semantic.negative.muted};
  border-radius: ${EFFECTS.borderRadius.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${EFFECTS.transition.fast};
  background: transparent;
  color: ${COLORS.semantic.negative.main};
  
  &:hover {
    background: ${COLORS.semantic.negative.bg};
    border-color: ${COLORS.semantic.negative.main};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100px;
  gap: ${SPACING[2]};
  color: ${COLORS.text.tertiary};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

// =============================================================================
// COMPONENT
// =============================================================================

type TabId = 'positions' | 'orders' | 'history';

interface TerminalPanelProps {
    positions: Position[];
    orders: Order[];
    history?: TradeHistory[];
    onClosePosition?: (positionId: string) => void;
    onModifyPosition?: (positionId: string) => void;
    onCancelOrder?: (orderId: string) => void;
    defaultTab?: TabId;
}

export function TerminalPanel({
    positions,
    orders,
    history = [],
    onClosePosition,
    onModifyPosition,
    onCancelOrder,
    defaultTab = 'positions',
}: TerminalPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [tabRefs] = useState<Record<TabId, React.RefObject<HTMLButtonElement>>>({
        positions: React.createRef(),
        orders: React.createRef(),
        history: React.createRef(),
    });

    const openOrders = useMemo(() =>
        orders.filter(o => o.status === 'open'),
        [orders]
    );

    // Calculate tab indicator position
    const indicatorStyle = useMemo(() => {
        const ref = tabRefs[activeTab];
        if (ref?.current) {
            return {
                left: ref.current.offsetLeft,
                width: ref.current.offsetWidth,
            };
        }
        return { left: 0, width: 80 };
    }, [activeTab, tabRefs]);

    return (
        <Container>
            <TabsHeader>
                <TabList>
                    <Tab
                        ref={tabRefs.positions}
                        $active={activeTab === 'positions'}
                        onClick={() => setActiveTab('positions')}
                    >
                        Positions
                        <TabBadge $active={activeTab === 'positions'} $hasItems={positions.length > 0}>
                            {positions.length}
                        </TabBadge>
                    </Tab>
                    <Tab
                        ref={tabRefs.orders}
                        $active={activeTab === 'orders'}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders
                        <TabBadge $active={activeTab === 'orders'} $hasItems={openOrders.length > 0}>
                            {openOrders.length}
                        </TabBadge>
                    </Tab>
                    <Tab
                        ref={tabRefs.history}
                        $active={activeTab === 'history'}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </Tab>
                    <TabIndicator $left={indicatorStyle.left} $width={indicatorStyle.width} />
                </TabList>
            </TabsHeader>

            <Content key={activeTab}>
                {activeTab === 'positions' && (
                    <PositionsTable
                        positions={positions}
                        onClose={onClosePosition}
                        onModify={onModifyPosition}
                        compact
                    />
                )}

                {activeTab === 'orders' && (
                    openOrders.length === 0 ? (
                        <EmptyState>No pending orders</EmptyState>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <Thead>
                                    <tr>
                                        <Th>Symbol</Th>
                                        <Th $align="center">Side</Th>
                                        <Th $align="center">Type</Th>
                                        <Th $align="right">Qty</Th>
                                        <Th $align="right">Price</Th>
                                        <Th $align="center">Status</Th>
                                        <Th $align="right">Created</Th>
                                        <Th $align="right">Actions</Th>
                                    </tr>
                                </Thead>
                                <tbody>
                                    {openOrders.map(order => (
                                        <Tr key={order.id}>
                                            <Td><SymbolText>{order.symbol}</SymbolText></Td>
                                            <Td $align="center">
                                                <SideBadge $side={order.side}>{order.side}</SideBadge>
                                            </Td>
                                            <Td $align="center" style={{ textTransform: 'capitalize' }}>
                                                {order.type.replace('_', ' ')}
                                            </Td>
                                            <Td $align="right" style={{ fontFamily: TYPOGRAPHY.fontFamily.mono }}>
                                                {order.quantity.toFixed(2)}
                                            </Td>
                                            <Td $align="right" style={{ fontFamily: TYPOGRAPHY.fontFamily.mono }}>
                                                {order.limitPrice ? formatPrice(order.limitPrice, 5) : '—'}
                                            </Td>
                                            <Td $align="center">
                                                <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                                            </Td>
                                            <Td $align="right" style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                                                {formatRelativeTime(order.createdAt)}
                                            </Td>
                                            <Td $align="right">
                                                <ActionButton onClick={() => onCancelOrder?.(order.id)}>
                                                    Cancel
                                                </ActionButton>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    )
                )}

                {activeTab === 'history' && (
                    history.length === 0 ? (
                        <EmptyState>No trade history</EmptyState>
                    ) : (
                        <TableWrapper>
                            <Table>
                                <Thead>
                                    <tr>
                                        <Th>Symbol</Th>
                                        <Th $align="center">Side</Th>
                                        <Th $align="right">Qty</Th>
                                        <Th $align="right">Entry</Th>
                                        <Th $align="right">Exit</Th>
                                        <Th $align="right">P&L</Th>
                                        <Th $align="center">Reason</Th>
                                        <Th $align="right">Closed</Th>
                                    </tr>
                                </Thead>
                                <tbody>
                                    {history.map(trade => (
                                        <Tr key={trade.id}>
                                            <Td><SymbolText>{trade.symbol}</SymbolText></Td>
                                            <Td $align="center">
                                                <SideBadge $side={trade.side}>
                                                    {trade.side === 'buy' ? 'Long' : 'Short'}
                                                </SideBadge>
                                            </Td>
                                            <Td $align="right" style={{ fontFamily: TYPOGRAPHY.fontFamily.mono }}>
                                                {trade.quantity.toFixed(2)}
                                            </Td>
                                            <Td $align="right" style={{ fontFamily: TYPOGRAPHY.fontFamily.mono }}>
                                                {formatPrice(trade.entryPrice, 5)}
                                            </Td>
                                            <Td $align="right" style={{ fontFamily: TYPOGRAPHY.fontFamily.mono }}>
                                                {formatPrice(trade.exitPrice, 5)}
                                            </Td>
                                            <Td $align="right">
                                                <PnLCell $positive={trade.pnl >= 0}>
                                                    <PnLAmount $positive={trade.pnl >= 0}>
                                                        {formatCurrency(trade.pnl, 'USD', true)}
                                                    </PnLAmount>
                                                    <PnLPercent $positive={trade.pnlPercent >= 0}>
                                                        {formatPercent(trade.pnlPercent)}
                                                    </PnLPercent>
                                                </PnLCell>
                                            </Td>
                                            <Td $align="center">
                                                <ReasonBadge $reason={trade.closeReason}>
                                                    {trade.closeReason.replace('_', ' ')}
                                                </ReasonBadge>
                                            </Td>
                                            <Td $align="right" style={{ fontSize: TYPOGRAPHY.fontSize.xs }}>
                                                {formatRelativeTime(trade.closedAt)}
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </Table>
                        </TableWrapper>
                    )
                )}
            </Content>
        </Container>
    );
}

export default TerminalPanel;
