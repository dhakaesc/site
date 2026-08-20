"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type Photo = { id: number; key: string };

export default function EditProfilePage() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  function loadPhotos() {
    fetch("/api/profile/photos")
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []));
  }

  useEffect(loadPhotos, []);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setBio(data.profile?.bio ?? "");
        setLocation(data.profile?.location ?? "");
      });
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSaved(false);
    setSavingProfile(true);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, location }),
    });

    setSavingProfile(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setProfileError(data.error ?? "Could not save.");
      return;
    }

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/profile/photos", {
      method: "POST",
      body: form,
    });

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed.");
      return;
    }

    loadPhotos();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/profile/photos/${id}`, { method: "DELETE" });
    loadPhotos();
  }

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <Link href="/dashboard" className="text-sm text-stone hover:text-ivory">
          Dashboard
        </Link>
      </div>

      <div className="rounded-[22px] border border-border-hair bg-surface p-8 mb-6">
        <h1 className="font-serif text-2xl mb-1">About you</h1>
        <p className="text-stone text-sm mb-6">
          A short bio and your location help others get to know you.
        </p>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-sm text-stone block mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell people a bit about yourself…"
              className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
            />
            <p className="text-stone-dim text-xs mt-1">{bio.length}/500</p>
          </div>

          <div>
            <label className="text-sm text-stone block mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              placeholder="e.g. Dhaka, Bangladesh"
              className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
            />
          </div>

          {profileError && (
            <p className="text-danger text-sm">{profileError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-full bg-ivory text-black text-sm font-medium px-5 py-2.5 disabled:opacity-50"
            >
              {savingProfile ? "Saving…" : "Save"}
            </button>
            {profileSaved && (
              <span className="text-sm text-stone">Saved.</span>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-[22px] border border-border-hair bg-surface p-8">
        <h1 className="font-serif text-2xl mb-1">Your photos</h1>
        <p className="text-stone text-sm mb-6">
          Add photos so others can see who you are.
        </p>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {photos?.map((p) => (
            <div
              key={p.id}
              className="relative aspect-square rounded-[14px] overflow-hidden bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/media/${p.key}`}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
              >
                ✕
              </button>
            </div>
          ))}

          <label className="aspect-square rounded-[14px] border border-dashed border-border-hair-2 flex items-center justify-center text-stone text-xs cursor-pointer hover:text-ivory">
            {uploading ? "Uploading…" : "+ Add photo"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <p className="text-stone-dim text-xs">
          JPEG, PNG, or WebP. Up to 8MB per photo.
        </p>
      </div>
    </main>
  );
}
