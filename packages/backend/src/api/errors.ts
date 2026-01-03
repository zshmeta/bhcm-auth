import type { HttpResponse } from "./types.js";
import type { AuthError } from "../domains/auth/index.js";

type LoggerLike = {
  error: (msg: string, meta?: Record<string, unknown>) => void;
};

export function isAuthError(err: unknown): err is AuthError {
  if (typeof err !== "object" || err === null) return false;
  const maybe = err as Record<string, unknown>;
  return maybe["name"] === "AuthError" && typeof maybe["code"] === "string";
}

export function mapAuthErrorToStatus(code: AuthError["code"]): number {
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
}

export function toHttpErrorResponse(err: unknown, logger: LoggerLike): HttpResponse {
  if (isAuthError(err)) {
    return { status: mapAuthErrorToStatus(err.code), body: { error: err.code } };
  }

  logger.error("unhandled_error", { err: String(err) });
  return { status: 500, body: { error: "internal_error" } };
}
