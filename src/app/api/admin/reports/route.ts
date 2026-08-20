import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterUserId: reports.reporterUserId,
      reportedUserId: reports.reportedUserId,
    })
    .from(reports)
    .orderBy(desc(reports.createdAt))
    .limit(300);

  if (rows.length === 0) {
    return NextResponse.json({ reports: [] });
  }

  // Resolve names in one extra query rather than N+1 joins per row.
  const userIds = [...new Set(rows.flatMap((r) => [r.reporterUserId, r.reportedUserId]))];
  const people = await db
    .select({ id: users.id, name: users.name, email: users.email, isBanned: users.isBanned })
    .from(users)
    .where(inArray(users.id, userIds));
  const byId = new Map(people.map((p) => [p.id, p]));

  return NextResponse.json({
    reports: rows.map((r) => ({
      ...r,
      reporter: byId.get(r.reporterUserId) ?? null,
      reported: byId.get(r.reportedUserId) ?? null,
    })),
  });
}

const patchSchema = z.object({
  reportId: z.number().int(),
  status: z.enum(["open", "reviewed", "dismissed"]),
});

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const [updated] = await db
    .update(reports)
    .set({ status: parsed.data.status })
    .where(eq(reports.id, parsed.data.reportId))
    .returning({ id: reports.id, status: reports.status });

  return NextResponse.json({ report: updated });
}
