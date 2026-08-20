import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminLogsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Security Logs" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Security Logs"
          description="Audit trail of admin actions — bans, payment approvals, tier changes."
          note="No action is currently logged anywhere; approving a payment or banning a user leaves no record of which admin did it or when. Needs an audit_logs table written to from every admin mutation."
        />
      </main>
    </div>
  );
}
