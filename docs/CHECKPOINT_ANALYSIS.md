# BHC Markets - Checkpoint Analysis & Roadmap

**Date:** January 2026
**Purpose:** Comprehensive codebase review to guide enterprise-grade development

---

## Executive Summary

BHC Markets has evolved from a boilerplate into a functional trading platform MVP. The foundation is solid in several areas (auth domain, database schema, UI library), but significant gaps exist in the trading core, real-time infrastructure, and cross-cutting concerns. This document maps what exists, what's incomplete, and provides a prioritized roadmap.

---

## 1. Current State Assessment

### ✅ **Well-Implemented (Production-Ready Foundations)**

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| **Auth Domain** | `packages/backend/src/domains/auth/` | 🟢 Mature | Clean layered architecture, typed errors, session management, token rotation |
| **Database Schema** | `packages/database/schema.ts` | 🟢 Solid | Comprehensive tables for users, accounts, orders, positions, ledger with proper indexes |
| **UI Component Library** | `packages/ui/src/components/` | 🟢 Extensive | 40+ components covering inputs, displays, feedback, controls |
| **Auth Frontend** | `apps/auth/` | 🟢 Good | Clean separation, proper API abstraction, type-safe |
| **Monorepo Structure** | Root config | 🟢 Good | Turborepo, shared packages, consistent tooling |
| **Type Definitions** | `packages/types/` | 🟢 Good | Shared trading/user types across packages |

### ⚠️ **Partially Implemented (Needs Completion)**

| Component | Location | Gap | Priority |
|-----------|----------|-----|----------|
| **Order Matching Engine** | `domains/order/matching-engine.ts` | Works but lacks persistence, no fee calculation, no trade recording | 🔴 Critical |
| **Position Service** | `domains/position/position.service.ts` | Basic upsert only, no PnL calculation, no entry price averaging | 🔴 Critical |
| **Risk Service** | `domains/risk/risk.service.ts` | Balance checks exist, but incomplete house exposure limits | 🟡 High |
| **Ledger Service** | `domains/ledger/ledger.service.ts` | Transfer works, but not integrated with order flow | 🟡 High |
| **Market Data Service** | `packages/backend/src/market-data/` | Fetcher exists, scheduler exists, but no real-time broadcast | 🟡 High |
| **Admin Dashboard** | `apps/admin/` | Basic user management UI, needs full admin capabilities | 🟠 Medium |
| **Platform App** | `apps/platform/` | Placeholder pages, no actual trading UI | 🟠 Medium |

### ❌ **Not Implemented (Empty or Stubs)**

| Component | Location | Impact |
|-----------|----------|--------|
| **Real-time Gateway** | `realtime/gateway.ts` | Empty - No WebSocket for live updates |
| **Price Broadcaster** | `realtime/priceBroadcaster.ts` | Empty - No live price feeds |
| **User Notifier** | `realtime/userNotifier.ts` | Empty - No order/trade notifications |
| **WebSocket Manager** | `apps/platform/src/services/ws/manager.ts` | Empty - Frontend can't receive real-time data |
| **Trade Service** | `domains/trade/trade.service.ts` | Interface only, no implementation |
| **Order Cancel** | `order.service.ts:cancel()` | `throw new Error("Method not implemented")` |
| **Account Routes** | N/A | No HTTP endpoints for deposits/withdrawals |
| **Admin Account Control** | N/A | No freeze/unfreeze, no balance adjustments |

---

## 2. Architecture Issues & Technical Debt

### 2.1 Inconsistent Domain Patterns

**Problem:** Auth domain is well-structured (barrel exports, repositories, typed errors). Other domains are ad-hoc.

```
# Auth (exemplary)
domains/auth/
  ├── core/           # Service, types, errors
  ├── repositories/   # Database access
  ├── security/       # Hashing, JWT
  ├── routes/         # HTTP handlers
  └── validators/     # Zod schemas

# Order (inconsistent)
domains/order/
  ├── order.service.ts      # Mixed concerns
  ├── orderController.ts    # Thin, good
  ├── orderHttpRoutes.ts    # Good
  └── matching-engine.ts    # In-memory only!
```

**Fix:** Refactor `order`, `position`, `account`, `ledger` domains to match auth's layered structure.

### 2.2 Matching Engine Has No Persistence

**Problem:** `OrderMatchingEngine` holds order book in memory. Server restart = lost state.

```typescript
// matching-engine.ts
private bids: EngineOrder[] = []; // Lost on restart!
private asks: EngineOrder[] = [];
```

**Fix:**
1. Store order book state in Redis for fast access + PostgreSQL for durability
2. On startup, reconstruct from `orders` table (partially done in `initialize()`)
3. Consider event sourcing for audit trail

### 2.3 Trade Recording Not Wired

**Problem:** Matching engine produces `Trade[]` but they're never persisted.

```typescript
// order.service.ts lines 83-96
for (const trade of result.trades) {
  // TODO: Update Position Logic
  // await this.positionService.updatePosition(...)
}
```

**Fix:** Complete the trade flow:
1. Insert into `trades` table
2. Update both maker/taker positions
3. Update ledger entries
4. Emit real-time notifications

### 2.4 No Transaction Boundaries for Order Execution

**Problem:** Order placement uses transaction for DB updates but matching + settlement is fragmented.

**Fix:** Wrap entire order lifecycle in a single transaction:
```typescript
await db.transaction(async (tx) => {
  // 1. Validate risk
  // 2. Lock funds
  // 3. Insert order
  // 4. Match (in-memory is fine, but results must be in tx)
  // 5. Record trades
  // 6. Update positions
  // 7. Settle funds via ledger
});
```

### 2.5 Real-time Infrastructure Missing

**Problem:** Files exist but are empty. No WebSocket server, no Socket.io setup despite dependency being installed.

**Current state:**
- `socket.io` in dependencies ✅
- `realtime/gateway.ts` is empty ❌
- `fastify-socket.io` imported but unused ❌

**Fix:** Implement:
1. Socket.io server in `gateway.ts`
2. Authenticated connections (verify JWT)
3. Price broadcast channel
4. User-specific notification channels

### 2.6 Backend Uses Both Native HTTP and Fastify

**Problem:** `server.ts` uses native `http.createServer` with custom router, but `market-data/` uses Fastify. Dependencies include both patterns.

**Recommendation:** Pick one. For enterprise-grade:
- Use **Fastify** everywhere (better middleware, validation, OpenAPI support)
- Or commit to native HTTP with proper middleware extraction

---

## 3. Critical Path to Enterprise-Grade

### Phase 1: Complete Trading Core (2-3 weeks)

**Goal:** Orders can be placed, matched, settled, and positions updated correctly.

| Task | Files to Modify | Complexity |
|------|-----------------|------------|
| 1.1 Trade persistence | `order.service.ts`, new `trade.repository.ts` | Medium |
| 1.2 Position updates with PnL | `position.service.ts` | Medium |
| 1.3 Ledger integration | `order.service.ts` calls `ledger.service.ts` | Medium |
| 1.4 Order cancel implementation | `order.service.ts:cancel()` | Low |
| 1.5 Transaction boundaries | Wrap order flow in single tx | High |
| 1.6 Risk validation on orders | Wire `risk.service.ts` into `orderController` | Medium |

### Phase 2: Real-time Infrastructure (1-2 weeks)

**Goal:** Live price updates and order notifications reach clients.

| Task | Files to Create/Modify |
|------|------------------------|
| 2.1 WebSocket gateway | `realtime/gateway.ts` |
| 2.2 JWT auth for sockets | `realtime/socketAuth.ts` |
| 2.3 Price broadcaster | `realtime/priceBroadcaster.ts` |
| 2.4 Trade/order notifier | `realtime/userNotifier.ts` |
| 2.5 Frontend WS client | `apps/platform/src/services/ws/` |

### Phase 3: Platform UI (2-3 weeks)

**Goal:** Functional trading dashboard.

| Task | Files |
|------|-------|
| 3.1 Order entry form | `apps/platform/src/features/trading/` |
| 3.2 Order book display | Real-time via WS |
| 3.3 Positions view | `features/positions/` |
| 3.4 Trade history | `features/trades/` |
| 3.5 Account balances | `features/account/` |

### Phase 4: Admin & Operations (1-2 weeks)

| Task | Location |
|------|----------|
| 4.1 User management (freeze/unfreeze) | `apps/admin/` + `domains/admin/` |
| 4.2 Manual balance adjustments | Admin routes |
| 4.3 System health dashboard | Admin |
| 4.4 Audit log viewer | Query `ledger_entries` |

### Phase 5: Hardening (Ongoing)

| Task | Notes |
|------|-------|
| 5.1 Rate limiting | Already have `@fastify/rate-limit` dep |
| 5.2 Request validation | Zod schemas exist in auth, replicate |
| 5.3 Error standardization | Adopt auth domain's `AuthError` pattern |
| 5.4 Integration tests | Expand `domains/tests/` |
| 5.5 Load testing | k6 or artillery |
| 5.6 Observability | Structured logging, metrics |

---

## 4. Specific Code Fixes Needed

### 4.1 Order Service - Complete Trade Recording

```typescript
// In order.service.ts, replace TODO blocks:
for (const trade of result.trades) {
  // 1. Record trade
  await tx.insert(trades).values({
    orderId: order.id,
    price: trade.price.toString(),
    quantity: trade.quantity.toString(),
    fee: '0', // Calculate fee
  });

  // 2. Update maker position
  await this.positionService.updatePosition(
    makerOrder.accountId,
    order.symbol,
    makerOrder.side === 'buy' ? 'sell' : 'buy', // Opposite side for maker fill
    trade.quantity,
    trade.price
  );

  // 3. Update taker position
  await this.positionService.updatePosition(
    account.id, // taker's account
    order.symbol,
    order.side,
    trade.quantity,
    trade.price
  );

  // 4. Settle funds via ledger
  // (debit buyer's USD, credit seller's USD, etc.)
}
```

### 4.2 Position Service - PnL Calculation

```typescript
// Add to position.service.ts
async calculateUnrealizedPnl(position: Position, currentPrice: number): Promise<string> {
  const qty = parseFloat(position.quantity);
  const entry = parseFloat(position.entryPrice || '0');
  const pnl = position.side === 'long'
    ? (currentPrice - entry) * qty
    : (entry - currentPrice) * qty;
  return pnl.toString();
}

// On each price update, recalculate and store
```

### 4.3 WebSocket Gateway Skeleton

```typescript
// realtime/gateway.ts
import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyAccessToken } from "../domains/auth/security/tokens.js";

export function createWebSocketGateway(httpServer: HttpServer, jwtSecret: string) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CORS_ORIGINS?.split(",") || "*" },
    transports: ["websocket"],
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("unauthorized"));
    try {
      const claims = await verifyAccessToken(token, jwtSecret);
      socket.data.userId = claims.sub;
      next();
    } catch {
      next(new Error("invalid_token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.data.userId}`);
    socket.on("subscribe:prices", (symbols: string[]) => {
      symbols.forEach(s => socket.join(`prices:${s}`));
    });
  });

  return io;
}
```

---

## 5. Configuration & Environment

### Missing from `.env.example`

Create `packages/backend/.env.example`:
```bash
# Database
DATABASE_URL=postgres://bhc:bhc@localhost:5432/bhc
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-256-bit-secret
ACCESS_TTL_SEC=900
REFRESH_TTL_SEC=2592000
BCRYPT_ROUNDS=12
MAX_SESSIONS_PER_USER=10

# Server
PORT=8080
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Market Data
YAHOO_FINANCE_API_KEY=optional
```

---

## 6. Testing Strategy

### Current Coverage
- `domains/tests/authService.test.ts` - Good unit tests with mocks
- `domains/tests/authController.test.ts` - Exists

### Needed
1. **Order flow integration test** - Place order → match → settle
2. **Position calculation tests** - PnL accuracy
3. **Ledger balance tests** - Double-entry correctness
4. **WebSocket connection tests** - Auth, subscription, broadcast

### Recommended Test Structure
```
packages/backend/src/
  domains/
    auth/
      __tests__/       # Co-located tests
        auth.service.test.ts
        auth.routes.test.ts
    order/
      __tests__/
        order.service.test.ts
        matching-engine.test.ts
```

---

## 7. Immediate Action Items

### This Week
1. [ ] Implement trade recording in `order.service.ts`
2. [ ] Add `cancel()` method to order service
3. [ ] Wire risk validation before order placement
4. [ ] Create WebSocket gateway skeleton

### Next Week
1. [ ] Complete position PnL calculation
2. [ ] Integrate ledger with order settlement
3. [ ] Build price broadcaster
4. [ ] Start platform trading UI

### This Month
1. [ ] Full order lifecycle working end-to-end
2. [ ] Real-time prices and notifications
3. [ ] Admin user management complete
4. [ ] Basic load testing

---

## 8. Decision Log

Document key decisions for future reference:

| Decision | Rationale | Date |
|----------|-----------|------|
| Native HTTP over Fastify for main server | Minimize dependencies, easier to understand | TBD |
| In-memory matching engine | Performance; persistence via DB | TBD |
| Separate auth app | Security boundary, SSO-ready | Already done |
| Drizzle ORM | Type-safe, lightweight | Already done |
| styled-components | Consistent with UI library | Already done |

---

## Appendix: File Reference

### Key Files to Understand

1. **Server bootstrap:** `packages/backend/src/server.ts`
2. **Auth service:** `packages/backend/src/domains/auth/core/auth.service.ts`
3. **Order flow:** `packages/backend/src/domains/order/order.service.ts`
4. **Database schema:** `packages/database/schema.ts`
5. **UI exports:** `packages/ui/src/components/index.ts`
6. **Auth frontend API:** `apps/auth/src/auth/auth.api.ts`

### Files Needing Immediate Attention

1. `packages/backend/src/realtime/` - All empty
2. `packages/backend/src/domains/order/order.service.ts` - TODOs
3. `packages/backend/src/domains/trade/trade.service.ts` - Interface only
4. `apps/platform/src/services/ws/manager.ts` - Empty
