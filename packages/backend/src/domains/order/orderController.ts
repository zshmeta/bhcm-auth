import type { HttpRequest, HttpResponse } from "../../api/types.js";
import { validatePlaceOrder } from "./orderValidator.js";

export const listByAccount = async (
  req: HttpRequest<unknown, unknown, { accountId: string }>,
): Promise<HttpResponse> => {
  return { status: 200, body: [] };
};

export const placeOrder = async (req: HttpRequest): Promise<HttpResponse> => {
  const body = validatePlaceOrder(req.body);
  const idempotencyKey = req.headers["idempotency-key"];
  // NEXT: OrderService.place(body, { idempotencyKey })
  return { status: 201, body: { ...body, id: "" } };
};

export const cancelOrder = async (
  req: HttpRequest<unknown, unknown, { id: string }>,
): Promise<HttpResponse> => {
  // NEXT: OrderService.cancel(req.params.id)
  return { status: 204 };
};
