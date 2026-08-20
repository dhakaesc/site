"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

type Profile = {
  id: number;
  name: string;
  age: number;
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
      .then((d) => {
        if (d.error) setError(d.error);
        else setProfile(d.profile);
      })
      .catch(() => setError("Couldn't load this profile."));

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSignedIn(Boolean(d.user)))
      .catch(() => setSignedIn(false));
  }, [id]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-stone">{error}</p>
          <Link href="/browse" className="text-gold-bright text-sm mt-3 inline-block">
            ← Back to browsing
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-6 sm:px-12 py-4 border-b border-border-hair">
        <Link href="/" className="font-serif italic text-xl flex items-center gap-2">
          <span className="text-rose-bright not-italic">♥</span> AMOURA
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/browse" className="text-sm text-stone hover:text-ivory">
            Browse
          </Link>
          {signedIn ? (
            <Link href="/dashboard" className="rounded-[12px] border border-border-hair px-4 py-2 text-sm">
              Dashboard
            </Link>
          ) : (
            <Link
              href="/register"
              className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white"
            >
              Join free
            </Link>
          )}
        </div>
      </header>

      {!profile ? (
        <p className="text-stone text-sm text-center py-20">Loading…</p>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8">
            {/* Photos */}
            <div>
              <div className="aspect-[4/5] rounded-[22px] overflow-hidden bg-surface-2">
                {profile.photos[active] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photos[active]}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-dim text-sm">
                    No photo yet
                  </div>
                )}
              </div>
              {profile.photos.length > 1 && (
                <div className="grid grid-cols-5 gap-2 mt-3">
                  {profile.photos.map((url, i) => (
                    <button
                      key={url}
                      onClick={() => setActive(i)}
                      className={`aspect-square rounded-[10px] overflow-hidden border ${
                        i === active ? "border-gold-bright" : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-3xl">
                  {profile.name}, {profile.age}
                </h1>
                {profile.verified && (
                  <span className="text-[10px] uppercase tracking-wide bg-success/10 border border-success/25 text-success font-semibold rounded-full px-2 py-0.5">
                    ✓ Verified
                  </span>
                )}
              </div>

              {profile.location && (
                <p className="text-stone text-sm mt-1.5">{profile.location}</p>
              )}

              {profile.categoryTitle && (
                <span className="inline-block mt-3 rounded-full bg-gold-bright/15 border border-gold-bright/35 text-gold-bright text-[11px] font-semibold px-3 py-1.5">
                  {profile.categoryTitle}
                </span>
              )}

              {profile.bio && (
                <p className="text-ivory text-sm mt-4 leading-relaxed">{profile.bio}</p>
              )}

              <div className="mt-6 rounded-[18px] border border-border-hair bg-surface p-5">
                {signedIn ? (
                  <>
                    <p className="text-stone text-sm mb-3">
                      Like {profile.name.split(" ")[0]} from the browse feed — if they
                      like you back, you can start a conversation.
                    </p>
                    <Link
                      href="/browse"
                      className="inline-block rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 py-2.5 text-sm font-semibold text-white"
                    >
                      Go to browsing
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm mb-1 font-semibold">
                      Want to message {profile.name.split(" ")[0]}?
                    </p>
                    <p className="text-stone text-[13px] mb-4">
                      Create a free profile to like and message. Free members get 5
                      messages to up to 5 people.
                    </p>
                    <div className="flex gap-2.5 flex-wrap">
                      <Link
                        href="/register"
                        className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 py-2.5 text-sm font-semibold text-white"
                      >
                        Create free profile
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-[12px] border border-border-hair px-5 py-2.5 text-sm"
                      >
                        Log in
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
