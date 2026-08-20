import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { TIER_PRICES, getPaymentNumbers, SUBSCRIPTION_DAYS } from "@/lib/payments";
import PaymentForm from "./payment-form";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/upgrade");

  const { tier: rawTier } = await searchParams;
  const tier = rawTier === "vip" ? "vip" : "plus";
  const amount = TIER_PRICES[tier];
  const numbers = getPaymentNumbers();

  return (
    <div className="px-6 py-10 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/pricing" className="text-sm text-stone hover:text-ivory">
          ← Plans
        </Link>
        <div className="font-serif italic text-lg">♥ AMOURA</div>
      </div>

      <div className="rounded-[22px] border border-border-hair bg-surface p-7">
        <h1 className="font-serif text-2xl mb-1">
          Upgrade to {tier === "vip" ? "VIP" : "Plus"}
        </h1>
        <p className="text-stone text-sm mb-6">
          ৳{amount.toLocaleString()} for {SUBSCRIPTION_DAYS} days
        </p>

        <div className="rounded-[16px] bg-surface-2 border border-border-hair p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3">
            Step 1 — Send ৳{amount.toLocaleString()}
          </h2>
          <p className="text-stone text-[13px] mb-4">
            Use <span className="text-ivory">Send Money</span> from your bKash or
            Nagad app to one of these numbers:
          </p>

          <div className="space-y-2">
            <NumberRow label="bKash" value={numbers.bkash} />
            <NumberRow label="Nagad" value={numbers.nagad} />
          </div>

          <p className="text-stone-dim text-xs mt-4">
            Send the exact amount. After sending, you'll get a Transaction ID
            (TrxID) in your SMS or app — you'll need it in the next step.
          </p>
        </div>

        <h2 className="text-sm font-semibold mb-3">
          Step 2 — Submit your Transaction ID
        </h2>
        <PaymentForm tier={tier} amount={amount} />
      </div>

      <div className="rounded-[16px] border border-border-hair bg-surface/60 p-5 mt-5 text-[13px] text-stone">
        <p className="text-ivory font-semibold text-sm mb-2">Good to know</p>
        <ul className="space-y-1.5">
          <li>
            • Every payment is checked by a person against our bKash/Nagad
            statement — usually within a few hours, and by the next morning at
            the latest.
          </li>
          <li>
            • Your {SUBSCRIPTION_DAYS} days start when your plan is activated,
            not when you pay, so waiting costs you nothing.
          </li>
          <li>
            • We'll email you the moment it's live. If anything looks wrong,
            reply to that email and we'll sort it out.
          </li>
        </ul>
      </div>
    </div>
  );
}

function NumberRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] bg-surface px-4 py-3">
      <span className="text-stone text-xs">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
