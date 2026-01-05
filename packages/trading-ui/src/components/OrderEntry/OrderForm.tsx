/**
 * OrderForm Component (Premium)
 * 
 * Professional order entry with all trading features.
 * Features:
 * - Animated buy/sell toggle
 * - Quick quantity buttons (25%, 50%, 75%, 100%)
 * - Real-time margin calculation
 * - Risk/Reward display
 * - Expandable advanced options
 * - Form validation with inline errors
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { OrderRequest, OrderSide, OrderType, AnyInstrument, Tick } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS, SIZING } from '../../theme';
import { formatPrice, formatCurrency, formatPercent } from '../../utils';
import { calculateMargin, validateOrder, calculateRiskReward } from '../../utils/calculations';

// =============================================================================
// ANIMATIONS
// =============================================================================

const slideDown = keyframes`
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 300px; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
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

const TitleText = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
`;

const SymbolBadge = styled.span`
  padding: ${SPACING[1]} ${SPACING[2]};
  background: ${COLORS.semantic.info.bg};
  color: ${COLORS.semantic.info.main};
  border-radius: ${EFFECTS.borderRadius.base};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const Body = styled.div`
  flex: 1;
  padding: ${SPACING[3]};
  display: flex;
  flex-direction: column;
  gap: ${SPACING[3]};
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${COLORS.border.default};
    border-radius: 2px;
  }
`;

// Side Toggle
const SideToggle = styled.div`
  display: flex;
  background: ${COLORS.bg.primary};
  border-radius: ${EFFECTS.borderRadius.md};
  padding: 3px;
  position: relative;
`;

const SideSlider = styled.div<{ $side: OrderSide }>`
  position: absolute;
  top: 3px;
  left: ${({ $side }) => $side === 'buy' ? '3px' : 'calc(50% + 1.5px)'};
  width: calc(50% - 4.5px);
  height: calc(100% - 6px);
  background: ${({ $side }) =>
    $side === 'buy' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
  border-radius: ${EFFECTS.borderRadius.base};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ $side }) =>
    $side === 'buy' ? EFFECTS.shadow.glow.positive : EFFECTS.shadow.glow.negative
  };
`;

const SideButton = styled.button<{ $side: OrderSide; $active: boolean }>`
  flex: 1;
  padding: ${SPACING[3]} ${SPACING[2]};
  border: none;
  background: transparent;
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-size: ${TYPOGRAPHY.fontSize.md};
  cursor: pointer;
  transition: ${EFFECTS.transition.base};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
  position: relative;
  z-index: 1;
  color: ${({ $active }) => $active ? '#fff' : COLORS.text.tertiary};
  
  &:hover {
    color: ${({ $active }) => $active ? '#fff' : COLORS.text.secondary};
  }
`;

// Price Display
const PriceDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING[2]};
`;

const PriceBox = styled.div<{ $side: 'bid' | 'ask'; $active?: boolean }>`
  padding: ${SPACING[2]} ${SPACING[3]};
  border-radius: ${EFFECTS.borderRadius.base};
  background: ${({ $active, $side }) =>
    $active
      ? ($side === 'ask' ? COLORS.semantic.positive.bg : COLORS.semantic.negative.bg)
      : COLORS.bg.primary
  };
  border: 1px solid ${({ $active, $side }) =>
    $active
      ? ($side === 'ask' ? COLORS.semantic.positive.muted : COLORS.semantic.negative.muted)
      : COLORS.border.subtle
  };
  text-align: center;
  transition: ${EFFECTS.transition.base};
`;

const PriceLabel = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wider};
  margin-bottom: ${SPACING[1]};
`;

const PriceValue = styled.div<{ $side: 'bid' | 'ask' }>`
  font-size: ${TYPOGRAPHY.fontSize.xl};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $side }) =>
    $side === 'ask' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
`;

// Form Group
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[1]};
`;

const Label = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const LabelHint = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
  font-weight: ${TYPOGRAPHY.fontWeight.normal};
`;

const InputWrapper = styled.div<{ $hasError?: boolean }>`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $hasError }) => $hasError ? COLORS.semantic.negative.main : 'transparent'};
    border-radius: 0 0 ${EFFECTS.borderRadius.base} ${EFFECTS.borderRadius.base};
  }
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${SPACING[2]} ${SPACING[3]};
  border: 1px solid ${({ $hasError }) =>
    $hasError ? COLORS.semantic.negative.main : COLORS.border.default
  };
  border-radius: ${EFFECTS.borderRadius.base};
  background: ${COLORS.bg.primary};
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  transition: ${EFFECTS.transition.base};
  
  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
    $hasError ? COLORS.semantic.negative.main : COLORS.border.focus
  };
    box-shadow: 0 0 0 3px ${({ $hasError }) =>
    $hasError ? COLORS.semantic.negative.bg : COLORS.semantic.info.bg
  };
  }
  
  &::placeholder {
    color: ${COLORS.text.tertiary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${SPACING[2]} ${SPACING[3]};
  border: 1px solid ${COLORS.border.default};
  border-radius: ${EFFECTS.borderRadius.base};
  background: ${COLORS.bg.primary};
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.md};
  cursor: pointer;
  transition: ${EFFECTS.transition.base};
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b6b7d' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  
  &:focus {
    outline: none;
    border-color: ${COLORS.border.focus};
    box-shadow: 0 0 0 3px ${COLORS.semantic.info.bg};
  }
`;

// Quick Buttons
const QuickButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${SPACING[1]};
`;

const QuickButton = styled.button`
  padding: ${SPACING[1]} ${SPACING[2]};
  border: 1px solid ${COLORS.border.default};
  border-radius: ${EFFECTS.borderRadius.sm};
  background: transparent;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  transition: ${EFFECTS.transition.fast};
  
  &:hover {
    border-color: ${COLORS.border.strong};
    background: ${COLORS.bg.hover};
    color: ${COLORS.text.primary};
  }
  
  &:active {
    background: ${COLORS.bg.active};
  }
`;

// Leverage Slider
const LeverageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[2]};
`;

const LeverageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeverageValue = styled.span<{ $high?: boolean }>`
  padding: ${SPACING[1]} ${SPACING[2]};
  background: ${({ $high }) => $high ? COLORS.semantic.warning.bg : COLORS.bg.primary};
  border: 1px solid ${({ $high }) => $high ? COLORS.semantic.warning.main : COLORS.border.default};
  border-radius: ${EFFECTS.borderRadius.base};
  font-size: ${TYPOGRAPHY.fontSize.md};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $high }) => $high ? COLORS.semantic.warning.main : COLORS.text.primary};
`;

const SliderTrack = styled.div`
  position: relative;
  height: 4px;
  background: ${COLORS.bg.elevated};
  border-radius: 2px;
`;

const SliderFill = styled.div<{ $percent: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: linear-gradient(90deg, 
    ${COLORS.semantic.positive.main} 0%, 
    ${COLORS.semantic.warning.main} 50%, 
    ${COLORS.semantic.negative.main} 100%
  );
  border-radius: 2px;
`;

const SliderInput = styled.input`
  position: absolute;
  top: -6px;
  left: 0;
  width: 100%;
  height: 16px;
  opacity: 0;
  cursor: pointer;
`;

const SliderMarks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${SPACING[1]};
`;

const SliderMark = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.tertiary};
`;

// Row
const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING[2]};
`;

// Advanced Section
const AdvancedToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING[1]};
  padding: ${SPACING[2]};
  border: 1px dashed ${COLORS.border.default};
  border-radius: ${EFFECTS.borderRadius.base};
  background: transparent;
  color: ${COLORS.text.tertiary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  cursor: pointer;
  transition: ${EFFECTS.transition.base};
  
  &:hover {
    border-color: ${COLORS.border.strong};
    color: ${COLORS.text.secondary};
  }
  
  svg {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
  }
`;

const AdvancedSection = styled.div<{ $expanded: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[3]};
  overflow: hidden;
  ${({ $expanded }) => $expanded && css`
    animation: ${slideDown} 0.3s ease-out;
  `}
`;

// Summary
const Summary = styled.div`
  background: ${COLORS.bg.primary};
  border: 1px solid ${COLORS.border.subtle};
  border-radius: ${EFFECTS.borderRadius.base};
  padding: ${SPACING[3]};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${SPACING[1]} 0;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  
  &:not(:last-child) {
    border-bottom: 1px solid ${COLORS.border.subtle};
  }
`;

const SummaryLabel = styled.span`
  color: ${COLORS.text.tertiary};
`;

const SummaryValue = styled.span<{ $color?: string }>`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  font-family: ${TYPOGRAPHY.fontFamily.mono};
  color: ${({ $color }) => $color || COLORS.text.primary};
`;

// Error
const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
  padding: ${SPACING[2]} ${SPACING[3]};
  background: ${COLORS.semantic.negative.bg};
  border: 1px solid ${COLORS.semantic.negative.muted};
  border-radius: ${EFFECTS.borderRadius.base};
  color: ${COLORS.semantic.negative.main};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

// Submit Button
const SubmitButton = styled.button<{ $side: OrderSide }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${SPACING[2]};
  padding: ${SPACING[4]};
  border: none;
  border-radius: ${EFFECTS.borderRadius.md};
  font-weight: ${TYPOGRAPHY.fontWeight.bold};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  text-transform: uppercase;
  letter-spacing: ${TYPOGRAPHY.letterSpacing.wide};
  cursor: pointer;
  transition: ${EFFECTS.transition.base};
  background: ${({ $side }) =>
    $side === 'buy' ? COLORS.semantic.positive.main : COLORS.semantic.negative.main
  };
  color: #fff;
  box-shadow: ${({ $side }) =>
    $side === 'buy' ? EFFECTS.shadow.glow.positive : EFFECTS.shadow.glow.negative
  };
  
  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

// =============================================================================
// COMPONENT
// =============================================================================

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop_limit', label: 'Stop Limit' },
];

interface OrderFormProps {
  symbol: string;
  instrument?: AnyInstrument;
  tick?: Tick;
  freeMargin?: number;
  maxLeverage?: number;
  onSubmit?: (order: OrderRequest) => void;
  showAdvanced?: boolean;
  compact?: boolean;
}

export function OrderForm({
  symbol,
  instrument,
  tick,
  freeMargin = 10000,
  maxLeverage = 100,
  onSubmit,
  showAdvanced = true,
  compact = false,
}: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState('0.1');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState(10);
  const [errors, setErrors] = useState<string[]>([]);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const decimals = instrument?.decimals || 5;
  const minQty = instrument?.minQuantity || 0.01;

  const executionPrice = useMemo(() => {
    if (orderType === 'market') {
      return (side === 'buy' ? tick?.ask : tick?.bid) || 0;
    }
    return parseFloat(price) || 0;
  }, [orderType, side, tick, price]);

  // Set price when switching to limit order
  useEffect(() => {
    if (orderType !== 'market' && !price && tick) {
      setPrice(formatPrice(tick.last, decimals));
    }
  }, [orderType, tick, price, decimals]);

  const marginRequired = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    return calculateMargin(executionPrice, qty, leverage);
  }, [executionPrice, quantity, leverage]);

  const riskReward = useMemo(() => {
    if (!stopLoss || !takeProfit || !executionPrice) return null;
    return calculateRiskReward(
      executionPrice,
      parseFloat(stopLoss),
      parseFloat(takeProfit),
      side
    );
  }, [executionPrice, stopLoss, takeProfit, side]);

  const validation = useMemo(() => {
    if (!instrument) return { valid: false, errors: ['Select an instrument'] };
    return validateOrder({
      quantity: parseFloat(quantity) || 0,
      price: executionPrice,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      side,
      instrument,
      freeMargin,
      leverage,
    });
  }, [quantity, executionPrice, stopLoss, takeProfit, side, instrument, freeMargin, leverage]);

  const handleQuickQuantity = (percent: number) => {
    const maxQty = (freeMargin * leverage) / executionPrice;
    const qty = maxQty * (percent / 100);
    setQuantity(qty.toFixed(2));
  };

  const handleSubmit = useCallback(() => {
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);

    const order: OrderRequest = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      leverage,
    };

    if (orderType === 'limit' || orderType === 'stop_limit') {
      order.limitPrice = parseFloat(price);
    }
    if (orderType === 'stop' || orderType === 'stop_limit') {
      order.stopPrice = parseFloat(price);
    }
    if (stopLoss) order.stopLoss = parseFloat(stopLoss);
    if (takeProfit) order.takeProfit = parseFloat(takeProfit);

    onSubmit?.(order);
  }, [validation, symbol, side, orderType, quantity, price, stopLoss, takeProfit, leverage, onSubmit]);

  return (
    <Container>
      <Header>
        <TitleText>New Order</TitleText>
        <SymbolBadge>{symbol}</SymbolBadge>
      </Header>

      <Body>
        {/* Buy/Sell Toggle */}
        <SideToggle>
          <SideSlider $side={side} />
          <SideButton
            $side="buy"
            $active={side === 'buy'}
            onClick={() => setSide('buy')}
          >
            Buy
          </SideButton>
          <SideButton
            $side="sell"
            $active={side === 'sell'}
            onClick={() => setSide('sell')}
          >
            Sell
          </SideButton>
        </SideToggle>

        {/* Prices */}
        {tick && (
          <PriceDisplay>
            <PriceBox $side="bid" $active={side === 'sell'}>
              <PriceLabel>Bid</PriceLabel>
              <PriceValue $side="bid">{formatPrice(tick.bid, decimals)}</PriceValue>
            </PriceBox>
            <PriceBox $side="ask" $active={side === 'buy'}>
              <PriceLabel>Ask</PriceLabel>
              <PriceValue $side="ask">{formatPrice(tick.ask, decimals)}</PriceValue>
            </PriceBox>
          </PriceDisplay>
        )}

        {/* Order Type */}
        <FormGroup>
          <Label>Order Type</Label>
          <Select value={orderType} onChange={e => setOrderType(e.target.value as OrderType)}>
            {ORDER_TYPES.map(ot => (
              <option key={ot.value} value={ot.value}>{ot.label}</option>
            ))}
          </Select>
        </FormGroup>

        {/* Price (for limit/stop) */}
        {orderType !== 'market' && (
          <FormGroup>
            <Label>
              Price
              <LabelHint>{orderType === 'limit' ? 'Limit' : 'Trigger'} price</LabelHint>
            </Label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              step={Math.pow(10, -decimals)}
            />
          </FormGroup>
        )}

        {/* Quantity */}
        <FormGroup>
          <Label>
            Quantity
            <LabelHint>Lots</LabelHint>
          </Label>
          <Input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min={minQty}
            step={minQty}
          />
          <QuickButtons>
            <QuickButton onClick={() => handleQuickQuantity(25)}>25%</QuickButton>
            <QuickButton onClick={() => handleQuickQuantity(50)}>50%</QuickButton>
            <QuickButton onClick={() => handleQuickQuantity(75)}>75%</QuickButton>
            <QuickButton onClick={() => handleQuickQuantity(100)}>Max</QuickButton>
          </QuickButtons>
        </FormGroup>

        {/* Leverage */}
        <LeverageContainer>
          <LeverageHeader>
            <Label>Leverage</Label>
            <LeverageValue $high={leverage >= maxLeverage * 0.8}>{leverage}x</LeverageValue>
          </LeverageHeader>
          <SliderTrack>
            <SliderFill $percent={(leverage / maxLeverage) * 100} />
            <SliderInput
              type="range"
              min={1}
              max={maxLeverage}
              value={leverage}
              onChange={e => setLeverage(parseInt(e.target.value))}
            />
          </SliderTrack>
          <SliderMarks>
            <SliderMark>1x</SliderMark>
            <SliderMark>{Math.floor(maxLeverage / 4)}x</SliderMark>
            <SliderMark>{Math.floor(maxLeverage / 2)}x</SliderMark>
            <SliderMark>{Math.floor(maxLeverage * 0.75)}x</SliderMark>
            <SliderMark>{maxLeverage}x</SliderMark>
          </SliderMarks>
        </LeverageContainer>

        {/* Advanced Options */}
        {showAdvanced && (
          <>
            <AdvancedToggle onClick={() => setAdvancedExpanded(!advancedExpanded)}>
              <svg viewBox="0 0 16 16" fill="currentColor" style={{ transform: advancedExpanded ? 'rotate(180deg)' : 'none' }}>
                <path d="M8 11L3 6h10z" />
              </svg>
              {advancedExpanded ? 'Hide' : 'Show'} SL/TP Options
            </AdvancedToggle>

            {advancedExpanded && (
              <AdvancedSection $expanded={advancedExpanded}>
                <Row>
                  <FormGroup>
                    <Label>Stop Loss</Label>
                    <Input
                      type="number"
                      value={stopLoss}
                      onChange={e => setStopLoss(e.target.value)}
                      placeholder="Optional"
                      step={Math.pow(10, -decimals)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Take Profit</Label>
                    <Input
                      type="number"
                      value={takeProfit}
                      onChange={e => setTakeProfit(e.target.value)}
                      placeholder="Optional"
                      step={Math.pow(10, -decimals)}
                    />
                  </FormGroup>
                </Row>

                {riskReward !== null && (
                  <SummaryRow>
                    <SummaryLabel>Risk/Reward Ratio</SummaryLabel>
                    <SummaryValue $color={riskReward >= 2 ? COLORS.semantic.positive.main : COLORS.semantic.warning.main}>
                      1:{riskReward.toFixed(2)}
                    </SummaryValue>
                  </SummaryRow>
                )}
              </AdvancedSection>
            )}
          </>
        )}

        {/* Summary */}
        <Summary>
          <SummaryRow>
            <SummaryLabel>Margin Required</SummaryLabel>
            <SummaryValue>{formatCurrency(marginRequired)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Free Margin</SummaryLabel>
            <SummaryValue $color={freeMargin < marginRequired ? COLORS.semantic.negative.main : undefined}>
              {formatCurrency(freeMargin)}
            </SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Est. Position Value</SummaryLabel>
            <SummaryValue>
              {formatCurrency(executionPrice * (parseFloat(quantity) || 0))}
            </SummaryValue>
          </SummaryRow>
        </Summary>

        {/* Errors */}
        {errors.length > 0 && (
          <ErrorMessage>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 12a1 1 0 110-2 1 1 0 010 2zm1-4a1 1 0 01-2 0V4a1 1 0 012 0v4z" />
            </svg>
            {errors[0]}
          </ErrorMessage>
        )}

        {/* Submit */}
        <SubmitButton $side={side} onClick={handleSubmit} disabled={!validation.valid}>
          {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
        </SubmitButton>
      </Body>
    </Container>
  );
}

export default OrderForm;
