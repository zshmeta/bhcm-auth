import { pgTable, uuid, varchar, numeric, timestamp, text, integer, boolean, jsonb, pgEnum, index, uniqueIndex, bigserial, date } from 'drizzle-orm/pg-core';

// Enums
export const userStatusEnum = pgEnum('user_status', ['active', 'pending', 'suspended', 'deleted']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'support']);
export const sessionStatusEnum = pgEnum('session_status', ['active', 'revoked', 'expired', 'replaced']);
export const sessionInvalidationReasonEnum = pgEnum('session_invalidation_reason', [
  'manual',
  'password_rotated',
  'refresh_rotated',
  'session_limit',
  'suspicious_activity',
  'user_disabled',
  'logout_all',
  'expired'
]);
export const accountTypeEnum = pgEnum('account_type', ['spot', 'margin', 'futures', 'demo']);
export const accountStatusEnum = pgEnum('account_status', ['active', 'locked', 'closed']);
export const orderSideEnum = pgEnum('order_side', ['buy', 'sell']);
export const orderTypeEnum = pgEnum('order_type', ['market', 'limit', 'stop', 'take_profit']);
export const orderStatusEnum = pgEnum('order_status', ['new', 'partially_filled', 'filled', 'cancelled', 'rejected']);

// Users
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    status: userStatusEnum('status').default('pending').notNull(),
    role: userRoleEnum('role').default('user').notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User Credentials (password storage and lockout tracking)
export const userCredentials = pgTable('user_credentials', {
    userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    passwordHash: text('password_hash').notNull(),
    version: integer('version').notNull().default(1),
    failedAttemptCount: integer('failed_attempt_count').notNull().default(0),
    lockedUntil: timestamp('locked_until', { withTimezone: true }),
    passwordUpdatedAt: timestamp('password_updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Auth Sessions (refresh token and session state management)
export const authSessions = pgTable('auth_sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    refreshTokenHash: text('refresh_token_hash').notNull(),
    refreshTokenVersion: integer('refresh_token_version').notNull().default(1),
    passwordVersion: integer('password_version').notNull().default(1),
    status: sessionStatusEnum('status').notNull().default('active'),
    userAgent: text('user_agent'),
    ipAddress: varchar('ip_address', { length: 45 }), // INET in Postgres, varchar for IP storage
    deviceFingerprint: text('device_fingerprint'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedReason: sessionInvalidationReasonEnum('revoked_reason'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index('idx_auth_sessions_user').on(table.userId),
        statusExpiresIdx: index('idx_auth_sessions_status_expires').on(table.status, table.expiresAt),
        refreshTokenHashIdx: uniqueIndex('uq_auth_sessions_refresh_token_hash').on(table.refreshTokenHash),
    };
});

// Accounts
export const accounts = pgTable('accounts', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull(),
    balance: numeric('balance', { precision: 30, scale: 10 }).default('0').notNull(),
    locked: numeric('locked', { precision: 30, scale: 10 }).default('0').notNull(),
    accountType: accountTypeEnum('account_type').default('spot').notNull(),
    status: accountStatusEnum('status').default('active').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index('idx_accounts_user').on(table.userId),
    };
});

// Orders
export const orders = pgTable('orders', {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
    symbol: varchar('symbol', { length: 64 }).notNull(),
    side: orderSideEnum('side').notNull(),
    type: orderTypeEnum('type').notNull(),
    price: numeric('price', { precision: 30, scale: 10 }),
    quantity: numeric('quantity', { precision: 30, scale: 10 }).notNull(),
    filledQuantity: numeric('filled_quantity', { precision: 30, scale: 10 }).default('0').notNull(),
    status: orderStatusEnum('status').default('new').notNull(),
    timeInForce: varchar('time_in_force', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        accountIdIdx: index('idx_orders_account').on(table.accountId),
        symbolIdx: index('idx_orders_symbol').on(table.symbol),
        statusIdx: index('idx_orders_status').on(table.status),
    };
});

// Positions
export const positions = pgTable('positions', {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
    symbol: varchar('symbol', { length: 64 }).notNull(),
    side: varchar('side', { length: 10 }).notNull(), // 'long' or 'short' usually, but schema said varchar
    quantity: numeric('quantity', { precision: 30, scale: 10 }).default('0').notNull(),
    entryPrice: numeric('entry_price', { precision: 30, scale: 10 }),
    unrealizedPnl: numeric('unrealized_pnl', { precision: 30, scale: 10 }).default('0'),
    realizedPnl: numeric('realized_pnl', { precision: 30, scale: 10 }).default('0'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        accountSymbolIdx: uniqueIndex('uq_positions_account_symbol').on(table.accountId, table.symbol),
    };
});

// Trades
export const trades = pgTable('trades', {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    price: numeric('price', { precision: 30, scale: 10 }).notNull(),
    quantity: numeric('quantity', { precision: 30, scale: 10 }).notNull(),
    fee: numeric('fee', { precision: 30, scale: 10 }).default('0').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        orderIdIdx: index('idx_trades_order').on(table.orderId),
    };
});

// Market Prices (for completeness with existing migration)
export const marketPrices = pgTable('market_prices', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    symbol: varchar('symbol', { length: 32 }).notNull(),
    price: numeric('price', { precision: 30, scale: 10 }).notNull(),
    currency: varchar('currency', { length: 10 }),
    source: varchar('source', { length: 32 }),
    timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb('metadata'),
}, (table) => {
    return {
        symbolTimeIdx: index('idx_market_prices_symbol_time').on(table.symbol, table.timestamp),
    };
});

// Ledger Entries
export const ledgerEntries = pgTable('ledger_entries', {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: uuid('account_id').references(() => accounts.id, { onDelete: 'cascade' }).notNull(),
    amount: numeric('amount', { precision: 30, scale: 10 }).notNull(),
    balanceAfter: numeric('balance_after', { precision: 30, scale: 10 }),
    referenceId: uuid('reference_id'),
    referenceType: varchar('reference_type', { length: 32 }),
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        accountIdx: index('idx_ledger_account').on(table.accountId),
        refIdx: index('idx_ledger_ref').on(table.referenceId),
    };
});
