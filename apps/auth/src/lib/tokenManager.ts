import { readAuthStorage } from "./storage";

// Centralized token access.
// Avoid reading tokens from random components to prevent accidental leaks.

export function getAccessToken(): string | null {
	return readAuthStorage()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
	return readAuthStorage()?.refreshToken ?? null;
}
