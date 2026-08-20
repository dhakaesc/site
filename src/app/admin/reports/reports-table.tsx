"use client";

import { useEffect, useState } from "react";

type Report = {
  id: number;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { id: number; name: string; email: string; isBanned: boolean } | null;
  reported: { id: number; name: string; email: string; isBanned: boolean } | null;
};

const REASON_LABELS: Record<string, string> = {
  fake_profile: "Fake profile",
  inappropriate_content: "Inappropriate content",
  harassment: "Harassment or abuse",
  scam: "Scam or soliciting money",
  underage: "Underage user",
  other: "Something else",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-danger/10 border-danger/30 text-danger",
  reviewed: "bg-success/10 border-success/25 text-success",
  dismissed: "border-border-hair text-stone",
};

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "open">("open");

  function load() {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []));
  }

  useEffect(load, []);

  async function setStatus(reportId: number, status: "reviewed" | "dismissed") {
    setBusyId(reportId);
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    setBusyId(null);
    if (res.ok) load();
  }

  async function banReportedUser(reportId: number, userId: number) {
    if (!confirm("Ban this user? They will lose access immediately.")) return;
    setBusyId(reportId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isBanned: true }),
    });
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status: "reviewed" }),
    });
    setBusyId(null);
    load();
  }

  const visible = reports?.filter((r) => (filter === "open" ? r.status === "open" : true));

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("open")}
          className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
            filter === "open" ? "bg-danger/10 border border-danger/30 text-danger" : "border border-border-hair text-stone"
          }`}
        >
          Open only
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full text-xs font-semibold px-3 py-1.5 ${
            filter === "all" ? "bg-surface-2 text-ivory" : "border border-border-hair text-stone"
          }`}
        >
          All reports
        </button>
      </div>

      {!reports && <p className="text-stone text-sm">Loading…</p>}
      {reports && visible?.length === 0 && (
        <p className="text-stone text-sm">
          {filter === "open" ? "No open reports." : "No reports yet."}
        </p>
      )}

      <div className="space-y-3">
        {visible?.map((r) => (
          <div key={r.id} className="rounded-[16px] border border-border-hair bg-surface p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full border text-[11px] font-semibold px-2.5 py-1 ${STATUS_STYLE[r.status]}`}>
                    {r.status}
                  </span>
                  <span className="text-sm font-semibold">
                    {REASON_LABELS[r.reason] ?? r.reason}
                  </span>
                </div>
                <div className="text-stone text-xs mt-1.5">
                  <b className="text-ivory">{r.reported?.name ?? "Unknown"}</b> ({r.reported?.email})
                  {r.reported?.isBanned && (
                    <span className="ml-1.5 text-danger">— already banned</span>
                  )}
                  {" "}reported by <b className="text-ivory">{r.reporter?.name ?? "Unknown"}</b> ({r.reporter?.email})
                </div>
                {r.details && (
                  <p className="text-sm mt-2 bg-surface-2 rounded-[10px] px-3 py-2">{r.details}</p>
                )}
                <div className="text-stone-dim text-[11px] mt-1.5">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              {r.status === "open" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    disabled={busyId === r.id || !r.reported || r.reported.isBanned}
                    onClick={() => r.reported && banReportedUser(r.id, r.reported.id)}
                    className="rounded-[10px] border border-danger/30 text-danger px-3 py-2 text-xs font-semibold disabled:opacity-40"
                  >
                    Ban user
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, "dismissed")}
                    className="rounded-[10px] border border-border-hair px-3 py-2 text-xs disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                  <button
                    disabled={busyId === r.id}
                    onClick={() => setStatus(r.id, "reviewed")}
                    className="rounded-[10px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] px-3 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    Mark reviewed
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
