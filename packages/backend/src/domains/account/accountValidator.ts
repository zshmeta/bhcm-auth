export type CreateAccountBody = { currency: string; accountType?: "spot" | "margin" | "futures" | "demo" };
export const validateCreateAccount = (body: unknown): CreateAccountBody => {
  const b = body as Partial<CreateAccountBody>;
  if (!b?.currency) throw new Error("validation_error: currency required");
  return { currency: String(b.currency), accountType: b.accountType };
};
