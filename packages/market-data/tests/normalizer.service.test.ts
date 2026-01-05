/**
 * Normalizer Service Tests
 * ========================
 *
 * Unit tests for tick normalization and enrichment.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NormalizerService } from '../src/domains/normalizer/normalizer.service.js';
import type { NormalizedTick } from '../src/domains/collectors/collector.types.js';

describe('NormalizerService', () => {
  let normalizer: NormalizerService;

  beforeEach(() => {
    normalizer = new NormalizerService();
    normalizer.reset(); // Clear any state from previous tests
  });

  /**
   * Helper to create a raw tick.
   */
  function createRawTick(overrides: Partial<NormalizedTick> = {}): NormalizedTick {
    return {
      symbol: 'BTC/USD',
      last: 50000,
      bid: 49990,
      ask: 50010,
      volume: 100,
      timestamp: Date.now(),
      source: 'binance',
      ...overrides,
    };
  }

  describe('process', () => {
    it('should enrich tick with computed fields', () => {
      const tick = createRawTick({
        bid: 49990,
        ask: 50010,
      });

      const enriched = normalizer.process(tick);

      expect(enriched).not.toBeNull();
      expect(enriched?.mid).toBe(50000); // (49990 + 50010) / 2
      expect(enriched?.spread).toBe(20); // 50010 - 49990
      expect(enriched?.spreadPercent).toBeCloseTo(0.04, 2); // (20 / 50000) * 100
    });

    it('should add asset kind and name from symbol definition', () => {
      const tick = createRawTick();
      const enriched = normalizer.process(tick);

      expect(enriched).not.toBeNull();
      expect(enriched?.kind).toBe('crypto');
      expect(enriched?.name).toBe('Bitcoin');
    });

    it('should format price for display', () => {
      const tick = createRawTick({ last: 50123.45 });
      const enriched = normalizer.process(tick);

      expect(enriched).not.toBeNull();
      expect(enriched?.priceFormatted).toBeDefined();
      expect(typeof enriched?.priceFormatted).toBe('string');
    });

    it('should reject unknown symbols', () => {
      const tick = createRawTick({ symbol: 'UNKNOWN/PAIR' });
      const result = normalizer.process(tick);

      expect(result).toBeNull();
    });

    it('should deduplicate identical ticks (same price and near-same timestamp)', () => {
      const baseTimestamp = Date.now();

      const tick1 = createRawTick({ timestamp: baseTimestamp, last: 50000 });
      const tick2 = createRawTick({ timestamp: baseTimestamp + 50, last: 50000 }); // Same price, 50ms later

      const result1 = normalizer.process(tick1);
      const result2 = normalizer.process(tick2);

      expect(result1).not.toBeNull();
      expect(result2).toBeNull(); // Should be deduplicated
    });

    it('should not deduplicate ticks with different prices', () => {
      const baseTimestamp = Date.now();

      const tick1 = createRawTick({ timestamp: baseTimestamp, last: 50000 });
      const tick2 = createRawTick({ timestamp: baseTimestamp + 50, last: 50100 }); // Different price

      const result1 = normalizer.process(tick1);
      const result2 = normalizer.process(tick2);

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull(); // Should NOT be deduplicated
    });

    it('should not deduplicate ticks with different timestamps', () => {
      const tick1 = createRawTick({ timestamp: 1000, last: 50000 });
      const tick2 = createRawTick({ timestamp: 2000, last: 50000 }); // Same price, different timestamp

      const result1 = normalizer.process(tick1);
      const result2 = normalizer.process(tick2);

      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
    });

    it('should handle missing bid/ask gracefully', () => {
      const tick = createRawTick({
        bid: undefined,
        ask: undefined,
        last: 50000,
      });

      const enriched = normalizer.process(tick);

      expect(enriched).not.toBeNull();
      expect(enriched?.mid).toBe(50000); // Falls back to last price
      expect(enriched?.spread).toBeUndefined();
      expect(enriched?.spreadPercent).toBeUndefined();
    });
  });

  describe('processBatch', () => {
    it('should process multiple ticks and filter duplicates', () => {
      const baseTimestamp = Date.now();

      const ticks = [
        createRawTick({ symbol: 'BTC/USD', timestamp: baseTimestamp, last: 50000 }),
        createRawTick({ symbol: 'ETH/USD', timestamp: baseTimestamp, last: 3000 }),
        createRawTick({ symbol: 'BTC/USD', timestamp: baseTimestamp + 50, last: 50000 }), // Duplicate
      ];

      const results = normalizer.processBatch(ticks);

      expect(results.length).toBe(2); // Third tick should be deduplicated
      expect(results.map((r) => r.symbol)).toContain('BTC/USD');
      expect(results.map((r) => r.symbol)).toContain('ETH/USD');
    });
  });

  describe('onTick event', () => {
    it('should emit enriched ticks to subscribers', () => {
      const received: unknown[] = [];
      normalizer.onTick((tick) => received.push(tick));

      normalizer.process(createRawTick({ timestamp: 1 }));
      normalizer.process(createRawTick({ timestamp: 2, symbol: 'ETH/USD' }));

      expect(received.length).toBe(2);
    });

    it('should not emit for deduplicated ticks', () => {
      const received: unknown[] = [];
      normalizer.onTick((tick) => received.push(tick));

      const tick = createRawTick({ timestamp: Date.now() });
      normalizer.process(tick);
      normalizer.process({ ...tick }); // Same tick

      expect(received.length).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear internal state', () => {
      normalizer.process(createRawTick({ timestamp: Date.now() }));

      normalizer.reset();

      // After reset, the same tick should not be deduplicated
      const tick = createRawTick({ timestamp: Date.now() + 100 });
      const result = normalizer.process(tick);

      expect(result).not.toBeNull();
    });
  });
});
