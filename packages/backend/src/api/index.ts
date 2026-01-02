/*
	HTTP API composition layer
	- Define route registrars per domain (auth, accounts, orders, etc.)
	- Keep controllers thin: validate -> call service -> map result
	- Used by the Node HTTP server today; can be adapted to Fastify later.
*/

import type { Router } from "./types.js";
import type { AuthError, AuthService } from "../domains/auth/authService.js";
import type { SessionInvalidationReason } from "../domains/auth/auth.types.js";
import type { TokenManager } from "../security/tokens.js";
import type { UserSessionRepository } from "../domains/auth/auth.types.js";
import type { AccountService } from "../domains/account/account.service.js";
import type { OrderService } from "../domains/order/order.service.js";
import type { PositionService } from "../domains/position/position.service.js";
import { createLoginController } from "../domains/auth/authController.js";
import { OrderSide, OrderType } from "../domains/order/order.types.js";

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

const mapAuthErrorToStatus = (code: AuthError["code"]): number => {
	switch (code) {
		case "EMAIL_ALREADY_REGISTERED":
			return 409;
		case "INVALID_CREDENTIALS":
		case "PASSWORD_MISMATCH":
		case "REFRESH_TOKEN_INVALID":
		case "REFRESH_TOKEN_REUSED":
		case "REFRESH_TOKEN_EXPIRED":
			return 401;
		case "USER_NOT_ACTIVE":
		case "USER_SUSPENDED":
			return 403;
		case "SESSION_NOT_FOUND":
			return 404;
		case "SESSION_REVOKED":
		case "SESSION_EXPIRED":
		case "UNKNOWN_USER":
			return 401;
		default:
			return 400;
	}
};

const isAuthError = (err: unknown): err is AuthError => {
	return typeof err === "object" && err !== null && (err as any).name === "AuthError" && typeof (err as any).code === "string";
};

const getAuthUser = async (req: import("./types.js").HttpRequest, services: Pick<ApiServices, "tokenManager" | "sessionRepository">) => {
	const authHeader = req.headers["authorization"];
	if (!authHeader?.startsWith("Bearer ")) return null;
	const parts = authHeader.split(" ");
	if (parts.length !== 2) return null;
	const token = parts[1];
	if (!token) return null;

	const claims = await services.tokenManager.parseAccessToken(token);
	if (!claims) return null;

	const session = await services.sessionRepository.getById(claims.sessionId);
	if (!session) return null;

	const now = new Date();
	if (new Date(session.expiresAt) <= now) {
		await services.sessionRepository.markInactive(session.id, "expired", now.toISOString());
		return null;
	}
	if (session.status !== "active") return null;
	if (session.refreshTokenVersion !== claims.version) return null;
	if (session.userId !== claims.sub) return null;

	const userAgent = req.headers["user-agent"];
	await services.sessionRepository.touch(session.id, {
		lastSeenAt: now.toISOString(),
		ipAddress: req.ipAddress,
		userAgent,
	});

	return claims;
};

export function registerApiRoutes(router: Router, services: ApiServices, logger: LoggerLike) {
	// Health & readiness
	router.route("GET", "/healthz", async () => ({ status: 200, body: { status: "ok" } }));
	router.route("GET", "/readyz", async () => ({ status: 200, body: { status: "ready" } }));

	// Auth routes
	router.route("POST", "/auth/register", async (req) => {
		const body = req.body as { email?: string; password?: string } | null;
		if (!body?.email || !body?.password) return { status: 400, body: { error: "invalid_body" } };
		try {
			const result = await services.auth.register({ email: body.email, password: body.password });
			return { status: 200, body: result };
		} catch (e) {
			if (isAuthError(e)) return { status: mapAuthErrorToStatus(e.code), body: { error: e.code } };
			logger.error("auth_register_error", { err: String(e) });
			return { status: 500, body: { error: "internal_error" } };
		}
	});

	router.route("POST", "/auth/login", createLoginController(services.auth));

	router.route("POST", "/auth/refresh", async (req) => {
		const body = req.body as { refreshToken?: string } | null;
		if (!body?.refreshToken) return { status: 400, body: { error: "invalid_body" } };
		try {
			const result = await services.auth.refreshSession({ refreshToken: body.refreshToken });
			return { status: 200, body: result };
		} catch (e) {
			if (isAuthError(e)) return { status: mapAuthErrorToStatus(e.code), body: { error: e.code } };
			logger.error("auth_refresh_error", { err: String(e) });
			return { status: 500, body: { error: "internal_error" } };
		}
	});

	router.route("POST", "/auth/logout", async (req) => {
		const body = req.body as { sessionId?: string; userId?: string; reason?: string } | null;
		if (!body?.sessionId) return { status: 400, body: { error: "invalid_body" } };
		try {
			await services.auth.logout({
				sessionId: body.sessionId,
				userId: body.userId,
				reason: body.reason as SessionInvalidationReason | undefined,
			});
			return { status: 204 };
		} catch (e) {
			if (isAuthError(e)) return { status: mapAuthErrorToStatus(e.code), body: { error: e.code } };
			logger.error("auth_logout_error", { err: String(e) });
			return { status: 500, body: { error: "internal_error" } };
		}
	});

	router.route("POST", "/auth/logout-all", async (req) => {
		const body = req.body as { userId?: string; excludeSessionId?: string; reason?: string } | null;
		if (!body?.userId) return { status: 400, body: { error: "invalid_body" } };
		try {
			await services.auth.logoutAll({
				userId: body.userId,
				excludeSessionId: body.excludeSessionId,
				reason: body.reason as SessionInvalidationReason | undefined,
			});
			return { status: 204 };
		} catch (e) {
			if (isAuthError(e)) return { status: mapAuthErrorToStatus(e.code), body: { error: e.code } };
			logger.error("auth_logout_all_error", { err: String(e) });
			return { status: 500, body: { error: "internal_error" } };
		}
	});

	router.route("GET", "/auth/sessions", async (req) => {
		const userId = req.query["userId"];
		if (!userId) return { status: 400, body: { error: "user_id_required" } };
		const sessions = await services.auth.listActiveSessions(userId);
		return { status: 200, body: { sessions } };
	});

	// Positions
	router.route("GET", "/positions", async (req) => {
		const auth = await getAuthUser(req, services);
		if (!auth) return { status: 401, body: { error: "unauthorized" } };

		const userId = req.query["userId"];
		if (!userId) return { status: 400, body: { error: "user_id_required" } };
		if (auth.sub !== userId && auth.role !== "admin") return { status: 403, body: { error: "forbidden" } };

		const positions = await services.position.getPositions(userId);
		return { status: 200, body: positions };
	});

	// Orders
	router.route("POST", "/orders", async (req) => {
		const auth = await getAuthUser(req, services);
		if (!auth) return { status: 401, body: { error: "unauthorized" } };

		const body = req.body as { userId?: string; symbol?: string; side?: string; type?: string; quantity?: number; price?: number } | null;
		if (!body?.userId || !body?.symbol || !body?.quantity) return { status: 400, body: { error: "invalid_body" } };
		if (auth.sub !== body.userId) return { status: 403, body: { error: "forbidden" } };

		const account = await services.account.getAccount(body.userId);
		if (!account) return { status: 404, body: { error: "account_not_found" } };

		const result = await services.order.place({
			accountId: account.id,
			symbol: body.symbol,
			side: body.side as OrderSide,
			type: body.type as OrderType,
			quantity: body.quantity.toString(),
			price: body.price?.toString(),
		});
		return { status: 200, body: result };
	});

	// Admin
	router.route("GET", "/admin/users", async (req) => {
		const auth = await getAuthUser(req, services);
		if (!auth) return { status: 401, body: { error: "unauthorized" } };
		if (auth.role !== "admin") return { status: 403, body: { error: "forbidden_admin_only" } };

		const accounts = await services.account.getAllAccounts();
		return { status: 200, body: accounts };
	});

	router.route("POST", "/admin/balance", async (req) => {
		const auth = await getAuthUser(req, services);
		if (!auth) return { status: 401, body: { error: "unauthorized" } };
		if (auth.role !== "admin") return { status: 403, body: { error: "forbidden_admin_only" } };

		const body = req.body as { userId?: string; amount?: number; type?: "deposit" | "withdraw" } | null;
		if (!body?.userId || !body?.amount || !body?.type) return { status: 400, body: { error: "invalid_body" } };

		try {
			const result = await services.account.updateBalance(body.userId, body.amount, body.type);
			return { status: 200, body: result };
		} catch (e) {
			return { status: 400, body: { error: e instanceof Error ? e.message : "update_failed" } };
		}
	});
}

