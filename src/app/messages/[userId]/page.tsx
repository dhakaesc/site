"use client";

import { useEffect, useRef, useState, use } from "react";
import Link from "next/link";

type Msg = {
  id: number;
  body: string;
  fromMe: boolean;
  createdAt: string;
};

type Other = { id: number; name: string; age: number };

export default function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<Other | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function load() {
    fetch(`/api/messages/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setOther(d.other);
        setMessages(d.messages ?? []);
      });
  }

  useEffect(() => {
    load();
    // Light polling keeps the thread fresh without a websocket connection.
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);

    const res = await fetch(`/api/messages/${userId}`, {
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
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4">
        <Link href="/messages" className="text-sm text-stone hover:text-ivory">
          ← Messages
        </Link>
        <div className="font-semibold text-sm">
          {other ? `${other.name}, ${other.age}` : ""}
        </div>
      </div>

      <div className="flex-1 rounded-[18px] border border-border-hair bg-surface p-4 overflow-y-auto space-y-3 min-h-[60vh]">
        {messages.length === 0 && !error && (
          <p className="text-stone text-sm text-center py-8">
            No messages yet — say hello.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-[16px] px-4 py-2.5 text-sm ${
                m.fromMe
                  ? "bg-gradient-to-b from-rose-bright to-rose text-white"
                  : "bg-surface-2 text-ivory"
              }`}
            >
              {m.body}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="mt-3 text-sm">
          <p className="text-danger">{error}</p>
          {upgradeNeeded && (
            <Link
              href="/pricing"
              className="inline-block mt-2 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]"
            >
              Upgrade to Plus
            </Link>
          )}
        </div>
      )}

      <form onSubmit={send} className="flex gap-2 mt-3">
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
          className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
