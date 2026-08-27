"use client";

import { useCallback, useEffect, useState } from "react";

type Person = {
  id: number;
  name: string;
  email: string;
  tier: string;
  isBanned: boolean;
  isModelProfile: boolean;
};

type ConversationSummary = {
  userA: Person;
  userB: Person;
  lastMessageAt: string;
  messageCount: number;
  unread: number;
  lastMessage: string;
  lastMessageFromUserId: number | null;
};

type ThreadMessage = {
  id: number;
  body: string;
  fromUserId: number;
  toUserId: number;
  fromName: string;
  toName: string;
  read: boolean;
  createdAt: string;
};

function PersonTag({ p }: { p: Person }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-semibold">{p.name}</span>
      {p.isModelProfile && (
        <span className="rounded-full border border-gold-bright/35 text-gold-bright text-[10px] px-1.5 py-0.5">
          model
        </span>
      )}
      {p.tier !== "free" && (
        <span className="rounded-full border border-border-hair text-stone text-[10px] px-1.5 py-0.5 uppercase">
          {p.tier}
        </span>
      )}
      {p.isBanned && (
        <span className="rounded-full border border-danger/40 text-danger text-[10px] px-1.5 py-0.5">
          banned
        </span>
      )}
    </span>
  );
}

export default function InboxBrowser() {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [selected, setSelected] = useState<ConversationSummary | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((q: string, p: number) => {
    setConversations(null);
    setError(null);
    fetch(`/api/admin/inbox?q=${encodeURIComponent(q)}&page=${p}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setConversations([]); return; }
        setConversations(d.conversations ?? []);
        setHasMore(Boolean(d.hasMore));
      })
      .catch(() => { setError("Couldn't load conversations."); setConversations([]); });
  }, []);

  // Debounced so typing a name does not fire a query per keystroke.
  useEffect(() => {
    const t = setTimeout(() => load(query, page), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [query, page, load]);

  function openThread(c: ConversationSummary) {
    setSelected(c);
    setThread(null);
    fetch(`/api/admin/inbox?userA=${c.userA.id}&userB=${c.userB.id}`)
      .then((r) => r.json())
      .then((d) => setThread(d.thread ?? []))
      .catch(() => setThread([]));
  }

  // ---- Thread view ---------------------------------------------------------
  if (selected) {
    return (
      <div>
        <button
          onClick={() => { setSelected(null); setThread(null); }}
          className="text-stone text-sm hover:text-ivory mb-4"
        >
          ← All conversations
        </button>

        <div className="flex items-center gap-2 text-sm mb-1">
          <PersonTag p={selected.userA} />
          <span className="text-stone-dim">↔</span>
          <PersonTag p={selected.userB} />
        </div>
        <p className="text-stone-dim text-[11px] mb-4">
          {selected.userA.email || "no email"} · {selected.userB.email || "no email"}
        </p>

        {!thread && <p className="text-stone text-sm">Loading…</p>}

        <div className="rounded-[16px] border border-border-hair bg-surface p-4 space-y-3 max-h-[65vh] overflow-y-auto">
          {thread?.map((m) => (
            <div key={m.id} className="text-sm">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold">{m.fromName}</span>
                <span className="text-stone-dim text-[11px]">→ {m.toName}</span>
                <span className="text-stone-dim text-[11px]">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
                {!m.read && (
                  <span className="rounded-full border border-border-hair text-stone-dim text-[10px] px-1.5">
                    unread
                  </span>
                )}
              </div>
              <p className="text-ivory/90 mt-0.5 whitespace-pre-wrap break-words">{m.body}</p>
            </div>
          ))}
          {thread?.length === 0 && (
            <p className="text-stone text-sm">No messages in this thread.</p>
          )}
        </div>

        <p className="text-stone-dim text-[11px] mt-3">
          This read was recorded in the admin audit log.
        </p>
      </div>
    );
  }

  // ---- List view -----------------------------------------------------------
  return (
    <div>
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        placeholder="Search by name or email…"
        className="w-full mb-4 rounded-[12px] border border-border-hair bg-surface px-4 py-2.5 text-sm outline-none focus:border-border-hair-2"
      />

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden">
        {!conversations && <p className="text-stone text-sm p-4">Loading…</p>}
        {conversations?.length === 0 && !error && (
          <p className="text-stone text-sm p-4">
            {query ? "No conversations match that search." : "No conversations yet."}
          </p>
        )}

        {conversations && conversations.length > 0 && (
          <table className="w-full text-sm">
            <tbody>
              {conversations.map((c) => {
                const senderIsA = c.lastMessageFromUserId === c.userA.id;
                const sender = senderIsA ? c.userA.name : c.userB.name;
                return (
                  <tr
                    key={`${c.userA.id}-${c.userB.id}`}
                    onClick={() => openThread(c)}
                    className="border-b border-border-hair last:border-0 cursor-pointer hover:bg-surface-2 align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PersonTag p={c.userA} />
                        <span className="text-stone-dim">↔</span>
                        <PersonTag p={c.userB} />
                      </div>
                      <p className="text-stone text-xs mt-1 truncate max-w-[46ch]">
                        <span className="text-stone-dim">{sender}:</span> {c.lastMessage}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-stone text-xs whitespace-nowrap">
                      {c.messageCount} {c.messageCount === 1 ? "message" : "messages"}
                      {c.unread > 0 && (
                        <span className="ml-2 text-gold-bright">{c.unread} unread</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-dim text-xs text-right whitespace-nowrap">
                      {new Date(c.lastMessageAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {(page > 0 || hasMore) && (
        <div className="flex justify-between mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="text-sm text-stone hover:text-ivory disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-stone hover:text-ivory disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
