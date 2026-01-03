import type { Session, User } from "../components/AuthContext";

// Storage is security-sensitive.
// We use sessionStorage (not localStorage) to reduce long-lived secret persistence.
// The backend remains the source of truth; this is only for UX continuity.

const KEY = "bhc.auth";

export type AuthStorageSnapshot = {
  user?: User;
  session?: Session;
  accessToken?: string;
  refreshToken?: string;
};

export function readAuthStorage(): AuthStorageSnapshot | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthStorageSnapshot;
  } catch {
    // If parsing fails, treat it as corrupted session state and start fresh.
    return null;
  }
}

export function writeAuthStorage(next: AuthStorageSnapshot): void {
  try {
    const current = readAuthStorage() ?? {};
    const merged: AuthStorageSnapshot = { ...current, ...next };
    sessionStorage.setItem(KEY, JSON.stringify(merged));
  } catch {
    // If storage is unavailable (privacy mode, etc.), we continue in-memory only.
  }
}

export function clearAuthStorage(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
