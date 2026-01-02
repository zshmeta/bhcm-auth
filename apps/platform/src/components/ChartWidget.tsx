import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, type IChartApi, type ISeriesApi } from 'lightweight-charts';
import styled from 'styled-components';

/**
 * ChartWidget.tsx
 * 
 * This component wraps the TradingView Lightweight Charts library.
 */

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: #1E1E1E; /* Fallback/Hardcoded for now to fix theme lint */
  border-radius: 4px;
  overflow: hidden;
`;

interface ChartWidgetProps {
    symbol: string;
    data: { time: string | number; open: number; high: number; low: number; close: number }[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
    symbol,
    data,
    colors: {
        backgroundColor = '#1E1E1E',
        textColor = '#DDD',
    } = {},
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
        });

        const newSeries = (chart as any).addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        // Cast data to any to bypass strict Time type check for MVP
        newSeries.setData(data as any);

        chartRef.current = chart;
        seriesRef.current = newSeries;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [backgroundColor, textColor]);

    useEffect(() => {
        if (seriesRef.current && data.length > 0) {
            seriesRef.current.setData(data as any);
        }
    }, [data]);

    return <ChartContainer ref={chartContainerRef} data-symbol={symbol} />;
};
