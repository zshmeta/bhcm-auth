/*
	HTTP API composition layer
	- Define route registrars per domain (auth, accounts, orders, etc.)
	- Keep controllers thin: validate -> call service -> map result
	- Used by the Node HTTP server today; can be adapted to Fastify later.
*/

import type { Router } from "./types.js";
import type { TokenManager, UserSessionRepository, AuthService } from "../domains/auth/index.js";
import type { AccountService } from "../domains/account/account.service.js";
import type { OrderService } from "../domains/order/order.service.js";
import type { PositionService } from "../domains/position/position.service.js";
import { registerAuthRoutes } from "../domains/auth/index.js";
import { registerPositionRoutes } from "../domains/position/positionRoutes.js";
import { registerOrderHttpRoutes } from "../domains/order/orderHttpRoutes.js";
import { registerAdminRoutes } from "../domains/admin/adminRoutes.js";

export type ApiServices = {
	auth: AuthService;
	tokenManager: TokenManager;
	sessionRepository: UserSessionRepository;
	account: AccountService;
	order: OrderService;
	position: PositionService;
};

type LoggerLike = {
	error: (msg: string, meta?: Record<string, unknown>) => void;
};

export function registerApiRoutes(router: Router, services: ApiServices, logger: LoggerLike) {
	// Health & readiness
	router.route("GET", "/healthz", async () => ({ status: 200, body: { status: "ok" } }));
	router.route("GET", "/readyz", async () => ({ status: 200, body: { status: "ready" } }));

	// Auth routes live in the auth domain module.
	registerAuthRoutes(router, { auth: services.auth }, logger);

	// Domain-owned routes (enterprise boundary)
	registerPositionRoutes(router, services);
	registerOrderHttpRoutes(router, services, logger);
	registerAdminRoutes(router, services, logger);
}

