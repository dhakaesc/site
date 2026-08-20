"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Icon, PhotoGrid } from "../../../_home/pieces";

type Profile = {
  id: number;
  name: string;
  age: number;
  gender: string;
  bio: string | null;
  location: string | null;
  categoryTitle: string | null;
  verified: boolean;
  spotlighted: boolean;
  photos: string[];
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(`/api/profiles/${id}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setProfile(d.profile)))
      .catch(() => setError("Couldn't load this profile."));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, [id]);

  if (error) {
    return (
      <div className="px-6 sm:px-12 py-24 text-center">
        <p className="text-stone">{error}</p>
        <Link href="/browse" className="text-gold-bright text-sm mt-3 inline-block">
          ← Back to browsing
        </Link>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-stone text-sm text-center py-24">Loading…</p>;
  }

  const firstName = profile.name.split(" ")[0];
  const cover = profile.photos[active] ?? profile.photos[0];

  return (
    <div className="px-6 sm:px-12 pb-16 pt-6 flex gap-8 flex-wrap items-start">
      {/* MAIN COLUMN */}
      <div className="flex-[2] min-w-[340px]">
        {/* Cover */}
        <div className="h-[280px] rounded-[22px] relative overflow-hidden bg-surface-2">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-dim text-sm">
              No photo yet
            </div>
          )}
          {profile.spotlighted && (
            <span className="absolute top-4 left-4 rounded-full bg-success/10 border border-success/25 text-success text-[11px] font-semibold px-3 py-1">
              ● Spotlighted
            </span>
          )}
          {profile.verified && (
            <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1">
              <Icon name="shield" /> Verified
            </span>
          )}
        </div>

        {/* Name + actions */}
        <div className="flex justify-between items-start mt-5 flex-wrap gap-3">
          <div>
            <h1 className="font-serif text-[28px]">
              {profile.name}, {profile.age}
            </h1>
            <div className="text-stone text-[13px] mt-1 flex items-center gap-1.5">
              <Icon name="map" /> {profile.location || "Bangladesh"}
            </div>
          </div>
          <div className="flex gap-2.5">
            {signedIn ? (
              <>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-border-hair px-4 py-2 text-sm font-semibold"
                >
                  <Icon name="heart" /> Like
                </Link>
                <Link
                  href="/messages"
                  className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white"
                >
                  Message
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-[14px] border border-border-hair px-4 py-2 text-sm font-semibold"
                >
                  <Icon name="heart" /> Like
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white"
                >
                  Message
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Photos */}
        <div className="flex items-baseline justify-between mt-8 mb-3">
          <h3 className="text-[17px]">Photos</h3>
          <span className="rounded-full border border-border-hair text-stone text-[11px] px-2.5 py-1">
            {profile.photos.length} {profile.photos.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        {profile.photos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {profile.photos.map((url, i) => (
              <button
                key={url}
                onClick={() => setActive(i)}
                className={`aspect-square rounded-[14px] overflow-hidden border ${
                  i === active ? "border-gold-bright" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <PhotoGrid unlocked={0} total={30} />
        )}

        {/* About */}
        <h3 className="text-[17px] mt-8 mb-3">About</h3>
        <p className="text-stone text-sm leading-relaxed">
          {profile.bio || `${firstName} hasn't added a bio yet.`}
        </p>
        {profile.categoryTitle && (
          <div className="flex gap-2 flex-wrap mt-4">
            <span className="rounded-full border border-border-hair bg-white/[0.02] text-stone text-[11px] px-3 py-1.5">
              {profile.categoryTitle}
            </span>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <div className="flex-1 min-w-[260px] rounded-[22px] border border-border-hair bg-surface/60 backdrop-blur-xl p-6 sticky top-[90px]">
        <h3 className="text-[15px] mb-3.5">Basics</h3>
        {[
          ["Age", String(profile.age)],
          ["Location", profile.location || "Bangladesh"],
          ["Gender", profile.gender === "female" ? "Woman" : profile.gender === "male" ? "Man" : "Other"],
          ["Verified", profile.verified ? "Yes" : "Pending"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between text-[13px] py-2 border-b border-white/5"
          >
            <span className="text-stone">{k}</span>
            <span>{v}</span>
          </div>
        ))}

        {!signedIn && (
          <div
            className="rounded-[16px] border mt-5 p-4"
            style={{ background: "rgba(201,166,107,.06)", borderColor: "rgba(201,166,107,.3)" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1">
              <Icon name="crown" /> Free to join
            </span>
            <p className="text-xs mt-2.5 leading-relaxed">
              Create a free profile to like and message {firstName}. Free members get
              5 messages to up to 5 people.
            </p>
            <Link
              href="/register"
              className="block text-center w-full mt-3 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold py-2.5 text-sm font-semibold text-[#2a1c05]"
            >
              Create free profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
