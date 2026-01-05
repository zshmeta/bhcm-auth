/**
 * OrderBook Component (Premium)
 * 
 * Professional market depth display with real-time updates.
 * Features:
 * - Depth visualization with gradient bars
 * - Price flash animations on updates
 * - Hover highlighting with price tooltip
 * - Click-to-trade functionality
 * - Configurable precision and levels
 */

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { OrderBook as OrderBookType, OrderBookLevel } from '../../types';
import { formatPrice, formatVolume } from '../../utils';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS, SIZING, COMPONENT } from '../../theme';

// =============================================================================
// ANIMATIONS
// =============================================================================

const flashGreen = keyframes`
  0% { background-color: rgba(32, 178, 108, 0.35); }
  100% { background-color: transparent; }
`;

const flashRed = keyframes`
  0% { background-color: rgba(239, 68, 68, 0.35); }
  100% { background-color: transparent; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-2px); }
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
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  font-size: ${TYPOGRAPHY.fontSize.base};
  user-select: none;
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

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
`;

const TitleText = styled.span`
  font-family: ${TYPOGRAPHY.fontFamily.sans};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${COLORS.bg.primary};
  border-radius: ${EFFECTS.borderRadius.base};
  padding: 2px;
`;

const ViewButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
  border: none;
  border-radius: ${EFFECTS.borderRadius.sm};
  background: ${({ $active }) => $active ? COLORS.bg.elevated : 'transparent'};
  color: ${({ $active }) => $active ? COLORS.text.primary : COLORS.text.tertiary};
  cursor: pointer;
  transition: ${EFFECTS.transition.fast};
  
  &:hover {
    color: ${COLORS.text.primary};
    background: ${({ $active }) => $active ? COLORS.bg.elevated : COLORS.bg.hover};
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const SpreadBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[1]};
  padding: ${SPACING[1]} ${SPACING[2]};
  background: ${COLORS.bg.primary};
  border-radius: ${EFFECTS.borderRadius.base};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
`;

const SpreadValue = styled.span`
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const BookContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ColumnHeaders = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: ${SPACING[1]} ${SPACING[2]};
  background: ${COLORS.bg.secondary};
  border-bottom: 1px solid ${COLORS.border.subtle};
`;

const ColumnHeader = styled.span<{ $align?: 'left' | 'center' | 'right' }>`
  font-family: ${TYPOGRAPHY.fontFamily.sans};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wider};
  text-align: ${({ $align }) => $align || 'left'};
`;

const AsksContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.border.default};
    border-radius: 2px;
  }
`;

const BidsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.border.default};
    border-radius: 2px;
  }
`;

const SpreadRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${SPACING[3]};
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.bg.primary};
  border-top: 1px solid ${COLORS.border.subtle};
  border-bottom: 1px solid ${COLORS.border.subtle};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  min-height: 32px;
`;

const SpreadLabel = styled.span`
  color: ${COLORS.text.tertiary};
`;

const MidPrice = styled.span<{ $direction: 'up' | 'down' | 'unchanged' }>`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.md};
  color: ${({ $direction }) =>
    $direction === 'up' ? COLORS.semantic.positive.main :
      $direction === 'down' ? COLORS.semantic.negative.main :
        COLORS.text.primary
  };
  display: flex;
  align-items: center;
  gap: ${SPACING[1]};
`;

const DirectionIcon = styled.span<{ $direction: 'up' | 'down' }>`
  display: inline-flex;
  font-size: 10px;
  color: ${({ $direction }) =>
    $direction === 'up' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
`;

const LevelRow = styled.div<{
  $side: 'bid' | 'ask';
  $depth: number;
  $isHovered?: boolean;
  $flash?: 'up' | 'down' | null;
}>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 3px ${SPACING[2]};
  position: relative;
  cursor: pointer;
  min-height: 24px;
  align-items: center;
  transition: background-color 0.1s ease;
  
  /* Depth bar */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    ${({ $side }) => $side === 'bid' ? 'right: 0;' : 'left: 0;'}
    width: ${({ $depth }) => Math.min(Math.max($depth, 0), 100)}%;
    background: ${({ $side }) =>
    $side === 'bid'
      ? 'linear-gradient(to left, rgba(32, 178, 108, 0.15), rgba(32, 178, 108, 0.03))'
      : 'linear-gradient(to right, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.03))'
  };
    transition: width 0.2s ease;
    z-index: 0;
  }
  
  /* Hover state */
  ${({ $isHovered }) => $isHovered && css`
    background-color: ${COLORS.bg.hover};
  `}
  
  /* Flash animation */
  ${({ $flash }) => $flash === 'up' && css`
    animation: ${flashGreen} 0.4s ease-out;
  `}
  ${({ $flash }) => $flash === 'down' && css`
    animation: ${flashRed} 0.4s ease-out;
  `}
  
  &:hover {
    background-color: ${COLORS.bg.hover};
  }
`;

const Cell = styled.span<{
  $align?: 'left' | 'center' | 'right';
  $color?: string;
  $bold?: boolean;
}>`
  position: relative;
  z-index: 1;
  text-align: ${({ $align }) => $align || 'left'};
  color: ${({ $color }) => $color || COLORS.text.primary};
  font-weight: ${({ $bold }) => $bold ? TYPOGRAPHY.fontWeight.medium : TYPOGRAPHY.fontWeight.normal};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceCell = styled(Cell) <{ $side: 'bid' | 'ask' }>`
  color: ${({ $side }) =>
    $side === 'bid' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const Tooltip = styled.div<{ $visible: boolean; $x: number; $y: number }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.bg.elevated};
  border: 1px solid ${COLORS.border.strong};
  border-radius: ${EFFECTS.borderRadius.base};
  box-shadow: ${EFFECTS.shadow.lg};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  pointer-events: none;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transform: translateX(-50%);
  transition: opacity 0.15s ease;
  z-index: 1000;
  animation: ${fadeIn} 0.15s ease;
  white-space: nowrap;
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${SPACING[4]};
  
  &:not(:last-child) {
    margin-bottom: ${SPACING[1]};
  }
`;

const TooltipLabel = styled.span`
  color: ${COLORS.text.tertiary};
`;

const TooltipValue = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: ${SPACING[2]};
  color: ${COLORS.text.tertiary};
  font-size: ${TYPOGRAPHY.fontSize.md};
`;

const LoadingSpinner = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid ${COLORS.border.default};
  border-top-color: ${COLORS.semantic.info.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// =============================================================================
// ICONS
// =============================================================================

const BothSidesIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </svg>
);

const BidsOnlyIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="12" height="5" rx="1" fill={COLORS.semantic.positive.main} />
    <rect x="2" y="9" width="12" height="5" rx="1" opacity="0.3" />
  </svg>
);

const AsksOnlyIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="12" height="5" rx="1" fill={COLORS.semantic.negative.main} />
    <rect x="2" y="9" width="12" height="5" rx="1" opacity="0.3" />
  </svg>
);

// =============================================================================
// COMPONENT
// =============================================================================

type ViewMode = 'both' | 'bids' | 'asks';

interface OrderBookProps {
  /** Order book data */
  orderBook: OrderBookType | null;
  /** Number of levels to display */
  levels?: number;
  /** Decimal places for price */
  decimals?: number;
  /** Called when a price level is clicked */
  onPriceClick?: (price: number, side: 'bid' | 'ask') => void;
  /** Show cumulative volume */
  showCumulative?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Custom title */
  title?: string;
}

export function OrderBook({
  orderBook,
  levels = 12,
  decimals = 5,
  onPriceClick,
  showCumulative = false,
  isLoading = false,
  title = 'Order Book',
}: OrderBookProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [hoveredLevel, setHoveredLevel] = useState<{ price: number; side: 'bid' | 'ask' } | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; level: OrderBookLevel | null }>({
    visible: false, x: 0, y: 0, level: null
  });
  const [lastMidPrice, setLastMidPrice] = useState<number | null>(null);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'unchanged'>('unchanged');
  const prevOrderBookRef = useRef<OrderBookType | null>(null);

  // Track price direction
  useEffect(() => {
    if (orderBook && lastMidPrice !== null) {
      if (orderBook.midPrice > lastMidPrice) {
        setPriceDirection('up');
      } else if (orderBook.midPrice < lastMidPrice) {
        setPriceDirection('down');
      }
    }
    if (orderBook) {
      setLastMidPrice(orderBook.midPrice);
    }
  }, [orderBook?.midPrice]);

  // Calculate max cumulative for depth visualization
  const maxCumulative = useMemo(() => {
    if (!orderBook) return 1;
    const maxBid = orderBook.bids[Math.min(levels - 1, orderBook.bids.length - 1)]?.cumulative || 1;
    const maxAsk = orderBook.asks[Math.min(levels - 1, orderBook.asks.length - 1)]?.cumulative || 1;
    return Math.max(maxBid, maxAsk);
  }, [orderBook, levels]);

  // Get display levels
  const displayBids = useMemo(() =>
    orderBook?.bids.slice(0, levels) || [],
    [orderBook, levels]
  );

  const displayAsks = useMemo(() =>
    orderBook?.asks.slice(0, levels).reverse() || [],
    [orderBook, levels]
  );

  const handleMouseEnter = useCallback((e: React.MouseEvent, level: OrderBookLevel, side: 'bid' | 'ask') => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoveredLevel({ price: level.price, side });
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      level,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredLevel(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  const handleClick = useCallback((price: number, side: 'bid' | 'ask') => {
    onPriceClick?.(price, side);
  }, [onPriceClick]);

  const renderLevel = (level: OrderBookLevel, side: 'bid' | 'ask', index: number) => {
    const depth = maxCumulative > 0 ? (level.cumulative / maxCumulative) * 100 : 0;
    const volumeDisplay = showCumulative ? level.cumulative : level.quantity;
    const isHovered = hoveredLevel?.price === level.price && hoveredLevel?.side === side;

    return (
      <LevelRow
        key={`${side}-${level.price}-${index}`}
        $side={side}
        $depth={depth}
        $isHovered={isHovered}
        onMouseEnter={(e) => handleMouseEnter(e, level, side)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(level.price, side)}
      >
        <Cell $align="left" $color={COLORS.text.secondary}>
          {formatVolume(volumeDisplay)}
        </Cell>
        <PriceCell $align="center" $side={side} $bold>
          {formatPrice(level.price, decimals)}
        </PriceCell>
        <Cell $align="right" $color={COLORS.text.tertiary}>
          {formatVolume(level.total)}
        </Cell>
      </LevelRow>
    );
  };

  // Loading state
  if (isLoading || !orderBook) {
    return (
      <Container>
        <Header>
          <Title>
            <TitleText>{title}</TitleText>
          </Title>
        </Header>
        <EmptyState>
          <LoadingSpinner />
          <span>{isLoading ? 'Loading...' : 'No data'}</span>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <TitleText>{title}</TitleText>
        </Title>
        <ViewToggle>
          <ViewButton $active={viewMode === 'both'} onClick={() => setViewMode('both')} title="Show both">
            <BothSidesIcon />
          </ViewButton>
          <ViewButton $active={viewMode === 'bids'} onClick={() => setViewMode('bids')} title="Bids only">
            <BidsOnlyIcon />
          </ViewButton>
          <ViewButton $active={viewMode === 'asks'} onClick={() => setViewMode('asks')} title="Asks only">
            <AsksOnlyIcon />
          </ViewButton>
        </ViewToggle>
      </Header>

      <ColumnHeaders>
        <ColumnHeader $align="left">Size</ColumnHeader>
        <ColumnHeader $align="center">Price</ColumnHeader>
        <ColumnHeader $align="right">Total</ColumnHeader>
      </ColumnHeaders>

      <BookContainer>
        {viewMode !== 'bids' && (
          <AsksContainer>
            {displayAsks.map((level, i) => renderLevel(level, 'ask', i))}
          </AsksContainer>
        )}

        <SpreadRow>
          <MidPrice $direction={priceDirection}>
            {priceDirection !== 'unchanged' && (
              <DirectionIcon $direction={priceDirection}>
                {priceDirection === 'up' ? '▲' : '▼'}
              </DirectionIcon>
            )}
            {formatPrice(orderBook.midPrice, decimals)}
          </MidPrice>
          <SpreadBadge>
            <SpreadLabel>Spread:</SpreadLabel>
            <SpreadValue>{formatPrice(orderBook.spread, decimals)}</SpreadValue>
          </SpreadBadge>
        </SpreadRow>

        {viewMode !== 'asks' && (
          <BidsContainer>
            {displayBids.map((level, i) => renderLevel(level, 'bid', i))}
          </BidsContainer>
        )}
      </BookContainer>

      {tooltip.level && (
        <Tooltip $visible={tooltip.visible} $x={tooltip.x} $y={tooltip.y}>
          <TooltipRow>
            <TooltipLabel>Price:</TooltipLabel>
            <TooltipValue>{formatPrice(tooltip.level.price, decimals)}</TooltipValue>
          </TooltipRow>
          <TooltipRow>
            <TooltipLabel>Quantity:</TooltipLabel>
            <TooltipValue>{formatVolume(tooltip.level.quantity)}</TooltipValue>
          </TooltipRow>
          <TooltipRow>
            <TooltipLabel>Total:</TooltipLabel>
            <TooltipValue>${formatVolume(tooltip.level.total)}</TooltipValue>
          </TooltipRow>
        </Tooltip>
      )}
    </Container>
  );
}

export default OrderBook;
