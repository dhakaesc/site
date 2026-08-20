import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminTicketsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Support Tickets" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Support Tickets"
          description="Member support requests, separate from safety reports."
          note="No ticket table or member-facing 'contact support' form exists yet. Needs a support_tickets table and a way for members to open one (e.g. a Help link) before this queue means anything."
        />
      </main>
    </div>
  );
}
