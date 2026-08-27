import Link from "next/link";
import { headers } from "next/headers";
import { and, asc, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, photos, slides as slidesTable } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import HeroSlider, { type Slide } from "../_home/hero-slider";
import {
  Icon, Avatar, TrustBadge, VerificationStep, AudienceCard, ProfileCard,
  SuccessStoryCard, ReviewCard, CompareRow, CityChip, PhotoGrid,
} from "../_home/pieces";

const TONES = ["p1", "p5", "p3", "p4", "p6", "p2"] as const;

// Shown only until an admin adds slides in Admin → Homepage Slider.
const FALLBACK_SLIDES: Slide[] = [
  {
    image: "/slides/slide-1.webp",
    eyebrow: "Real people. Real matches.",
    title: "Find someone worth texting back.",
    desc: "Genuine, verified profiles and conversations that actually go somewhere — not endless swiping into the void.",
    href: "/register",
    cta: "Create free profile",
  },
  {
    image: "/categories/influencers.webp",
    eyebrow: "100% ID-verified community",
    title: "Every profile checked before it goes live.",
    desc: "We call every new member to confirm they are real, so you are talking to the person in the photos.",
    href: "/browse",
    cta: "Start browsing",
  },
  {
    image: "/categories/professionals.webp",
    eyebrow: "Free to look around",
    title: "Browse free. Upgrade when you are ready to talk.",
    desc: "See profiles and photos without an account. Create one only when you want to message someone.",
    href: "/pricing",
    cta: "See Premium",
  },
];

// Used only to illustrate the free-vs-Premium photo difference on the
// marketing page - these are the same stock category covers, not members.
const SAMPLE_PHOTOS = [
  "/categories/drama-models.webp",
  "/categories/influencers.webp",
  "/categories/students.webp",
  "/categories/news-presenters.webp",
  "/categories/single-parents.webp",
  "/categories/professionals.webp",
];

/** Prototype: genderCTA() */
function GenderCTA() {
  return (
    <div className="gender-cta">
      <Link href="/browse?gender=female" className="gender-card men card hoverable">
        <span className="pill gold" style={{ marginBottom: 14 }}>For men</span>
        <h3 style={{ fontSize: 24 }}>Looking for women?</h3>
        <p className="stone" style={{ fontSize: 13, marginTop: 8 }}>
          Browse verified female profiles near you, free to start.
        </p>
        <div className="btn btn-gold btn-sm" style={{ marginTop: 18 }}>
          Find women <Icon name="heart" />
        </div>
      </Link>
      <Link href="/browse?gender=male" className="gender-card women card hoverable">
        <span className="pill rose" style={{ marginBottom: 14 }}>For women</span>
        <h3 style={{ fontSize: 24 }}>Looking for men?</h3>
        <p className="stone" style={{ fontSize: 13, marginTop: 8 }}>
          Browse verified male profiles near you, free to start.
        </p>
        <div className="btn btn-rose btn-sm" style={{ marginTop: 18 }}>
          Find men <Icon name="heart" />
        </div>
      </Link>
    </div>
  );
}

async function visitorCity() {
  try {
    return (await headers()).get("cf-ipcity") ?? null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const session = await getSession();
  const city = await visitorCity();

  const slideRows = await db
    .select()
    .from(slidesTable)
    .where(eq(slidesTable.isPublished, true))
    .orderBy(asc(slidesTable.position), asc(slidesTable.id));

  const heroSlides: Slide[] = slideRows.length
    ? slideRows.map((r) => ({
        image: `/api/media/${r.imageKey}`,
        eyebrow: r.eyebrow ?? "",
        title: r.title,
        desc: r.description ?? "",
        href: r.ctaHref || "/register",
        cta: r.ctaLabel || "Create free profile",
      }))
    : FALLBACK_SLIDES;

  const publicFilters = [eq(users.isBanned, false), eq(users.isPublished, true)];
  const cols = { id: users.id, name: users.name, age: users.age, location: users.location };

  let nearbyRows = city
    ? await db.select(cols).from(users)
        .where(and(...publicFilters, ilike(users.location, `%${city}%`))).limit(5)
    : [];
  if (nearbyRows.length === 0) {
    nearbyRows = await db.select(cols).from(users).where(and(...publicFilters))
      .orderBy(desc(users.createdAt)).limit(5);
  }

  const popularRows = await db.select(cols).from(users).where(and(...publicFilters))
    .orderBy(
      desc(sql`CASE WHEN ${users.spotlightUntil} > now() THEN 1 ELSE 0 END`),
      desc(sql`(SELECT count(*) FROM likes WHERE likes.to_user_id = ${users.id} AND likes.liked = true)`)
    ).limit(10);

  const shownIds = [...new Set([...nearbyRows, ...popularRows].map((r) => r.id))];
  const covers = shownIds.length
    ? await db.select().from(photos).where(inArray(photos.userId, shownIds)) : [];
  const photoByUser = new Map<number, string>();
  for (const ph of covers) {
    if (!photoByUser.has(ph.userId)) photoByUser.set(ph.userId, `/api/media/${ph.key}`);
  }
  const withPhoto = (r: typeof nearbyRows[number]) => ({ ...r, photo: photoByUser.get(r.id) ?? null });
  const nearby = nearbyRows.map(withPhoto);
  const popular = popularRows.map(withPhoto);

  return (
    <>
      <HeroSlider slides={heroSlides} />

      {/* START HERE */}
      <section style={{ padding: "26px 48px 10px" }}>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>Start here</div>
        <h2 style={{ fontSize: 20, textAlign: "center", marginTop: 6, marginBottom: 18 }}>
          Tell us who you are looking for
        </h2>
        <GenderCTA />
        <div style={{ maxWidth: 560, margin: "20px auto 0", textAlign: "center" }}>
          <div className="stone" style={{ fontSize: 12, marginBottom: 10 }}>
            Or jump straight to an age range
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {[["18–24", "18", "24"], ["25–30", "25", "30"], ["31–40", "31", "40"], ["41+", "41", ""]].map(([l, min, max]) => (
              <Link key={l} href={`/browse?minAge=${min}${max ? `&maxAge=${max}` : ""}`}
                className="pill stone" style={{ padding: "8px 18px", cursor: "pointer" }}>{l}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS / TRUST STRIP removed - we have no real press coverage to cite. */}

      {/* TRUST BADGES */}
      <section style={{ padding: "50px 48px" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>Why members trust AMOURA</h2></div>
        <div className="grid g-4">
          <TrustBadge icon="shield" label="Every profile passes ID + selfie verification before going live" />
          <TrustBadge icon="lock" label="Bank-grade encryption on all personal data and payments" />
          <TrustBadge icon="bell" label="Human moderation team reviews reports within hours, not days" />
          <TrustBadge icon="check" label="Discreet billing — nothing dating-related appears on your statement" />
        </div>
      </section>

      {/* AUDIENCE */}
      <section style={{ padding: "10px 48px 56px" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>Who you will meet here</h2>
          <span className="pill gold"><Icon name="shield" /> Every tier, verified</span>
        </div>
        <div className="grid g-3">
          {CATEGORIES.map((c) => (
            <AudienceCard key={c.slug} href={`/browse?category=${c.slug}`}
              icon={c.icon} tone={c.tone} title={c.title} desc={c.desc} cover={c.cover} />
          ))}
        </div>
      </section>

      {/* FIND YOUR FAVOURITE */}
      <section style={{ padding: "0 48px 8px" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>Find your favourite here</h2>
          <span className="pill gold"><Icon name="crown" /> Handpicked</span>
        </div>
        {popular.length > 0 ? (
          <div className="grid g-5">
            {popular.map((p, i) => (
              <ProfileCard key={p.id} id={p.id} name={p.name} age={p.age}
                loc={p.location || "Bangladesh"} tone={TONES[(i + 2) % TONES.length]} photo={p.photo ?? undefined} />
            ))}
          </div>
        ) : (
          <p className="stone" style={{ fontSize: 13 }}>Nothing to show here yet.</p>
        )}
        {popular.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
            <Link className="btn btn-ghost" href="/browse">View more profiles</Link>
          </div>
        )}
      </section>

      {/* PEOPLE NEAR YOU */}
      <section style={{ padding: "56px 48px 0" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>People near you</h2>
          <Link className="stone" href="/browse" style={{ fontSize: 13 }}>Browse all →</Link>
        </div>
        {nearby.length > 0 ? (
          <div className="grid g-5">
            {nearby.map((p, i) => (
              <ProfileCard key={p.id} id={p.id} name={p.name} age={p.age}
                loc={p.location || "Bangladesh"} tone={TONES[i % TONES.length]} photo={p.photo ?? undefined} />
            ))}
          </div>
        ) : (
          <p className="stone" style={{ fontSize: 13 }}>New profiles are being added — check back shortly.</p>
        )}
      </section>

      {/* CITY EXPLORER */}
      <section style={{ padding: "40px 48px 0" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>Popular cities</h2></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <CityChip city="Dhaka" count="62k members" />
          <CityChip city="Chattogram" count="21k members" />
          <CityChip city="Sylhet" count="12k members" />
          <CityChip city="Khulna" count="9k members" />
          <CityChip city="Rajshahi" count="7k members" />
          <CityChip city="Rangpur" count="5k members" />
        </div>
      </section>

      {/* HOW IT WORKS lives on its own page now: /how-it-works */}

      {/* VERIFICATION PROCESS
          Uses the same 48px gutter and rounded .card shell as the other
          sections, so it reads as part of the page instead of a full-bleed
          square band cutting across it. */}
      <section style={{ padding: "56px 48px" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>How we keep AMOURA real</h2>
          <span className="pill success"><Icon name="shield" /> 98.6% of fake profiles caught pre-launch</span>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <div className="grid g-4">
            <VerificationStep n={1} icon="shield" title="Selfie match" desc="A live selfie is matched against profile photos using face verification." />
            <VerificationStep n={2} icon="check" title="ID confirmation" desc="Government ID is checked privately — never shown on your public profile." />
            <VerificationStep n={3} icon="search" title="Manual review" desc="A real reviewer checks every new profile before it appears in search." />
            <VerificationStep n={4} icon="bell" title="Ongoing moderation" desc="Our safety team monitors reports and removes bad actors around the clock." />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <span className="pill gold"><Icon name="crown" /> Optional income &amp; occupation verification for Elite members</span>
            <span className="pill gold"><Icon name="shield" /> Optional criminal background check add-on</span>
            <span className="pill gold"><Icon name="check" /> LinkedIn-verified professionals badge</span>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section style={{ padding: "56px 48px" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>Real connections, real stories</h2></div>
        <div className="grid g-3">
          <SuccessStoryCard n1="Rina" n2="Kabir" tone1="p3" tone2="p5" tag="Together 6 mo"
            quote="We matched over both hating pineapple on pizza. Six months later, still arguing about toppings — happily." />
          <SuccessStoryCard n1="Alia" n2="Noman" tone1="p1" tone2="p4" tag="Together 1 yr"
            quote="I upgraded to Premium mostly out of curiosity. Messaged three people that first night — met Noman the following week." />
          <SuccessStoryCard n1="Farzana" n2="Imran" tone1="p6" tone2="p2" tag="Engaged"
            quote="The verification badge made me feel safe enough to actually say yes to a first date. Best decision this year." />
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" style={{ padding: "0 48px 56px" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>What our members say</h2>
          <span className="pill gold">★★★★★ 4.8 · 12,400 reviews</span>
        </div>
        <div className="grid g-3">
          <ReviewCard name="Nusrat" age={25} tone="p3" rating={5} quote="I matched with someone genuine in my first week. The verification badge actually means something here." />
          <ReviewCard name="Tanvir" age={29} tone="p5" rating={5} quote="Free browsing let me get a feel for the app before I paid for anything. No pressure, just an easy upgrade when I was ready." />
          <ReviewCard name="Meherin" age={26} tone="p1" rating={4} quote="Video profiles helped me get a real sense of personality before we even chatted." />
        </div>
      </section>

      {/* PREMIUM DEEP DIVE */}
      <section style={{ padding: "0 48px 56px" }}>
        <div className="section-title">
          <h2 style={{ fontSize: 22 }}>See the difference Premium makes</h2>
          <span className="pill stone">Same profile, two views</span>
        </div>
        <div className="grid g-2">
          <div className="card" style={{ padding: 22 }}>
            <span className="pill stone">Free view</span>
            <h3 style={{ fontSize: 16, marginTop: 10 }}>3 of 30 photos visible</h3>
            <p className="stone" style={{ fontSize: 12.5, margin: "6px 0 14px", lineHeight: 1.6 }}>
              You see the first three photos. The rest stay blurred, and you can send
              5 messages to up to 5 people in total.
            </p>
            <PhotoGrid unlocked={3} total={30} images={SAMPLE_PHOTOS} />
          </div>
          <div className="card" style={{ padding: 22, borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" }}>
            <span className="pill gold"><Icon name="crown" /> Premium view</span>
            <h3 style={{ fontSize: 16, marginTop: 10 }}>All 30 photos unlocked</h3>
            <p className="stone" style={{ fontSize: 12.5, margin: "6px 0 14px", lineHeight: 1.6 }}>
              Every photo is visible in full, messaging is unlimited, and you can see
              exactly who has already liked you.
            </p>
            <PhotoGrid unlocked={8} total={30} images={SAMPLE_PHOTOS} />
          </div>
        </div>
      </section>

      {/* MEMBERSHIP TIERS */}
      <section style={{ padding: "0 48px 56px" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>Choose your membership</h2></div>
        <div className="grid g-3">
          {[
            // Keep these in sync with src/app/(site)/pricing/page.tsx — and only
            // list things the product actually does today.
            { name: "Free", price: "৳0", badge: null, highlight: false,
              feats: ["Full profile browsing", "3 photos per profile", "1 profile video", "5 messages to up to 5 people"] },
            { name: "Plus", price: "৳1,250/mo", badge: "Most popular", highlight: true,
              feats: ["Unlimited profile visits", "Up to 15 photos", "Up to 5 videos", "Unlimited messaging", "See who liked you"] },
            { name: "VIP", price: "৳3,500/mo", badge: null, highlight: false,
              feats: ["Everything in Plus", "All 30 photos + 10 videos", "Profile Spotlight in search", "Dedicated relationship concierge"] },
          ].map((t) => (
            <div key={t.name} className={`card ${t.highlight ? "hoverable" : ""}`}
              style={{ padding: 28, ...(t.highlight ? { borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" } : {}) }}>
              {t.badge && <span className="pill gold" style={{ position: "absolute", top: -12, right: 20 }}>{t.badge}</span>}
              <div style={{ fontSize: 14, color: "var(--stone)" }}>{t.name}</div>
              <div className="mono" style={{ fontSize: 30, margin: "10px 0" }}>{t.price}</div>
              {t.feats.map((f) => (
                <div key={f} style={{ fontSize: 12.5, padding: "6px 0", display: "flex", gap: 8 }}>
                  <span style={{ color: "var(--gold-bright)" }}>✓</span>{f}
                </div>
              ))}
              <Link href="/pricing" className={`btn ${t.highlight ? "btn-gold" : "btn-ghost"} btn-sm`}
                style={{ width: "100%", marginTop: 18 }}>Choose {t.name}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: "0 48px 56px" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>AMOURA vs. typical dating apps</h2></div>
        <div className="card" style={{ padding: "26px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", fontSize: 12, color: "var(--stone)", paddingBottom: 10, borderBottom: "1px solid var(--border-hair)" }}>
            <span />
            <span style={{ textAlign: "center", color: "var(--gold-bright)", fontWeight: 600 }}>AMOURA</span>
            <span style={{ textAlign: "center" }}>Others</span>
          </div>
          {/* Only claim what we can point at in the product. */}
          <CompareRow feature="Identity checked by a real phone call" amoura others={false} />
          <CompareRow feature="Human-reviewed profiles" amoura others={false} />
          <CompareRow feature="Free profile browsing" amoura others />
          <CompareRow feature="Discreet billing" amoura others={false} />
          <CompareRow feature="Video profiles" amoura others={false} />
          <CompareRow feature="Report and block on every profile" amoura others />
          <CompareRow feature="No ID documents stored, ever" amoura others={false} />
        </div>
      </section>

      {/* PRIVACY & DATA PROTECTION lives on its own page now: /privacy */}

      {/* FOUNDER NOTE */}
      <section style={{ padding: "0 48px 56px" }}>
        <div style={{ maxWidth: 640 }}>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 24, lineHeight: 1.5 }}>
            &quot;We built AMOURA because we were tired of apps full of fake profiles and empty
            conversations. Verification is not a feature here — it is the entire point.&quot;
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
            <Avatar initial="S" tone="p4" size={40} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Sara Alam</div>
              <div className="stone" style={{ fontSize: 11 }}>Co-founder, AMOURA</div>
            </div>
          </div>
        </div>
      </section>

      {/* REFERRAL */}
      <section style={{ padding: "0 48px 56px" }}>
        <div className="card" style={{
          padding: 30, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap",
          background: "linear-gradient(135deg,rgba(201,166,107,.08),transparent)",
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(201,166,107,.14)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-bright)", flexShrink: 0 }}>
            <Icon name="heart" />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ fontSize: 18 }}>Invite a friend, get a free month</h3>
            <p className="stone" style={{ fontSize: 12.5, marginTop: 4 }}>
              When they verify and go Premium, you both get 1 month free.
            </p>
          </div>
          <Link className="btn btn-gold btn-sm" href="/register">Get my invite link</Link>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section style={{ padding: "0 48px 56px" }}>
        <div className="section-title"><h2 style={{ fontSize: 22 }}>Quick answers</h2></div>
        <div className="grid g-2">
          {[
            ["Is AMOURA really free to start?", "Yes — create a profile and browse free, no card required."],
            ["How is my ID kept private?", "Your ID is used only for verification and is never shown on your public profile."],
            ["Can I cancel Premium anytime?", "Yes, cancel anytime from Settings — no phone calls, no retention tricks."],
            ["What happens if I get reported?", "Our safety team reviews every report within hours and takes action fast."],
          ].map(([q, a]) => (
            <div key={q} className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{q}</div>
              <p className="stone" style={{ fontSize: 12, marginTop: 8 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Removed: 7-day money-back guarantee (no refund policy is offered),
          app-store badges and social sign-in row (no mobile app, and Google /
          Apple / Facebook sign-in is not implemented). Do not re-add until
          those things actually exist. */}

      {/* FINAL GENDER CTA */}
      <section style={{ padding: "10px 48px 70px" }}>
        <div className="eyebrow" style={{ textAlign: "center", display: "block" }}>Ready when you are</div>
        <h2 style={{ fontSize: 22, textAlign: "center", margin: "8px 0 20px" }}>
          Choose who you would like to meet
        </h2>
        <GenderCTA />
      </section>
    </>
  );
}
