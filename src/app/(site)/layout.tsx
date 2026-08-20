import SiteHeader from "../_shared/site-header";
import SiteFooter from "../_shared/site-footer";

/**
 * Every public-facing page shares the same header and footer, so they only
 * live here rather than being repeated (and drifting) per page.
 *
 * The banner, header bar and footer rule span the full viewport width — only
 * their *contents* are constrained to the centred column, so nothing looks
 * cut off on a wide screen.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 w-full max-w-[1280px] mx-auto">{children}</main>
      <SiteFooter />
    </div>
  );
}
