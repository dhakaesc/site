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

const REPORT_REASONS: { value: string; label: string }[] = [
  { value: "fake_profile", label: "Fake profile" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "scam", label: "Scam or soliciting money" },
  { value: "underage", label: "Underage user" },
  { value: "other", label: "Something else" },
];

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0].value);
  const [reportDetails, setReportDetails] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
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

  async function handleBlock() {
    if (!other) return;
    if (!confirm(`Block ${other.name}? They won't be able to message you, and you won't see each other again.`)) {
      return;
    }
    setMenuOpen(false);
    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: other.id }),
    });
    if (res.ok) {
      setActionMessage(`${other.name} is blocked.`);
      setError("This conversation is no longer available.");
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!other) return;

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: other.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      }),
    });

    if (res.ok) {
      setReportOpen(false);
      setReportDetails("");
      setActionMessage("Report submitted. Our team will review it.");
    }
  }

  return (
    <main className="min-h-screen flex flex-col max-w-2xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-4 relative">
        <Link href="/messages" className="text-sm text-stone hover:text-ivory">
          ← Messages
        </Link>
        <div className="font-semibold text-sm">
          {other ? `${other.name}, ${other.age}` : ""}
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="text-stone hover:text-ivory text-sm px-2"
            aria-label="More options"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-44 rounded-[14px] border border-border-hair bg-surface shadow-lg py-1 text-sm">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-stone hover:text-ivory"
              >
                Report
              </button>
              <button
                onClick={handleBlock}
                className="w-full text-left px-4 py-2 text-danger hover:opacity-80"
              >
                Block
              </button>
            </div>
          )}
        </div>
      </div>

      {actionMessage && (
        <p className="text-stone text-xs mb-3">{actionMessage}</p>
      )}

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

      {reportOpen && other && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-[18px] border border-border-hair bg-surface p-6">
            <h2 className="font-serif text-lg mb-1">Report {other.name}</h2>
            <p className="text-stone text-xs mb-4">
              This won't notify them. Our team reviews all reports.
            </p>

            <form onSubmit={handleReport} className="space-y-3">
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="field-input"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>

              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Any details that would help us (optional)"
                className="w-full rounded-[14px] border border-border-hair-2 bg-surface-2 px-4 py-3 text-sm text-ivory placeholder:text-stone-dim focus:outline-none focus:border-ivory/40"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReportOpen(false)}
                  className="flex-1 rounded-[12px] border border-border-hair-2 py-2.5 text-sm text-stone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-[12px] bg-danger py-2.5 text-sm font-semibold text-white"
                >
                  Submit report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
