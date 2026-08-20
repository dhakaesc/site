"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Icon, PhotoGrid } from "../../../_home/pieces";
import PhotoLightbox from "../../../_home/photo-lightbox";

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
  const [lightbox, setLightbox] = useState<number | null>(null);

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
  // First photo is the profile picture; the next one (when there is one) makes
  // a better cover so the two are not identical.
  const avatarPhoto = profile.photos[0];
  const coverPhoto = profile.photos[1] ?? profile.photos[0];

  return (
    <>
    <div className="px-6 sm:px-12 pb-16 pt-6 flex gap-8 flex-wrap items-start">
      {/* MAIN COLUMN */}
      <div className="flex-[2] min-w-[340px]">
        {/* Cover photo with the profile picture sitting over its bottom-left */}
        <div style={{ position: "relative", marginBottom: 58 }}>
          <div className="cover" style={{
            height: 280, borderRadius: 22, position: "relative", overflow: "hidden",
            background: "var(--bg-surface-2)",
          }}>
            {coverPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPhoto} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            ) : (
              <div className="stone" style={{
                height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13,
              }}>No photo yet</div>
            )}
            {profile.spotlighted && (
              <span className="pill success" style={{ position: "absolute", top: 16, left: 16 }}>
                ● Spotlighted
              </span>
            )}
            {profile.verified && (
              <span className="pill gold" style={{ position: "absolute", top: 16, right: 16 }}>
                <Icon name="shield" /> Verified
              </span>
            )}
          </div>

          {/* Round profile picture */}
          <div style={{
            position: "absolute", left: 28, bottom: -46,
            width: 116, height: 116, borderRadius: "50%", overflow: "hidden",
            border: "4px solid var(--bg-void)", background: "var(--bg-surface-2)",
            boxShadow: "0 12px 30px -10px rgba(0,0,0,.7)",
          }}>
            {avatarPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPhoto} alt={profile.name} style={{
                width: "100%", height: "100%", objectFit: "cover",
              }} />
            ) : (
              <div className="stone" style={{
                height: "100%", display: "flex", alignItems: "center",
                justifyContent: "center", fontFamily: "var(--serif)", fontSize: 34,
              }}>{profile.name[0]}</div>
            )}
          </div>
        </div>

        {/* Name + actions */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{ fontSize: 28 }}>{profile.name}, {profile.age}</h1>
            <div className="stone" style={{
              fontSize: 13, marginTop: 4, display: "flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="map" /> {profile.location || "Bangladesh"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="btn btn-ghost btn-sm" href={signedIn ? "/browse" : "/register"}>
              <Icon name="heart" /> Like
            </Link>
            <Link className="btn btn-rose btn-sm" href={signedIn ? "/messages" : "/register"}>
              <Icon name="msg" /> Message
            </Link>
          </div>
        </div>

        {/* Photos */}
        <div className="section-title" style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 17 }}>Photos</h3>
          <span className="pill stone">
            {profile.photos.length} {profile.photos.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        {profile.photos.length > 0 ? (
          <div className="photo-grid">
            {profile.photos.map((url, i) => (
              <button
                key={url}
                onClick={() => setLightbox(i)}
                className="photo-tile"
                aria-label={`Open photo ${i + 1}`}
                style={{ border: "none", padding: 0, cursor: "pointer", background: "var(--bg-surface-2)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" loading="lazy" style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                }} />
              </button>
            ))}
          </div>
        ) : (
          <PhotoGrid unlocked={0} total={30} />
        )}

        {/* Videos */}
        <div className="section-title" style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 17 }}>Videos</h3>
          <span className="pill stone">Coming soon</span>
        </div>
        <div className="video-row">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="video-tile locked" style={{ background: "var(--bg-surface-2)" }}>
              <div className="lockbadge">
                <Icon name="video" />
                <span>Video profiles<br />coming soon</span>
              </div>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="section-title" style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 17 }}>About</h3>
        </div>
        <p className="stone" style={{ fontSize: 14, lineHeight: 1.7 }}>
          {profile.bio || `${firstName} hasn't added a bio yet.`}
        </p>
        {profile.categoryTitle && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            <span className="pill stone">{profile.categoryTitle}</span>
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

    {lightbox !== null && profile.photos.length > 0 && (
      <PhotoLightbox
        photos={profile.photos}
        index={lightbox}
        name={profile.name}
        onClose={() => setLightbox(null)}
        onIndexChange={setLightbox}
      />
    )}
    </>
  );
}
