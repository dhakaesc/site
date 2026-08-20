import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminModelProfilesPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Model Profiles" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Model Profiles"
          description="In the design prototype, this let an admin create profiles for named public figures (actors, presenters, influencers)."
          note="Not building the functional version until this is redefined — creating profiles of real, identifiable people without their consent is an impersonation and publicity-rights risk. Needs a product decision: is this for admin-curated fictional/anonymous profiles, or for flagging real self-signed-up users as 'featured'?"
        />
      </main>
    </div>
  );
}
