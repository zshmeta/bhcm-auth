/**
 * API Client for Authentication
 * Provides type-safe communication with the backend auth service
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface User {
  id: string;
  email: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  tokenType: "Bearer";
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device?: {
    ipAddress?: string;
    userAgent?: string;
    platform?: string;
  };
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
  session: {
    id: string;
    userId: string;
    status: string;
    createdAt: string;
    lastSeenAt: string;
    expiresAt: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  issueSession?: boolean;
  device?: {
    ipAddress?: string;
    userAgent?: string;
    platform?: string;
  };
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  session: {
    id: string;
    userId: string;
    status: string;
    createdAt: string;
    lastSeenAt: string;
    expiresAt: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
  device?: {
    ipAddress?: string;
    userAgent?: string;
    platform?: string;
  };
}

export interface LogoutRequest {
  sessionId: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  invalidateOtherSessions?: boolean;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class AuthApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Add auth token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          code: "UNKNOWN_ERROR",
          message: response.statusText,
        }));

        throw new ApiError(
          response.status,
          errorData.code || "UNKNOWN_ERROR",
          errorData.message || "An error occurred",
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new ApiError(0, "NETWORK_ERROR", error.message);
      }

      throw new ApiError(0, "UNKNOWN_ERROR", "An unknown error occurred");
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(data: RefreshTokenRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(data: LogoutRequest): Promise<void> {
    return this.request<void>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/password/reset/request",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async confirmPasswordReset(
    data: PasswordResetConfirmRequest
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/password/reset/confirm",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return this.request<void>("/api/auth/password/change", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      "/api/auth/verify-email/resend",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/api/auth/me");
  }

  async getActiveSessions(): Promise<
    Array<{
      id: string;
      userId: string;
      status: string;
      ipAddress?: string;
      userAgent?: string;
      createdAt: string;
      lastSeenAt: string;
      expiresAt: string;
    }>
  > {
    return this.request("/api/auth/sessions");
  }

  async revokeSession(sessionId: string): Promise<void> {
    return this.request<void>(`/api/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  async revokeAllSessions(excludeCurrentSession: boolean = true): Promise<void> {
    return this.request<void>("/api/auth/sessions", {
      method: "DELETE",
      body: JSON.stringify({ excludeCurrent: excludeCurrentSession }),
    });
  }
}

// Singleton instance
let authClient: AuthApiClient | null = null;

export const createAuthClient = (baseUrl?: string): AuthApiClient => {
  if (!authClient) {
    authClient = new AuthApiClient(baseUrl);
  }
  return authClient;
};

export const getAuthClient = (): AuthApiClient => {
  if (!authClient) {
    authClient = new AuthApiClient();
  }
  return authClient;
};

export default AuthApiClient;
