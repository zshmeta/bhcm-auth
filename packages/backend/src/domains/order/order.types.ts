// TODO: Replace with import from @repo/types once project references are finalized
export type UUID = string;
export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "take_profit";
export type OrderStatus = "new" | "partially_filled" | "filled" | "cancelled" | "rejected";
export interface Order {
  id: UUID;
  accountId: UUID;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price?: string;
  quantity: string;
  filledQuantity: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderInput {
  accountId: UUID;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "take_profit";
  price?: string;
  quantity: string;
}

export interface OrderRepository {
  getById(id: UUID): Promise<Order | null>;
  listByAccount(accountId: UUID): Promise<Order[]>;
  create(input: PlaceOrderInput): Promise<Order>;
  updateStatus(id: UUID, status: OrderStatus): Promise<void>;
}

export interface OrderService {
  place(input: PlaceOrderInput): Promise<Order>;
  cancel(id: UUID): Promise<void>;
  get(id: UUID): Promise<Order | null>;
  listByAccount(accountId: UUID): Promise<Order[]>;
}
