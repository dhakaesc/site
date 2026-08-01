"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Conversation = {
  user: { id: number; name: string; age: number; avatar: string | null };
  lastMessage: { body: string; createdAt: string; fromMe: boolean } | null;
  unread: number;
};

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(
    null
  );

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []));
  }, []);

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <Link href="/dashboard" className="text-sm text-stone hover:text-ivory">
          Dashboard
        </Link>
      </div>

      <h1 className="font-serif text-2xl mb-1">Messages</h1>
      <p className="text-stone text-sm mb-6">
        You can chat with anyone you've matched with.
      </p>

      {!conversations && (
        <p className="text-stone text-sm">Loading conversations…</p>
      )}

      {conversations && conversations.length === 0 && (
        <div className="rounded-[18px] border border-border-hair bg-surface p-8 text-center">
          <p className="text-stone text-sm">
            No matches yet. Like someone who likes you back and they'll show up
            here.
          </p>
          <Link
            href="/browse"
            className="inline-block mt-4 rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-5 py-2.5 text-sm font-semibold text-white"
          >
            Browse profiles
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {conversations?.map((c) => (
          <Link
            key={c.user.id}
            href={`/messages/${c.user.id}`}
            className="flex items-center gap-4 rounded-[16px] border border-border-hair bg-surface p-4 hover:border-border-hair-2"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-2 shrink-0">
              {c.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{c.user.name}</span>
                {c.unread > 0 && (
                  <span className="text-[10px] bg-rose text-white rounded-full px-2 py-0.5">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="text-stone text-xs truncate mt-0.5">
                {c.lastMessage
                  ? `${c.lastMessage.fromMe ? "You: " : ""}${c.lastMessage.body}`
                  : "Say hello 👋"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
