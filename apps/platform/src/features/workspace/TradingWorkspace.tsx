import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import styled from 'styled-components';
import 'react-grid-layout/css/styles.css';

import { ChartWidget } from '../../components/ChartWidget';
import { WatchlistPanel } from './components/WatchlistPanel';
import { OrderEntryPanel } from './components/OrderEntryPanel';
import { TerminalPanel } from './components/TerminalPanel';

const ResponsiveGridLayout = WidthProvider(Responsive) as any;

const WorkspaceContainer = styled.div`
  background: ${({ theme }: any) => theme.colors.background.main || '#000'};
  min-height: 100vh;
  padding: 8px;
`;

const GridItem = styled.div`
  background: ${({ theme }: any) => theme.colors.background.surface || '#111'};
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid ${({ theme }: any) => theme.colors.border || '#333'};
`;

// Default Layout
const defaultLayouts = {
    lg: [
        { i: 'watchlist', x: 0, y: 0, w: 2, h: 8 },
        { i: 'chart', x: 2, y: 0, w: 7, h: 8 },
        { i: 'order_entry', x: 9, y: 0, w: 3, h: 8 },
        { i: 'terminal', x: 2, y: 8, w: 10, h: 4 },
    ],
};

// Mock chart data again for now
const generateMockData = () => {
    const data = [];
    let time = new Date("2023-01-01").getTime() / 1000;
    let value = 42000;
    for (let i = 0; i < 100; i++) {
        const open = value;
        const close = value + (Math.random() - 0.5) * 500;
        const high = Math.max(open, close) + Math.random() * 100;
        const low = Math.min(open, close) - Math.random() * 100;
        data.push({ time, open, high, low, close });
        time += 86400;
        value = close;
    }
    return data;
};

const mockData = generateMockData();

import { useTradingData } from './hooks/useTradingData';

export const TradingWorkspace: React.FC = () => {
    const [symbol, setSymbol] = useState('BTC-USD');
    const { positions, orders } = useTradingData();

    return (
        <WorkspaceContainer>
            <ResponsiveGridLayout
                className="layout"
                layouts={defaultLayouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                draggableHandle=".grid-drag-handle"
            >
                <GridItem key="watchlist">
                    <WatchlistPanel onSelectSymbol={setSymbol} />
                </GridItem>

                <GridItem key="chart">
                    <ChartWidget symbol={symbol} data={mockData} />
                </GridItem>

                <GridItem key="order_entry">
                    <OrderEntryPanel symbol={symbol} />
                </GridItem>

                <GridItem key="terminal">
                    <TerminalPanel positions={positions} orders={orders} />
                </GridItem>

            </ResponsiveGridLayout>
        </WorkspaceContainer>
    );
};
