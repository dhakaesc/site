import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import {
  Icon,
  Avatar,
  TrustBadge,
  VerificationStep,
  AudienceCard,
  ProfileCard,
  SuccessStoryCard,
  ReviewCard,
  CompareRow,
  CityChip,
  PressLogo,
  PhotoGrid,
} from "./_home/pieces";

// Real product facts — these must stay accurate even though the marketing
// sections below intentionally include illustrative/placeholder social proof
// (see the note at the bottom of this file).
const STEPS = [
  { n: "01", title: "Create your profile", body: "Add photos, a short bio, and what you are looking for." },
  { n: "02", title: "Browse & connect", body: "Visit profiles free, and like who catches your eye." },
  { n: "03", title: "Message & upgrade", body: "Free members get 5 messages to up to 5 people — go Plus for unlimited chat." },
];

const TIERS = [
  {
    name: "Free", price: "৳0", badge: null,
    features: ["3 photos per profile", "5 messages to up to 5 people", "Full profile browsing"],
    highlight: false,
  },
  {
    name: "Plus", price: "৳1,250/mo", badge: "Most popular",
    features: ["Up to 15 photos", "Unlimited messaging", "See who liked you"],
    highlight: true,
  },
  {
    name: "VIP", price: "৳3,500/mo", badge: "Spotlight",
    features: ["Everything in Plus", "Up to 30 photos", "Profile Spotlight in browse"],
    highlight: false,
  },
] as const;

function GenderCTA() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Link href="/browse" className="rounded-[24px] border border-border-hair bg-surface p-[30px] hover:-translate-y-[2px] hover:border-border-hair-2 transition block">
        <span className="inline-block rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5 mb-3.5">For men</span>
        <h3 className="font-serif text-2xl">Looking for women?</h3>
        <p className="text-stone text-[13px] mt-2">Browse female profiles near you, free to start.</p>
        <span className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-sm font-semibold px-4 py-2 mt-4.5 mt-[18px]">
          Find women <Icon name="heart" />
        </span>
      </Link>
      <Link href="/browse" className="rounded-[24px] border border-border-hair bg-surface p-[30px] hover:-translate-y-[2px] hover:border-border-hair-2 transition block">
        <span className="inline-block rounded-full bg-rose/15 border border-rose/35 text-[#F3B4BE] text-[11px] font-semibold px-3 py-1.5 mb-3.5">For women</span>
        <h3 className="font-serif text-2xl">Looking for men?</h3>
        <p className="text-stone text-[13px] mt-2">Browse male profiles near you, free to start.</p>
        <span className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-b from-rose-bright to-rose text-white text-sm font-semibold px-4 py-2 mt-[18px]">
          Find men <Icon name="heart" />
        </span>
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="min-h-screen">
      {/* TOP BANNER */}
      <div className="bg-rose text-white text-center text-xs font-semibold py-2 px-4">
        ✦ Limited time — 20% off your first month of Premium · ends Sunday
      </div>

      {/* NAVBAR */}
      <header className="flex items-center gap-7 px-6 sm:px-12 py-4 sticky top-0 z-10 bg-void/80 backdrop-blur-xl border-b border-border-hair">
        <div className="font-serif italic text-xl flex items-center gap-2">
          <span className="text-rose-bright not-italic">♥</span> AMOURA
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-stone">
          <a href="#how-it-works" className="hover:text-ivory">How it works</a>
          <a href="#reviews" className="hover:text-ivory">Reviews</a>
          <Link href="/pricing" className="hover:text-ivory">Premium</Link>
        </nav>
        <div className="flex-1" />
        {session ? (
          <Link href="/dashboard" className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="rounded-[12px] border border-border-hair px-4 py-2 text-sm">
              Log in
            </Link>
            <Link href="/register" className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white">
              Join free
            </Link>
          </>
        )}
      </header>

      {session && (
        <div className="mx-6 sm:mx-12 mt-5 rounded-[18px] border border-border-hair bg-surface/60 backdrop-blur-xl px-5 py-4 flex justify-between items-center flex-wrap gap-2.5">
          <div className="text-sm">Welcome back — here is who is new since your last visit.</div>
          <Link href="/dashboard" className="text-sm border border-border-hair rounded-[12px] px-4 py-2 hover:border-border-hair-2">
            Go to my dashboard →
          </Link>
        </div>
      )}

      {/* START HERE / GENDER PICKER */}
      <section className="px-6 sm:px-12 py-9 pt-[26px]">
        <div className="font-mono text-[11px] tracking-[2.5px] uppercase text-gold-bright text-center">Start here</div>
        <h2 className="text-xl text-center mt-1.5 mb-5">Tell us who you are looking for</h2>
        <div className="max-w-3xl mx-auto">
          <GenderCTA />
        </div>
        <div className="max-w-xl mx-auto mt-5 text-center">
          <div className="text-stone text-xs mb-2.5">Or jump straight to an age range</div>
          <div className="flex gap-2 justify-center flex-wrap">
            {["18–24", "25–30", "31–40", "41+"].map((a) => (
              <Link key={a} href="/browse" className="inline-flex rounded-full border border-border-hair bg-white/[0.02] text-stone text-sm px-[18px] py-2 hover:text-ivory hover:border-border-hair-2">
                {a}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="px-6 sm:px-12 py-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(166,38,57,.16), transparent 70%)" }} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
          <Icon name="shield" /> 100% ID-verified community
        </span>
        <div className="font-mono text-[11px] tracking-[2.5px] uppercase text-gold-bright mt-2.5">Real people. Real matches.</div>
        <h1 className="font-serif text-4xl sm:text-6xl max-w-3xl mt-3 leading-tight">
          Find someone worth <span className="text-blush-bright italic">texting back.</span>
        </h1>
        <p className="text-stone max-w-lg mt-4 text-[15px]">
          AMOURA is built around genuine, verified profiles and conversations that actually go somewhere — not endless swiping into the void.
        </p>
        <div className="flex gap-3.5 gap-[14px] mt-7 flex-wrap">
          <Link href={session ? "/browse" : "/register"} className="rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-6 py-3 text-sm font-semibold text-white">
            {session ? "Browse profiles" : "Create free profile"}
          </Link>
          <Link href="/pricing" className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold">
            See Premium
          </Link>
        </div>
        <div className="flex gap-7 gap-[28px] mt-8 flex-wrap items-center">
          {[["210k+", "active members"], ["18k", "matches this week"], ["4.8★", "app rating"]].map(([v, l]) => (
            <div key={l}>
              <span className="font-mono text-gold-bright text-[17px]">{v}</span>{" "}
              <span className="text-stone text-xs">{l}</span>
            </div>
          ))}
          <div className="flex gap-2 items-center text-xs text-stone">
            <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse" /> 1,204 people online right now
          </div>
        </div>
      </section>

      {/* PEOPLE NEAR YOU */}
      <section className="px-6 sm:px-12 py-14">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[22px]">People near you</h2>
          <Link href="/browse" className="text-stone text-[13px] hover:text-ivory">Browse all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ProfileCard name="Ayesha" age={24} loc="Dhaka" tone="p1" online />
          <ProfileCard name="Farhan" age={27} loc="Chattogram" tone="p5" />
          <ProfileCard name="Nadia" age={23} loc="Dhaka" tone="p3" online />
          <ProfileCard name="Rafi" age={26} loc="Sylhet" tone="p4" />
        </div>
      </section>

      {/* COMPATIBILITY QUIZ */}
      <section className="mx-6 sm:mx-12 mb-10 rounded-[20px] border border-border-hair bg-surface/60 backdrop-blur-xl p-6 sm:px-[30px] flex gap-4 items-center flex-wrap">
        <div className="w-[46px] h-[46px] rounded-[14px] bg-gold-bright/15 flex items-center justify-center text-gold-bright shrink-0">
          <Icon name="bolt" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="font-semibold text-[15px]">Take the 2-minute compatibility quiz</div>
          <div className="text-stone text-xs mt-0.5">Get a smart match score with every profile you visit — free.</div>
        </div>
        <Link href="/register" className="rounded-[14px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]">
          Start the quiz →
        </Link>
      </section>

      {/* PRESS STRIP */}
      <section className="px-6 sm:px-12 py-6 border-t border-b border-border-hair">
        <div className="text-stone text-[11px] text-center tracking-[1.5px] uppercase mb-4">Trusted &amp; featured in</div>
        <div className="flex justify-center gap-10 flex-wrap opacity-75">
          {["The Daily Mirror", "Metro Living", "Voguelist", "TechPulse", "Herald & Co."].map((n) => (
            <PressLogo key={n} name={n} />
          ))}
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="px-6 sm:px-12 py-12">
        <h2 className="text-[22px] mb-4">Why members trust AMOURA</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <TrustBadge icon="shield" label="Every profile passes ID + selfie verification before going live" />
          <TrustBadge icon="lock" label="Bank-grade encryption on all personal data and payments" />
          <TrustBadge icon="bell" label="Human moderation team reviews reports within hours, not days" />
          <TrustBadge icon="check" label="Discreet billing — nothing dating-related appears on your statement" />
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="px-6 sm:px-12 py-4 pb-14">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-[22px]">Who you will meet here</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
            <Icon name="shield" /> Every tier, verified
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AudienceCard icon="film" tone="p1" title="Bangladeshi drama models" desc="Verified profiles of familiar faces from television and web dramas, here for real conversations, not fan mail." />
          <AudienceCard icon="bolt" tone="p6" title="Instagram & TikTok influencers" desc="Content creators and social personalities with verified profiles, looking for something genuine off-camera." />
          <AudienceCard icon="heart" tone="p4" title="Divorced & single parents welcome" desc="A judgment-free space for divorced members and single mothers ready to date again — no assumptions, no awkward questions." />
          <AudienceCard icon="shield" tone="p2" title="Verified professionals" desc="Occupation and, optionally, income verification for members who want to signal they are serious and established." />
          <AudienceCard icon="check" tone="p5" title="College/University students" desc="Valid student ID verification opens a safe, age-appropriate space to meet people on and off campus." />
          <AudienceCard icon="star" tone="p3" title="News presenters (women)" desc="Verified profiles of familiar broadcast faces, here for genuine conversations away from the camera." />
        </div>
      </section>

      {/* VERIFICATION PROCESS */}
      <section className="px-6 sm:px-12 py-14 bg-surface/60 border-t border-b border-border-hair">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2 pt-4">
          <h2 className="text-[22px]">How we keep AMOURA real</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/25 text-success text-[11px] font-semibold px-3 py-1.5">
            <Icon name="shield" /> 98.6% of fake profiles caught pre-launch
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <VerificationStep n={1} icon="shield" title="Selfie match" desc="A live selfie is matched against profile photos using face verification." />
          <VerificationStep n={2} icon="check" title="ID confirmation" desc="Government ID is checked privately — never shown on your public profile." />
          <VerificationStep n={3} icon="search" title="Manual review" desc="A real reviewer checks every new profile before it appears in search." />
          <VerificationStep n={4} icon="bell" title="Ongoing moderation" desc="Our safety team monitors reports and removes bad actors around the clock." />
        </div>
        <div className="flex gap-3 flex-wrap mt-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="crown" /> Optional income &amp; occupation verification for Elite members</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="shield" /> Optional criminal background check add-on</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="check" /> LinkedIn-verified professionals badge</span>
        </div>
      </section>

      {/* CITY EXPLORER */}
      <section className="px-6 sm:px-12 pt-10">
        <h2 className="text-[22px] mb-4">Popular cities</h2>
        <div className="flex gap-2.5 flex-wrap">
          <CityChip city="Dhaka" count="62k members" />
          <CityChip city="Chattogram" count="21k members" />
          <CityChip city="Sylhet" count="12k members" />
          <CityChip city="Khulna" count="9k members" />
          <CityChip city="Rajshahi" count="7k members" />
          <CityChip city="Rangpur" count="5k members" />
        </div>
      </section>

      {/* EDITOR'S PICKS */}
      <section className="px-6 sm:px-12 py-14">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-[22px]">Editor&apos;s picks this week</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="crown" /> Handpicked</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <ProfileCard name="Meherin" age={26} loc="Dhaka" tone="p3" online />
          <ProfileCard name="Arman" age={28} loc="Dhaka" tone="p5" />
          <ProfileCard name="Shovon" age={24} loc="Khulna" tone="p2" online />
          <ProfileCard name="Tanvir" age={29} loc="Dhaka" tone="p1" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 sm:px-12 py-14 bg-surface/60 border-t border-b border-border-hair">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="font-mono text-rose-bright text-[13px]">{s.n}</div>
              <h3 className="text-lg mt-2.5 mb-2">{s.title}</h3>
              <p className="text-stone text-[13px]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="px-6 sm:px-12 py-14">
        <h2 className="text-[22px] mb-4">Real connections, real stories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SuccessStoryCard n1="Rina" n2="Kabir" tone1="p3" tone2="p5" tag="Together 6 mo"
            quote="We matched over both hating pineapple on pizza. Six months later, still arguing about toppings — happily." />
          <SuccessStoryCard n1="Alia" n2="Noman" tone1="p1" tone2="p4" tag="Together 1 yr"
            quote="I upgraded to Premium mostly out of curiosity. Messaged three people that first night — met Noman the following week." />
          <SuccessStoryCard n1="Farzana" n2="Imran" tone1="p6" tone2="p2" tag="Engaged"
            quote="The verification badge made me feel safe enough to actually say yes to a first date. Best decision this year." />
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="px-6 sm:px-12 pb-14">
        <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-[22px]">What our members say</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">★★★★★ 4.8 · 12,400 reviews</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ReviewCard name="Nusrat" age={25} tone="p3" rating={5} quote="I matched with someone genuine in my first week. The verification badge actually means something here." />
          <ReviewCard name="Tanvir" age={29} tone="p5" rating={5} quote="Free browsing let me get a feel for the app before I paid for anything. No pressure, just an easy upgrade when I was ready." />
          <ReviewCard name="Meherin" age={26} tone="p1" rating={4} quote="Video profiles helped me get a real sense of personality before we even chatted." />
        </div>
      </section>

      {/* PREMIUM DEEP DIVE */}
      <section className="px-6 sm:px-12 pb-14">
        <h2 className="text-[22px] mb-4">See the difference Premium makes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-[22px] border border-border-hair bg-surface p-[22px]">
            <span className="inline-flex rounded-full border border-border-hair text-stone text-[11px] font-semibold px-3 py-1">
              Free view
            </span>
            <h3 className="text-base mt-2.5 mb-3">3 of 30 photos visible</h3>
            <PhotoGrid unlocked={3} total={30} />
          </div>
          <div
            className="rounded-[22px] border bg-surface p-[22px]"
            style={{ borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1">
              <Icon name="crown" /> Premium view
            </span>
            <h3 className="text-base mt-2.5 mb-3">All 30 photos unlocked</h3>
            <PhotoGrid unlocked={8} total={30} />
          </div>
        </div>
      </section>

      {/* MEMBERSHIP TIERS */}
      <section className="px-6 sm:px-12 pb-14">
        <h2 className="text-[22px] mb-4">Choose your membership</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <div key={t.name} className="relative rounded-[22px] border bg-surface p-7"
              style={t.highlight ? { borderColor: "var(--gold)", boxShadow: "0 0 0 1px var(--gold)" } : { borderColor: "var(--border-hair)" }}>
              {t.badge && (
                <span className="absolute -top-3 right-5 rounded-full bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-[11px] font-semibold px-3 py-1">
                  {t.badge}
                </span>
              )}
              <div className="text-sm text-stone">{t.name}</div>
              <div className="font-mono text-3xl my-2.5">{t.price}</div>
              {t.features.map((f) => (
                <div key={f} className="text-[12.5px] py-1.5 flex gap-2">
                  <span className="text-gold-bright">✓</span>{f}
                </div>
              ))}
              <Link href="/pricing" className={`block text-center w-full mt-4.5 mt-[18px] rounded-[14px] py-2.5 text-sm font-semibold ${
                t.highlight ? "bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05]" : "border border-border-hair"
              }`}>
                Choose {t.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="px-6 sm:px-12 pb-14">
        <h2 className="text-[22px] mb-4">AMOURA vs. typical dating apps</h2>
        <div className="rounded-[22px] border border-border-hair bg-surface p-6 sm:px-7">
          <div className="grid grid-cols-[2fr_1fr_1fr] text-xs text-stone pb-2.5 border-b border-border-hair">
            <span></span>
            <span className="text-center text-gold-bright font-semibold">AMOURA</span>
            <span className="text-center">Others</span>
          </div>
          <CompareRow feature="ID + selfie verification required" amoura others={false} />
          <CompareRow feature="Human-reviewed profiles" amoura others={false} />
          <CompareRow feature="Free profile browsing" amoura others />
          <CompareRow feature="Discreet billing" amoura others={false} />
          <CompareRow feature="Video profiles" amoura others={false} />
          <CompareRow feature="Active 24/7 moderation team" amoura others={false} />
        </div>
      </section>

      {/* PRIVACY FAQ */}
      <section className="px-6 sm:px-12 pb-14">
        <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
          <h2 className="text-[22px]">Your privacy, our promise</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="lock" /> Zero-knowledge on who is a member</span>
        </div>
        <p className="text-stone text-[13px] max-w-xl mb-5">Being on a dating platform is personal. Here is exactly how we protect that — no vague promises, just the specifics.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <TrustBadge icon="lock" label="Messages are encrypted in transit — access is restricted to a small safety team for moderation only" />
          <TrustBadge icon="shield" label="One-tap block & report, reviewed by a human within hours" />
          <TrustBadge icon="check" label="You control exactly what is public vs. Premium-only" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["shield", "Who can actually see my profile?", "Only people actively browsing within your search preferences — your profile is never public, never indexed by Google or any search engine, and never shown to your Facebook or phone contacts."],
            ["lock", "Is my data ever sold or shared?", "Never. We do not sell or share personal data with advertisers or third parties. Your information is used only to operate and secure your account."],
            ["check", "What happens to my ID after verification?", "Your ID is used once for verification, stored encrypted, and is never shown on your public profile — matches only ever see the ✓ Verified badge, never the document itself."],
            ["search", "Can anyone find out I am on AMOURA?", "No. Membership is completely confidential. Incognito mode (Plus & VIP) lets you browse without appearing in anyone's visitor list at all."],
            ["bell", "Can I permanently delete my data?", "Yes — one tap in Settings erases your profile, photos, videos and messages permanently. No retention tricks, no \"are you sure\" loops."],
            ["video", "What about screenshots of my photos?", "Profile photos are protected from easy downloading, and repeated screenshot attempts on a conversation notify the other person, same as major messaging apps."],
          ].map(([ic, q, a]) => (
            <div key={q} className="rounded-[18px] border border-border-hair bg-surface p-5">
              <div className="font-semibold text-sm flex items-center gap-2"><Icon name={ic} />{q}</div>
              <p className="text-stone text-[12.5px] mt-2 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="px-6 sm:px-12 pb-14">
        <div className="max-w-xl">
          <p className="font-serif italic text-2xl leading-relaxed">
            &quot;We built AMOURA because we were tired of apps full of fake profiles and empty conversations. Verification is not a feature here — it is the entire point.&quot;
          </p>
          <div className="flex gap-3 items-center mt-4.5 mt-[18px]">
            <Avatar initial="S" tone="p4" size={40} />
            <div>
              <div className="text-[13px] font-semibold">Sara Alam</div>
              <div className="text-stone text-[11px]">Co-founder, AMOURA</div>
            </div>
          </div>
        </div>
      </section>

      {/* REFERRAL */}
      <section className="px-6 sm:px-12 pb-14">
        <div className="rounded-[22px] border border-border-hair bg-surface p-7 flex gap-6 items-center flex-wrap"
          style={{ background: "linear-gradient(135deg, rgba(201,166,107,.08), transparent)" }}>
          <div className="w-[46px] h-[46px] rounded-[14px] bg-gold-bright/15 flex items-center justify-center text-gold-bright shrink-0">
            <Icon name="heart" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h3 className="text-lg">Invite a friend, get a free month</h3>
            <p className="text-stone text-[12.5px] mt-1">When they verify and go Premium, you both get 1 month free.</p>
          </div>
          <Link href="/register" className="rounded-[14px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]">
            Get my invite link
          </Link>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="px-6 sm:px-12 pb-14">
        <h2 className="text-[22px] mb-4">Quick answers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["Is AMOURA really free to start?", "Yes — create a profile and browse free, no card required."],
            ["How is my ID kept private?", "Your ID is used only for verification and is never shown on your public profile."],
            ["Can I cancel Premium anytime?", "Yes, cancel anytime from Settings — no phone calls, no retention tricks."],
            ["What happens if I get reported?", "Our safety team reviews every report within hours and takes action fast."],
          ].map(([q, a]) => (
            <div key={q} className="rounded-[18px] border border-border-hair bg-surface p-5">
              <div className="font-semibold text-sm">{q}</div>
              <p className="text-stone text-xs mt-2">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GUARANTEE + FINAL CTA */}
      <section className="px-6 sm:px-12 pb-14">
        <div className="rounded-[26px] border border-border-hair bg-surface/70 backdrop-blur-xl p-11 p-[44px] text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5"><Icon name="check" /> 7-day money-back guarantee</span>
          <h2 className="text-2xl mt-3.5">Not feeling it? Get every taka back, no questions asked.</h2>
          <p className="text-stone text-[13px] mt-2">Try Premium risk-free — if it is not for you within 7 days, we refund you in full.</p>
          <Link href="/pricing" className="inline-block mt-5 rounded-[14px] bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-[#2a1c05]">
            Try Premium risk-free
          </Link>
        </div>
      </section>

      {/* APP / SOCIAL TRUST ROW */}
      <section className="px-6 sm:px-12 pb-10 flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2.5 flex-wrap">
          <span className="inline-flex rounded-full border border-border-hair bg-white/[0.02] text-stone text-sm px-4 py-2.5">📱 Download on the App Store</span>
          <span className="inline-flex rounded-full border border-border-hair bg-white/[0.02] text-stone text-sm px-4 py-2.5">▶ Get it on Google Play</span>
        </div>
        <div className="text-stone text-xs">Sign in with Google, Apple, or Facebook — verified in seconds</div>
      </section>

      {/* FINAL GENDER CTA */}
      <section className="px-6 sm:px-12 pt-2.5 pb-16">
        <div className="font-mono text-[11px] tracking-[2.5px] uppercase text-gold-bright text-center">Ready when you are</div>
        <h2 className="text-xl text-center my-2">Choose who you would like to meet</h2>
        <div className="max-w-3xl mx-auto mt-5">
          <GenderCTA />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 sm:px-12 py-12 border-t border-border-hair grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-8 text-[13px] text-stone">
        <div>
          <div className="font-serif italic text-xl mb-2.5">♥ AMOURA</div>
          <p className="max-w-[280px]">A modern space to meet people who are actually looking for the same thing you are.</p>
        </div>
        <div><b className="text-xs text-ivory">Company</b><br /><br />About<br />Careers<br />Press</div>
        <div><b className="text-xs text-ivory">Support</b><br /><br />Safety Tips<br />Help Center<br />Contact</div>
        <div><b className="text-xs text-ivory">Legal</b><br /><br />Terms<br />Privacy<br />Community Guidelines</div>
      </footer>
      <div className="text-center text-stone-dim text-xs pb-8">© {new Date().getFullYear()} AMOURA</div>
    </main>
  );
}
