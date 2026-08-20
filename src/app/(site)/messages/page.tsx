"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "../../_home/pieces";

type Conversation = {
  user: { id: number; name: string; age: number; avatar: string | null };
  lastMessage: { body: string; createdAt: string; fromMe: boolean } | null;
  unread: number;
};

type Msg = { id: number; body: string; fromMe: boolean; createdAt: string };

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  function loadConversations() {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => {
        const list: Conversation[] = d.conversations ?? [];
        setConversations(list);
        setActiveId((cur) => cur ?? list[0]?.user.id ?? null);
      });
  }

  useEffect(loadConversations, []);

  useEffect(() => {
    if (!activeId) return;
    function loadThread() {
      fetch(`/api/messages/${activeId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) {
            setError(d.error);
            return;
          }
          setError(null);
          setMessages(d.messages ?? []);
        });
    }
    loadThread();
    const t = setInterval(loadThread, 5000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending || !activeId) return;

    setSending(true);
    setError(null);

    const res = await fetch(`/api/messages/${activeId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSending(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Couldn't send message.");
      setUpgradeNeeded(Boolean(d.upgradeRequired));
      return;
    }

    const d = await res.json();
    setMessages((prev) => [...prev, d.message]);
    setDraft("");
    loadConversations();
  }

  const visible = conversations?.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase())
  );
  const active = conversations?.find((c) => c.user.id === activeId);

  return (
    <div className="px-6 sm:px-12 py-8">
      <h1 className="font-serif text-2xl mb-1">Messages</h1>
      <p className="text-stone text-sm mb-6">
        You can chat with anyone you&apos;ve matched with.
      </p>

      {!conversations && <p className="text-stone text-sm">Loading conversations…</p>}

      {conversations && conversations.length === 0 && (
        <div className="rounded-[18px] border border-border-hair bg-surface p-8 text-center">
          <p className="text-stone text-sm mb-4">
            No matches yet. Like a few profiles — when someone likes you back, your
            conversation starts here.
          </p>
          <Link
            href="/browse"
            className="inline-block rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start browsing
          </Link>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-260px)] min-h-[460px]">
          {/* Conversation list */}
          <div className="rounded-[18px] border border-border-hair bg-surface overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border-hair">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="field-input"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {visible?.map((c) => (
                <button
                  key={c.user.id}
                  onClick={() => setActiveId(c.user.id)}
                  className={`w-full text-left flex gap-2.5 items-center px-4 py-3 border-b border-white/[0.04] ${
                    c.user.id === activeId ? "bg-surface-2" : "hover:bg-surface-2/60"
                  }`}
                >
                  <div className="w-[42px] h-[42px] rounded-full bg-surface-2 overflow-hidden shrink-0 flex items-center justify-center text-sm">
                    {c.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      c.user.name[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-[13px] font-semibold truncate">
                        {c.user.name}, {c.user.age}
                      </span>
                      {c.lastMessage && (
                        <span className="text-stone text-[10.5px] shrink-0">
                          {new Date(c.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-stone text-[11.5px] truncate">
                      {c.lastMessage?.body ?? "New match — say hi!"}
                    </div>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-bright shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat pane */}
          <div className="rounded-[18px] border border-border-hair bg-surface flex flex-col overflow-hidden">
            {active && (
              <div className="flex gap-2.5 items-center px-4 py-3 border-b border-border-hair">
                <div className="w-[38px] h-[38px] rounded-full bg-surface-2 overflow-hidden shrink-0 flex items-center justify-center text-sm">
                  {active.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={active.user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    active.user.name[0]
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {active.user.name}, {active.user.age}
                  </div>
                  <Link href={`/u/${active.user.id}`} className="text-stone text-[11px] hover:text-ivory">
                    View profile →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && !error && (
                <p className="text-stone text-sm text-center py-8">
                  No messages yet — say hello.
                </p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-[16px] px-4 py-2.5 text-sm ${
                      m.fromMe
                        ? "bg-gradient-to-b from-rose-bright to-rose text-white"
                        : "bg-surface-2 text-ivory"
                    }`}
                  >
                    {m.body}
                    <div className={`text-[10px] mt-1 ${m.fromMe ? "text-white/70" : "text-stone-dim"}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {error && (
              <div className="px-4 pb-2 text-sm">
                <p className="text-danger">{error}</p>
                {upgradeNeeded && (
                  <Link
                    href="/pricing"
                    className="inline-block mt-2 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2 text-sm font-semibold text-[#2a1c05]"
                  >
                    Upgrade to Plus
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={send} className="flex gap-2 p-3 border-t border-border-hair">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                className="field-input flex-1"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Icon name="send" /> Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
