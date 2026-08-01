"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  tier: string;
  messagesUsed: number;
  isBanned: boolean;
  isAdmin: boolean;
  createdAt: string;
};

export default function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }

  useEffect(load, []);

  async function update(userId: number, patch: Record<string, unknown>) {
    setBusyId(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    setBusyId(null);
    load();
  }

  return (
    <div className="rounded-[18px] border border-border-hair bg-surface overflow-hidden">
      <div className="p-5 border-b border-border-hair">
        <h2 className="font-semibold text-sm">Users</h2>
        <p className="text-stone text-xs mt-1">
          Change a member's plan, reset their message allowance, or suspend an
          account.
        </p>
      </div>

      {!users && <p className="text-stone text-sm p-5">Loading users…</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-b border-border-hair last:border-0">
                <td className="p-4">
                  <div className="font-medium">
                    {u.name}
                    {u.isAdmin && (
                      <span className="ml-2 text-[10px] text-gold-bright">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-stone text-xs">{u.email}</div>
                </td>
                <td className="p-4 text-stone text-xs whitespace-nowrap">
                  {u.age} · {u.gender}
                </td>
                <td className="p-4 text-xs whitespace-nowrap">
                  <span className="uppercase font-mono">{u.tier}</span>
                  <div className="text-stone">{u.messagesUsed} msgs used</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <select
                      value={u.tier}
                      disabled={busyId === u.id}
                      onChange={(e) => update(u.id, { tier: e.target.value })}
                      className="field-input !py-1.5 !text-xs !w-auto"
                    >
                      <option value="free">Free</option>
                      <option value="plus">Plus</option>
                      <option value="vip">VIP</option>
                    </select>

                    <button
                      onClick={() => update(u.id, { resetMessages: true })}
                      disabled={busyId === u.id}
                      className="rounded-[10px] border border-border-hair px-3 py-1.5 text-xs"
                    >
                      Reset msgs
                    </button>

                    <button
                      onClick={() => update(u.id, { isBanned: !u.isBanned })}
                      disabled={busyId === u.id}
                      className={`rounded-[10px] px-3 py-1.5 text-xs border ${
                        u.isBanned
                          ? "border-success text-success"
                          : "border-danger text-danger"
                      }`}
                    >
                      {u.isBanned ? "Unban" : "Ban"}
                    </button>
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
