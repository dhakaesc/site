import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminVerificationPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Verification" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Verification"
          description="Review ID and selfie submissions and approve the 'Verified' badge."
          note="There is currently no member-facing flow for submitting an ID or selfie at all, so this queue has nothing to show. Building this for real means: a submission form + secure storage for ID images, plus this review queue — a bigger project than the admin page alone."
        />
      </main>
    </div>
  );
}
