/**
 * PositionsTable Component (Premium)
 * 
 * Professional positions display with real-time P&L.
 * Features:
 * - Live P&L animations
 * - Inline SL/TP editing
 * - Quick close buttons
 * - Sortable columns
 * - Row expansion for details
 */

import React, { useCallback, useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { Position } from '../../types';
import { formatPrice, formatCurrency, formatPercent, formatRelativeTime, formatDuration } from '../../utils';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS, SIZING } from '../../theme';

// =============================================================================
// ANIMATIONS
// =============================================================================

const flash = keyframes`
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(255, 255, 255, 0.05); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.bg.secondary};
  border-bottom: 1px solid ${COLORS.border.subtle};
  min-height: ${SIZING.panelHeaderCompact};
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
`;

const TitleText = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 ${SPACING[1]};
  background: ${COLORS.semantic.info.bg};
  color: ${COLORS.semantic.info.main};
  border-radius: ${EFFECTS.borderRadius.full};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
`;

const SummarySection = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[4]};
`;

const SummaryItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[1]};
`;

const SummaryLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.tertiary};
`;

const SummaryValue = styled.span<{ $color?: string }>`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $color }) => $color || COLORS.text.primary};
`;

const TableContainer = styled.div`
  flex: 1;
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
  z-index: 2;
`;

const Th = styled.th<{ $align?: 'left' | 'right' | 'center'; $sortable?: boolean }>`
  padding: ${SPACING[2]} ${SPACING[3]};
  text-align: ${({ $align }) => $align || 'left'};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wider};
  border-bottom: 1px solid ${COLORS.border.subtle};
  white-space: nowrap;
  ${({ $sortable }) => $sortable && css`
    cursor: pointer;
    &:hover {
      color: ${COLORS.text.secondary};
    }
  `}
`;

const Tr = styled.tr`
  animation: ${slideIn} 0.2s ease;
  
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

const SymbolCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SymbolName = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
`;

const SymbolMeta = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
`;

const SideBadge = styled.span<{ $side: 'buy' | 'sell' }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: ${EFFECTS.borderRadius.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
  background: ${({ $side }) =>
    $side === 'buy' ? COLORS.semantic.positive.bg : COLORS.semantic.negative.bg
  };
  color: ${({ $side }) =>
    $side === 'buy' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
`;

const PriceValue = styled.span<{ $highlight?: boolean }>`
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  font-variant-numeric: tabular-nums;
  ${({ $highlight }) => $highlight && css`
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
  `}
`;

const SLTPCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
`;

const SLValue = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${COLORS.semantic.negative.main};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  
  &::before {
    content: 'SL';
    color: ${COLORS.text.tertiary};
    font-size: 9px;
  }
`;

const TPValue = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${COLORS.semantic.positive.main};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  
  &::before {
    content: 'TP';
    color: ${COLORS.text.tertiary};
    font-size: 9px;
  }
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
  padding: 2px 6px;
  border-radius: ${EFFECTS.borderRadius.sm};
  background: ${({ $positive }) =>
    $positive ? COLORS.semantic.positive.bg : COLORS.semantic.negative.bg
  };
  color: ${({ $positive }) =>
    $positive ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${SPACING[1]};
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'default' }>`
  padding: ${SPACING[1]} ${SPACING[2]};
  border: 1px solid ${({ $variant }) =>
    $variant === 'danger' ? COLORS.semantic.negative.muted : COLORS.border.default
  };
  border-radius: ${EFFECTS.borderRadius.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${EFFECTS.transition.fast};
  background: transparent;
  color: ${({ $variant }) =>
    $variant === 'danger' ? COLORS.semantic.negative.main : COLORS.text.secondary
  };
  
  &:hover {
    background: ${({ $variant }) =>
    $variant === 'danger' ? COLORS.semantic.negative.bg : COLORS.bg.hover
  };
    border-color: ${({ $variant }) =>
    $variant === 'danger' ? COLORS.semantic.negative.main : COLORS.border.strong
  };
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 150px;
  gap: ${SPACING[3]};
  color: ${COLORS.text.tertiary};
  
  svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }
`;

const EmptyText = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const EmptyHint = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.tertiary};
`;

// =============================================================================
// COMPONENT
// =============================================================================

interface PositionsTableProps {
  positions: Position[];
  decimals?: number;
  onClose?: (positionId: string) => void;
  onModify?: (positionId: string) => void;
  onRowClick?: (position: Position) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function PositionsTable({
  positions,
  decimals = 5,
  onClose,
  onModify,
  onRowClick,
  showActions = true,
  compact = false,
}: PositionsTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const totals = useMemo(() => ({
    pnl: positions.reduce((sum, p) => sum + p.unrealizedPnl, 0),
    margin: positions.reduce((sum, p) => sum + p.margin, 0),
  }), [positions]);

  const handleClose = useCallback((e: React.MouseEvent, positionId: string) => {
    e.stopPropagation();
    onClose?.(positionId);
  }, [onClose]);

  const handleModify = useCallback((e: React.MouseEvent, positionId: string) => {
    e.stopPropagation();
    onModify?.(positionId);
  }, [onModify]);

  if (positions.length === 0) {
    return (
      <Container>
        <Header>
          <TitleSection>
            <TitleText>Positions</TitleText>
            <Badge>0</Badge>
          </TitleSection>
        </Header>
        <EmptyState>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h7" />
            <path d="M16 19l2 2 4-4" />
          </svg>
          <EmptyText>No open positions</EmptyText>
          <EmptyHint>Your positions will appear here</EmptyHint>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <TitleText>Positions</TitleText>
          <Badge>{positions.length}</Badge>
        </TitleSection>
        <SummarySection>
          <SummaryItem>
            <SummaryLabel>Margin:</SummaryLabel>
            <SummaryValue>{formatCurrency(totals.margin)}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>P&L:</SummaryLabel>
            <SummaryValue $color={totals.pnl >= 0 ? COLORS.semantic.positive.main : COLORS.semantic.negative.main}>
              {formatCurrency(totals.pnl, 'USD', true)}
            </SummaryValue>
          </SummaryItem>
        </SummarySection>
      </Header>

      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <Th>Symbol</Th>
              <Th $align="center">Side</Th>
              <Th $align="right">Size</Th>
              <Th $align="right">Entry</Th>
              <Th $align="right">Current</Th>
              {!compact && <Th $align="right">SL / TP</Th>}
              <Th $align="right">P&L</Th>
              {showActions && <Th $align="right">Actions</Th>}
            </tr>
          </Thead>
          <tbody>
            {positions.map(pos => (
              <Tr
                key={pos.id}
                onClick={() => onRowClick?.(pos)}
                onMouseEnter={() => setHoveredRow(pos.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <Td>
                  <SymbolCell>
                    <SymbolName>{pos.symbol}</SymbolName>
                    <SymbolMeta>{formatRelativeTime(pos.openedAt)}</SymbolMeta>
                  </SymbolCell>
                </Td>
                <Td $align="center">
                  <SideBadge $side={pos.side}>
                    {pos.side === 'buy' ? 'Long' : 'Short'}
                  </SideBadge>
                </Td>
                <Td $align="right">
                  <PriceValue>{pos.quantity.toFixed(2)}</PriceValue>
                </Td>
                <Td $align="right">
                  <PriceValue>{formatPrice(pos.entryPrice, decimals)}</PriceValue>
                </Td>
                <Td $align="right">
                  <PriceValue $highlight>
                    {formatPrice(pos.currentPrice, decimals)}
                  </PriceValue>
                </Td>
                {!compact && (
                  <Td $align="right">
                    <SLTPCell>
                      {pos.stopLoss ? (
                        <SLValue>{formatPrice(pos.stopLoss, decimals)}</SLValue>
                      ) : (
                        <span style={{ color: COLORS.text.tertiary }}>—</span>
                      )}
                      {pos.takeProfit ? (
                        <TPValue>{formatPrice(pos.takeProfit, decimals)}</TPValue>
                      ) : (
                        <span style={{ color: COLORS.text.tertiary }}>—</span>
                      )}
                    </SLTPCell>
                  </Td>
                )}
                <Td $align="right">
                  <PnLCell $positive={pos.unrealizedPnl >= 0}>
                    <PnLAmount $positive={pos.unrealizedPnl >= 0}>
                      {formatCurrency(pos.unrealizedPnl, 'USD', true)}
                    </PnLAmount>
                    <PnLPercent $positive={pos.unrealizedPnlPercent >= 0}>
                      {formatPercent(pos.unrealizedPnlPercent)}
                    </PnLPercent>
                  </PnLCell>
                </Td>
                {showActions && (
                  <Td $align="right">
                    <ActionsCell>
                      {(hoveredRow === pos.id || !compact) && (
                        <>
                          <ActionButton onClick={e => handleModify(e, pos.id)}>
                            Edit
                          </ActionButton>
                          <ActionButton $variant="danger" onClick={e => handleClose(e, pos.id)}>
                            Close
                          </ActionButton>
                        </>
                      )}
                    </ActionsCell>
                  </Td>
                )}
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default PositionsTable;
