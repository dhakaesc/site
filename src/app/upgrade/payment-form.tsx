"use client";

import { useEffect, useState } from "react";

type PaymentRequest = {
  id: number;
  tier: string;
  amount: number;
  transactionId: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

export default function PaymentForm({
  tier,
  amount,
}: {
  tier: string;
  amount: number;
}) {
  const [method, setMethod] = useState("bkash");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<PaymentRequest[] | null>(null);

  function loadRequests() {
    fetch("/api/billing/submit")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []));
  }

  useEffect(loadRequests, []);

  const pending = requests?.find((r) => r.status === "pending");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/billing/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, method, senderNumber, transactionId }),
    });

    setSubmitting(false);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Couldn't submit. Please try again.");
      return;
    }

    setSenderNumber("");
    setTransactionId("");
    loadRequests();
  }

  if (pending) {
    return (
      <div className="rounded-[16px] border border-gold/40 bg-gold/10 p-5">
        <p className="text-sm font-semibold text-gold-bright mb-1">
          Payment submitted — awaiting review
        </p>
        <p className="text-stone text-[13px]">
          TrxID <span className="font-mono text-ivory">{pending.transactionId}</span>{" "}
          for ৳{pending.amount.toLocaleString()}. We'll activate your plan once
          it's verified.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-xs text-stone mb-1.5">Paid with</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="field-input"
          >
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-xs text-stone mb-1.5">
            Your {method === "bkash" ? "bKash" : "Nagad"} number
          </span>
          <input
            required
            value={senderNumber}
            onChange={(e) => setSenderNumber(e.target.value)}
            className="field-input"
            placeholder="01XXXXXXXXX"
            inputMode="numeric"
          />
        </label>

        <label className="block">
          <span className="block text-xs text-stone mb-1.5">
            Transaction ID (TrxID)
          </span>
          <input
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="field-input font-mono"
            placeholder="e.g. 9F7A2B1C3D"
          />
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[14px] bg-gradient-to-b from-gold-bright to-gold py-3 text-sm font-semibold text-[#2a1c05] disabled:opacity-60"
        >
          {submitting
            ? "Submitting…"
            : `I've sent ৳${amount.toLocaleString()}`}
        </button>
      </form>

      {requests && requests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs text-stone mb-2">Your payment history</h3>
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-[12px] border border-border-hair px-4 py-2.5 text-xs"
              >
                <div>
                  <span className="font-mono">{r.transactionId}</span>
                  <span className="text-stone ml-2">
                    ৳{r.amount.toLocaleString()} · {r.tier}
                  </span>
                </div>
                <span
                  className={
                    r.status === "approved"
                      ? "text-success"
                      : r.status === "rejected"
                        ? "text-danger"
                        : "text-gold-bright"
                  }
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
