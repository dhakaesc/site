import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { verificationTokens } from "@/lib/db/schema";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function randomToken(): string {
  // 32 random bytes, hex-encoded -> 64 chars. Edge-safe (Web Crypto).
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createToken(
  userId: number,
  purpose: "reset" | "verify"
): Promise<string> {
  const token = randomToken();
  const ttl = purpose === "reset" ? RESET_TTL_MS : VERIFY_TTL_MS;

  await db.insert(verificationTokens).values({
    userId,
    token,
    purpose,
    expiresAt: new Date(Date.now() + ttl),
  });

  return token;
}

/** Returns the userId if the token is valid, unused, and unexpired. Does NOT consume it. */
export async function peekToken(
  token: string,
  purpose: "reset" | "verify"
): Promise<number | null> {
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.purpose, purpose),
        isNull(verificationTokens.usedAt),
        gt(verificationTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return row?.userId ?? null;
}

/** Marks a token as used. Call after successfully acting on it. */
export async function consumeToken(token: string): Promise<void> {
  await db
    .update(verificationTokens)
    .set({ usedAt: new Date() })
    .where(eq(verificationTokens.token, token));
}
