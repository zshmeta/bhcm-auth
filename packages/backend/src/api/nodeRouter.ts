import type { IncomingMessage, ServerResponse } from "http";
import type { Socket } from "net";
import { URL } from "url";
import type { HttpMethod, HttpRequest, HttpResponse, Router } from "./types.js";

class PayloadTooLargeError extends Error {
  constructor() {
    super("payload_too_large");
  }
}

type LoggerLike = {
  info?: (msg: string, meta?: Record<string, unknown>) => void;
  error?: (msg: string, meta?: Record<string, unknown>) => void;
};

type RouteEntry = {
  method: HttpMethod;
  pattern: string;
  handler: (req: HttpRequest) => Promise<HttpResponse>;
};

const coerceHeaderValue = (value: string | string[] | undefined): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return undefined;
};

const toHeadersRecord = (req: IncomingMessage): Record<string, string | undefined> => {
  const out: Record<string, string | undefined> = {};
  for (const key in req.headers) {
    const value = req.headers[key];
    out[key.toLowerCase()] = coerceHeaderValue(value);
  }
  return out;
};

const matchPath = (pattern: string, pathname: string): Record<string, string> | null => {
  if (pattern === pathname) return {};

  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i]!;
    const v = pathParts[i]!;
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(v);
      continue;
    }
    if (p !== v) return null;
  }
  return params;
};

async function readJsonBody<T>(req: IncomingMessage, maxBytes: number): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;

    req
      .on("data", (c) => {
        const chunk = Buffer.isBuffer(c) ? c : Buffer.from(c);
        total += chunk.length;
        if (total > maxBytes) {
          reject(new PayloadTooLargeError());
          req.destroy();
          return;
        }
        chunks.push(chunk);
      })
      .on("end", () => {
        try {
          if (!chunks.length) return resolve(null);
          const json = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          resolve(json as T);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => reject(err));
  });
}

export type NodeRouterOptions = {
  corsOrigins: string[];
  maxBodyBytes?: number;
  logger?: LoggerLike;
};

export function createNodeRouter(options: NodeRouterOptions) {
  const routes: RouteEntry[] = [];
  const logger = options.logger;
  const maxBodyBytes = options.maxBodyBytes ?? 1_048_576;

  const router: Router = {
    route: (method, path, handler) => {
      routes.push({ method, pattern: path, handler });
    },
  };

  const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(payload === undefined ? undefined : JSON.stringify(payload));
  };

  const handle = async (req: IncomingMessage, res: ServerResponse) => {
    const methodRaw = req.method ?? "GET";

    const requestOrigin = coerceHeaderValue(req.headers.origin);
    const allowedOrigins = options.corsOrigins;
    const originAllowed = requestOrigin && (allowedOrigins.includes("*") || allowedOrigins.includes(requestOrigin));
    const originToUse = originAllowed ? requestOrigin : "*";

    res.setHeader("Access-Control-Allow-Origin", originToUse);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Idempotency-Key");
    if (originAllowed && originToUse !== "*") {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Max-Age", "600");

    if (methodRaw === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    const method = methodRaw as HttpMethod;

    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname;

    // Route lookup
    let matched: { entry: RouteEntry; params: Record<string, string> } | null = null;
    for (const entry of routes) {
      if (entry.method !== method) continue;
      const params = matchPath(entry.pattern, pathname);
      if (!params) continue;
      matched = { entry, params };
      break;
    }

    if (!matched) {
      sendJson(res, 404, { error: "not_found" });
      return;
    }

    // Query
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Body (JSON only)
    const contentType = coerceHeaderValue(req.headers["content-type"]);
    const expectsJsonBody = method !== "GET" && method !== "DELETE" && contentType?.includes("application/json");

    let body: unknown = null;
    if (expectsJsonBody) {
      try {
        body = await readJsonBody(req, maxBodyBytes);
      } catch (err) {
        if (err instanceof PayloadTooLargeError) {
          sendJson(res, 413, { error: "payload_too_large" });
          return;
        }
        logger?.error?.("body_parse_error", { err: String(err) });
        sendJson(res, 400, { error: "invalid_json" });
        return;
      }
    }

    const headers = toHeadersRecord(req);
    const socket = req.socket as Socket | undefined;

    const httpRequest: HttpRequest = {
      body,
      query,
      params: matched.params,
      headers,
      ipAddress: socket?.remoteAddress,
    };

    try {
      const response = await matched.entry.handler(httpRequest);
      if (response.headers) {
        for (const [k, v] of Object.entries(response.headers)) {
          res.setHeader(k, v);
        }
      }

      if (response.status === 204) {
        res.writeHead(204);
        res.end();
        return;
      }

      sendJson(res, response.status, response.body);
    } catch (err) {
      logger?.error?.("route_handler_error", { err: String(err), method, pathname });
      sendJson(res, 500, { error: "internal_error" });
    }
  };

  return { router, handle } as const;
}
