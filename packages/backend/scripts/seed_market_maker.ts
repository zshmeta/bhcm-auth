import { createPgPool, createDrizzleClient } from "../src/db/pg.js";
import { loadEnv } from "../src/config/env.js";
import {
    createBcryptHasher,
    createUserRepository,
    createCredentialRepository
} from "../src/domains/auth/index.js";
import { AccountService } from "../src/domains/account/AccountService.js";
import { users } from "@repo/database";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function main() {
    const config = loadEnv();
    const pool = createPgPool({ connectionString: config.databaseUrl });
    const db = createDrizzleClient(pool);
    const hasher = createBcryptHasher(10);

    const userRepo = createUserRepository(pool);
    const credRepo = createCredentialRepository(pool);
    const accountService = new AccountService(db);

    const email = "mm@bhc.com";
    const password = "marketmaker";

    console.log(`Seeding User: ${email}`);

    const existing = await userRepo.findByEmail(email);

    let userId = existing?.id;

    if (existing) {
        console.log("User exists.");
    } else {
        console.log("Creating new user...");
        userId = randomUUID();
        const now = new Date().toISOString();

        await userRepo.create({
            id: userId,
            email,
            role: 'user', // MM is just a standard user with money
            status: 'active',
            createdAt: now,
            updatedAt: now
        });

        const pwdHash = await hasher.hash(password);
        await credRepo.create({
            userId,
            passwordHash: pwdHash,
            version: 1,
            createdAt: now,
            updatedAt: now,
            passwordUpdatedAt: now
        });

        await accountService.createAccount(userId, "USD");
        console.log("User created.");
    }

    // Fund the account
    if (userId) {
        console.log("Funding account...");
        // Use AccountService or direct DB? AccountService exposes updateBalance but it might check limits or something?
        // Actually AccountService.updateBalance is what we want.
        // Wait, updateBalance only handles the 'balance' column (quote currency usually?).
        // We also need BTC (Asset) balance if we want to Sell.
        // Our AccountService currently creates ONE account per user?
        // Let's check AccountService.ts again. Usually exchanges have one account per currency OR a multi-currency account.
        // Schema says `accounts` table has `currency`.
        // So a user has MULTIPLE accounts.
        // accountService.createAccount(userId, "USD") creates the base account.

        // Ensure USD account
        let usdAccount = await accountService.getAccount(userId, "USD");
        if (!usdAccount) {
            usdAccount = await accountService.createAccount(userId, "USD");
        }
        await accountService.updateBalance(userId, 10000000, "deposit", "USD"); // $10M

        // Ensure BTC account
        // AccountService might need a way to create asset accounts if not transparent.
        // Looking at AccountService... it has `createAccount(userId, currency)`.
        let btcAccount = await accountService.getAccount(userId, "BTC"); // Method might not exist or be named differently
        if (!btcAccount) {
            btcAccount = await accountService.createAccount(userId, "BTC");
        }
        await accountService.updateBalance(userId, 1000, "deposit", "BTC"); // 1000 BTC

        console.log("Funded $10M and 1000 BTC.");
    }

    await pool.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
