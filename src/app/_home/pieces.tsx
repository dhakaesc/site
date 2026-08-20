import Link from "next/link";

// Presentational building blocks, mirroring the prototype's helper functions
// (icon, av, profileCard, reviewCard, trustBadge, …) one-for-one and using the
// prototype's own CSS classes so nothing drifts.

const ICON_PATHS: Record<string, string> = {
  heart: "M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z",
  msg: "M4 5h16v11H8l-4 4z",
  lock: "M6 11V8a6 6 0 1 1 12 0v3M5 11h14v10H5zM12 15v3",
  crown: "M4 18h16l-1.6-8-4 3.4L12 8l-2.4 5.4-4-3.4z",
  check: "M20 6 9 17l-5-5",
  shield: "M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 17-5.6-5.6",
  filter: "M4 6h16M7 12h10M10 18h4",
  star: "M12 2l3.1 6.3 7 1-5 4.9 1.2 7-6.3-3.3L5.7 21l1.2-7-5-4.9 7-1z",
  map: "M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3zM9 3v15M15 6v15",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6z",
  bell: "M6 9a6 6 0 1 1 12 0v5l2 3H4l2-3zM10 20a2 2 0 0 0 4 0",
  video: "M4 7h11v10H4zM15 10l5-3v10l-5-3z",
  film: "M4 4h16v16H4zM4 8h16M4 16h16M8 4v4M8 16v4M16 4v4M16 16v4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0",
  inbox: "M4 4h16v16H4zM4 14h5l1 3h4l1-3h5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  sparkle: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  plus: "M12 5v14M5 12h14",
  upload: "M12 3v13m0 0-4-4m4 4 4-4M4 21h16",
  users: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8a6 6 0 0 1 12 0M17 8a4 4 0 0 1 0 8m3 4a6 6 0 0 0-4-5.6",
  layout: "M4 4h16v4H4zM4 12h7v8H4zM13 12h7v8h-7z",
  dollar: "M12 2v20M17 6.5c0-1.9-2.2-3.5-5-3.5S7 4.6 7 6.5 9.2 10 12 10s5 1.6 5 3.5-2.2 3.5-5 3.5-5-1.6-5-3.5",
  chart: "M4 20V10M11 20V4M18 20v-7",
};

export function Icon({ name }: { name: string }) {
  const d = ICON_PATHS[name] ?? "";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// The prototype's p1..p6 avatar/cover gradients.
export const GRADIENTS: Record<string, string> = {
  p1: "linear-gradient(135deg,#F3D2CB,#C97D74)",
  p2: "linear-gradient(135deg,#E4C892,#9C7B3C)",
  p3: "linear-gradient(135deg,#D9A7B0,#8C4B5A)",
  p4: "linear-gradient(135deg,#C9A7D9,#6B4B8C)",
  p5: "linear-gradient(135deg,#A7C9D9,#4B7A8C)",
  p6: "linear-gradient(135deg,#D9C2A7,#8C6B4B)",
};

/** Prototype: av(initials, cls, size) */
export function Avatar({ initial, tone, size = 40 }: { initial: string; tone: string; size?: number }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: GRADIENTS[tone] }}>
      {initial}
    </div>
  );
}

/** Prototype: stars(n) */
export function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: "var(--gold-bright)", fontSize: 12 }}>
      {"★".repeat(Math.round(n))}
      {"☆".repeat(5 - Math.round(n))}
    </span>
  );
}

/** Prototype: trustBadge(ic, label) */
export function TrustBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "center", padding: "14px 16px",
      background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-hair)", borderRadius: 14,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, background: "rgba(201,166,107,.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--gold-bright)", flexShrink: 0,
      }}>
        <Icon name={icon} />
      </div>
      <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

/** Prototype: verificationStep(n, ic, title, desc) */
export function VerificationStep({ n, icon, title, desc }: { n: number; icon: string; title: string; desc: string }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: "rgba(201,166,107,.12)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-bright)",
        }}>
          <Icon name={icon} />
        </div>
        <span className="mono stone" style={{ fontSize: 11 }}>0{n}</span>
      </div>
      <h3 style={{ fontSize: 16, marginTop: 16 }}>{title}</h3>
      <p className="stone" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

/** Prototype: audienceCard(ic, title, desc, cls), with a cover photo behind it. */
export function AudienceCard({ icon, title, desc, tone, href, cover }: {
  icon: string; title: string; desc: string; tone: string; href?: string; cover?: string;
}) {
  const inner = (
    <>
      {cover && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt="" loading="lazy" decoding="async" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 22%",
          }} />
          {/* Keeps the copy legible whatever the photo behind it looks like. */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(20,6,9,.35) 0%, rgba(20,6,9,.72) 55%, rgba(20,6,9,.92) 100%)",
          }} />
        </>
      )}
      <div style={{ position: "relative" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,.35)",
          display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-bright)",
        }}>
          <Icon name={icon} />
        </div>
        <h3 style={{ fontSize: 17, marginTop: 16 }}>{title}</h3>
        <p style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.6, color: "rgba(243,230,225,.88)" }}>{desc}</p>
      </div>
    </>
  );
  const style = {
    padding: 26, position: "relative" as const, overflow: "hidden" as const,
    minHeight: 230, display: "flex", flexDirection: "column" as const, justifyContent: "flex-end" as const,
    background: cover ? "var(--bg-surface)" : GRADIENTS[tone],
  };
  if (href) return <Link href={href} className="card hoverable" style={style}>{inner}</Link>;
  return <div className="card hoverable" style={style}>{inner}</div>;
}

/** Prototype: profileCard(name, age, loc, cls, online) */
export function ProfileCard({ name, age, loc, tone, online, id, photo }: {
  name: string; age: number; loc: string; tone: string; online?: boolean; id?: number; photo?: string;
}) {
  const inner = (
    <>
      <div className="cover" style={{ height: 200, position: "relative", background: GRADIENTS[tone] }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          }} />
        )}
        {online && (
          <span className="pill success" style={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>● Online</span>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{name}, {age}</span>
          <span style={{ color: "var(--rose-bright)" }}><Icon name="heart" /></span>
        </div>
        <div className="stone" style={{ fontSize: 12, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
          <Icon name="map" /> {loc}
        </div>
      </div>
    </>
  );
  const style = { overflow: "hidden" as const, cursor: "pointer" as const, display: "block" };
  if (id) return <Link href={`/u/${id}`} className="card hoverable" style={style}>{inner}</Link>;
  return <div className="card hoverable" style={style}>{inner}</div>;
}

/** Prototype: successStoryCard(n1, n2, quote, cls1, cls2, tag) */
export function SuccessStoryCard({ n1, n2, quote, tone1, tone2, tag }: {
  n1: string; n2: string; quote: string; tone1: string; tone2: string; tag: string;
}) {
  return (
    <div className="card hoverable" style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", height: 150 }}>
        <div style={{ flex: 1, background: GRADIENTS[tone1] }} />
        <div style={{ flex: 1, background: GRADIENTS[tone2] }} />
      </div>
      <div style={{ padding: 18 }}>
        <span className="pill rose">{tag}</span>
        <div style={{ fontWeight: 600, fontSize: 14, marginTop: 10 }}>{n1} &amp; {n2}</div>
        <p className="stone" style={{ fontSize: 12.5, marginTop: 6, lineHeight: 1.6 }}>&quot;{quote}&quot;</p>
      </div>
    </div>
  );
}

/** Prototype: reviewCard(name, age, quote, rating, cls) */
export function ReviewCard({ name, age, quote, rating, tone }: {
  name: string; age: number; quote: string; rating: number; tone: string;
}) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ color: "var(--gold-bright)" }}><Stars n={rating} /></div>
      <p style={{ fontSize: 14, lineHeight: 1.65, marginTop: 10 }}>&quot;{quote}&quot;</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
        <Avatar initial={name[0]} tone={tone} size={34} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{name}, {age}</div>
          <div className="stone" style={{ fontSize: 11 }}>Verified member</div>
        </div>
      </div>
    </div>
  );
}

/** Prototype: compareRow(feature, amoura, others) */
export function CompareRow({ feature, amoura, others }: { feature: string; amoura: boolean; others: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "2fr 1fr 1fr", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.05)", fontSize: 13,
    }}>
      <span>{feature}</span>
      <span style={{ textAlign: "center", color: "var(--gold-bright)" }}>{amoura ? "✓" : "—"}</span>
      <span style={{ textAlign: "center", color: "var(--stone-dim)" }}>{others ? "✓" : "—"}</span>
    </div>
  );
}

/** Prototype: cityChip(city, count) */
export function CityChip({ city, count }: { city: string; count: string }) {
  return (
    <span className="pill stone" style={{ padding: "9px 16px", cursor: "pointer" }}>
      {city} <span style={{ color: "var(--gold-bright)" }}>· {count}</span>
    </span>
  );
}

/** Prototype: pressLogo(name) */
export function PressLogo({ name }: { name: string }) {
  return (
    <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 17, color: "var(--stone)", opacity: 0.8 }}>
      {name}
    </span>
  );
}

/** Prototype: photoGrid(unlocked, total, …) */
export function PhotoGrid({ unlocked, total }: { unlocked: number; total: number }) {
  const tones = ["p1", "p3", "p5", "p2", "p4", "p6", "p1", "p3"];
  return (
    <div className="photo-grid">
      {tones.map((tone, i) => {
        const locked = i >= unlocked;
        return (
          <div key={i} className={`photo-tile ${locked ? "locked" : ""}`} style={{ background: GRADIENTS[tone] }}>
            {i === unlocked && (
              <div className="lockbadge">
                <Icon name="lock" />
                <b style={{ fontFamily: "var(--sans)", fontSize: 12 }}>+{total - unlocked} more</b>
                <span>Unlock with Premium</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
