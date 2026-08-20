import AdminSidebar from "../admin-sidebar";
import { requireAdminPage } from "../require-admin-page";
import ModelProfilesManager from "./model-profiles-manager";

export default async function AdminModelProfilesPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Model Profiles" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <div className="rounded-[16px] border border-border-hair bg-surface/60 backdrop-blur-xl px-5 py-3.5 mb-5 flex gap-3 items-center">
          <span className="text-gold-bright">♛</span>
          <span className="text-[12px] text-stone">
            Admin-created profiles for members who already have a paying
            relationship with us — not real self-signups, so no membership
            tier, phone, or IP data.
          </span>
        </div>
        <ModelProfilesManager />
      </main>
    </div>
  );
}
