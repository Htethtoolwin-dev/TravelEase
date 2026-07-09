import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    // Session pooler (5432) for drizzle-kit — transaction pooler (6543) can crash introspection
    url: process.env.DATABASE_URL_DRIZZLE ?? process.env.DATABASE_URL!,
  },
});
