import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Analytics" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Analytics"
          description="Signups, revenue, and engagement trends over time."
          note="The Dashboard page already shows live totals. This would add trend charts (signups/day, revenue/week, message volume) — needs a decision on what metrics matter most before building."
        />
      </main>
    </div>
  );
}
