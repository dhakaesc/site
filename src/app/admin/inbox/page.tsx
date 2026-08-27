import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminSidebar from "../admin-sidebar";
import InboxBrowser from "./inbox-browser";

export default async function AdminInboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Open Inbox" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Open Inbox</h1>
        <div className="card glass mb-5" style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ color: "var(--gold-bright)" }}>&#9679;</span>
          <span style={{ fontSize: 12.5 }}>
            Every profile&apos;s inbox in one place. Click a profile to see
            everyone messaging them. Read-only, and every conversation you open
            is logged.
          </span>
        </div>
        <InboxBrowser />
      </main>
    </div>
  );
}
