import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../lib/authApi";
import { clearAuthStorage, readAuthStorage, writeAuthStorage } from "../lib/storage";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Session {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  // Used by protected pages to refresh tokens opportunistically.
  setSessionFromRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Bootstrap auth state from sessionStorage.
    // We prefer session-scoped persistence to reduce long-lived secrets on disk.
    const snapshot = readAuthStorage();
    if (snapshot?.user) setUser(snapshot.user);
    if (snapshot?.session) setSession(snapshot.session);
    setIsLoading(false);
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    setUser(userData);
    // Caller decides navigation; context only updates state.
    writeAuthStorage({ user: userData, accessToken, refreshToken });
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    clearAuthStorage();
  };

  const setSessionFromRefresh = async () => {
    // Refresh only if we still have a refresh token.
    const snapshot = readAuthStorage();
    if (!snapshot?.refreshToken) return;

    const result = await authApi.refresh({ refreshToken: snapshot.refreshToken });

    // These updates keep the UI in sync with server state.
    setUser(result.user);
    setSession(result.session);

    writeAuthStorage({
      user: result.user,
      session: result.session,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      setSessionFromRefresh,
    }),
    [user, session, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
