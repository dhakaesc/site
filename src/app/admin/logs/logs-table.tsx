"use client";

import { useEffect, useState } from "react";

type LogRow = {
  id: number;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: string;
  adminName: string | null;
  adminEmail: string | null;
};

export default function LogsTable() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="rounded-[16px] border border-border-hair bg-surface overflow-hidden">
      {!logs && <p className="text-stone text-sm p-4">Loading…</p>}
      {logs?.length === 0 && (
        <p className="text-stone text-sm p-4">Nothing logged yet.</p>
      )}
      {logs && logs.length > 0 && (
        <table className="w-full text-sm">
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-border-hair last:border-0 align-top">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold">{l.adminName ?? "Unknown admin"}</span>
                  <div className="text-stone-dim text-[11px]">{l.adminEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-border-hair text-stone text-[11px] px-2 py-0.5">
                    {l.action}
                  </span>
                  {l.detail && <div className="text-stone text-xs mt-1">{l.detail}</div>}
                </td>
                <td className="px-4 py-3 text-stone-dim text-xs text-right whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
