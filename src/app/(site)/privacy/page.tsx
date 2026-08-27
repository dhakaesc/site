import type { Metadata } from "next";
import { Icon, TrustBadge } from "../../_home/pieces";

export const metadata: Metadata = {
  title: "Privacy at AMOURA",
  description:
    "How AMOURA protects your profile, your ID and your messages — the specifics, not vague promises.",
};

const ANSWERS: [string, string, string][] = [
  ["shield", "Who can actually see my profile?", "Only people actively browsing within your search preferences — your profile is never public, never indexed by Google or any search engine, and never shown to your Facebook or phone contacts."],
  ["lock", "Is my data ever sold or shared?", "Never. We do not sell or share personal data with advertisers or third parties. Your information is used only to operate and secure your account."],
  ["check", "What happens to my ID after verification?", "Your ID is used once for verification, stored encrypted, and is never shown on your public profile — matches only ever see the ✓ Verified badge, never the document itself."],
  ["search", "Can anyone find out I am on AMOURA?", "No. Membership is completely confidential. Incognito mode (Plus & VIP) lets you browse without appearing in anyone's visitor list at all."],
  ["bell", "Can I permanently delete my data?", "Yes — one tap in Settings erases your profile, photos, videos and messages permanently. No retention tricks, no \u201Care you sure\u201D loops."],
  ["video", "What about screenshots of my photos?", "Profile photos are protected from easy downloading, and repeated screenshot attempts on a conversation notify the other person, same as major messaging apps."],
];

export default function PrivacyPage() {
  return (
    <section style={{ padding: "56px 48px 70px" }}>
      <div className="section-title">
        <h1 style={{ fontSize: 30 }}>Your privacy, our promise</h1>
        <span className="pill gold"><Icon name="lock" /> Zero-knowledge on who is a member</span>
      </div>
      <p className="stone" style={{ fontSize: 13, maxWidth: 600, marginTop: -6, marginBottom: 22 }}>
        Being on a dating platform is personal. Here is exactly how we protect that — no vague
        promises, just the specifics.
      </p>

      <div className="grid g-3" style={{ marginBottom: 20 }}>
        <TrustBadge icon="lock" label="Messages are encrypted in transit — access is restricted to a small safety team for moderation only" />
        <TrustBadge icon="shield" label="One-tap block & report, reviewed by a human within hours" />
        <TrustBadge icon="check" label="You control exactly what is public vs. Premium-only" />
      </div>

      <div className="grid g-2">
        {ANSWERS.map(([ic, q, a]) => (
          <div key={q} className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name={ic} />{q}
            </div>
            <p className="stone" style={{ fontSize: 12.5, marginTop: 8, lineHeight: 1.6 }}>{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
