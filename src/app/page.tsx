import Link from "next/link";
import { getSession } from "@/lib/auth/session";

const STEPS = [
  {
    n: "01",
    title: "Create your profile",
    body: "Add photos, a short bio, and what you are looking for.",
  },
  {
    n: "02",
    title: "Browse & connect",
    body: "Visit profiles free, and like who catches your eye.",
  },
  {
    n: "03",
    title: "Message & upgrade",
    body: "Free members get 5 messages to up to 5 people — go Plus for unlimited chat.",
  },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="min-h-screen">
      <header className="flex items-center justify-between px-6 sm:px-12 py-6">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/pricing" className="text-stone hover:text-ivory">
            Pricing
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-[12px] border border-border-hair px-4 py-2"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-[12px] border border-border-hair px-4 py-2"
            >
              Log in
            </Link>
          )}
        </nav>
      </header>

      <section className="px-6 sm:px-12 py-16 text-center">
        <h1 className="font-serif text-4xl sm:text-5xl max-w-2xl mx-auto leading-tight">
          Find <span className="text-blush-bright italic">real</span> connections
        </h1>
        <p className="text-stone mt-4 max-w-md mx-auto">
          Create your free profile in minutes and start meeting people who are
          actually looking for the same thing you are.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href={session ? "/browse" : "/register"}
            className="rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-6 py-3 text-sm font-semibold text-white"
          >
            {session ? "Browse profiles" : "Create free profile"}
          </Link>
          <Link
            href="/pricing"
            className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
          >
            See plans
          </Link>
        </div>
      </section>

      <section className="px-6 sm:px-12 py-14 border-t border-border-hair bg-surface/40">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {STEPS.map((s) => (
            <div key={s.n}>
              <div className="font-mono text-rose-bright text-[13px]">{s.n}</div>
              <h3 className="text-lg mt-2 mb-2">{s.title}</h3>
              <p className="text-stone text-[13px]">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 sm:px-12 py-8 border-t border-border-hair text-stone text-xs text-center">
        © {new Date().getFullYear()} AMOURA
      </footer>
    </main>
  );
}
