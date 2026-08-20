"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BannedUser = {
  id: number;
  name: string;
  email: string;
  tier: string;
  createdAt: string;
};

export default function BannedUsersTable({ initial }: { initial: BannedUser[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function unban(userId: number) {
    setBusyId(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned: false }),
    });
    setBusyId(null);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      router.refresh();
    }
  }

  if (users.length === 0) {
    return <p className="text-stone text-sm">No banned users.</p>;
  }

  return (
    <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-stone text-xs border-b border-border-hair">
            <th className="px-4 py-3 font-medium">Member</th>
            <th className="px-4 py-3 font-medium">Tier</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-border-hair last:border-0">
              <td className="px-4 py-3">
                <div className="font-semibold">{u.name}</div>
                <div className="text-stone text-xs">{u.email}</div>
              </td>
              <td className="px-4 py-3 text-stone capitalize">{u.tier}</td>
              <td className="px-4 py-3 text-stone-dim text-xs">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  disabled={busyId === u.id}
                  onClick={() => unban(u.id)}
                  className="rounded-[10px] border border-border-hair px-3 py-1.5 text-xs disabled:opacity-50 hover:border-border-hair-2"
                >
                  Unban
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
