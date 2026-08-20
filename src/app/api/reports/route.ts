import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

const REASONS = [
  "fake_profile",
  "inappropriate_content",
  "harassment",
  "scam",
  "underage",
  "other",
] as const;

const bodySchema = z.object({
  userId: z.number().int(),
  reason: z.enum(REASONS),
  details: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  if (parsed.data.userId === session.userId) {
    return NextResponse.json(
      { error: "You can't report yourself." },
      { status: 400 }
    );
  }

  await db.insert(reports).values({
    reporterUserId: session.userId,
    reportedUserId: parsed.data.userId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? "",
  });

  return NextResponse.json({ ok: true });
}
