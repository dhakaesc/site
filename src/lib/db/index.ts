import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Thrown only when a DB call actually happens, not at build time.
  console.warn(
    "DATABASE_URL is not set. Set it in .env (see .env.example) before using the database."
  );
}

const client = postgres(connectionString ?? "", { prepare: false });

export const db = drizzle(client, { schema });
