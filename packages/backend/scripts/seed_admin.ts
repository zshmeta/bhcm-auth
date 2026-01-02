import { createPgPool, createDrizzleClient } from "../src/db/pg.js";
import { loadEnv } from "../src/config/env.js";
import { createBcryptHasher } from "../src/security/hasher.js";
import {
    createUserRepository,
    createCredentialRepository
} from "../src/domains/user/repositories.pg.js";
import { AccountService } from "../src/domains/account/AccountService.js";
import { users } from "@repo/database";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function main() {
    const config = loadEnv();
    const pool = createPgPool({ connectionString: config.databaseUrl });
    const db = createDrizzleClient(pool);
    const hasher = createBcryptHasher(10);

    // Repos
    const userRepo = createUserRepository(pool);
    const credRepo = createCredentialRepository(pool);
    const accountService = new AccountService(db); // uses DrizzleClient

    const email = "admin@bhc.com";
    const password = "admin"; // Change this in prod!

    console.log(`Seeding admin: ${email}`);

    const existing = await userRepo.findByEmail(email);

    if (existing) {
        console.log("Admin exists, ensuring role is 'admin'...");
        await db.update(users).set({ role: 'admin', status: 'active' }).where(eq(users.id, existing.id));
        console.log("Updated.");
    } else {
        console.log("Creating new admin...");
        const userId = randomUUID();
        const now = new Date().toISOString();

        // 1. User
        await userRepo.create({
            id: userId,
            email,
            role: 'admin',
            status: 'active',
            createdAt: now,
            updatedAt: now
        });

        // 2. Credential
        const pwdHash = await hasher.hash(password);
        await credRepo.create({
            userId,
            passwordHash: pwdHash,
            version: 1,
            createdAt: now,
            updatedAt: now,
            passwordUpdatedAt: now
        });

        // 3. Account
        await accountService.createAccount(userId, "USD");
        console.log("Admin created with password 'admin'.");
    }

    await pool.end();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
