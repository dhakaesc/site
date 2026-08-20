import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminSidebar from "../admin-sidebar";
import ReportsTable from "./reports-table";

export default async function AdminReportsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin) redirect("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Reports & Moderation" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Reports & Moderation</h1>
        <p className="text-stone text-sm mb-6">
          Reports submitted by members from a chat conversation.
        </p>
        <ReportsTable />
      </main>
    </div>
  );
}
