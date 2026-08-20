import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminCmsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Edit Site (CMS)" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Edit Site (CMS)"
          description="Edit homepage text without a code deploy."
          note="Homepage copy is hardcoded in src/app/page.tsx right now. Making it editable means moving that text into the database and having the homepage read from it — worth doing once the copy stabilizes, since it's still changing often."
        />
      </main>
    </div>
  );
}
