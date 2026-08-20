import AdminSidebar from "../admin-sidebar";
import { requireAdminPage } from "../require-admin-page";
import VerificationQueue from "./verification-queue";

export default async function AdminVerificationPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Verification" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <h1 className="font-serif text-2xl mb-1">Verification</h1>
        <p className="text-stone text-sm mb-6 max-w-xl">
          Every new signup starts pending. Call the number they gave at
          registration to confirm they're a real person, then mark them
          verified or rejected here. No ID numbers or documents are stored —
          this only records the outcome of the call.
        </p>
        <VerificationQueue />
      </main>
    </div>
  );
}
