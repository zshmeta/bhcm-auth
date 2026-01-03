import { httpJson } from "./http";

// These types intentionally mirror the backend auth route responses.
// Keep them small and stable to avoid coupling the UI to backend internals.

export type User = {
  id: string;
  email: string;
  role: string;
  status?: string;
};

export type SessionView = {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
  revokedAt?: string;
  revokedReason?: string;
};

export type AuthTokens = {
  tokenType: "Bearer";
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type AuthenticationResult = {
  user: User;
  session: SessionView;
  tokens: AuthTokens;
};

export type RegisterInput = {
  email: string;
  password: string;
  issueSession?: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RefreshInput = {
  refreshToken: string;
};

export const authApi = {
  register: (input: RegisterInput) =>
    httpJson<AuthenticationResult | { user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: LoginInput) =>
    httpJson<AuthenticationResult>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  refresh: (input: RefreshInput) =>
    httpJson<AuthenticationResult>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: (input: { sessionId: string; userId?: string; reason?: string }) =>
    httpJson<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logoutAll: (input: { userId: string; excludeSessionId?: string; reason?: string }) =>
    httpJson<void>("/auth/logout-all", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listSessions: async (input: { userId: string }) => {
    const qs = new URLSearchParams({ userId: input.userId });
    return httpJson<{ sessions: SessionView[] }>(`/auth/sessions?${qs.toString()}`, { method: "GET" });
  },
};
