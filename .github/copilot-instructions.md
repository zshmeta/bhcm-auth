# BHC Markets - AI Agent Instructions

## Project Overview

**BHC Markets** is a multi-app trading platform monorepo using Turborepo:

| App/Package             | Purpose                                 | Status                     |
| ----------------------- | --------------------------------------- | -------------------------- |
| `apps/auth`             | Identity flows (login, register, MFA)   | ✅ Mature                  |
| `apps/platform`         | Trading dashboard                       | 🚧 Placeholder UI          |
| `apps/admin`            | Admin panel                             | 🚧 Basic                   |
| `apps/mobile`           | Expo mobile app                         | 🚧 Basic                   |
| `apps/web`              | Marketing site                          | 🚧 Stub                    |
| `packages/backend`      | Node.js API (native HTTP router)        | ⚠️ Trading core incomplete |
| `packages/database`     | Drizzle ORM + PostgreSQL                | ✅ Solid                   |
| `packages/ui`           | styled-components library (`@repo/ui`)  | ✅ 40+ components          |
| `packages/types`        | Shared TypeScript types (`@repo/types`) | ✅ Good                    |
| `packages/market-maker` | Liquidity simulation bot                | ✅ Working                 |

## Architecture Principles

### Domain-Driven Backend

Backend domains in `packages/backend/src/domains/`:

```
auth/       # ✅ Mature: layered (core/, repositories/, security/, routes/, validators/)
order/      # ⚠️ Matching engine works, trade recording incomplete
position/   # ⚠️ Basic upsert, no PnL calculation
account/    # ⚠️ Balance ops exist, no HTTP routes
ledger/     # ⚠️ Transfer works, not wired to orders
risk/       # ⚠️ Balance checks only
admin/      # 🚧 User management routes
trade/      # ❌ Interface only, no implementation
```

**Pattern to follow:** Auth domain is the reference architecture. Other domains should match:

- `core/`: Services, types, errors (no HTTP dependencies)
- `repositories/`: Database access
- `routes/`: HTTP handlers + validators
- Barrel export via `index.ts`

### Known Incomplete Areas

1. **Trade recording**: `order.service.ts` has TODOs—trades from matching engine aren't persisted
2. **Real-time**: `realtime/gateway.ts`, `priceBroadcaster.ts`, `userNotifier.ts` are empty
3. **Order cancel**: `order.service.ts:cancel()` throws "not implemented"
4. **Frontend WS**: `apps/platform/src/services/ws/manager.ts` is empty

### Frontend App Boundaries

- **`apps/auth`**: Identity flows ONLY. Never add trading features.
- **`apps/platform`**: All business features (trading, portfolio, workspace).
- UI from `@repo/ui` only—never duplicate components.

## Key Commands

```bash
# Development
npm run dev                     # All apps in watch mode
npm run build && npm run check-types  # Verify before commit

# Database
npm run db:start                # Docker: PostgreSQL + Redis
npm run db:migrate              # Run Drizzle migrations
npx drizzle-kit generate        # Generate new migration (from packages/database)

# Backend (from packages/backend)
npm run seed:admin              # Create admin user
npm run seed:mm                 # Create market-maker account

# Testing
npm run test                    # Vitest (not auto-run on commit)
```

## Database

- Schema: `packages/database/schema.ts`
- Key tables: `users`, `user_credentials`, `auth_sessions`, `accounts`, `orders`, `positions`, `trades`, `ledger_entries`, `market_prices`
- All monetary values use `numeric(30,10)` stored as strings

## Code Patterns

### Error Handling (Auth Domain Pattern)

```typescript
// Define typed errors in core/
export class AuthError extends Error {
  constructor(public code: AuthErrorCode) {
    super(code);
  }
}

// Map to HTTP in routes/
if (err instanceof AuthError) {
  return { status: AUTH_ERROR_HTTP_STATUS[err.code], body: { error: err.code } };
}
```

### Route Registration

```typescript
// packages/backend/src/api/index.ts
registerAuthRoutes(router, { auth: services.auth }, logger);
registerOrderHttpRoutes(router, services, logger);
```

### Service Wiring

Services are manually wired in `packages/backend/src/server.ts`—no DI framework. Follow the existing pattern when adding new services.

## Shared UI (`packages/ui`)

Check `packages/ui/src/components/index.ts` before creating new UI. Available:

- **Inputs**: `EmailInput`, `PasswordInput`, `PhoneInput`, `NumInput`, `OTPInput`, `DatePicker`, `SearchInput`, `TextArea`
- **Display**: `Card`, `Text`, `Skeleton`, `Table`, `Accordion`, `Avatar`, `Badge`, `StatCard`, `EmptyState`
- **Feedback**: `Modal`, `Toast`, `Notification`, `Alert`, `Loader`, `Progress`, `Tooltip`, `Sheet`
- **Controls**: `Button`, `Checkbox`, `Radio`, `Toggle`, `Dropdown`, `Select`, `Picker`

## Security

- Passwords: bcrypt (configurable rounds via `BCRYPT_ROUNDS`)
- Tokens: JWT with rotation; refresh tokens hashed in `auth_sessions`
- Never log: passwords, tokens, secrets
- Sessions: max per user enforced, invalidation on password change

## Environment Variables

Required in `packages/backend/.env`:

```
DATABASE_URL=postgres://bhc:bhc@localhost:5432/bhc
JWT_SECRET=<256-bit-secret>
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Optional: `REDIS_URL`, `ACCESS_TTL_SEC`, `REFRESH_TTL_SEC`, `BCRYPT_ROUNDS`, `MAX_SESSIONS_PER_USER`

---

📋 **See `docs/CHECKPOINT_ANALYSIS.md` for full architecture review and roadmap.**

📁 **See `.github/instructions/` for domain-specific rules (auth-backend, auth-frontend, auth-ui-kit).**
