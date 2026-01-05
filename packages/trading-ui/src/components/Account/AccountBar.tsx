/**
 * AccountBar Component (Premium)
 * 
 * Professional account summary header bar.
 * Features:
 * - Real-time equity updates with animations
 * - Margin level gauge indicator
 * - P&L with color-coded changes
 * - Expandable details
 */

import React, { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { Account } from '../../types';
import { formatCurrency, formatPercent, formatMarginLevel } from '../../utils';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme';

// =============================================================================
// ANIMATIONS
// =============================================================================

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: ${SPACING[2]} ${SPACING[4]};
  background: linear-gradient(180deg, ${COLORS.bg.secondary} 0%, ${COLORS.bg.tertiary} 100%);
  border-bottom: 1px solid ${COLORS.border.subtle};
  gap: ${SPACING[4]};
  overflow-x: auto;
  font-family: ${TYPOGRAPHY.fontFamily.sans};
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const AccountSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[3]};
`;

const AccountInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const AccountLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
`;

const AccountValue = styled.span<{ $color?: string; $large?: boolean }>`
  font-size: ${({ $large }) => $large ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $color }) => $color || COLORS.text.primary};
  font-variant-numeric: tabular-nums;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: ${COLORS.border.default};
`;

// Margin Gauge
const MarginGauge = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[1]};
  min-width: 100px;
`;

const GaugeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GaugeLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
`;

const GaugeValue = styled.span<{ $status: 'safe' | 'warning' | 'danger' }>`
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $status }) =>
        $status === 'safe' ? COLORS.semantic.positive.main :
            $status === 'warning' ? COLORS.semantic.warning.main :
                COLORS.semantic.negative.main
    };
`;

const GaugeTrack = styled.div`
  height: 4px;
  background: ${COLORS.bg.elevated};
  border-radius: 2px;
  overflow: hidden;
`;

const GaugeFill = styled.div<{ $percent: number; $status: 'safe' | 'warning' | 'danger' }>`
  height: 100%;
  width: ${({ $percent }) => Math.min($percent, 100)}%;
  border-radius: 2px;
  transition: all 0.3s ease;
  background: ${({ $status }) =>
        $status === 'safe' ? COLORS.semantic.positive.main :
            $status === 'warning' ? COLORS.semantic.warning.main :
                COLORS.semantic.negative.main
    };
  
  ${({ $status }) => $status === 'danger' && css`
    animation: ${pulse} 1s ease-in-out infinite;
  `}
`;

// Stats Row
const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[4]};
  margin-left: auto;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const StatLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
`;

const StatValue = styled.span<{ $color?: string }>`
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $color }) => $color || COLORS.text.primary};
`;

// Position Counter
const PositionCounter = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[3]};
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.bg.primary};
  border-radius: ${EFFECTS.borderRadius.md};
  border: 1px solid ${COLORS.border.subtle};
`;

const CounterItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[1]};
`;

const CounterIcon = styled.div<{ $type: 'positions' | 'orders' }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $type }) =>
        $type === 'positions' ? COLORS.semantic.info.main : COLORS.semantic.warning.main
    };
`;

const CounterLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
`;

const CounterValue = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  color: ${COLORS.text.primary};
`;

// Compact container
const CompactContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.bg.secondary};
  border-bottom: 1px solid ${COLORS.border.subtle};
  gap: ${SPACING[4]};
  font-family: ${TYPOGRAPHY.fontFamily.sans};
`;

// =============================================================================
// COMPONENT
// =============================================================================

interface AccountBarProps {
    account: Account;
    compact?: boolean;
    showPositionCount?: boolean;
}

export function AccountBar({
    account,
    compact = false,
    showPositionCount = true,
}: AccountBarProps) {
    const marginStatus = useMemo(() => {
        const level = account.marginLevel;
        if (level >= 200) return 'safe' as const;
        if (level >= 100) return 'warning' as const;
        return 'danger' as const;
    }, [account.marginLevel]);

    const equityChange = useMemo(() => {
        return account.equity - account.balance;
    }, [account.equity, account.balance]);

    if (compact) {
        return (
            <CompactContainer>
                <AccountInfo>
                    <AccountLabel>Equity</AccountLabel>
                    <AccountValue $large>{formatCurrency(account.equity, account.currency)}</AccountValue>
                </AccountInfo>

                <AccountInfo>
                    <AccountLabel>P&L</AccountLabel>
                    <AccountValue $color={equityChange >= 0 ? COLORS.semantic.positive.main : COLORS.semantic.negative.main}>
                        {formatCurrency(account.unrealizedPnl, account.currency, true)}
                    </AccountValue>
                </AccountInfo>

                <MarginGauge>
                    <GaugeHeader>
                        <GaugeLabel>Margin</GaugeLabel>
                        <GaugeValue $status={marginStatus}>{account.marginLevel.toFixed(0)}%</GaugeValue>
                    </GaugeHeader>
                    <GaugeTrack>
                        <GaugeFill $percent={Math.min(account.marginLevel / 3, 100)} $status={marginStatus} />
                    </GaugeTrack>
                </MarginGauge>
            </CompactContainer>
        );
    }

    return (
        <Container>
            {/* Balance & Equity */}
            <AccountSection>
                <AccountInfo>
                    <AccountLabel>Balance</AccountLabel>
                    <AccountValue $large>{formatCurrency(account.balance, account.currency)}</AccountValue>
                </AccountInfo>

                <Divider />

                <AccountInfo>
                    <AccountLabel>Equity</AccountLabel>
                    <AccountValue $large $color={equityChange >= 0 ? COLORS.semantic.positive.main : undefined}>
                        {formatCurrency(account.equity, account.currency)}
                    </AccountValue>
                </AccountInfo>

                <Divider />

                <AccountInfo>
                    <AccountLabel>Unrealized P&L</AccountLabel>
                    <AccountValue $color={account.unrealizedPnl >= 0 ? COLORS.semantic.positive.main : COLORS.semantic.negative.main}>
                        {formatCurrency(account.unrealizedPnl, account.currency, true)}
                    </AccountValue>
                </AccountInfo>
            </AccountSection>

            <Divider />

            {/* Margin Section */}
            <AccountSection>
                <AccountInfo>
                    <AccountLabel>Used Margin</AccountLabel>
                    <StatValue>{formatCurrency(account.usedMargin, account.currency)}</StatValue>
                </AccountInfo>

                <AccountInfo>
                    <AccountLabel>Free Margin</AccountLabel>
                    <StatValue $color={account.freeMargin < 0 ? COLORS.semantic.negative.main : undefined}>
                        {formatCurrency(account.freeMargin, account.currency)}
                    </StatValue>
                </AccountInfo>

                <MarginGauge>
                    <GaugeHeader>
                        <GaugeLabel>Margin Level</GaugeLabel>
                        <GaugeValue $status={marginStatus}>
                            {account.marginLevel > 0 ? `${account.marginLevel.toFixed(0)}%` : '∞'}
                        </GaugeValue>
                    </GaugeHeader>
                    <GaugeTrack>
                        <GaugeFill
                            $percent={Math.min(account.marginLevel / 3, 100)}
                            $status={marginStatus}
                        />
                    </GaugeTrack>
                </MarginGauge>
            </AccountSection>

            {/* Right Side Stats */}
            <StatsRow>
                {account.realizedPnlToday !== 0 && (
                    <StatItem>
                        <StatLabel>Today's P&L</StatLabel>
                        <StatValue $color={account.realizedPnlToday >= 0 ? COLORS.semantic.positive.main : COLORS.semantic.negative.main}>
                            {formatCurrency(account.realizedPnlToday, account.currency, true)}
                        </StatValue>
                    </StatItem>
                )}

                {showPositionCount && (
                    <PositionCounter>
                        <CounterItem>
                            <CounterIcon $type="positions" />
                            <CounterLabel>Positions</CounterLabel>
                            <CounterValue>{account.openPositions}</CounterValue>
                        </CounterItem>
                        <CounterItem>
                            <CounterIcon $type="orders" />
                            <CounterLabel>Orders</CounterLabel>
                            <CounterValue>{account.pendingOrders}</CounterValue>
                        </CounterItem>
                    </PositionCounter>
                )}
            </StatsRow>
        </Container>
    );
}

export default AccountBar;
