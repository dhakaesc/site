"use client";

import { useCallback, useEffect, useState } from "react";

type Profile = {
  id: number;
  name: string;
  gender: string;
  tier: string;
  isBanned: boolean;
  isModelProfile: boolean;
  messageCount: number;
  unread: number;
  lastMessageAt: string | null;
  avatar: string | null;
};

type Conversation = {
  id: number;
  name: string;
  age: number | null;
  tier: string;
  isBanned: boolean;
  messageCount: number;
  unread: number;
  lastMessage: string;
  lastMessageMine: boolean;
  lastMessageAt: string;
};

type Contact = {
  id: number;
  name: string;
  age: number | null;
  email: string;
  phone: string;
  location: string | null;
  tier: string;
  isBanned: boolean;
  verified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
  ip: string | null;
};

type ThreadMessage = {
  id: number;
  body: string;
  mine: boolean;
  read: boolean;
  createdAt: string;
};

function initial(name: string) {
  return (name.trim()[0] ?? "?").toUpperCase();
}

function shortTime(iso: string | null) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d` : new Date(iso).toLocaleDateString();
}

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full bg-surface-2 border border-border-hair flex items-center justify-center font-semibold shrink-0"
    >
      {initial(name)}
    </div>
  );
}

export default function InboxBrowser() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [genderTab, setGenderTab] = useState<"all" | "female" | "male">("all");
  const [search, setSearch] = useState("");

  const [openProfile, setOpenProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetch("/api/admin/inbox")
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? `Request failed (${r.status})`);
        return d;
      })
      .then((d) => setProfiles(d.profiles ?? []))
      .catch((e) => {
        setError(e.message ?? "Couldn't load profiles.");
        setProfiles([]);
      });
  }, []);

  const openConversation = useCallback(
    (profileId: number, otherId: number) => {
      setActiveId(otherId);
      setThread(null);
      setContact(null);
      fetch(`/api/admin/inbox?profile=${profileId}&with=${otherId}`)
        .then((r) => r.json())
        .then((d) => {
          setThread(d.thread ?? []);
          setContact(d.contact ?? null);
        })
        .catch(() => setThread([]));
    },
    []
  );

  function openInbox(p: Profile) {
    setOpenProfile(p);
    setConversations(null);
    setThread(null);
    setContact(null);
    setActiveId(null);
    fetch(`/api/admin/inbox?profile=${p.id}`)
      .then((r) => r.json())
      .then((d) => {
        const list: Conversation[] = d.conversations ?? [];
        setConversations(list);
        if (list.length > 0) openConversation(p.id, list[0].id);
      })
      .catch(() => setConversations([]));
  }

  // ---- Level 2: one profile's inbox ---------------------------------------
  if (openProfile) {
    return (
      <div>
        <button
          onClick={() => setOpenProfile(null)}
          className="btn btn-ghost btn-sm"
        >
          ← Back to all profiles
        </button>

        <div className="inbox-shell" style={{ marginTop: 16 }}>
          <div className="convo-list">
            {!conversations && <p className="text-stone text-sm p-4">Loading…</p>}
            {conversations?.length === 0 && (
              <p className="text-stone text-sm text-center px-4 py-8">
                No conversations yet
              </p>
            )}
            {conversations?.map((c) => (
              <div
                key={c.id}
                onClick={() => openConversation(openProfile.id, c.id)}
                className={`convo-item${activeId === c.id ? " active" : ""}`}
              >
                <Avatar src={null} name={c.name} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="cname">
                    <span className="truncate">
                      {c.name}
                      {c.age ? `, ${c.age}` : ""}
                    </span>
                    <span className="text-stone-dim text-[11px] shrink-0">
                      {shortTime(c.lastMessageAt)}
                    </span>
                  </div>
                  <div className="cpreview">
                    {c.lastMessageMine ? "" : "↩ "}
                    {c.lastMessage}
                  </div>
                </div>
                {c.unread > 0 && <span className="unread-dot" />}
              </div>
            ))}
          </div>

          <div className="chat-pane">
            {contact && (
              <div className="chat-header">
                <Avatar src={null} name={contact.name} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {contact.name}
                    {contact.age ? `, ${contact.age}` : ""}
                  </div>
                  <div className="stone truncate" style={{ fontSize: 11 }}>
                    {contact.email}
                    {contact.phone ? ` · ${contact.phone}` : ""}
                  </div>
                </div>
                <span className="pill stone">messaging {openProfile.name}</span>
              </div>
            )}

            <div className="chat-messages">
              {!thread && activeId !== null && (
                <p className="text-stone text-sm">Loading…</p>
              )}
              {activeId === null && conversations?.length === 0 && (
                <p className="text-stone text-sm">
                  Nobody has messaged {openProfile.name} yet.
                </p>
              )}
              {thread?.map((m) => (
                <div key={m.id} className={`bubble ${m.mine ? "me" : "them"}`}>
                  {m.body}
                  <div
                    className="bubble-time"
                    style={{ color: m.mine ? "rgba(255,255,255,.7)" : "var(--stone-dim)" }}
                  >
                    {new Date(m.createdAt).toLocaleString()}
                    {!m.read && !m.mine ? " · unread" : ""}
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-input-row">
              <input
                className="field-input"
                placeholder="Admin view is read-only"
                disabled
              />
              <button className="btn btn-ghost btn-sm" disabled style={{ opacity: 0.4 }}>
                Send
              </button>
            </div>
          </div>

          <div className="contact-panel">
            {contact ? (
              <>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div className="flex justify-center">
                    <Avatar src={null} name={contact.name} size={54} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 8 }}>
                    {contact.name}
                  </div>
                  <div className="stone break-all" style={{ fontSize: 11 }}>
                    {contact.email}
                  </div>
                </div>
                <div className="divider" />

                <Field label="Phone" value={contact.phone || "Not provided"} mono />
                <Field label="Location" value={contact.location || "Not provided"} />
                <Field
                  label="IP address"
                  value="Not recorded"
                  mono
                  note="Sign-in IPs are not stored anywhere yet."
                />
                <Field label="Plan" value={contact.tier.toUpperCase()} />
                <Field
                  label="Verified"
                  value={contact.verified ? "Yes" : "No"}
                />
                <Field
                  label="Joined"
                  value={new Date(contact.createdAt).toLocaleDateString()}
                />
                <Field
                  label="Last seen"
                  value={
                    contact.lastSeenAt
                      ? new Date(contact.lastSeenAt).toLocaleString()
                      : "Never"
                  }
                />
                {contact.isBanned && (
                  <span className="pill" style={{ background: "rgba(220,60,80,.15)", color: "var(--danger)" }}>
                    Banned
                  </span>
                )}
              </>
            ) : (
              <p className="text-stone text-xs">Select a conversation.</p>
            )}
          </div>
        </div>

        <p className="text-stone-dim text-[11px] mt-3">
          Opening a conversation is recorded in the admin audit log.
        </p>
      </div>
    );
  }

  // ---- Level 1: profile grid ----------------------------------------------
  const visible = (profiles ?? []).filter((p) => {
    const genderOk =
      genderTab === "all" ||
      p.gender === genderTab ||
      (genderTab === "male" && p.gender === "man") ||
      (genderTab === "female" && p.gender === "woman");
    const searchOk =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.trim().toLowerCase());
    return genderOk && searchOk;
  });

  return (
    <div>
      <div className="section-title">
        <h3 style={{ fontSize: 15 }}>All profiles</h3>
        <div
          style={{
            display: "flex",
            gap: 4,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-hair)",
            borderRadius: 999,
            padding: 3,
          }}
        >
          {(["all", "female", "male"] as const).map((g) => (
            <span
              key={g}
              onClick={() => setGenderTab(g)}
              className={`pill ${genderTab === g ? "rose" : "stone"}`}
              style={{ padding: "8px 16px", cursor: "pointer", textTransform: "capitalize" }}
            >
              {g}
            </span>
          ))}
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search profiles by name…"
        className="w-full mb-4 rounded-[12px] border border-border-hair bg-surface px-4 py-2.5 text-sm outline-none focus:border-border-hair-2"
      />

      {error && <p className="text-danger text-sm mb-3">{error}</p>}
      {!profiles && <p className="text-stone text-sm">Loading…</p>}
      {profiles && visible.length === 0 && !error && (
        <p className="text-stone text-sm">No profiles match that filter.</p>
      )}

      <div className="grid g-4">
        {visible.map((p) => (
          <div
            key={p.id}
            onClick={() => openInbox(p)}
            className="card hoverable profile-inbox-card"
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <Avatar src={p.avatar} name={p.name} size={56} />
              {p.messageCount > 0 && (
                <span className="badge-count">
                  {p.messageCount > 99 ? "99+" : p.messageCount}
                </span>
              )}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, marginTop: 10 }}>
              {p.name}
            </div>
            <div className="stone" style={{ fontSize: 11 }}>
              {p.messageCount} message{p.messageCount === 1 ? "" : "s"}
              {p.unread > 0 && (
                <span style={{ color: "var(--gold-bright)" }}> · {p.unread} unread</span>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
              {p.isModelProfile && <span className="pill gold" style={{ fontSize: 10 }}>model</span>}
              {p.tier !== "free" && (
                <span className="pill stone" style={{ fontSize: 10, textTransform: "uppercase" }}>
                  {p.tier}
                </span>
              )}
              {p.isBanned && (
                <span className="pill" style={{ fontSize: 10, background: "rgba(220,60,80,.15)", color: "var(--danger)" }}>
                  banned
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  note,
}: {
  label: string;
  value: string;
  mono?: boolean;
  note?: string;
}) {
  return (
    <>
      <div
        className="stone"
        style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}
      >
        {label}
      </div>
      <div
        className={mono ? "mono break-all" : "break-words"}
        style={{ fontSize: 12.5, marginBottom: note ? 2 : 14 }}
      >
        {value}
      </div>
      {note && (
        <div className="stone-dim" style={{ fontSize: 10, marginBottom: 14, color: "var(--stone-dim)" }}>
          {note}
        </div>
      )}
    </>
  );
}
