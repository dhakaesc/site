import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminTeamPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Admin Team & Roles" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Admin Team & Roles"
          description="Add other admins and control what they can do."
          note="Right now isAdmin is a single yes/no flag — anyone marked admin can do everything. Real roles (e.g. 'can approve payments' vs 'can ban users') would need a permissions model, not just a UI."
        />
      </main>
    </div>
  );
}
