// Redirect helpers are security-sensitive.
// We only allow same-app, relative redirects to avoid open-redirect attacks.

const DEFAULT_RETURN_TO = "/sessions";

export function isSafeRelativePath(path: string): boolean {
	if (!path.startsWith("/")) return false;
	if (path.startsWith("//")) return false;
	// Disallow attempts to smuggle a scheme.
	if (path.includes("://")) return false;
	return true;
}

export function getSafeReturnTo(params: URLSearchParams): string {
	const raw = params.get("returnTo");
	if (!raw) return DEFAULT_RETURN_TO;
	if (!isSafeRelativePath(raw)) return DEFAULT_RETURN_TO;
	return raw;
}

export function buildReturnToQuery(returnTo?: string): string {
	if (!returnTo || !isSafeRelativePath(returnTo)) return "";
	return `?returnTo=${encodeURIComponent(returnTo)}`;
}
