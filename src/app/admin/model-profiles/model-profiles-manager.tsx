"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/categories";

type Profile = {
  id: number;
  name: string;
  age: number;
  gender: string;
  location: string | null;
  bio: string | null;
  category: string | null;
  adminNote: string | null;
  isPublished: boolean;
  createdAt: string;
  photos: string[];
};

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.title])
);

export default function ModelProfilesManager() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    category: CATEGORIES[0].slug as string,
    location: "",
    gender: "female",
    published: false,
    bio: "",
    adminNote: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newProfileId, setNewProfileId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/admin/model-profiles")
      .then((r) => r.json())
      .then((d) => setProfiles(d.profiles ?? []));
  }

  useEffect(load, []);

  async function togglePublish(id: number, isPublished: boolean) {
    setBusyId(id);
    await fetch("/api/admin/model-profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id, isPublished: !isPublished }),
    });
    setBusyId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this profile permanently? This can't be undone.")) return;
    setBusyId(id);
    await fetch("/api/admin/model-profiles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    setBusyId(null);
    load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setBusyId(editing.id);
    await fetch("/api/admin/model-profiles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: editing.id,
        name: editing.name,
        age: editing.age,
        category: editing.category ?? undefined,
        gender: editing.gender,
        location: editing.location ?? "",
        bio: editing.bio ?? "",
        adminNote: editing.adminNote ?? "",
      }),
    });
    setBusyId(null);
    setEditing(null);
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);

    const res = await fetch("/api/admin/model-profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        category: form.category,
        location: form.location,
        bio: form.bio,
        published: form.published,
        adminNote: form.adminNote,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Couldn't create profile.");
      return;
    }

    const data = await res.json();
    setNewProfileId(data.profile.id);
    setForm({
      name: "",
      age: "",
      category: CATEGORIES[0].slug as string,
      location: "",
      gender: "female",
      published: false,
      bio: "",
      adminNote: "",
    });
    load();
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !newProfileId) return;
    setUploading(true);

    const body = new FormData();
    body.append("file", file);
    await fetch(`/api/admin/model-profiles/${newProfileId}/photos`, {
      method: "POST",
      body,
    });

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    load();
  }

  const visible = profiles?.filter((p) => (filter === "all" ? true : p.category === filter));

  const activeProfile = profiles?.find((p) => p.id === newProfileId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex gap-2">
          {["all", ...CATEGORIES.map((c) => c.slug)].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
                filter === f
                  ? "bg-gold-bright/15 border border-gold-bright/35 text-gold-bright"
                  : "border border-border-hair text-stone"
              }`}
            >
              {f === "all"
                ? `All (${profiles?.length ?? 0})`
                : CATEGORY_LABEL[f]}
            </button>
          ))}
        </div>
        <a
          href="#create-profile-form"
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-sm font-semibold px-4 py-2"
        >
          + Create profile
        </a>
      </div>

      <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden mb-8">
        {!profiles && <p className="text-stone text-sm p-4">Loading…</p>}
        {profiles && visible?.length === 0 && (
          <p className="text-stone text-sm p-4">No profiles here yet.</p>
        )}
        {visible && visible.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone text-xs border-b border-border-hair">
                <th className="px-4 py-3 font-medium">Profile</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b border-border-hair last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {p.photos[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photos[0]} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-xs">
                          {p.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold">{p.name}, {p.age}</div>
                        <div className="text-stone text-[11px]">ID #{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category && (
                      <span className="rounded-full border border-gold-bright/35 bg-gold-bright/15 text-gold-bright text-[11px] font-semibold px-2.5 py-1">
                        {CATEGORY_LABEL[p.category] ?? p.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone">{p.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border text-[11px] font-semibold px-2.5 py-1 ${
                      p.isPublished ? "bg-success/10 border-success/25 text-success" : "border-border-hair text-stone"
                    }`}>
                      {p.isPublished ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-stone text-xs hover:text-ivory"
                      >
                        Edit
                      </button>
                      <button
                        disabled={busyId === p.id}
                        onClick={() => togglePublish(p.id, p.isPublished)}
                        className="text-stone text-xs hover:text-ivory disabled:opacity-50"
                      >
                        {p.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        disabled={busyId === p.id}
                        onClick={() => remove(p.id)}
                        className="text-danger text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div id="create-profile-form" className="rounded-[18px] border border-border-hair bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">+ Create a profile</h3>
          <span className="rounded-full border border-border-hair text-stone text-[11px] px-2.5 py-1">
            Admin-created
          </span>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LabeledInput label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Tanjila Rahman" required />
            <LabeledInput label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} placeholder="24" required />
            <div>
              <label className="block text-xs text-stone mb-1.5">Profile type</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field-input">
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <LabeledInput label="City" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Dhaka" />
            <div>
              <label className="block text-xs text-stone mb-1.5">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="field-input">
                <option value="female">Woman</option>
                <option value="male">Man</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone mb-1.5">Status</label>
              <select
                value={form.published ? "active" : "draft"}
                onChange={(e) => setForm({ ...form, published: e.target.value === "active" })}
                className="field-input"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-stone mb-1.5">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Short bio for the public profile"
              className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
            />
          </div>

          <div>
            <label className="block text-xs text-stone mb-1.5">
              Internal note (never shown publicly — e.g. how/when they paid)
            </label>
            <textarea
              rows={2}
              value={form.adminNote}
              onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
              placeholder="Paid via bKash, Aug 2026 — contacted via WhatsApp"
              className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button
            type="submit"
            disabled={creating}
            className="rounded-[12px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create profile"}
          </button>
        </form>

        {activeProfile && (
          <div className="mt-6 pt-6 border-t border-border-hair">
            <label className="block text-xs text-stone mb-2">
              Photos for {activeProfile.name} (up to 30)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {activeProfile.photos.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="aspect-square rounded-[12px] object-cover" />
              ))}
              <label className="aspect-square rounded-[12px] border border-dashed border-border-hair-2 flex flex-col items-center justify-center text-stone-dim text-xs cursor-pointer hover:text-stone">
                {uploading ? "…" : "↑ Upload"}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 px-4 py-8 overflow-y-auto">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-lg rounded-[18px] border border-border-hair bg-surface p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg">Edit profile</h3>
              <span className="text-stone-dim text-[11px]">ID #{editing.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <LabeledInput
                label="Full name"
                value={editing.name}
                onChange={(v) => setEditing({ ...editing, name: v })}
                required
              />
              <LabeledInput
                label="Age"
                type="number"
                value={String(editing.age)}
                onChange={(v) => setEditing({ ...editing, age: Number(v) })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-stone mb-1.5">Category</label>
                <select
                  value={editing.category ?? ""}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="field-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-stone mb-1.5">Gender</label>
                <select
                  value={editing.gender}
                  onChange={(e) => setEditing({ ...editing, gender: e.target.value })}
                  className="field-input"
                >
                  <option value="female">Woman</option>
                  <option value="male">Man</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <LabeledInput
              label="City"
              value={editing.location ?? ""}
              onChange={(v) => setEditing({ ...editing, location: v })}
            />

            <div>
              <label className="block text-xs text-stone mb-1.5">Bio</label>
              <textarea
                rows={3}
                value={editing.bio ?? ""}
                onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-1.5">
                Internal note (never shown publicly)
              </label>
              <textarea
                rows={2}
                value={editing.adminNote ?? ""}
                onChange={(e) => setEditing({ ...editing, adminNote: e.target.value })}
                className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
              />
            </div>

            <div>
              <label className="block text-xs text-stone mb-2">Photos</label>
              <div className="grid grid-cols-5 gap-2">
                {editing.photos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} src={url} alt="" className="aspect-square rounded-[10px] object-cover" />
                ))}
                <label className="aspect-square rounded-[10px] border border-dashed border-border-hair-2 flex items-center justify-center text-stone-dim text-[10px] cursor-pointer hover:text-stone">
                  ↑ Add
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !editing) return;
                      const body = new FormData();
                      body.append("file", file);
                      await fetch(`/api/admin/model-profiles/${editing.id}/photos`, {
                        method: "POST",
                        body,
                      });
                      const res = await fetch("/api/admin/model-profiles");
                      const d = await res.json();
                      setProfiles(d.profiles ?? []);
                      const fresh = (d.profiles ?? []).find((x: Profile) => x.id === editing.id);
                      if (fresh) setEditing(fresh);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 rounded-[12px] border border-border-hair-2 py-2.5 text-sm text-stone"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyId === editing.id}
                className="flex-1 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold py-2.5 text-sm font-semibold text-[#2a1c05] disabled:opacity-60"
              >
                {busyId === editing.id ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function LabeledInput({
  label, value, onChange, placeholder, type = "text", required,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-stone mb-1.5">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input"
      />
    </div>
  );
}
