// A tiny fetch wrapper for the Auth app.
// Keep it centralized so we can enforce consistent error handling.

export type HttpErrorCode = "invalid_body" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "server_error";

export class HttpError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: HttpErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function getApiBase(): string {
  const win = window as unknown as { __API_BASE?: string };
  const base = win.__API_BASE ?? "";
  // Allow empty base for same-origin deployments.
  return base.replace(/\/$/, "");
}

export async function httpJson<TResponse>(
  path: string,
  options: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {},
): Promise<TResponse> {
  const url = `${getApiBase()}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });

  const text = await res.text();
  const body = text ? safeJsonParse(text) : undefined;

  if (!res.ok) {
    // Keep messages generic to avoid leaking sensitive details.
    const code = mapStatusToCode(res.status);
    throw new HttpError("Request failed", res.status, code, body);
  }

  return body as TResponse;
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function mapStatusToCode(status: number): HttpErrorCode {
  if (status === 400) return "invalid_body";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  return "server_error";
}
