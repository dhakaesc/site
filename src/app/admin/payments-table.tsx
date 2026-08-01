"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: number;
  tier: string;
  amount: number;
  method: string;
  senderNumber: string;
  transactionId: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  userId: number;
  userName: string;
  userEmail: string;
};

export default function AdminPaymentsTable() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []));
  }

  useEffect(() => {
    load();
    // Refresh so newly submitted payments appear without a manual reload.
    const interval = setInterval(load, 20000);
    return () => clearInterval(interval);
  }, []);

  async function review(requestId: number, action: "approve" | "reject") {
    let note = "";
    if (action === "reject") {
      const reason = window.prompt(
        "Why is this being rejected? This is emailed to the member, so keep it helpful.",
        "We couldn't find this transaction ID in our statement. Please double-check it and submit again."
      );
      // Cancelling the prompt cancels the rejection.
      if (reason === null) return;
      note = reason;
    }

    setBusyId(requestId);
    setError(null);

    const res = await fetch("/api/admin/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action, note }),
    });

    setBusyId(null);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Couldn't update that payment.");
    }

    load();
  }

  const pending = payments?.filter((p) => p.status === "pending") ?? [];
  const reviewed = payments?.filter((p) => p.status !== "pending") ?? [];

  return (
    <div className="rounded-[18px] border border-border-hair bg-surface overflow-hidden mb-8">
      <div className="p-5 border-b border-border-hair flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Payments</h2>
          <p className="text-stone text-xs mt-1">
            Check the TrxID against your bKash/Nagad statement before approving.
            Approving activates the plan for 30 days.
          </p>
        </div>
        {pending.length > 0 && (
          <span className="text-xs bg-gold/20 text-gold-bright rounded-full px-3 py-1">
            {pending.length} pending
          </span>
        )}
      </div>

      {error && <p className="text-danger text-sm px-5 pt-4">{error}</p>}

      {!payments && <p className="text-stone text-sm p-5">Loading payments…</p>}

      {payments && payments.length === 0 && (
        <p className="text-stone text-sm p-5">No payments submitted yet.</p>
      )}

      {pending.map((p) => (
        <div
          key={p.id}
          className="p-5 border-b border-border-hair flex flex-wrap items-center gap-4 justify-between"
        >
          <div className="min-w-0">
            <div className="font-medium text-sm">
              {p.userName}{" "}
              <span className="text-stone font-normal">({p.userEmail})</span>
            </div>
            <div className="text-xs text-stone mt-1">
              <span className="font-mono text-ivory">{p.transactionId}</span> ·
              ৳{p.amount.toLocaleString()} · {p.method} · from {p.senderNumber} ·
              wants <span className="uppercase">{p.tier}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => review(p.id, "reject")}
              disabled={busyId === p.id}
              className="rounded-[10px] border border-danger text-danger px-4 py-2 text-xs"
            >
              Reject
            </button>
            <button
              onClick={() => review(p.id, "approve")}
              disabled={busyId === p.id}
              className="rounded-[10px] bg-gradient-to-b from-success/90 to-success text-[#0d2414] px-4 py-2 text-xs font-semibold"
            >
              {busyId === p.id ? "Working…" : "Approve"}
            </button>
          </div>
        </div>
      ))}

      {reviewed.length > 0 && (
        <div className="p-5">
          <h3 className="text-xs text-stone mb-3">Reviewed</h3>
          <div className="space-y-2">
            {reviewed.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs border border-border-hair rounded-[12px] px-4 py-2.5"
              >
                <span className="truncate">
                  <span className="font-mono">{p.transactionId}</span>
                  <span className="text-stone ml-2">
                    {p.userName} · ৳{p.amount.toLocaleString()} · {p.tier}
                  </span>
                </span>
                <span
                  className={
                    p.status === "approved" ? "text-success" : "text-danger"
                  }
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
