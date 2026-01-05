/**
 * Database Schema
 * ===============
 *
 * Drizzle ORM schema definitions for market data persistence.
 *
 * TABLES:
 * - market_prices: Stores both ticks and candles with metadata
 * - candles: Dedicated OHLCV table for future optimization
 *
 * NOTE: We currently use the market_prices table with JSON metadata
 * for candles. The dedicated candles table is defined for future
 * migration when we need better query performance.
 */

import {
    pgTable,
    serial,
    varchar,
    decimal,
    timestamp,
    jsonb,
    integer,
    index,
    unique,
} from 'drizzle-orm/pg-core';

/**
 * Market prices table - stores ticks and candles.
 *
 * This table uses a flexible schema with a JSON metadata column
 * to store different types of market data (ticks, candles).
 */
export const marketPrices = pgTable(
    'market_prices',
    {
        id: serial('id').primaryKey(),
        symbol: varchar('symbol', { length: 20 }).notNull(),
        price: decimal('price', { precision: 20, scale: 8 }).notNull(),
        currency: varchar('currency', { length: 10 }).default('USD'),
        source: varchar('source', { length: 50 }),
        timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
        metadata: jsonb('metadata'),
    },
    (table) => ({
        symbolIdx: index('idx_market_prices_symbol').on(table.symbol),
        timestampIdx: index('idx_market_prices_timestamp').on(table.timestamp),
        symbolTimeIdx: index('idx_market_prices_symbol_time').on(
            table.symbol,
            table.timestamp
        ),
    })
);

/**
 * Dedicated candles table for OHLCV data.
 *
 * This table is optimized for candle queries with proper columns
 * instead of JSON metadata. Use this for new implementations.
 *
 * FUTURE MIGRATION:
 * 1. Create this table with migration
 * 2. Backfill from market_prices where metadata->>'type' = 'candle'
 * 3. Update TickRepository to use this table
 * 4. Keep market_prices for backward compatibility
 */
export const candles = pgTable(
    'candles',
    {
        id: serial('id').primaryKey(),
        symbol: varchar('symbol', { length: 20 }).notNull(),
        timeframe: varchar('timeframe', { length: 5 }).notNull(),
        open: decimal('open', { precision: 20, scale: 8 }).notNull(),
        high: decimal('high', { precision: 20, scale: 8 }).notNull(),
        low: decimal('low', { precision: 20, scale: 8 }).notNull(),
        close: decimal('close', { precision: 20, scale: 8 }).notNull(),
        volume: decimal('volume', { precision: 20, scale: 8 }).default('0'),
        tickCount: integer('tick_count').default(0),
        timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    },
    (table) => ({
        symbolTimeframeIdx: index('idx_candles_symbol_tf').on(
            table.symbol,
            table.timeframe
        ),
        timestampIdx: index('idx_candles_timestamp').on(table.timestamp),
        // Ensure unique candle per symbol/timeframe/timestamp
        uniqueCandle: unique('uniq_candle').on(
            table.symbol,
            table.timeframe,
            table.timestamp
        ),
    })
);

// Type exports for use in application code
export type MarketPrice = typeof marketPrices.$inferSelect;
export type NewMarketPrice = typeof marketPrices.$inferInsert;
export type Candle = typeof candles.$inferSelect;
export type NewCandle = typeof candles.$inferInsert;
