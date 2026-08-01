import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import LogoutButton from "./logout-button";

// Free tier gets 5 messages total (see admin settings to change this).
const FREE_MESSAGE_LIMIT = 5;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/login");

  const messagesLeft =
    user.tier === "free"
      ? Math.max(FREE_MESSAGE_LIMIT - user.messagesUsed, 0)
      : null;

  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <LogoutButton />
      </div>

      <div className="rounded-[22px] border border-border-hair bg-surface p-8">
        <h1 className="font-serif text-2xl mb-1">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-stone text-sm mb-6">
          You are on the{" "}
          <span className="text-gold-bright font-semibold capitalize">
            {user.tier}
          </span>{" "}
          plan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Plan" value={user.tier.toUpperCase()} />
          <Stat
            label="Messages left"
            value={
              user.tier === "free" ? `${messagesLeft} / ${FREE_MESSAGE_LIMIT}` : "Unlimited"
            }
          />
          <Stat label="Location" value={user.location || "Not set"} />
        </div>

        {user.tier === "free" && (
          <a
            href="/pricing"
            className="inline-block mt-6 rounded-[14px] bg-gradient-to-b from-gold-bright to-gold px-6 py-3 text-sm font-semibold text-[#2a1c05]"
          >
            Upgrade to Plus
          </a>
        )}

        <div className="flex gap-3 mt-6">
          <a
            href="/browse"
            className="rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-6 py-3 text-sm font-semibold text-white"
          >
            Browse profiles
          </a>
          <a
            href="/profile/edit"
            className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
          >
            Edit your photos
          </a>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-border-hair bg-surface-2 p-4">
      <div className="text-xl font-semibold font-mono">{value}</div>
      <div className="text-stone text-xs mt-1">{label}</div>
    </div>
  );
}
