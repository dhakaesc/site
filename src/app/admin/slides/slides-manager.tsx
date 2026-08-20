"use client";

import { useEffect, useRef, useState } from "react";

type Slide = {
  id: number;
  imageUrl: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  position: number;
  isPublished: boolean;
};

const EMPTY = {
  title: "",
  eyebrow: "",
  description: "",
  ctaLabel: "Create free profile",
  ctaHref: "/register",
};

export default function SlidesManager() {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Slide | null>(null);

  const [form, setForm] = useState({ ...EMPTY });
  const [file, setFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/admin/slides")
      .then((r) => r.json())
      .then((d) => setSlides(d.slides ?? []));
  }
  useEffect(load, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Please choose an image for the slide.");
      return;
    }
    setCreating(true);

    const body = new FormData();
    body.append("file", file);
    Object.entries(form).forEach(([k, v]) => body.append(k, v));

    const res = await fetch("/api/admin/slides", { method: "POST", body });
    setCreating(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? `Could not save the slide (${res.status}).`);
      return;
    }
    setForm({ ...EMPTY });
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  async function patch(id: number, updates: Record<string, unknown>) {
    setBusyId(id);
    await fetch("/api/admin/slides", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    setBusyId(null);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this slide? The image is removed too.")) return;
    setBusyId(id);
    await fetch("/api/admin/slides", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setBusyId(null);
    setEditing(null);
    load();
  }

  async function move(index: number, dir: -1 | 1) {
    if (!slides) return;
    const target = slides[index + dir];
    const current = slides[index];
    if (!target || !current) return;
    await patch(current.id, { position: target.position });
    await patch(target.id, { position: current.position });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await patch(editing.id, {
      title: editing.title,
      eyebrow: editing.eyebrow ?? "",
      description: editing.description ?? "",
      ctaLabel: editing.ctaLabel ?? "",
      ctaHref: editing.ctaHref ?? "",
    });
    setEditing(null);
  }

  return (
    <div>
      {/* Existing slides */}
      {!slides && <p className="stone" style={{ fontSize: 13 }}>Loading…</p>}
      {slides && slides.length === 0 && (
        <p className="stone" style={{ fontSize: 13, marginBottom: 24 }}>
          No slides yet. The homepage falls back to its built-in slide until you add one.
        </p>
      )}

      <div style={{ display: "grid", gap: 14, marginBottom: 32 }}>
        {slides?.map((s, i) => (
          <div key={s.id} className="card" style={{ padding: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.imageUrl} alt="" style={{
              width: 190, aspectRatio: "8/3", objectFit: "cover", borderRadius: 12, flexShrink: 0,
            }} />

            <div style={{ flex: 1, minWidth: 220 }}>
              <div className="eyebrow" style={{ fontSize: 10 }}>{s.eyebrow}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4 }}>{s.title}</div>
              <div className="stone" style={{ fontSize: 12, marginTop: 4 }}>{s.description}</div>
              <div className="stone" style={{ fontSize: 11, marginTop: 6 }}>
                Button: <b>{s.ctaLabel}</b> → {s.ctaHref}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span className={`pill ${s.isPublished ? "success" : "stone"}`}>
                {s.isPublished ? "Live" : "Hidden"}
              </span>
              <button className="btn btn-ghost btn-sm" disabled={i === 0 || busyId === s.id}
                onClick={() => move(i, -1)}>↑</button>
              <button className="btn btn-ghost btn-sm" disabled={i === slides.length - 1 || busyId === s.id}
                onClick={() => move(i, 1)}>↓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(s)}>Edit</button>
              <button className="btn btn-ghost btn-sm" disabled={busyId === s.id}
                onClick={() => patch(s.id, { isPublished: !s.isPublished })}>
                {s.isPublished ? "Hide" : "Show"}
              </button>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)", borderColor: "rgba(224,133,133,.3)" }}
                disabled={busyId === s.id} onClick={() => remove(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add a slide */}
      <div className="card" style={{ padding: 26 }}>
        <div className="section-title">
          <h3 style={{ fontSize: 16 }}>+ Add a slide</h3>
          <span className="pill stone">Wide image works best — about 1600×600</span>
        </div>

        <form onSubmit={create} style={{ display: "grid", gap: 14 }}>
          <div>
            <label className="field-label">Image</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="field-input" style={{ padding: 9 }} />
          </div>

          <div className="grid g-2" style={{ gap: 14 }}>
            <div>
              <label className="field-label">Small label above the heading</label>
              <input className="field-input" value={form.eyebrow} placeholder="Real people. Real matches."
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Heading</label>
              <input required className="field-input" value={form.title} placeholder="Find someone worth texting back."
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea rows={2} className="field-input" value={form.description}
              placeholder="One or two lines under the heading."
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="grid g-2" style={{ gap: 14 }}>
            <div>
              <label className="field-label">Button text</label>
              <input className="field-input" value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Button link</label>
              <input className="field-input" value={form.ctaHref} placeholder="/register"
                onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} />
            </div>
          </div>

          {error && <p style={{ color: "var(--danger)", fontSize: 13 }}>{error}</p>}

          <button type="submit" className="btn btn-gold" disabled={creating} style={{ justifySelf: "start" }}>
            {creating ? "Saving…" : "Add slide"}
          </button>
        </form>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,.6)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
        }}>
          <form onSubmit={saveEdit} className="card" style={{ padding: 26, width: "100%", maxWidth: 520, display: "grid", gap: 14 }}>
            <div className="section-title">
              <h3 style={{ fontSize: 16 }}>Edit slide</h3>
              <span className="stone" style={{ fontSize: 11 }}>ID #{editing.id}</span>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={editing.imageUrl} alt="" style={{ width: "100%", aspectRatio: "8/3", objectFit: "cover", borderRadius: 12 }} />
            <p className="stone" style={{ fontSize: 11, marginTop: -6 }}>
              To change the picture, delete this slide and add a new one.
            </p>

            <div>
              <label className="field-label">Small label</label>
              <input className="field-input" value={editing.eyebrow ?? ""}
                onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Heading</label>
              <input required className="field-input" value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Description</label>
              <textarea rows={2} className="field-input" value={editing.description ?? ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </div>
            <div className="grid g-2" style={{ gap: 14 }}>
              <div>
                <label className="field-label">Button text</label>
                <input className="field-input" value={editing.ctaLabel ?? ""}
                  onChange={(e) => setEditing({ ...editing, ctaLabel: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Button link</label>
                <input className="field-input" value={editing.ctaHref ?? ""}
                  onChange={(e) => setEditing({ ...editing, ctaHref: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-gold" style={{ flex: 1 }}>Save changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
