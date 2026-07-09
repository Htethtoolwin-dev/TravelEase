import { config } from "dotenv";
import { resolve } from "path";

if (!process.env.DATABASE_URL) {
  config({ path: resolve(process.cwd(), ".env.local") });
  config({ path: resolve(process.cwd(), ".env") });
}

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = postgres(connectionString, {
    prepare: false,
    max: process.env.NODE_ENV === "production" ? 3 : 10,
    idle_timeout: 20,
    connect_timeout: 30,
  });
  return drizzle(client, { schema });
}

declare global {
  var __db: ReturnType<typeof createDb> | undefined;
}

export const db = globalThis.__db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__db = db;
}
