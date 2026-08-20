"use client";

import { useEffect, useState } from "react";

type ConversationSummary = {
  userA: { id: number; name: string };
  userB: { id: number; name: string };
  lastMessageAt: string;
  messageCount: number;
};

type ThreadMessage = {
  id: number;
  body: string;
  fromUserId: number;
  fromName: string;
  createdAt: string;
};

export default function InboxBrowser() {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [selected, setSelected] = useState<ConversationSummary | null>(null);
  const [thread, setThread] = useState<ThreadMessage[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/inbox")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []));
  }, []);

  function openThread(c: ConversationSummary) {
    setSelected(c);
    setThread(null);
    fetch(`/api/admin/inbox?userA=${c.userA.id}&userB=${c.userB.id}`)
      .then((r) => r.json())
      .then((d) => setThread(d.thread ?? []));
  }

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="text-stone text-sm hover:text-ivory mb-4"
        >
          ← All conversations
        </button>
        <div className="font-semibold text-sm mb-4">
          {selected.userA.name} ↔ {selected.userB.name}
        </div>

        {!thread && <p className="text-stone text-sm">Loading…</p>}

        <div className="rounded-[16px] border border-border-hair bg-surface p-4 space-y-3 max-h-[65vh] overflow-y-auto">
          {thread?.map((m) => (
            <div key={m.id} className="text-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold">{m.fromName}</span>
                <span className="text-stone-dim text-[11px]">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-ivory/90 mt-0.5">{m.body}</p>
            </div>
          ))}
          {thread?.length === 0 && (
            <p className="text-stone text-sm">No messages in this thread.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden">
      {!conversations && <p className="text-stone text-sm p-4">Loading…</p>}
      {conversations?.length === 0 && (
        <p className="text-stone text-sm p-4">No conversations yet.</p>
      )}
      <table className="w-full text-sm">
        <tbody>
          {conversations?.map((c) => (
            <tr
              key={`${c.userA.id}-${c.userB.id}`}
              onClick={() => openThread(c)}
              className="border-b border-border-hair last:border-0 cursor-pointer hover:bg-surface-2"
            >
              <td className="px-4 py-3 font-semibold">
                {c.userA.name} ↔ {c.userB.name}
              </td>
              <td className="px-4 py-3 text-stone text-xs">
                {c.messageCount} {c.messageCount === 1 ? "message" : "messages"}
              </td>
              <td className="px-4 py-3 text-stone-dim text-xs text-right">
                {new Date(c.lastMessageAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
