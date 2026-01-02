import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import socketio from "fastify-socket.io";
import { logger } from "./logger.js";
import { loadSnapshot } from "./storage.js";
import { runRefresh } from "./worker.js";
import { API_KEY } from "./config.js";
import { getSymbolsList } from "./fetcher.js";
import { getOrderBook, Order } from "./orderbook.js";

export function createServer() {
  const app = Fastify({
    logger: false
  });

  app.register(helmet);
  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });

  app.register(cors, {
    origin: "*" // Allow all for dev
  });

  app.register(socketio as any, {
    cors: {
      origin: "*", // Allow all for dev
    }
  });

  app.ready().then(() => {
    (app as any).io.on("connection", (socket: any) => {
      logger.info({ socketId: socket.id }, "Client connected");

      socket.on("subscribe", (symbol: string) => {
        socket.join(symbol);
        logger.info({ socketId: socket.id, symbol }, "Client subscribed");
      });

      socket.on("unsubscribe", (symbol: string) => {
        socket.leave(symbol);
      });
    });
  });

  // Simple API key protection for /refresh and /metrics if API_KEY is set
  app.addHook("onRequest", async (req: any, reply: any) => {
    if (!API_KEY) return;
    const url = req.url || "";
    const protectedPaths = ["/refresh"];
    if (protectedPaths.some((p: string) => url.startsWith(p))) {
      const key = (req.headers["x-api-key"] || req.headers["authorization"]) as string | undefined;
      const token = key?.startsWith("Bearer ") ? key.slice("Bearer ".length) : key;
      if (token !== API_KEY) {
        reply.code(401).send({ error: "Unauthorized" });
      }
    }
  });

  app.get("/health", async () => {
    return { status: "ok", ts: new Date().toISOString() };
  });

  app.get("/refresh", async (_req: any, reply: any) => {
    try {
      await runRefresh(app);
      return reply.code(200).send({ ok: true });
    } catch (err) {
      return reply.code(500).send({ ok: false, error: String(err) });
    }
  });

  app.get("/prices", async () => {
    const snap = await loadSnapshot();
    return snap ?? { message: "no snapshot available" };
  });

  app.get("/symbols", async () => {
    const symbols = await getSymbolsList();
    return { symbols };
  });

  app.get("/orderbook/:symbol", async (req: any, reply: any) => {
    const { symbol } = req.params;
    const book = getOrderBook(symbol);
    return book.getDepth();
  });

  app.post("/orders", async (req: any, reply: any) => {
    const body = req.body as any;
    if (!body.symbol || !body.side || !body.quantity || !body.price) {
      return reply.code(400).send({ error: "Invalid order" });
    }
    const book = getOrderBook(body.symbol);
    const order: Order = {
      id: Math.random().toString(36).substring(7),
      symbol: body.symbol,
      side: body.side,
      type: "limit",
      price: Number(body.price),
      quantity: Number(body.quantity),
      filled: 0,
      timestamp: Date.now()
    };
    book.addOrder(order);
    return { orderId: order.id };
  });

  return app;
}