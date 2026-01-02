// import React from "react";
import styled from "styled-components";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
  StatBlock,
} from "@repo/ui";

const Page = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.typography.sizes.base};
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
  grid-template-columns: 2fr 1fr; // Chart takes 2/3, OrderBook takes 1/3
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const StatRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const PlaceholderCopy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

import { useMarketData } from "../../hooks/useMarketData";

import { ChartWidget } from "../../components/ChartWidget";

// Mock data generator for the chart (since we don't have full historical OHLC API yet)
const generateMockData = () => {
  const data = [];
  let time = new Date("2023-01-01").getTime() / 1000;
  let value = 100;
  for (let i = 0; i < 100; i++) {
    const open = value;
    const close = value + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random();
    const low = Math.min(open, close) - Math.random();
    data.push({ time, open, high, low, close });
    time += 86400; // 1 day
    value = close;
  }
  return data;
};

const mockChartData = generateMockData();

export const MarketsPage = (): JSX.Element => {
  const data = useMarketData(["^GSPC", "EURUSD=X", "BTC-USD"]);

  const getPrice = (sym: string) => data[sym];

  const sp500 = getPrice("^GSPC");
  const btc = getPrice("BTC-USD");
  const eur = getPrice("EURUSD=X");

  return (
    <Page>
      <Header>
        <Title>Markets</Title>
        <Subtitle>Live pricing from Market Data Service.</Subtitle>
      </Header>

      <StatRow>
        <StatBlock
          label="S&P 500"
          value={sp500 ? sp500.price?.toFixed(2) : "..."}
          trend={sp500 ? `${sp500.changePercent?.toFixed(2)}%` : "..."}
          trendDirection={sp500?.changePercent >= 0 ? "up" : "down"}
          meta="Index"
        />
        <StatBlock
          label="EUR/USD"
          value={eur ? eur.price?.toFixed(4) : "..."}
          trend={eur ? `${eur.changePercent?.toFixed(2)}%` : "..."}
          trendDirection={eur?.changePercent >= 0 ? "up" : "down"}
          meta="FX"
        />
        <StatBlock
          label="Bitcoin"
          value={btc ? `$${btc.price?.toLocaleString()}` : "..."}
          trend={btc ? `${btc.change24h?.toFixed(2)}%` : "..."}
          trendDirection={btc?.change24h >= 0 ? "up" : "down"}
          meta="Crypto"
        />
      </StatRow>

      <Grid>
        <Card>
          <CardHeader>
            <CardTitle>BTC/USD Chart</CardTitle>
          </CardHeader>
          <CardBody>
            <ChartWidget symbol="BTC-USD" data={mockChartData} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Order Book</CardTitle>
              <CardSubtitle>Depth aggregation placeholder</CardSubtitle>
            </div>
            <Badge variant="default">Mock</Badge>
          </CardHeader>
          <CardBody>
            <PlaceholderCopy>
              Slot for book visualisations, e.g. laddered bars or time and sales streams.
            </PlaceholderCopy>
          </CardBody>
        </Card>
      </Grid>
    </Page>
  );
};

export default MarketsPage;
