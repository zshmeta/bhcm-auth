import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./schema.ts",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgresql://bhc:bhc@localhost:5432/bhc",
    },
});
