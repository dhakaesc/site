import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/** Redirects non-admins away. Call at the top of every /admin/* page. */
export async function requireAdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");
  return session;
}
