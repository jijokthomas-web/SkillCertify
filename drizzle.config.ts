import { defineConfig } from "drizzle-kit";

const DB_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!DB_URL) {
  throw new Error("DATABASE_URL/NETLIFY_DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
});
