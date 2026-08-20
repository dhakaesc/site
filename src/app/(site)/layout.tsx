import SiteHeader from "../_shared/site-header";
import SiteFooter from "../_shared/site-footer";

/**
 * Public pages share the prototype's chrome: top banner, sticky navbar and
 * site footer. Widths come from the prototype's own CSS, not from utilities
 * added here, so nothing drifts.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
