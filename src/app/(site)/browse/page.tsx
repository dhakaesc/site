"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon, ProfileCard } from "../../_home/pieces";
import { CATEGORIES, categoryTitle } from "@/lib/categories";

type Profile = {
  id: number;
  name: string;
  age: number;
  bio: string | null;
  location: string | null;
  verified?: boolean;
  spotlighted?: boolean;
  photos: string[];
};

const TONES = ["p1", "p5", "p3", "p4", "p6", "p2"] as const;
const AGE_PRESETS: [string, string, string][] = [
  ["18–24", "18", "24"],
  ["25–30", "25", "30"],
  ["31–40", "31", "40"],
  ["41+", "41", ""],
];
const AGE_OPTIONS = [18, 21, 24, 28, 32, 36, 40, 45, 50, 60];

function BrowseInner() {
  const router = useRouter();
  const params = useSearchParams();

  // The URL is the single source of truth, so links from the homepage
  // ("Find women" / "Find men") and the category cards arrive pre-filtered
  // and stay shareable.
  const gender = params.get("gender") ?? "";
  const category = params.get("category") ?? "";
  const minAge = params.get("minAge") ?? "";
  const maxAge = params.get("maxAge") ?? "";
  const location = params.get("location") ?? "";

  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [fromAge, setFromAge] = useState(minAge || "18");
  const [toAge, setToAge] = useState(maxAge || "60");
  const [city, setCity] = useState(location);

  const setParams = useCallback(
    (changes: Record<string, string>) => {
      const next = new URLSearchParams(params.toString());
      Object.entries(changes).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      router.push(`/browse?${next.toString()}`);
    },
    [params, router]
  );

  useEffect(() => {
    const q = new URLSearchParams();
    if (gender) q.set("gender", gender);
    if (category) q.set("category", category);
    if (minAge) q.set("minAge", minAge);
    if (maxAge) q.set("maxAge", maxAge);
    if (location) q.set("location", location);

    setProfiles(null);
    fetch(`/api/browse?${q.toString()}`)
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []))
      .catch(() => setProfiles([]));
  }, [gender, category, minAge, maxAge, location]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, []);

  const activePreset = AGE_PRESETS.find(([, lo, hi]) => lo === minAge && hi === maxAge);

  return (
    <>
      {/* Gender toggle + filters */}
      <div style={{ padding: "24px 48px 12px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", gap: 4, background: "var(--bg-surface)",
          border: "1px solid var(--border-hair)", borderRadius: 999, padding: 3,
        }}>
          {[
            { label: "Everyone", value: "" },
            { label: "Men", value: "male" },
            { label: "Women", value: "female" },
          ].map((g) => (
            <button
              key={g.value || "all"}
              onClick={() => setParams({ gender: g.value })}
              className={`pill ${gender === g.value ? "rose" : "stone"}`}
              style={{ padding: "8px 18px", cursor: "pointer", border: "none" }}
            >
              {gender === g.value && g.value ? `Showing: ${g.label}` : g.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {category && (
          <span className="pill gold" style={{ padding: "8px 14px" }}>
            {categoryTitle(category) ?? category}
            <button onClick={() => setParams({ category: "" })}
              style={{ background: "none", border: "none", color: "inherit", marginLeft: 6 }}
              aria-label="Clear category">✕</button>
          </span>
        )}

        <button className="btn btn-ghost btn-sm" onClick={() => setShowFilters((v) => !v)}>
          <Icon name="filter" /> More filters
        </button>
      </div>

      {/* Age / city filter */}
      {showFilters && (
        <div style={{ padding: "0 48px 20px" }}>
          <div className="card" style={{ padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ color: "var(--gold-bright)" }}><Icon name="search" /></span>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>Search by age</span>
              <span className="stone" style={{ fontSize: 11.5 }}>
                — find matches in exactly the age range you want
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {AGE_PRESETS.map(([label, lo, hi]) => (
                <button key={label}
                  onClick={() => { setFromAge(lo); setToAge(hi || "60"); setParams({ minAge: lo, maxAge: hi }); }}
                  className={`pill ${activePreset?.[0] === label ? "gold" : "stone"}`}
                  style={{ padding: "8px 16px", cursor: "pointer", border: "none" }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="field-label">From age</label>
                <select className="field-input" value={fromAge} onChange={(e) => setFromAge(e.target.value)}>
                  {AGE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label className="field-label">To age</label>
                <select className="field-input" value={toAge} onChange={(e) => setToAge(e.target.value)}>
                  {AGE_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label className="field-label">City</label>
                <input className="field-input" value={city} placeholder="Dhaka"
                  onChange={(e) => setCity(e.target.value)} />
              </div>
              <button className="btn btn-gold btn-sm"
                onClick={() => setParams({ minAge: fromAge, maxAge: toAge, location: city })}>
                Apply
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              {CATEGORIES.map((c) => (
                <button key={c.slug}
                  onClick={() => setParams({ category: category === c.slug ? "" : c.slug })}
                  className={`pill ${category === c.slug ? "gold" : "stone"}`}
                  style={{ padding: "7px 14px", cursor: "pointer", border: "none" }}>
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: "0 48px 40px" }}>
        {!profiles && <p className="stone" style={{ fontSize: 13 }}>Loading profiles…</p>}

        {profiles && profiles.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <p className="stone" style={{ fontSize: 14 }}>
              No profiles match these filters yet.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }}
              onClick={() => router.push("/browse")}>
              Clear all filters
            </button>
          </div>
        )}

        {profiles && profiles.length > 0 && (
          <div className="grid g-5">
            {profiles.map((p, i) => (
              <ProfileCard
                key={p.id}
                id={p.id}
                name={p.name}
                age={p.age}
                loc={p.location || "Bangladesh"}
                tone={TONES[i % TONES.length]}
                photo={p.photos[0]}
              />
            ))}
          </div>
        )}

        {signedIn === false && profiles && profiles.length > 0 && (
          <div className="card glass" style={{
            marginTop: 24, padding: 20, display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ fontSize: 13 }}>
              Browsing is free. Create a profile to like and message people.
            </div>
            <Link className="btn btn-rose btn-sm" href="/register">Create free profile</Link>
          </div>
        )}
      </div>
    </>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseInner />
    </Suspense>
  );
}
