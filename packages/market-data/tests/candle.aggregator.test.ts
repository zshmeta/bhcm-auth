/**
 * Candle Aggregator Tests
 * =======================
 *
 * Unit tests for the OHLCV candle aggregation logic.
 * These tests don't require external services.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CandleAggregator, aggregateCandles } from '../src/domains/historical/candle.aggregator.js';
import type { EnrichedTick } from '../src/domains/normalizer/normalizer.types.js';
import type { Candle } from '../src/domains/historical/historical.types.js';

describe('CandleAggregator', () => {
  let aggregator: CandleAggregator;

  beforeEach(() => {
    aggregator = new CandleAggregator();
  });

  afterEach(() => {
    aggregator.stop();
  });

  /**
   * Helper to create a mock enriched tick.
   */
  function createTick(overrides: Partial<EnrichedTick> = {}): EnrichedTick {
    return {
      symbol: 'BTC/USD',
      last: 50000,
      bid: 49999,
      ask: 50001,
      mid: 50000,
      spread: 2,
      spreadPercent: 0.004,
      volume: 100,
      timestamp: Date.now(),
      source: 'binance',
      kind: 'crypto',
      name: 'Bitcoin',
      priceFormatted: '$50,000.00',
      ...overrides,
    };
  }

  describe('processTick', () => {
    it('should create a new candle for first tick', () => {
      const tick = createTick({ last: 50000 });
      aggregator.processTick(tick);

      const candle = aggregator.getCurrentCandle('BTC/USD');

      expect(candle).not.toBeNull();
      expect(candle?.open).toBe(50000);
      expect(candle?.high).toBe(50000);
      expect(candle?.low).toBe(50000);
      expect(candle?.close).toBe(50000);
    });

    it('should update high correctly', () => {
      // First tick
      aggregator.processTick(createTick({ last: 50000 }));

      // Higher price
      aggregator.processTick(createTick({ last: 51000 }));
      const candle = aggregator.getCurrentCandle('BTC/USD');

      expect(candle?.high).toBe(51000);
      expect(candle?.open).toBe(50000); // Open unchanged
    });

    it('should update low correctly', () => {
      // First tick
      aggregator.processTick(createTick({ last: 50000 }));

      // Lower price
      aggregator.processTick(createTick({ last: 49000 }));
      const candle = aggregator.getCurrentCandle('BTC/USD');

      expect(candle?.low).toBe(49000);
      expect(candle?.open).toBe(50000); // Open unchanged
    });

    it('should track close as latest price', () => {
      aggregator.processTick(createTick({ last: 50000 }));
      aggregator.processTick(createTick({ last: 51000 }));
      aggregator.processTick(createTick({ last: 50500 }));

      const candle = aggregator.getCurrentCandle('BTC/USD');
      expect(candle?.close).toBe(50500);
    });

    it('should accumulate volume', () => {
      aggregator.processTick(createTick({ volume: 100 }));
      aggregator.processTick(createTick({ volume: 200 }));
      aggregator.processTick(createTick({ volume: 150 }));

      const candle = aggregator.getCurrentCandle('BTC/USD');
      expect(candle?.volume).toBe(450);
    });

    it('should count ticks', () => {
      aggregator.processTick(createTick());
      aggregator.processTick(createTick());
      aggregator.processTick(createTick());

      const candle = aggregator.getCurrentCandle('BTC/USD');
      expect(candle?.tickCount).toBe(3);
    });

    it('should handle zero volume gracefully', () => {
      aggregator.processTick(createTick({ volume: 0 }));
      aggregator.processTick(createTick({ volume: undefined }));

      const candle = aggregator.getCurrentCandle('BTC/USD');
      expect(candle?.volume).toBe(0);
    });
  });

  describe('candle completion', () => {
    it('should emit completed candle when minute boundary is crossed', async () => {
      const completedCandles: Candle[] = [];
      aggregator.onCandle((candle) => completedCandles.push(candle));

      // Set timestamp to just before minute boundary
      const minuteStart = Math.floor(Date.now() / 60000) * 60000;
      const tick1 = createTick({
        timestamp: minuteStart + 59000, // 59 seconds into minute
        last: 50000,
      });
      aggregator.processTick(tick1);

      // Next tick is in next minute
      const tick2 = createTick({
        timestamp: minuteStart + 61000, // 1 second into next minute
        last: 51000,
      });
      aggregator.processTick(tick2);

      // Should have completed the previous candle
      expect(completedCandles.length).toBe(1);
      expect(completedCandles[0].close).toBe(50000);
      expect(completedCandles[0].isComplete).toBe(true);

      // Current candle should start fresh with new tick
      const currentCandle = aggregator.getCurrentCandle('BTC/USD');
      expect(currentCandle?.open).toBe(51000);
    });
  });

  describe('multiple symbols', () => {
    it('should maintain separate candles per symbol', () => {
      aggregator.processTick(createTick({ symbol: 'BTC/USD', last: 50000 }));
      aggregator.processTick(createTick({ symbol: 'ETH/USD', last: 3000 }));

      const btcCandle = aggregator.getCurrentCandle('BTC/USD');
      const ethCandle = aggregator.getCurrentCandle('ETH/USD');

      expect(btcCandle?.close).toBe(50000);
      expect(ethCandle?.close).toBe(3000);
    });

    it('should track stats across all symbols', () => {
      aggregator.processTick(createTick({ symbol: 'BTC/USD' }));
      aggregator.processTick(createTick({ symbol: 'ETH/USD' }));
      aggregator.processTick(createTick({ symbol: 'SOL/USD' }));

      const stats = aggregator.getStats();

      expect(stats.activeBuilders).toBe(3);
      expect(stats.symbols).toContain('BTC/USD');
      expect(stats.symbols).toContain('ETH/USD');
      expect(stats.symbols).toContain('SOL/USD');
    });
  });

  describe('getAllCurrentCandles', () => {
    it('should return all in-progress candles', () => {
      aggregator.processTick(createTick({ symbol: 'BTC/USD', last: 50000 }));
      aggregator.processTick(createTick({ symbol: 'ETH/USD', last: 3000 }));

      const candles = aggregator.getAllCurrentCandles();

      expect(candles.length).toBe(2);
      expect(candles.every((c) => c.isComplete === false)).toBe(true);
    });
  });
});

describe('aggregateCandles (standalone function)', () => {
  it('should aggregate 1m candles into 5m', () => {
    const baseTime = Math.floor(Date.now() / 300000) * 300000; // 5-minute boundary
    const candles: Candle[] = [
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 10,
        timestamp: baseTime,
        tickCount: 5,
        isComplete: true,
      },
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 105,
        high: 115,
        low: 100,
        close: 110,
        volume: 15,
        timestamp: baseTime + 60000,
        tickCount: 8,
        isComplete: true,
      },
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 110,
        high: 120,
        low: 105,
        close: 108,
        volume: 12,
        timestamp: baseTime + 120000,
        tickCount: 6,
        isComplete: true,
      },
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 108,
        high: 112,
        low: 102,
        close: 106,
        volume: 8,
        timestamp: baseTime + 180000,
        tickCount: 4,
        isComplete: true,
      },
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 106,
        high: 118,
        low: 104,
        close: 115,
        volume: 20,
        timestamp: baseTime + 240000,
        tickCount: 10,
        isComplete: true,
      },
    ];

    const aggregated = aggregateCandles(candles, '5m');

    expect(aggregated.length).toBe(1);
    expect(aggregated[0].open).toBe(100); // First candle's open
    expect(aggregated[0].close).toBe(115); // Last candle's close
    expect(aggregated[0].high).toBe(120); // Highest high
    expect(aggregated[0].low).toBe(95); // Lowest low
    expect(aggregated[0].volume).toBe(65); // Sum of volumes
    expect(aggregated[0].tickCount).toBe(33); // Sum of tick counts
  });

  it('should handle empty input', () => {
    const result = aggregateCandles([], '5m');
    expect(result).toEqual([]);
  });

  it('should handle single candle', () => {
    const candles: Candle[] = [
      {
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 100,
        high: 110,
        low: 95,
        close: 105,
        volume: 10,
        timestamp: Date.now(),
        tickCount: 5,
        isComplete: true,
      },
    ];

    const result = aggregateCandles(candles, '5m');

    expect(result.length).toBe(1);
    expect(result[0].open).toBe(100);
    expect(result[0].close).toBe(105);
  });

  it('should aggregate into multiple higher timeframe candles', () => {
    const baseTime = Math.floor(Date.now() / 300000) * 300000;

    // Create 10 one-minute candles spanning 2 five-minute periods
    const candles: Candle[] = [];
    for (let i = 0; i < 10; i++) {
      candles.push({
        symbol: 'BTC/USD',
        timeframe: '1m',
        open: 100 + i,
        high: 105 + i,
        low: 95 + i,
        close: 102 + i,
        volume: 10,
        timestamp: baseTime + i * 60000,
        tickCount: 5,
        isComplete: true,
      });
    }

    const aggregated = aggregateCandles(candles, '5m');

    expect(aggregated.length).toBe(2); // Two 5-minute candles
  });
});
