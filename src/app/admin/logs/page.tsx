import AdminSidebar from "../admin-sidebar";
import { requireAdminPage } from "../require-admin-page";
import LogsTable from "./logs-table";

export default async function AdminLogsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Security Logs" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Security Logs</h1>
        <p className="text-stone text-sm mb-6">
          Audit trail of admin actions. Reading a member conversation in Open
          Inbox is logged here. Bans, tier changes and payment approvals are
          not wired into this yet.
        </p>
        <LogsTable />
      </main>
    </div>
  );
}
