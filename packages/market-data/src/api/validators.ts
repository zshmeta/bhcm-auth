/**
 * API Request Validators
 * ======================
 *
 * Zod schemas for validating REST API request parameters.
 * Using Zod provides runtime type safety and clear error messages.
 */

import { z } from 'zod';

/**
 * Valid timeframes for candle queries.
 */
export const timeframeSchema = z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '1w']);
export type Timeframe = z.infer<typeof timeframeSchema>;

/**
 * Query parameters for the candle endpoint.
 */
export const candleQuerySchema = z.object({
    /** Candle timeframe (default: 1m) */
    timeframe: timeframeSchema.default('1m'),

    /** Maximum number of candles to return (default: 100, max: 1000) */
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(1000, 'Limit cannot exceed 1000')
        .default(100),

    /** Start timestamp in milliseconds (optional) */
    from: z.coerce
        .number()
        .int()
        .positive()
        .optional(),

    /** End timestamp in milliseconds (optional, default: now) */
    to: z.coerce
        .number()
        .int()
        .positive()
        .optional(),
});

export type CandleQueryParams = z.infer<typeof candleQuerySchema>;

/**
 * Query parameters for symbol search/filter.
 */
export const symbolQuerySchema = z.object({
    /** Filter by asset kind */
    kind: z.enum(['crypto', 'forex', 'stock', 'index', 'commodity']).optional(),

    /** Search query */
    search: z.string().max(50).optional(),
});

export type SymbolQueryParams = z.infer<typeof symbolQuerySchema>;

/**
 * Parse and validate query parameters from URLSearchParams.
 */
export function parseQueryParams<T extends z.ZodType>(
    schema: T,
    params: URLSearchParams
): z.SafeParseReturnType<unknown, z.infer<T>> {
    const obj: Record<string, string | undefined> = {};

    for (const [key, value] of params.entries()) {
        // Only set if value is non-empty
        if (value) {
            obj[key] = value;
        }
    }

    return schema.safeParse(obj);
}

/**
 * Format Zod errors for API response.
 */
export function formatZodErrors(error: z.ZodError): {
    message: string;
    details: Array<{ field: string; error: string }>;
} {
    const details = error.errors.map((e) => ({
        field: e.path.join('.') || 'unknown',
        error: e.message,
    }));

    return {
        message: 'Invalid request parameters',
        details,
    };
}
