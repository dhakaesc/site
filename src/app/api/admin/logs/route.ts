import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminAuditLogs, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

/** Admin audit trail, newest first. Read-only - nothing here can be edited. */
export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rows = await db
    .select({
      id: adminAuditLogs.id,
      action: adminAuditLogs.action,
      targetType: adminAuditLogs.targetType,
      targetId: adminAuditLogs.targetId,
      detail: adminAuditLogs.detail,
      createdAt: adminAuditLogs.createdAt,
      adminName: users.name,
      adminEmail: users.email,
    })
    .from(adminAuditLogs)
    .leftJoin(users, eq(users.id, adminAuditLogs.adminUserId))
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(200);

  return NextResponse.json({ logs: rows });
}
