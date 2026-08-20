import AdminSidebar from "../admin-sidebar";
import { requireAdminPage } from "../require-admin-page";
import SlidesManager from "./slides-manager";

export default async function AdminSlidesPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Homepage Slider" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Homepage Slider</h1>
        <p className="text-stone text-sm mb-6 max-w-xl">
          The slides at the top of the homepage. Each one has its own picture,
          heading, description and button. Drag order with the arrows, hide a
          slide without deleting it, or remove it entirely.
        </p>
        <SlidesManager />
      </main>
    </div>
  );
}
