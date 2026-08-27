import Link from "next/link";
import { Icon } from "../_home/pieces";

type Tier = "free" | "plus" | "vip";

/**
 * The member dashboard sidebar from the design prototype. Items the current
 * tier can't use are shown locked rather than hidden, so the upgrade path
 * stays visible.
 */
export default function MemberSidebar({
  tier,
  active,
}: {
  tier: Tier;
  active: string;
}) {
  const items: {
    label: string;
    icon: string;
    href?: string;
    locked?: boolean;
  }[] = [
    { label: "Dashboard", icon: "layout", href: "/dashboard" },
    { label: "Discover", icon: "grid", href: "/browse" },
    { label: "Matches", icon: "heart", href: "/messages" },
    { label: "Messages", icon: "inbox", href: "/messages" },
    {
      label: "Who Liked You",
      icon: "star",
      href: "/likes-me",
      locked: tier === "free",
    },
    // Video Call is not built yet, so it is not in the nav. Add it back with
    // an href the day the feature actually ships.
    { label: "My Profile", icon: "user", href: "/profile/edit" },
    { label: "Subscription", icon: "crown", href: "/pricing" },
  ];

  return (
    <aside className="w-[230px] shrink-0 border-r border-border-hair bg-surface p-5 hidden md:flex flex-col">
      <Link href="/" className="font-serif italic text-lg mb-6 flex items-center gap-2">
        <span className="text-rose-bright not-italic">♥</span> AMOURA
      </Link>

      <nav className="space-y-0.5 text-sm">
        {items.map((item) => {
          const cls = `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 ${
            item.label === active
              ? "bg-surface-2 text-ivory"
              : item.locked
                ? "text-stone-dim"
                : "text-stone hover:text-ivory"
          }`;

          const content = (
            <>
              <Icon name={item.icon} />
              <span className="flex-1">{item.label}</span>
              {item.locked && (
                <span className="text-gold-bright">
                  <Icon name="lock" />
                </span>
              )}
            </>
          );

          if (item.href && !item.locked) {
            return (
              <Link key={item.label} href={item.href} className={cls}>
                {content}
              </Link>
            );
          }
          return (
            <Link
              key={item.label}
              href="/pricing"
              className={cls}
              title="Upgrade to unlock"
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm text-stone hover:text-ivory"
      >
        <Icon name="logout" />
        <span>Log out</span>
      </Link>
    </aside>
  );
}
