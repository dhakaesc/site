import AdminSidebar from "../admin-sidebar";
import ComingSoonShell from "../coming-soon-shell";
import { requireAdminPage } from "../require-admin-page";

export default async function AdminCouponsPage() {
  await requireAdminPage();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar active="Coupons" />
      <main className="flex-1 min-w-0 overflow-y-auto p-8">
        <ComingSoonShell
          title="Coupons"
          description="Discount codes members can apply at upgrade time."
          note="The manual bKash/Nagad payment flow has no discount logic yet — the homepage's '20% off' banner isn't backed by a real coupon system. Needs: a coupons table, and logic in /upgrade to apply a code to the amount the member is told to send."
        />
      </main>
    </div>
  );
}
