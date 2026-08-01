import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cached: Db | null = null;

/**
 * Lazily creates the Neon HTTP client + Drizzle instance on first real use.
 *
 * This is intentional: Next.js evaluates route modules at build time to
 * collect page data, which would otherwise call neon() with an empty
 * string (DATABASE_URL isn't available at build time) and crash the build.
 * Deferring the connection until a query actually runs means the build
 * never needs DATABASE_URL — only the deployed runtime does.
 */
function getDb(): Db {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Set it in your environment (see .env.example)."
    );
  }

  const sql = neon(connectionString);
  cached = drizzle(sql, { schema });
  return cached;
}

// Proxy so `db.select(...)`, `db.insert(...)`, etc. keep working exactly
// as before, but the real client is only built on first property access.
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});
