import Link from "next/link";

// Presentational building blocks for the marketing homepage, mirroring
// reference/design-prototype.html's helper functions (icon, av, profileCard,
// reviewCard, trustBadge, etc.) but as React components.

const ICON_PATHS: Record<string, string> = {
  heart: "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z",
  lock: "M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5zM12 15v3",
  crown: "M4 18h16l-1.6-8-4 3.4L12 8l-2.4 5.4-4-3.4z",
  check: "M20 6 9 17l-5-5",
  shield: "M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5.6-5.6",
  star: "M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3L5.7 21l1.2-7-5-4.9 7-1z",
  map: "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6z",
  bell: "M6 9a6 6 0 1 1 12 0v5l2 3H4l2-3zM10 20a2 2 0 0 0 4 0",
  video: "M4 7h11v10H4zM15 10l5-3v10l-5-3z",
  film: "M4 4h16v16H4zM4 8h16M4 16h16M8 4v4M8 16v4M16 4v4M16 16v4",
  users: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8a6 6 0 0 1 12 0M17 8a4 4 0 0 1 0 8m3 4a6 6 0 0 0-4-5.6",
  dollar: "M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5S7 4.6 7 6.5 9.2 10 12 10s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5",
  inbox: "M4 4h16v16H4zM4 14h5l1 3h4l1-3h5",
  layout: "M4 4h16v4H4zM4 12h7v8H4zM13 12h7v8h-7z",
};

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  const d = ICON_PATHS[name] ?? "";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

// Decorative gradient "avatars" matching the prototype's p1..p6 palette —
// used only for illustrative marketing cards, never for real user photos.
export const GRADIENTS: Record<string, string> = {
  p1: "linear-gradient(135deg,#F3D2CB,#C97D74)",
  p2: "linear-gradient(135deg,#E4C892,#9C7B3C)",
  p3: "linear-gradient(135deg,#D9A7B0,#8C4B5A)",
  p4: "linear-gradient(135deg,#C9A7D9,#6B4B8C)",
  p5: "linear-gradient(135deg,#A7C9D9,#4B7A8C)",
  p6: "linear-gradient(135deg,#D9C2A7,#8C6B4B)",
};

export function Avatar({ initial, tone, size = 40 }: { initial: string; tone: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-serif font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38, background: GRADIENTS[tone], color: "#2a0a0f" }}
    >
      {initial}
    </div>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold-bright text-xs">
      {"★".repeat(Math.round(n))}
      {"☆".repeat(5 - Math.round(n))}
    </span>
  );
}

export function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex gap-2.5 items-center px-4 py-3.5 bg-white/[0.02] border border-border-hair rounded-[14px]">
      <div className="w-[34px] h-[34px] rounded-[10px] bg-gold-bright/10 flex items-center justify-center text-gold-bright shrink-0">
        <Icon name={icon} />
      </div>
      <span className="text-[12.5px] leading-snug">{label}</span>
    </div>
  );
}

export function VerificationStep({
  n, icon, title, desc,
}: { n: number; icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-[22px] border border-border-hair bg-surface p-6">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-[12px] bg-gold-bright/10 flex items-center justify-center text-gold-bright">
          <Icon name={icon} />
        </div>
        <span className="font-mono text-stone text-[11px]">0{n}</span>
      </div>
      <h3 className="text-base mt-4">{title}</h3>
      <p className="text-stone text-[12.5px] mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

export function AudienceCard({
  icon, title, desc, tone, href,
}: { icon: string; title: string; desc: string; tone: string; href?: string }) {
  const inner = (
    <>
      <div className="w-10 h-10 rounded-[12px] bg-black/25 flex items-center justify-center text-gold-bright">
        <Icon name={icon} />
      </div>
      <h3 className="text-[17px] mt-4">{title}</h3>
      <p className="text-[12.5px] mt-2 leading-relaxed text-ivory/85">{desc}</p>
    </>
  );

  const className =
    "rounded-[22px] border border-border-hair p-[26px] relative overflow-hidden hover:-translate-y-[3px] hover:border-border-hair-2 transition block";

  if (href) {
    return (
      <Link href={href} className={className} style={{ background: GRADIENTS[tone] }}>
        <div className="relative">{inner}</div>
      </Link>
    );
  }

  return (
    <div className={className} style={{ background: GRADIENTS[tone] }}>
      <div className="relative">{inner}</div>
    </div>
  );
}

export function ProfileCard({
  name, age, loc, tone, online, id, photo,
}: { name: string; age: number; loc: string; tone: string; online?: boolean; id?: number; photo?: string }) {
  const inner = (
    <>
      <div className="aspect-square relative" style={{ background: GRADIENTS[tone] }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        {online && (
          <span className="absolute top-3 left-3 rounded-full bg-success/10 border border-success/25 text-success text-[11px] font-semibold px-3 py-1">
            ● Online
          </span>
        )}
      </div>
      <div className="px-4 py-3.5">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm">{name}, {age}</span>
          <span className="text-rose-bright"><Icon name="heart" /></span>
        </div>
        <div className="text-stone text-xs mt-0.5 flex items-center gap-1">
          <Icon name="map" /> {loc}
        </div>
      </div>
    </>
  );

  const className =
    "rounded-[22px] border border-border-hair bg-surface overflow-hidden hover:-translate-y-[3px] hover:border-border-hair-2 transition block";

  if (id) {
    return <Link href={`/u/${id}`} className={className}>{inner}</Link>;
  }
  return <div className={className}>{inner}</div>;
}

export function SuccessStoryCard({
  n1, n2, quote, tone1, tone2, tag,
}: { n1: string; n2: string; quote: string; tone1: string; tone2: string; tag: string }) {
  return (
    <div className="rounded-[22px] border border-border-hair bg-surface overflow-hidden hover:-translate-y-[3px] hover:border-border-hair-2 transition">
      <div className="flex h-[150px]">
        <div className="flex-1" style={{ background: GRADIENTS[tone1] }} />
        <div className="flex-1" style={{ background: GRADIENTS[tone2] }} />
      </div>
      <div className="p-[18px]">
        <span className="inline-block rounded-full bg-rose/15 border border-rose/35 text-[#F3B4BE] text-[11px] font-semibold px-3 py-1">
          {tag}
        </span>
        <div className="font-semibold text-sm mt-2.5">{n1} &amp; {n2}</div>
        <p className="text-stone text-[12.5px] mt-1.5 leading-relaxed">&quot;{quote}&quot;</p>
      </div>
    </div>
  );
}

export function ReviewCard({
  name, age, quote, rating, tone,
}: { name: string; age: number; quote: string; rating: number; tone: string }) {
  return (
    <div className="rounded-[22px] border border-border-hair bg-surface p-[22px]">
      <Stars n={rating} />
      <p className="text-sm leading-relaxed mt-2.5">&quot;{quote}&quot;</p>
      <div className="flex gap-2.5 items-center mt-4">
        <Avatar initial={name[0]} tone={tone} size={34} />
        <div>
          <div className="text-[13px] font-semibold">{name}, {age}</div>
          <div className="text-stone text-[11px]">Verified member</div>
        </div>
      </div>
    </div>
  );
}

export function CompareRow({
  feature, amoura, others,
}: { feature: string; amoura: boolean; others: boolean }) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] items-center py-3 border-b border-white/5 text-sm">
      <span>{feature}</span>
      <span className="text-center text-gold-bright">{amoura ? "✓" : "—"}</span>
      <span className="text-center text-stone-dim">{others ? "✓" : "—"}</span>
    </div>
  );
}

export function CityChip({ city, count }: { city: string; count: string }) {
  return (
    <span className="inline-flex rounded-full border border-border-hair bg-white/[0.02] text-stone text-sm px-4 py-2.5 cursor-default">
      {city} <span className="text-gold-bright ml-1">· {count}</span>
    </span>
  );
}

export function PhotoGrid({ unlocked, total }: { unlocked: number; total: number }) {
  const tones = ["p1", "p3", "p5", "p2", "p4", "p6", "p1", "p3"];
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
      {tones.map((tone, i) => {
        const isUnlocked = i < unlocked;
        const isFirstLocked = i === unlocked;
        return (
          <div
            key={i}
            className="aspect-square rounded-[14px] relative overflow-hidden"
            style={{ background: GRADIENTS[tone] }}
          >
            {!isUnlocked && (
              <div className="absolute inset-0 bg-[rgba(10,3,4,0.72)] backdrop-blur-[6px]" />
            )}
            {isFirstLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gold-bright text-[11px] text-center z-[2] px-1">
                <Icon name="lock" />
                <b className="font-sans text-xs">+{total - unlocked} more</b>
                <span>Unlock with Premium</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PressLogo({ name }: { name: string }) {
  return (
    <span className="font-serif italic text-[17px] text-stone/80">{name}</span>
  );
}
