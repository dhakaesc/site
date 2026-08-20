import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminCampaignsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Notifications & Campaigns" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Notifications & Campaigns"
          description="Send announcements or promotions to members."
          note="Resend (email) is the only notification channel currently wired up. This would let admin compose and send a one-off email blast to some or all members — needs a decision on batching/rate limits given Resend's 100 emails/day free tier."
        />
      </main>
    </div>
  );
}
