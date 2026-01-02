import { DrizzleClient } from "../../db/pg.js";
import { accounts, ledgerEntries } from "@repo/database";
import { sql, eq } from "drizzle-orm";
import { LedgerService as ILedgerService, PostParams } from "./ledger.types.js";

export class LedgerService implements ILedgerService {
  constructor(private db: DrizzleClient) { }

  async transfer(debit: PostParams, credit: PostParams): Promise<void> {
    await this.db.transaction(async (tx) => {
      // 1. Debit
      // Retrieve current balance for accurate balanceAfter calculation if strict serialization needed.
      // Or just calculate in SQL. Drizzle 'returning' helps.

      const [debitUpdate] = await tx.update(accounts)
        .set({ balance: sql`${accounts.balance} - ${debit.amount}` })
        .where(eq(accounts.id, debit.accountId))
        .returning({ newBalance: accounts.balance });

      if (!debitUpdate) throw new Error(`Debit account not found: ${debit.accountId}`);

      await tx.insert(ledgerEntries).values({
        accountId: debit.accountId,
        amount: `-${debit.amount}`, // explicit negative for limit
        balanceAfter: debitUpdate.newBalance,
        referenceId: debit.referenceId,
        referenceType: debit.referenceType,
        description: debit.description || 'Debit'
      });

      // 2. Credit
      const [creditUpdate] = await tx.update(accounts)
        .set({ balance: sql`${accounts.balance} + ${credit.amount}` })
        .where(eq(accounts.id, credit.accountId))
        .returning({ newBalance: accounts.balance });

      if (!creditUpdate) throw new Error(`Credit account not found: ${credit.accountId}`);

      await tx.insert(ledgerEntries).values({
        accountId: credit.accountId,
        amount: credit.amount,
        balanceAfter: creditUpdate.newBalance,
        referenceId: credit.referenceId,
        referenceType: credit.referenceType,
        description: credit.description || 'Credit'
      });
    });
  }
}
