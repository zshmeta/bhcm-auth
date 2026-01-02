import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createPgPool, createDrizzleClient } from "../src/db/pg.js";
import { loadEnv } from "../src/config/env.js";

async function main() {
    const config = loadEnv();
    console.log("Running migrations...");

    const pool = createPgPool({ connectionString: config.databaseUrl });
    const db = createDrizzleClient(pool);

    // This will run migrations from the packages/database/migrations folder
    // We assume the migrations are generated there by drizzle-kit
    await migrate(db, { migrationsFolder: "../../packages/database/migrations" });

    console.log("Migrations complete!");
    await pool.end();
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
