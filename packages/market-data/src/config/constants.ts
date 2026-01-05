/**
 * Configuration Constants
 * =======================
 *
 * Centralized configuration constants for the market data service.
 * These values can be overridden by environment variables where appropriate.
 *
 * ORGANIZATION:
 * - Validation constants
 * - Rate limiting
 * - Caching
 * - Timers and intervals
 * - Buffer sizes
 */

// ============================================================
// VALIDATION
// ============================================================

/** Maximum age for a tick to be considered valid (5 minutes) */
export const MAX_TICK_AGE_MS = 5 * 60 * 1000;

/** Maximum time in the future a tick timestamp can be (30 seconds) */
export const MAX_FUTURE_TICK_MS = 30 * 1000;

/** Maximum allowed spread percentage for a tick to be valid */
export const MAX_SPREAD_PERCENT = 10;

/** Time tolerance for deduplicating identical ticks (100ms) */
export const TICK_DUPLICATE_TOLERANCE_MS = 100;

// ============================================================
// RATE LIMITING
// ============================================================

/** Minimum interval between tick updates per symbol for WebSocket (250ms = 4 updates/sec) */
export const MIN_TICK_UPDATE_INTERVAL_MS = 250;

/** Maximum subscription requests per client per minute */
export const SUBSCRIPTION_RATE_LIMIT_REQUESTS = 30;

/** Rate limit window in milliseconds (1 minute) */
export const RATE_LIMIT_WINDOW_MS = 60000;

/** Maximum symbols a single client can subscribe to */
export const MAX_SUBSCRIPTIONS_PER_CLIENT = 100;

// ============================================================
// CACHING
// ============================================================

/** TTL for cached prices in seconds */
export const PRICE_CACHE_TTL_SECONDS = 30;

/** Redis key prefix for prices */
export const PRICE_CACHE_PREFIX = 'price:';

/** Redis channel for price updates (pub/sub) */
export const PRICE_PUBSUB_CHANNEL = 'market:prices';

// ============================================================
// POLLING & DATA COLLECTION
// ============================================================

/** Delay between Yahoo Finance batch requests (500ms) */
export const YAHOO_BATCH_DELAY_MS = 500;

/** Maximum symbols per Yahoo Finance batch request */
export const YAHOO_BATCH_SIZE = 10;

// ============================================================
// TIMERS & INTERVALS
// ============================================================

/** Interval for logging metrics (1 minute) */
export const METRICS_LOG_INTERVAL_MS = 60000;

/** Interval for resetting stats counters (1 minute) */
export const STATS_RESET_INTERVAL_MS = 60000;

/** Interval for checking and flushing candle buffer (5 seconds) */
export const CANDLE_FLUSH_CHECK_INTERVAL_MS = 5000;

/** WebSocket heartbeat interval (30 seconds) */
export const WEBSOCKET_HEARTBEAT_INTERVAL_MS = 30000;

/** Interval for cleaning up rate limit entries */
export const RATE_LIMIT_CLEANUP_INTERVAL_MS = 60000;

// ============================================================
// BUFFER SIZES
// ============================================================

/** Buffer size for completed candles before batch save */
export const CANDLE_BUFFER_SIZE = 100;

/** Default limit for candle queries */
export const DEFAULT_CANDLE_QUERY_LIMIT = 100;

/** Maximum limit for candle queries */
export const MAX_CANDLE_QUERY_LIMIT = 1000;

// ============================================================
// DATABASE
// ============================================================

/** Database connection pool size */
export const DB_POOL_SIZE = 10;

/** Database connection idle timeout in seconds */
export const DB_IDLE_TIMEOUT_SECONDS = 30;

// ============================================================
// CIRCUIT BREAKER
// ============================================================

/** Number of failures before circuit opens */
export const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;

/** Time to wait before testing recovery (60 seconds) */
export const CIRCUIT_BREAKER_RESET_TIMEOUT_MS = 60000;

/** Number of successes needed to close circuit from half-open */
export const CIRCUIT_BREAKER_SUCCESS_THRESHOLD = 2;

// ============================================================
// RECONNECTION
// ============================================================

/** Base delay for reconnection attempts */
export const RECONNECT_BASE_DELAY_MS = 1000;

/** Maximum delay for reconnection attempts */
export const RECONNECT_MAX_DELAY_MS = 30000;

/** Maximum number of reconnection attempts before giving up */
export const RECONNECT_MAX_ATTEMPTS = 10;
