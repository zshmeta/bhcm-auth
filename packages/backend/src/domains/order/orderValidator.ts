export type PlaceOrderBody = {
  accountId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "take_profit";
  price?: string;
  quantity: string;
};

export const validatePlaceOrder = (body: unknown): PlaceOrderBody => {
  const b = body as Partial<PlaceOrderBody>;
  if (!b?.accountId || !b?.symbol || !b?.side || !b?.type || !b?.quantity) {
    throw new Error("validation_error: accountId, symbol, side, type, quantity are required");
  }
  return {
    accountId: String(b.accountId),
    symbol: String(b.symbol),
    side: b.side,
    type: b.type,
    price: b.price,
    quantity: String(b.quantity),
  } as PlaceOrderBody;
};
