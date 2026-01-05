/**
 * Trading Colors
 * 
 * Semantic color utilities for trading UI.
 */

/** Trading color palette */
export const TRADING_COLORS = {
    /** Positive/bullish/buy colors */
    positive: {
        main: '#26a69a',
        light: '#4db6ac',
        dark: '#00897b',
        bg: 'rgba(38, 166, 154, 0.1)',
        bgHover: 'rgba(38, 166, 154, 0.2)',
    },
    /** Negative/bearish/sell colors */
    negative: {
        main: '#ef5350',
        light: '#e57373',
        dark: '#c62828',
        bg: 'rgba(239, 83, 80, 0.1)',
        bgHover: 'rgba(239, 83, 80, 0.2)',
    },
    /** Neutral colors */
    neutral: {
        main: '#9e9e9e',
        light: '#bdbdbd',
        dark: '#757575',
        bg: 'rgba(158, 158, 158, 0.1)',
    },
    /** Warning colors */
    warning: {
        main: '#ffa726',
        light: '#ffb74d',
        dark: '#f57c00',
        bg: 'rgba(255, 167, 38, 0.1)',
    },
} as const;

/**
 * Get color based on value direction (positive/negative/neutral).
 */
export function getDirectionColor(
    value: number,
    variant: 'main' | 'light' | 'dark' | 'bg' = 'main'
): string {
    if (value > 0) return TRADING_COLORS.positive[variant];
    if (value < 0) return TRADING_COLORS.negative[variant];
    return TRADING_COLORS.neutral[variant];
}

/**
 * Get color for buy/sell side.
 */
export function getSideColor(
    side: 'buy' | 'sell',
    variant: 'main' | 'light' | 'dark' | 'bg' = 'main'
): string {
    return side === 'buy'
        ? TRADING_COLORS.positive[variant]
        : TRADING_COLORS.negative[variant];
}

/**
 * Get color based on margin level.
 */
export function getMarginLevelColor(marginLevel: number): string {
    if (marginLevel >= 200) return TRADING_COLORS.positive.main;
    if (marginLevel >= 100) return TRADING_COLORS.warning.main;
    return TRADING_COLORS.negative.main;
}

/**
 * Get gradient for order book depth bar.
 */
export function getDepthGradient(
    side: 'bid' | 'ask',
    direction: 'left' | 'right' = 'right'
): string {
    const color = side === 'bid'
        ? TRADING_COLORS.positive.main
        : TRADING_COLORS.negative.main;

    if (direction === 'right') {
        return `linear-gradient(to right, transparent, ${color}40)`;
    }
    return `linear-gradient(to left, transparent, ${color}40)`;
}

/**
 * Get color for price tick direction.
 */
export function getTickColor(direction: 'up' | 'down' | 'unchanged'): string {
    switch (direction) {
        case 'up':
            return TRADING_COLORS.positive.main;
        case 'down':
            return TRADING_COLORS.negative.main;
        default:
            return TRADING_COLORS.neutral.main;
    }
}

/**
 * Candlestick colors.
 */
export const CANDLE_COLORS = {
    up: {
        body: TRADING_COLORS.positive.main,
        wick: TRADING_COLORS.positive.dark,
        border: TRADING_COLORS.positive.dark,
    },
    down: {
        body: TRADING_COLORS.negative.main,
        wick: TRADING_COLORS.negative.dark,
        border: TRADING_COLORS.negative.dark,
    },
} as const;
