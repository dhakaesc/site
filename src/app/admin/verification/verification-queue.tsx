"use client";

import { useEffect, useState } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: string;
  identityStatus: string;
  identityVerifiedAt: string | null;
  createdAt: string;
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-gold-bright/10 border-gold-bright/30 text-gold-bright",
  verified: "bg-success/10 border-success/25 text-success",
  rejected: "bg-danger/10 border-danger/30 text-danger",
};

export default function VerificationQueue() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  function load() {
    fetch("/api/admin/verification")
      .then((r) => r.json())
      .then((d) => setMembers(d.users ?? []));
  }

  useEffect(load, []);

  async function setStatus(userId: number, status: "verified" | "rejected" | "pending") {
    setBusyId(userId);
    const res = await fetch("/api/admin/verification", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    setBusyId(null);
    if (res.ok) load();
  }

  const visible = members?.filter((m) => (filter === "pending" ? m.identityStatus === "pending" : true));

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("pending")}
          className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
            filter === "pending" ? "bg-gold-bright/10 border border-gold-bright/30 text-gold-bright" : "border border-border-hair text-stone"
          }`}
        >
          Pending only
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
            filter === "all" ? "bg-surface-2 text-ivory" : "border border-border-hair text-stone"
          }`}
        >
          All members
        </button>
      </div>

      {!members && <p className="text-stone text-sm">Loading…</p>}
      {members && visible?.length === 0 && (
        <p className="text-stone text-sm">
          {filter === "pending" ? "Nothing pending — everyone's been contacted." : "No members yet."}
        </p>
      )}

      <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone text-xs border-b border-border-hair">
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Signed up</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {visible?.map((m) => (
              <tr key={m.id} className="border-b border-border-hair last:border-0">
                <td className="px-4 py-3">
                  <div className="font-semibold">{m.name}, {m.age}</div>
                  <div className="text-stone text-xs">{m.email}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">
                  {m.phone || <span className="text-stone-dim">—</span>}
                </td>
                <td className="px-4 py-3 text-stone-dim text-xs">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border text-[11px] font-semibold px-2.5 py-1 ${STATUS_STYLE[m.identityStatus]}`}>
                    {m.identityStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {m.identityStatus !== "verified" && (
                      <button
                        disabled={busyId === m.id}
                        onClick={() => setStatus(m.id, "verified")}
                        className="rounded-[8px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                      >
                        Verify
                      </button>
                    )}
                    {m.identityStatus !== "rejected" && (
                      <button
                        disabled={busyId === m.id}
                        onClick={() => setStatus(m.id, "rejected")}
                        className="rounded-[8px] border border-danger/30 text-danger px-3 py-1.5 text-xs disabled:opacity-50"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
