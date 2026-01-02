export type UUID = string;

export type LedgerRefType = "order" | "trade" | "deposit" | "withdrawal" | "fee" | "adjustment";

export interface LedgerEntry {
  id?: number;
  entryUuid: UUID;
  accountId: UUID;
  referenceId?: UUID;
  referenceType?: LedgerRefType;
  amount: string; // +credit, -debit
  balanceAfter?: string;
  createdAt?: string;
  description?: string;
}

export interface PostParams {
  accountId: UUID;
  amount: string; // positive=credit, negative=debit for 'transfer', or absolute? Service implementation used signs.
  // Actually, service used: `debit` (subtract) and `credit` (add).
  // Service implementation: `amount: -debit.amount`
  // So `PostParams` should have `amount` as string (absolute usually preferred for params if direction is implied by method arg? But let's check service logic).
  // Service logic: `debit.amount` was used directly in SQL.
  // `sql`${accounts.balance} - ${debit.amount}`` -> Implies positive `debit.amount`.
  // `amount: -${debit.amount}` for ledger entry.
  // So yes, `amount` is string.
  referenceId?: UUID;
  referenceType?: LedgerRefType;
  description?: string;
}

export interface LedgerService {
  transfer(debit: PostParams, credit: PostParams): Promise<void>;
}
