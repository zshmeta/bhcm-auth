import { eq, sql } from "drizzle-orm";
import { accounts, users } from "@repo/database";
import type { DrizzleClient } from "../../db/pg.js";

export class AccountService {
  constructor(private db: DrizzleClient) {}

  async createAccount(userId: string, currency: string = "USD") {
    const [account] = await this.db
      .insert(accounts)
      .values({
        userId,
        currency,
        balance: "0",
        locked: "0",
        accountType: "spot",
        status: "active",
      })
      .returning();
    return account;
  }

  async getAccount(userId: string, currency: string = "USD") {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(sql`${accounts.userId} = ${userId} AND ${accounts.currency} = ${currency}`)
      .limit(1);
    return account;
  }

  async getAllAccounts() {
    return this.db
      .select({
        id: accounts.id,
        userId: accounts.userId,
        email: users.email,
        currency: accounts.currency,
        balance: accounts.balance,
        locked: accounts.locked,
        status: accounts.status,
      })
      .from(accounts)
      .innerJoin(users, eq(accounts.userId, users.id));
  }

  async updateBalance(
    userId: string,
    amount: number,
    type: "deposit" | "withdraw",
    currency: string = "USD",
  ) {
    const account = await this.getAccount(userId, currency);
    if (!account) {
      throw new Error("Account not found");
    }

    const currentBalance = parseFloat(account.balance);
    const newBalance = type === "deposit" ? currentBalance + amount : currentBalance - amount;

    if (newBalance < 0) {
      throw new Error("Insufficient funds");
    }

    const [updated] = await this.db
      .update(accounts)
      .set({ balance: newBalance.toString(), updatedAt: new Date() })
      .where(eq(accounts.id, account.id))
      .returning();

    return updated;
  }
}
