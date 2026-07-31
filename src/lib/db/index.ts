import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL is not set. Set it in .env (see .env.example) before using the database."
  );
}

const sql = neon(connectionString ?? "");

export const db = drizzle(sql, { schema });
