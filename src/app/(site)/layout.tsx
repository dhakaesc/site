import SiteHeader from "../_shared/site-header";
import SiteFooter from "../_shared/site-footer";

/**
 * Every public-facing page shares the same header and footer, so they only
 * live here rather than being repeated (and drifting) per page.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen max-w-[1280px] mx-auto flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
