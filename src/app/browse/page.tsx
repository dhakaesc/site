"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  id: number;
  name: string;
  age: number;
  bio: string | null;
  location: string | null;
  photos: string[];
};

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [index, setIndex] = useState(0);
  const [matchNotice, setMatchNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gender, setGender] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [location, setLocation] = useState("");

  function loadProfiles(g = gender, min = minAge, max = maxAge, loc = location) {
    const params = new URLSearchParams();
    if (g) params.set("gender", g);
    if (min) params.set("minAge", min);
    if (max) params.set("maxAge", max);
    if (loc) params.set("location", loc);

    fetch(`/api/browse?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProfiles(data.profiles ?? []);
        setIndex(0);
      })
      .catch(() => setError("Couldn't load profiles. Try again."));
  }

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setFiltersOpen(false);
    loadProfiles();
  }

  function clearFilters() {
    setGender("");
    setMinAge("");
    setMaxAge("");
    setLocation("");
    setFiltersOpen(false);
    loadProfiles("", "", "", "");
  }

  async function decide(liked: boolean) {
    const current = profiles?.[index];
    if (!current) return;

    setMatchNotice(null);
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: current.id, liked }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.matched) {
        setMatchNotice(`It's a match with ${current.name}! 🎉`);
      }
    }

    setIndex((i) => i + 1);
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="text-sm text-stone hover:text-ivory"
          >
            Filters{gender || minAge || maxAge || location ? " •" : ""}
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-stone hover:text-ivory"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {filtersOpen && (
        <form
          onSubmit={applyFilters}
          className="w-full max-w-md rounded-[18px] border border-border-hair bg-surface p-5 mb-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone mb-1.5">Show me</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="field-input"
              >
                <option value="">Anyone</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dhaka"
                className="field-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-stone mb-1.5">Min age</label>
              <input
                type="number"
                min={18}
                max={100}
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="block text-xs text-stone mb-1.5">Max age</label>
              <input
                type="number"
                min={18}
                max={100}
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-[12px] border border-border-hair-2 py-2.5 text-sm text-stone"
            >
              Clear
            </button>
            <button
              type="submit"
              className="flex-1 rounded-[12px] bg-gradient-to-b from-rose-bright to-rose py-2.5 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </div>
        </form>
      )}

      {matchNotice && (
        <div className="w-full max-w-md rounded-[14px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-sm font-semibold text-center py-3 mb-4">
          {matchNotice}
        </div>
      )}

      {error && <p className="text-danger text-sm">{error}</p>}

      {!profiles && !error && (
        <p className="text-stone text-sm">Loading profiles…</p>
      )}

      {profiles && profiles.length === 0 && (
        <div className="text-center text-stone text-sm mt-10">
          No profiles to show right now — check back later.
        </div>
      )}

      {profiles && index < profiles.length && (
        <ProfileCard profile={profiles[index]} onDecide={decide} />
      )}

      {profiles && profiles.length > 0 && index >= profiles.length && (
        <div className="text-center text-stone text-sm mt-10">
          That's everyone for now — check back later for new profiles.
        </div>
      )}
    </main>
  );
}

function ProfileCard({
  profile,
  onDecide,
}: {
  profile: Profile;
  onDecide: (liked: boolean) => void;
}) {
  return (
    <div className="w-full max-w-md rounded-[22px] border border-border-hair bg-surface overflow-hidden">
      <div className="aspect-[4/5] bg-surface-2 flex items-center justify-center">
        {profile.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-stone-dim text-sm">No photo yet</span>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-serif text-xl">
          {profile.name}, {profile.age}
        </h2>
        {profile.location && (
          <p className="text-stone text-xs mt-1">{profile.location}</p>
        )}
        {profile.bio && (
          <p className="text-ivory text-sm mt-3">{profile.bio}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onDecide(false)}
            className="flex-1 rounded-[14px] border border-border-hair py-3 text-sm font-semibold"
          >
            Pass
          </button>
          <button
            onClick={() => onDecide(true)}
            className="flex-1 rounded-[14px] bg-gradient-to-b from-rose-bright to-rose py-3 text-sm font-semibold text-white"
          >
            Like
          </button>
        </div>
      </div>
    </div>
  );
}
