/*
  tokens.ts
  Minimal JWT token manager built on top of `jose`.
  We keep a symmetric secret (HMAC-SHA256) for both access and refresh tokens to simplify ops.

  Access token: short-lived, includes role and session version for quick authz decisions.
  Refresh token: long-lived, used only at the refresh endpoint. We still hash its opaque JWT
  for server-side reuse detection.
*/

import { SignJWT, jwtVerify } from "jose";

export type UUID = string;

export interface AccessTokenClaims {
  sub: UUID;
  sessionId: UUID;
  role: string;
  version: number;
  issuedAt: string;
  expiresAt: string;
}

export interface RefreshTokenClaims {
  sub: UUID;
  sessionId: UUID;
  sessionVersion: number;
  passwordVersion: number;
  issuedAt: string;
  expiresAt: string;
}

export interface TokenManager {
  issueAccessToken(payload: AccessTokenClaims, ttlSeconds: number): Promise<string>;
  issueRefreshToken(payload: RefreshTokenClaims, ttlSeconds: number): Promise<string>;
  parseRefreshToken(token: string): Promise<RefreshTokenClaims | null>;
  parseAccessToken(token: string): Promise<AccessTokenClaims | null>;
}

export function createJwtTokenManager(secret: string): TokenManager {
  const key = new TextEncoder().encode(secret);

  const baseHeader = { alg: "HS256", typ: "JWT" } as const;

  return {
    async issueAccessToken(payload, ttlSeconds) {
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + ttlSeconds;
      return await new SignJWT({ ...payload })
        .setProtectedHeader(baseHeader)
        .setIssuedAt(iat)
        .setExpirationTime(exp)
        .sign(key);
    },
    async issueRefreshToken(payload, ttlSeconds) {
      const iat = Math.floor(Date.now() / 1000);
      const exp = iat + ttlSeconds;
      return await new SignJWT({ ...payload })
        .setProtectedHeader(baseHeader)
        .setIssuedAt(iat)
        .setExpirationTime(exp)
        .sign(key);
    },
    async parseRefreshToken(token) {
      try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        // Light runtime validation; the service verifies versions and expiry against DB.
        const claims = payload as unknown as RefreshTokenClaims;
        return claims;
      } catch {
        return null;
      }
    },
    async parseAccessToken(token) {
      try {
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        const claims = payload as unknown as AccessTokenClaims;
        return claims;
      } catch {
        return null;
      }
    },
  };
}
