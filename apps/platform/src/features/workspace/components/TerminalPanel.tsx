import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${({ theme }: any) => theme.colors.background.surface};
  border-radius: 4px;
  overflow: hidden;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }: any) => theme.colors.border};
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid ${({ theme, $active }: any) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }: any) => $active ? theme.colors.text.primary : theme.colors.text.secondary};
  cursor: pointer;
`;

const Content = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  
  th {
    text-align: left;
    padding: 8px;
    color: ${({ theme }: any) => theme.colors.text.secondary};
    border-bottom: 1px solid ${({ theme }: any) => theme.colors.border};
    background: ${({ theme }: any) => theme.colors.background.surface};
    position: sticky;
    top: 0;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid ${({ theme }: any) => theme.colors.border};
    color: ${({ theme }: any) => theme.colors.text.primary};
  }
`;

interface TerminalPanelProps {
  positions: any[];
  orders: any[];
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ positions, orders }) => {
  const [activeTab, setActiveTab] = useState('positions');

  return (
    <Container>
      <Tabs>
        <Tab $active={activeTab === 'positions'} onClick={() => setActiveTab('positions')}>Positions</Tab>
        <Tab $active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>Open Orders</Tab>
        <Tab $active={activeTab === 'history'} onClick={() => setActiveTab('history')}>History</Tab>
      </Tabs>
      <Content>
        {activeTab === 'positions' && (
          <Table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry Price</th>
                <th>PnL</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos, i) => (
                <tr key={i}>
                  <td>{pos.symbol}</td>
                  <td style={{ color: pos.side === 'buy' ? '#26a69a' : '#ef5350' }}>{pos.side.toUpperCase()}</td>
                  <td>{pos.quantity}</td>
                  <td>{pos.entryPrice.toFixed(2)}</td>
                  <td style={{ color: pos.unrealizedPnl >= 0 ? '#26a69a' : '#ef5350' }}>
                    {pos.unrealizedPnl >= 0 ? '+' : ''}{pos.unrealizedPnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {activeTab === 'orders' && <div>{orders.length === 0 ? "No open orders" : `${orders.length} active orders`}</div>}
        {activeTab === 'history' && <div>No trade history</div>}
      </Content>
    </Container>
  );
};
