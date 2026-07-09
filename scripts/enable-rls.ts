import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function enableRls() {
  const url = process.env.DATABASE_URL_DRIZZLE ?? process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL or DATABASE_URL_DRIZZLE is not set");
  }

  const sqlFile = resolve(process.cwd(), "supabase/migrations/001_enable_rls.sql");
  const raw = readFileSync(sqlFile, "utf-8");

  // Strip line comments, then split into statements
  const migration = raw
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");

  const statements = migration
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const db = postgres(url, { prepare: false, max: 1 });

  console.log("Enabling Row Level Security...\n");

  for (const statement of statements) {
    const preview = statement.replace(/\s+/g, " ").slice(0, 80);
    console.log(`→ ${preview}...`);
    await db.unsafe(statement);
  }

  await db.end();
  console.log("\n✓ RLS enabled on all tables.");
  console.log("  Public tables: read-only for anon/authenticated");
  console.log("  Protected tables: server-only access");
}

enableRls().catch((err) => {
  console.error("RLS migration failed:", err.message);
  process.exit(1);
});
