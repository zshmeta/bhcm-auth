import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8081),
  REFRESH_CRON: z.string().default("*/5 * * * *"),
  OUTPUT_DIR: z.string().default("./data"),
  SNAPSHOT_FILENAME: z.string().default("prices.json"),
  CONCURRENCY: z.coerce.number().int().positive().default(6),
  RETRY_RETRIES: z.coerce.number().int().nonnegative().default(3),
  RETRY_FACTOR: z.coerce.number().positive().default(2),
  API_KEY: z.string().optional().or(z.literal("")).default(""),
  SYMBOLS_PATH: z.string().default("./config/symbols.json"),
  HISTORY_RETENTION_DAYS: z.coerce.number().int().nonnegative().default(7),
  HISTORY_MAX_FILES: z.coerce.number().int().nonnegative().default(2000),
  YF_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  CG_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  DATABASE_URL: z.string().default("postgres://user:password@localhost:5432/bhcmarkets"),
  LOG_LEVEL: z.string().default("info")
});

const cfg = schema.parse(process.env);

export const PORT = cfg.PORT;
export const REFRESH_CRON = cfg.REFRESH_CRON;
export const OUTPUT_DIR = cfg.OUTPUT_DIR;
export const SNAPSHOT_FILENAME = cfg.SNAPSHOT_FILENAME;
export const CONCURRENCY = cfg.CONCURRENCY;
export const RETRY_RETRIES = cfg.RETRY_RETRIES;
export const RETRY_FACTOR = cfg.RETRY_FACTOR;
export const API_KEY = cfg.API_KEY || "";
export const SYMBOLS_PATH = cfg.SYMBOLS_PATH;
export const HISTORY_RETENTION_DAYS = cfg.HISTORY_RETENTION_DAYS;
export const HISTORY_MAX_FILES = cfg.HISTORY_MAX_FILES;
export const YF_TIMEOUT_MS = cfg.YF_TIMEOUT_MS;
export const CG_TIMEOUT_MS = cfg.CG_TIMEOUT_MS;
export const REDIS_URL = cfg.REDIS_URL;
export const DATABASE_URL = cfg.DATABASE_URL;
export const LOG_LEVEL = cfg.LOG_LEVEL;