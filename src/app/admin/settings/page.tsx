import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Settings" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Settings"
          description="Site-wide configuration — pricing, payment numbers, feature toggles."
          note="Prices and payment numbers currently live in src/lib/payments.ts and Cloudflare env vars. Making them editable from here means writing them to the database and having the rest of the app read from there instead."
        />
      </main>
    </div>
  );
}
