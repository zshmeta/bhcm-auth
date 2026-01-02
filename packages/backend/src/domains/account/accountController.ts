import type { HttpRequest, HttpResponse } from "../../api/types.js";
import { validateCreateAccount } from "./accountValidator.js";

export const listAccounts = async (_req: HttpRequest): Promise<HttpResponse> => {
  return { status: 200, body: [] };
};

export const getAccount = async (req: HttpRequest<unknown, unknown, { id: string }>): Promise<HttpResponse> => {
  return { status: 200, body: { id: req.params.id } };
};

export const createAccount = async (req: HttpRequest): Promise<HttpResponse> => {
  const body = validateCreateAccount(req.body);
  return { status: 201, body };
};
