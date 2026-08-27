import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How AMOURA works",
  description:
    "Create a profile, browse and connect free, then upgrade when you want unlimited messaging.",
};

const STEPS = [
  ["01", "Create your profile", "Add photos, a short bio, and what you are looking for."],
  ["02", "Browse & connect", "Visit profiles free, and like who catches your eye."],
  ["03", "Message & upgrade", "Free members can message up to 5 people (5 messages total) — go Plus for unlimited chat."],
];

export default function HowItWorksPage() {
  return (
    <section style={{ padding: "56px 48px 70px" }}>
      <div className="eyebrow">Getting started</div>
      <h1 style={{ fontSize: 30, margin: "10px 0 8px" }}>How AMOURA works</h1>
      <p className="stone" style={{ fontSize: 14, maxWidth: 560, marginBottom: 34 }}>
        Three steps, and the first two cost nothing.
      </p>

      <div className="grid g-3">
        {STEPS.map(([n, t, d]) => (
          <div key={n}>
            <div className="mono" style={{ color: "var(--rose-bright)", fontSize: 13 }}>{n}</div>
            <h3 style={{ fontSize: 19, margin: "10px 0 8px" }}>{t}</h3>
            <p className="stone" style={{ fontSize: 13 }}>{d}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
        <Link className="btn btn-rose" href="/register">Create free profile</Link>
        <Link className="btn btn-ghost" href="/pricing">See what Premium adds</Link>
      </div>
    </section>
  );
}
