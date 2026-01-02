import React from 'react';
import styled from 'styled-components';
import { useMarketData } from '../../../hooks/useMarketData';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${({ theme }: any) => theme.colors.background.surface};
  border-radius: 4px;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 8px 12px;
  background: ${({ theme }: any) => theme.colors.background.secondary};
  border-bottom: 1px solid ${({ theme }: any) => theme.colors.border};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }: any) => theme.colors.text.secondary};
  text-transform: uppercase;
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }: any) => theme.colors.border};
  cursor: pointer;
  &:hover {
    background: ${({ theme }: any) => theme.colors.background.hover};
  }
`;

const Symbol = styled.div`
  font-weight: 600;
  color: ${({ theme }: any) => theme.colors.text.primary};
`;

const Price = styled.div<{ $up: boolean }>`
  color: ${({ $up, theme }: any) => $up ? theme.colors.success : theme.colors.error};
  font-family: 'Roboto Mono', monospace;
`;

const Change = styled.div<{ $up: boolean }>`
  color: ${({ $up, theme }: any) => $up ? theme.colors.success : theme.colors.error};
  font-size: 11px;
`;

interface WatchlistPanelProps {
  onSelectSymbol: (symbol: string) => void;
}

const SYMBOLS = ["BTC-USD", "ETH-USD", "EURUSD=X", "^GSPC", "AAPL"];

export const WatchlistPanel: React.FC<WatchlistPanelProps> = ({ onSelectSymbol }) => {
  const data = useMarketData(SYMBOLS);

  return (
    <Container>
      <Header>Watchlist</Header>
      <List>
        {SYMBOLS.map(sym => {
          const item = data[sym];
          const price = item?.price || 0;
          const change = item?.changePercent || 0;
          const isUp = change >= 0;

          return (
            <Row key={sym} onClick={() => onSelectSymbol(sym)}>
              <div>
                <Symbol>{sym}</Symbol>
                <Change $up={isUp}>{change > 0 ? '+' : ''}{change.toFixed(2)}%</Change>
              </div>
              <Price $up={isUp}>{price.toFixed(2)}</Price>
            </Row>
          );
        })}
      </List>
    </Container>
  );
};
