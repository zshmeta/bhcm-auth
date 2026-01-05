/**
 * Instrument Types
 * 
 * Defines the trading instrument categories and their properties.
 */

/** Supported instrument categories */
export type InstrumentCategory = 'fx' | 'crypto' | 'stocks' | 'commodities';

/** Base instrument definition */
export interface Instrument {
    /** Unique symbol identifier (e.g., "EURUSD", "BTCUSD") */
    symbol: string;

    /** Human-readable name */
    name: string;

    /** Instrument category */
    category: InstrumentCategory;

    /** Number of decimal places for price display */
    decimals: number;

    /** Minimum tradeable quantity */
    minQuantity: number;

    /** Quantity step size */
    quantityStep: number;

    /** Base currency (e.g., "EUR" in EURUSD) */
    baseCurrency: string;

    /** Quote currency (e.g., "USD" in EURUSD) */
    quoteCurrency: string;

    /** Whether the instrument is currently tradeable */
    tradeable: boolean;

    /** Maximum leverage allowed */
    maxLeverage: number;

    /** Typical spread in pips/points */
    typicalSpread: number;
}

/** FX-specific instrument properties */
export interface FxInstrument extends Instrument {
    category: 'fx';
    /** Pip size (e.g., 0.0001 for majors, 0.01 for JPY pairs) */
    pipSize: number;
    /** Pip value per standard lot */
    pipValue: number;
}

/** Crypto-specific instrument properties */
export interface CryptoInstrument extends Instrument {
    category: 'crypto';
    /** Whether it trades 24/7 */
    is24h: boolean;
}

/** Stock-specific instrument properties */
export interface StockInstrument extends Instrument {
    category: 'stocks';
    /** Exchange where the stock is traded */
    exchange: string;
    /** Market session times */
    marketHours: {
        open: string;  // HH:mm in exchange timezone
        close: string;
    };
}

/** Commodity-specific instrument properties */
export interface CommodityInstrument extends Instrument {
    category: 'commodities';
    /** Unit of measurement (oz, barrel, etc.) */
    unit: string;
    /** Contract size */
    contractSize: number;
}

/** Union type for all instrument types */
export type AnyInstrument = FxInstrument | CryptoInstrument | StockInstrument | CommodityInstrument;

/** Symbol group for watchlist organization */
export interface SymbolGroup {
    id: string;
    name: string;
    category: InstrumentCategory;
    symbols: string[];
}
