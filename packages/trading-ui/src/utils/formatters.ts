/**
 * Formatting Utilities
 * 
 * Price, volume, and currency formatting functions.
 */

import type { InstrumentCategory } from '../types';

/**
 * Format a price with appropriate decimal places.
 */
export function formatPrice(
    price: number,
    decimals: number = 2,
    showSign: boolean = false
): string {
    const formatted = price.toFixed(decimals);
    if (showSign && price > 0) {
        return `+${formatted}`;
    }
    return formatted;
}

/**
 * Format a price change with sign and optional percentage.
 */
export function formatPriceChange(
    change: number,
    decimals: number = 2,
    asPercent: boolean = false
): string {
    const value = asPercent ? change : change;
    const formatted = Math.abs(value).toFixed(decimals);
    const sign = value >= 0 ? '+' : '-';
    const suffix = asPercent ? '%' : '';
    return `${sign}${formatted}${suffix}`;
}

/**
 * Format volume with K, M, B suffixes.
 */
export function formatVolume(volume: number): string {
    if (volume >= 1_000_000_000) {
        return `${(volume / 1_000_000_000).toFixed(2)}B`;
    }
    if (volume >= 1_000_000) {
        return `${(volume / 1_000_000).toFixed(2)}M`;
    }
    if (volume >= 1_000) {
        return `${(volume / 1_000).toFixed(2)}K`;
    }
    return volume.toFixed(2);
}

/**
 * Format currency value.
 */
export function formatCurrency(
    value: number,
    currency: string = 'USD',
    showSign: boolean = false
): string {
    const sign = showSign && value > 0 ? '+' : '';

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return sign + formatter.format(value);
}

/**
 * Format percentage.
 */
export function formatPercent(
    value: number,
    decimals: number = 2,
    showSign: boolean = true
): string {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format quantity based on instrument type.
 */
export function formatQuantity(
    quantity: number,
    category: InstrumentCategory
): string {
    switch (category) {
        case 'fx':
            // Lots for FX
            return quantity >= 1
                ? `${quantity.toFixed(2)} lots`
                : `${(quantity * 100000).toFixed(0)} units`;
        case 'crypto':
            return quantity.toFixed(8).replace(/\.?0+$/, '');
        case 'stocks':
            return quantity.toFixed(0);
        case 'commodities':
            return quantity.toFixed(2);
        default:
            return quantity.toFixed(4);
    }
}

/**
 * Format spread for display.
 */
export function formatSpread(
    spread: number,
    decimals: number = 5,
    category: InstrumentCategory = 'fx'
): string {
    if (category === 'fx') {
        // Convert to pips
        const pipValue = decimals === 5 || decimals === 3
            ? spread * 10000
            : spread * 100;
        return `${pipValue.toFixed(1)} pips`;
    }
    return spread.toFixed(decimals);
}

/**
 * Format margin level with color indicator.
 */
export function formatMarginLevel(marginLevel: number): {
    text: string;
    status: 'safe' | 'warning' | 'danger';
} {
    const text = `${marginLevel.toFixed(0)}%`;

    if (marginLevel >= 200) {
        return { text, status: 'safe' };
    }
    if (marginLevel >= 100) {
        return { text, status: 'warning' };
    }
    return { text, status: 'danger' };
}

/**
 * Format time duration.
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    if (seconds < 3600) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(timestamp: string | number): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) {
        return 'just now';
    }
    if (diffSeconds < 3600) {
        const mins = Math.floor(diffSeconds / 60);
        return `${mins}m ago`;
    }
    if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        return `${hours}h ago`;
    }
    const days = Math.floor(diffSeconds / 86400);
    return `${days}d ago`;
}
