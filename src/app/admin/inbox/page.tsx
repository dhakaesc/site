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
        <p className="text-stone text-sm mb-6">
          Read-only view of member conversations, for safety review only.
        </p>
        <InboxBrowser />
      </main>
    </div>
  );
}
