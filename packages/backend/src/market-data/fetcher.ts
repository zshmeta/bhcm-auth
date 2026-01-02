/**
 * Fetcher module.
 * - Uses yahoo-finance2 for tickers (indices, stocks, commodities & FX)
 * - Uses CoinGecko for crypto as high-quality free source
 * - Respects concurrency, retries, and timeouts
 * - Loads symbols from JSON file if available, with sane defaults fallback
 */

import yf from "yahoo-finance2";
import axios from "axios";
import pLimit from "p-limit";
import pRetry from "p-retry";
import pTimeout from "p-timeout";
import { promises as fs } from "fs";
import { CONCURRENCY, RETRY_RETRIES, RETRY_FACTOR, SYMBOLS_PATH, YF_TIMEOUT_MS, CG_TIMEOUT_MS } from "./config.js";
import { logger } from "./logger.js";

const limit = pLimit(CONCURRENCY);

export type Category = "indices" | "stocks" | "fx" | "cryptocurrencies" | "commodities";

export interface AssetDefinition {
  category: Category;
  symbol: string; // Yahoo style e.g. ^GSPC, MSFT, EURUSD=X, BTC-USD, GC=F
  name?: string;
}

// Built-in defaults (used if symbols file is missing or invalid)
const DEFAULT_SYMBOLS: AssetDefinition[] = [
  // indices
  { category: "indices", symbol: "^GSPC", name: "S&P 500" },
  { category: "indices", symbol: "^IXIC", name: "NASDAQ Composite" },
  { category: "indices", symbol: "^DJI", name: "Dow Jones" },
  { category: "indices", symbol: "^AXJO", name: "S&P/ASX 200" },
  { category: "indices", symbol: "^FTSE", name: "FTSE 100" },
  { category: "indices", symbol: "^GDAXI", name: "DAX" },
  { category: "indices", symbol: "^FCHI", name: "CAC 40" },
  { category: "indices", symbol: "^N225", name: "Nikkei 225" },
  { category: "indices", symbol: "^HSI", name: "Hang Seng" },
  { category: "indices", symbol: "000001.SS", name: "Shanghai Composite" },

  // FX majors
  { category: "fx", symbol: "EURUSD=X", name: "EUR/USD" },
  { category: "fx", symbol: "USDJPY=X", name: "USD/JPY" },
  { category: "fx", symbol: "GBPUSD=X", name: "GBP/USD" },
  { category: "fx", symbol: "USDCHF=X", name: "USD/CHF" },
  { category: "fx", symbol: "AUDUSD=X", name: "AUD/USD" },
  { category: "fx", symbol: "USDCAD=X", name: "USD/CAD" },
  { category: "fx", symbol: "NZDUSD=X", name: "NZD/USD" },
  { category: "fx", symbol: "EURGBP=X", name: "EUR/GBP" },
  { category: "fx", symbol: "EURJPY=X", name: "EUR/JPY" },
  { category: "fx", symbol: "GBPJPY=X", name: "GBP/JPY" },
  { category: "fx", symbol: "EURCHF=X", name: "EUR/CHF" },
  { category: "fx", symbol: "AUDJPY=X", name: "AUD/JPY" },
  { category: "fx", symbol: "USDHKD=X", name: "USD/HKD" },

  // Commodities (Yahoo futures)
  { category: "commodities", symbol: "GC=F", name: "Gold" },
  { category: "commodities", symbol: "CL=F", name: "Crude Oil WTI" },
  { category: "commodities", symbol: "SI=F", name: "Silver" },
  { category: "commodities", symbol: "BZ=F", name: "Brent" },
  { category: "commodities", symbol: "NG=F", name: "Natural Gas" },

  // Stocks
  { category: "stocks", symbol: "MSFT", name: "Microsoft" },
  { category: "stocks", symbol: "AAPL", name: "Apple" },
  { category: "stocks", symbol: "NVDA", name: "NVIDIA" },
  { category: "stocks", symbol: "AMZN", name: "Amazon" },

  // Crypto (CoinGecko preferred, Yahoo fallback)
  { category: "cryptocurrencies", symbol: "BTC-USD", name: "Bitcoin" },
  { category: "cryptocurrencies", symbol: "ETH-USD", name: "Ethereum" },
  { category: "cryptocurrencies", symbol: "SOL-USD", name: "Solana" },
  { category: "cryptocurrencies", symbol: "XRP-USD", name: "XRP" }
];

let SYMBOLS_CACHE: AssetDefinition[] | null = null;

async function loadSymbolsFromFile(): Promise<AssetDefinition[] | null> {
  try {
    const raw = await fs.readFile(SYMBOLS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // basic shape check
      return parsed.filter(
        (x) => x && typeof x.symbol === "string" && typeof x.category === "string"
      ) as AssetDefinition[];
    }
    logger.warn({ path: SYMBOLS_PATH }, "Symbols file is not an array; using defaults");
    return null;
  } catch (err) {
    logger.warn({ err, path: SYMBOLS_PATH }, "Failed to load symbols file; using defaults");
    return null;
  }
}

/** Load symbols once per process; prefer file over defaults */
async function loadSymbols(): Promise<AssetDefinition[]> {
  if (SYMBOLS_CACHE) return SYMBOLS_CACHE;
  const fileSymbols = await loadSymbolsFromFile();
  SYMBOLS_CACHE = fileSymbols?.length ? fileSymbols : DEFAULT_SYMBOLS;
  logger.info({ count: SYMBOLS_CACHE.length, fromFile: !!fileSymbols?.length }, "Loaded symbols");
  return SYMBOLS_CACHE;
}

export async function getSymbolsList(): Promise<AssetDefinition[]> {
  return loadSymbols();
}

async function fetchYahooSymbol(symbol: string) {
  // Wrap yahoo-finance2 call in timeout and retries
  return await pRetry(
    async () => {
      const task = async () => {
        const q = await yf.quoteSummary(symbol, { modules: ["price"] });
        const price = (q as any).price || {};
        return {
          symbol,
          price: price.regularMarketPrice ?? null,
          change: price.regularMarketChange ?? null,
          changePercent: price.regularMarketChangePercent ?? null,
          currency: price.currency ?? null,
          marketState: price.marketState ?? null,
          exchangeName: price.exchangeName ?? null,
          timestamp: price.regularMarketTime ?? null
        };
      };
      // Enforce timeout per request
      return pTimeout(task(), {
        milliseconds: YF_TIMEOUT_MS,
        message: `Yahoo request timed out after ${YF_TIMEOUT_MS}ms`
      });
    },
    {
      retries: RETRY_RETRIES,
      factor: RETRY_FACTOR,
      onFailedAttempt: (err) => {
        logger.warn({ symbol, attempt: err.attemptNumber, retriesLeft: err.retriesLeft }, "Yahoo fetch failed, retrying");
      }
    }
  );
}

async function fetchCoingeckoMarkets(ids: string[]) {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
    ids.join(",")
  )}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
  const resp = await axios.get(url, { timeout: CG_TIMEOUT_MS });
  return resp.data;
}

const CG_SYMBOL_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple"
};

export async function fetchAll(): Promise<Record<Category, Record<string, any>>> {
  const out: Record<Category, Record<string, any>> = {
    indices: {},
    stocks: {},
    fx: {},
    cryptocurrencies: {},
    commodities: {}
  };

  const symbols = await loadSymbols();

  // Prepare groups
  const byCategory: Record<Category, AssetDefinition[]> = {
    indices: [],
    stocks: [],
    fx: [],
    cryptocurrencies: [],
    commodities: []
  };

  symbols.forEach((s) => {
    byCategory[s.category].push(s);
  });

  // Fetch Yahoo-managed categories concurrently with p-limit
  const yahooCategories: (keyof typeof byCategory)[] = ["indices", "stocks", "fx", "commodities"];
  for (const cat of yahooCategories) {
    const tasks = byCategory[cat].map((asset) =>
      limit(async () => {
        try {
          const data = await fetchYahooSymbol(asset.symbol);
          out[cat][asset.symbol] = { ...data, name: asset.name, source: "yahoo" };
        } catch (err) {
          logger.error({ err, symbol: asset.symbol }, "Failed to fetch symbol from Yahoo");
          out[cat][asset.symbol] = { symbol: asset.symbol, error: String(err) };
        }
      })
    );
    await Promise.all(tasks);
  }

  // Crypto: use CoinGecko for market data (more metadata), Yahoo fallback
  const cryptoDefs = byCategory.cryptocurrencies;
  if (cryptoDefs.length > 0) {
    const ids = cryptoDefs
      .map((d) => {
        const sym = d.symbol.split("-")[0]!.replace(/-USD$/i, "").toUpperCase();
        return CG_SYMBOL_MAP[sym];
      })
      .filter(Boolean) as string[];

    if (ids.length > 0) {
      try {
        const markets = await pRetry(() => fetchCoingeckoMarkets(ids), {
          retries: RETRY_RETRIES,
          factor: RETRY_FACTOR
        });
        for (const def of cryptoDefs) {
          const symKey = def.symbol.split("-")[0]!.replace(/-USD$/i, "").toUpperCase();
          const id = CG_SYMBOL_MAP[symKey];
          const market = markets.find((m: any) => m.id === id);
          if (market) {
            out.cryptocurrencies[def.symbol] = {
              symbol: def.symbol,
              name: def.name,
              price: market.current_price,
              market_cap: market.market_cap,
              change24h: market.price_change_percentage_24h,
              volume: market.total_volume,
              source: "coingecko",
              raw: market
            };
          } else {
            try {
              const y = await fetchYahooSymbol(def.symbol);
              out.cryptocurrencies[def.symbol] = { ...y, name: def.name, source: "yahoo" };
            } catch (err) {
              out.cryptocurrencies[def.symbol] = { symbol: def.symbol, error: String(err) };
            }
          }
        }
      } catch (err) {
        logger.error({ err }, "CoinGecko fetch failed — falling back to Yahoo for cryptos");
        for (const def of cryptoDefs) {
          try {
            const y = await fetchYahooSymbol(def.symbol);
            out.cryptocurrencies[def.symbol] = { ...y, name: def.name, source: "yahoo" };
          } catch (err2) {
            out.cryptocurrencies[def.symbol] = { symbol: def.symbol, error: String(err2) };
          }
        }
      }
    }
  }

  return out;
}