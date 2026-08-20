import Link from "next/link";

const GROUPS: {
  label: string;
  items: { label: string; href?: string }[];
}[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin" }],
  },
  {
    label: "Content",
    items: [{ label: "Users Profile", href: "/admin" }],
  },
  {
    label: "Trust & Safety",
    items: [
      { label: "Reports & Moderation", href: "/admin/reports" },
      { label: "Banned Users", href: "/admin/banned" },
      { label: "Open Inbox", href: "/admin/inbox" },
      { label: "Verification" },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Support Tickets" }],
  },
  {
    label: "Money",
    items: [{ label: "Payments & Coupons", href: "/admin" }],
  },
  {
    label: "Marketing",
    items: [{ label: "Notifications & Campaigns" }],
  },
  {
    label: "Team & System",
    items: [
      { label: "Admin Team & Roles" },
      { label: "Security Logs" },
      { label: "Edit Site (CMS)" },
      { label: "Settings" },
    ],
  },
];

export default function AdminSidebar({ active }: { active: string }) {
  return (
    <aside className="w-[250px] shrink-0 border-r border-border-hair bg-surface p-5 overflow-y-auto">
      <div className="font-serif italic text-lg mb-6 flex items-center gap-2">
        ♥ AMOURA
        <span className="text-[9px] font-sans not-italic rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright px-2 py-0.5">
          ADMIN
        </span>
      </div>
      <nav className="text-sm space-y-4">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="text-stone-dim text-[10px] uppercase tracking-wide mb-1.5 px-1">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) =>
                item.href ? (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block rounded-[10px] px-3 py-2 ${
                      active === item.label
                        ? "bg-surface-2 text-ivory"
                        : "text-stone hover:text-ivory"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div
                    key={item.label}
                    title="Not built yet"
                    className="block rounded-[10px] px-3 py-2 text-stone-dim/60 cursor-not-allowed"
                  >
                    {item.label}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-6 pt-4 border-t border-border-hair">
        <Link href="/dashboard" className="block rounded-[10px] px-3 py-2 text-stone hover:text-ivory text-sm">
          Exit to site
        </Link>
      </div>
    </aside>
  );
}
