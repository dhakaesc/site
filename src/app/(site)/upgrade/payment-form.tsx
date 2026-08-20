"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  const [justSubmitted, setJustSubmitted] = useState(false);

  function loadRequests() {
    fetch("/api/billing/submit")
      .then((r) => r.json())
      .then((d) => setRequests(d.requests ?? []));
  }

  useEffect(() => {
    loadRequests();
    // While a payment is pending, poll so the page flips to "active"
    // on its own the moment an admin approves it.
    const interval = setInterval(loadRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const pending = requests?.find((r) => r.status === "pending");
  const approved = requests?.find((r) => r.status === "approved");
  const lastRejected = requests?.find((r) => r.status === "rejected");

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
    setJustSubmitted(true);
    loadRequests();
  }

  // Plan is live.
  if (approved && !pending) {
    return (
      <div className="rounded-[16px] border border-success/40 bg-success/10 p-6 text-center">
        <div className="text-3xl mb-2">✓</div>
        <p className="text-success font-semibold mb-1">
          Your plan is active
        </p>
        <p className="text-stone text-[13px] mb-4">
          Payment confirmed. Everything in your plan is unlocked.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-5 py-2.5 text-sm font-semibold text-[#2a1c05]"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  // Payment submitted, waiting on manual verification.
  if (pending) {
    return (
      <div className="rounded-[16px] border border-gold/40 bg-gold/10 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl leading-none">✓</div>
          <div>
            <p className="text-gold-bright font-semibold text-sm">
              {justSubmitted
                ? "Payment details received"
                : "Payment is being verified"}
            </p>
            <p className="text-stone text-[13px] mt-1">
              We've sent a confirmation to your email. Nothing else is needed
              from you.
            </p>
          </div>
        </div>

        <div className="rounded-[12px] bg-surface px-4 py-3 text-xs mb-4">
          <div className="flex justify-between py-1">
            <span className="text-stone">Transaction ID</span>
            <span className="font-mono">{pending.transactionId}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-stone">Amount</span>
            <span>৳{pending.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-stone">Plan</span>
            <span className="uppercase">{pending.tier}</span>
          </div>
        </div>

        <div className="text-[13px] text-stone space-y-2">
          <p>
            <span className="text-ivory">What happens next:</span> our team
            checks your transaction ID against our bKash/Nagad statement, then
            switches your account over.
          </p>
          <p>
            This usually takes a few hours. If you paid late at night it may
            take until the next morning — your plan will start from the moment
            it's approved, so you don't lose any days by waiting.
          </p>
          <p>
            You'll get an email as soon as it's live, and this page updates by
            itself if you leave it open.
          </p>
        </div>

        <Link
          href="/browse"
          className="inline-block mt-5 rounded-[12px] border border-border-hair px-5 py-2.5 text-sm"
        >
          Keep browsing meanwhile
        </Link>
      </div>
    );
  }

  return (
    <>
      {lastRejected && (
        <div className="rounded-[14px] border border-danger/40 bg-danger/10 p-4 mb-5 text-[13px]">
          <p className="text-danger font-semibold mb-1">
            We couldn't verify your last payment
          </p>
          <p className="text-stone">
            {lastRejected.adminNote ||
              "Please double-check the transaction ID and submit it again. If you did send the money, contact support and we'll fix it."}
          </p>
        </div>
      )}

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
          <span className="block text-stone-dim text-[11px] mt-1.5">
            You'll find this in the confirmation SMS or in your app's history.
          </span>
        </label>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[14px] bg-gradient-to-b from-gold-bright to-gold py-3 text-sm font-semibold text-[#2a1c05] disabled:opacity-60"
        >
          {submitting ? "Submitting…" : `I've sent ৳${amount.toLocaleString()}`}
        </button>
      </form>
    </>
  );
}
