/**
 * Mock Symbols
 * 
 * Provides realistic mock instrument data for FX, Crypto, Stocks, and Commodities.
 */

import type {
    FxInstrument,
    CryptoInstrument,
    StockInstrument,
    CommodityInstrument,
    AnyInstrument,
    InstrumentCategory
} from '../types';

/** FX pairs with realistic properties */
export const FX_INSTRUMENTS: FxInstrument[] = [
    {
        symbol: 'EURUSD',
        name: 'Euro / US Dollar',
        category: 'fx',
        decimals: 5,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'EUR',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 0.8,
        pipSize: 0.0001,
        pipValue: 10,
    },
    {
        symbol: 'GBPUSD',
        name: 'British Pound / US Dollar',
        category: 'fx',
        decimals: 5,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'GBP',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 1.2,
        pipSize: 0.0001,
        pipValue: 10,
    },
    {
        symbol: 'USDJPY',
        name: 'US Dollar / Japanese Yen',
        category: 'fx',
        decimals: 3,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'USD',
        quoteCurrency: 'JPY',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 1.0,
        pipSize: 0.01,
        pipValue: 9.2,
    },
    {
        symbol: 'AUDUSD',
        name: 'Australian Dollar / US Dollar',
        category: 'fx',
        decimals: 5,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'AUD',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 1.0,
        pipSize: 0.0001,
        pipValue: 10,
    },
    {
        symbol: 'USDCAD',
        name: 'US Dollar / Canadian Dollar',
        category: 'fx',
        decimals: 5,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'USD',
        quoteCurrency: 'CAD',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 1.5,
        pipSize: 0.0001,
        pipValue: 7.4,
    },
    {
        symbol: 'EURGBP',
        name: 'Euro / British Pound',
        category: 'fx',
        decimals: 5,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'EUR',
        quoteCurrency: 'GBP',
        tradeable: true,
        maxLeverage: 100,
        typicalSpread: 1.2,
        pipSize: 0.0001,
        pipValue: 12.5,
    },
];

/** Crypto pairs with realistic properties */
export const CRYPTO_INSTRUMENTS: CryptoInstrument[] = [
    {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        category: 'crypto',
        decimals: 2,
        minQuantity: 0.001,
        quantityStep: 0.001,
        baseCurrency: 'BTC',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 20,
        typicalSpread: 15,
        is24h: true,
    },
    {
        symbol: 'ETHUSD',
        name: 'Ethereum / US Dollar',
        category: 'crypto',
        decimals: 2,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'ETH',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 20,
        typicalSpread: 2,
        is24h: true,
    },
    {
        symbol: 'XRPUSD',
        name: 'Ripple / US Dollar',
        category: 'crypto',
        decimals: 5,
        minQuantity: 10,
        quantityStep: 1,
        baseCurrency: 'XRP',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 10,
        typicalSpread: 0.001,
        is24h: true,
    },
    {
        symbol: 'SOLUSD',
        name: 'Solana / US Dollar',
        category: 'crypto',
        decimals: 2,
        minQuantity: 0.1,
        quantityStep: 0.1,
        baseCurrency: 'SOL',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 10,
        typicalSpread: 0.5,
        is24h: true,
    },
];

/** Stock instruments with realistic properties */
export const STOCK_INSTRUMENTS: StockInstrument[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        category: 'stocks',
        decimals: 2,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'AAPL',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 5,
        typicalSpread: 0.02,
        exchange: 'NASDAQ',
        marketHours: { open: '09:30', close: '16:00' },
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        category: 'stocks',
        decimals: 2,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'TSLA',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 5,
        typicalSpread: 0.05,
        exchange: 'NASDAQ',
        marketHours: { open: '09:30', close: '16:00' },
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        category: 'stocks',
        decimals: 2,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'GOOGL',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 5,
        typicalSpread: 0.10,
        exchange: 'NASDAQ',
        marketHours: { open: '09:30', close: '16:00' },
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        category: 'stocks',
        decimals: 2,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'MSFT',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 5,
        typicalSpread: 0.03,
        exchange: 'NASDAQ',
        marketHours: { open: '09:30', close: '16:00' },
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        category: 'stocks',
        decimals: 2,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'NVDA',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 5,
        typicalSpread: 0.10,
        exchange: 'NASDAQ',
        marketHours: { open: '09:30', close: '16:00' },
    },
];

/** Commodity instruments with realistic properties */
export const COMMODITY_INSTRUMENTS: CommodityInstrument[] = [
    {
        symbol: 'XAUUSD',
        name: 'Gold / US Dollar',
        category: 'commodities',
        decimals: 2,
        minQuantity: 0.01,
        quantityStep: 0.01,
        baseCurrency: 'XAU',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 50,
        typicalSpread: 0.30,
        unit: 'oz',
        contractSize: 100,
    },
    {
        symbol: 'XAGUSD',
        name: 'Silver / US Dollar',
        category: 'commodities',
        decimals: 3,
        minQuantity: 0.1,
        quantityStep: 0.1,
        baseCurrency: 'XAG',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 50,
        typicalSpread: 0.02,
        unit: 'oz',
        contractSize: 5000,
    },
    {
        symbol: 'XTIUSD',
        name: 'WTI Crude Oil',
        category: 'commodities',
        decimals: 2,
        minQuantity: 0.1,
        quantityStep: 0.1,
        baseCurrency: 'XTI',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 20,
        typicalSpread: 0.03,
        unit: 'barrel',
        contractSize: 1000,
    },
    {
        symbol: 'XNGUSD',
        name: 'Natural Gas',
        category: 'commodities',
        decimals: 3,
        minQuantity: 1,
        quantityStep: 1,
        baseCurrency: 'XNG',
        quoteCurrency: 'USD',
        tradeable: true,
        maxLeverage: 20,
        typicalSpread: 0.005,
        unit: 'mmBtu',
        contractSize: 10000,
    },
];

/** All instruments combined */
export const ALL_INSTRUMENTS: AnyInstrument[] = [
    ...FX_INSTRUMENTS,
    ...CRYPTO_INSTRUMENTS,
    ...STOCK_INSTRUMENTS,
    ...COMMODITY_INSTRUMENTS,
];

/** Get instruments by category */
export function getInstrumentsByCategory(category: InstrumentCategory): AnyInstrument[] {
    switch (category) {
        case 'fx': return FX_INSTRUMENTS;
        case 'crypto': return CRYPTO_INSTRUMENTS;
        case 'stocks': return STOCK_INSTRUMENTS;
        case 'commodities': return COMMODITY_INSTRUMENTS;
        default: return [];
    }
}

/** Get instrument by symbol */
export function getInstrumentBySymbol(symbol: string): AnyInstrument | undefined {
    return ALL_INSTRUMENTS.find(i => i.symbol === symbol);
}

/** Default starting prices for mock data */
export const INITIAL_PRICES: Record<string, number> = {
    // FX
    EURUSD: 1.08542,
    GBPUSD: 1.26834,
    USDJPY: 149.245,
    AUDUSD: 0.65423,
    USDCAD: 1.35678,
    EURGBP: 0.85612,
    // Crypto
    BTCUSD: 43250.00,
    ETHUSD: 2285.50,
    XRPUSD: 0.62345,
    SOLUSD: 98.45,
    // Stocks
    AAPL: 185.42,
    TSLA: 248.75,
    GOOGL: 141.23,
    MSFT: 378.91,
    NVDA: 495.22,
    // Commodities
    XAUUSD: 2035.50,
    XAGUSD: 23.145,
    XTIUSD: 78.42,
    XNGUSD: 2.845,
};

/** Volatility factors by symbol (for realistic price movement) */
export const VOLATILITY: Record<string, number> = {
    // FX (lower volatility)
    EURUSD: 0.0001,
    GBPUSD: 0.00012,
    USDJPY: 0.01,
    AUDUSD: 0.00015,
    USDCAD: 0.0001,
    EURGBP: 0.00008,
    // Crypto (higher volatility)
    BTCUSD: 50,
    ETHUSD: 5,
    XRPUSD: 0.005,
    SOLUSD: 1,
    // Stocks
    AAPL: 0.5,
    TSLA: 2,
    GOOGL: 0.8,
    MSFT: 1,
    NVDA: 3,
    // Commodities
    XAUUSD: 2,
    XAGUSD: 0.05,
    XTIUSD: 0.2,
    XNGUSD: 0.01,
};
