import Link from "next/link";
import { getSession } from "@/lib/auth/session";

/**
 * The site navbar from the design prototype. Appears on every public page.
 * Shows member links when signed in, join/login when not.
 */
export default async function SiteHeader() {
  const session = await getSession();

  return (
    <>
      <div className="bg-rose text-white text-center text-xs font-semibold py-2 px-4">
        ✦ Limited time — 20% off your first month of Premium · ends Sunday
      </div>

      <header className="sticky top-0 z-20 bg-void/80 backdrop-blur-xl border-b border-border-hair">
        <div className="max-w-[1280px] mx-auto flex items-center gap-7 px-6 sm:px-12 py-4">
        <Link href="/" className="font-serif italic text-xl flex items-center gap-2">
          <span className="text-rose-bright not-italic">♥</span> AMOURA
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-stone">
          {session ? (
            <>
              <Link href="/browse" className="hover:text-ivory">Discover</Link>
              <Link href="/likes-me" className="hover:text-ivory">Matches</Link>
              <Link href="/messages" className="hover:text-ivory">Messages</Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className="hover:text-ivory">How it works</Link>
              <Link href="/#reviews" className="hover:text-ivory">Reviews</Link>
              <Link href="/pricing" className="hover:text-ivory">Premium</Link>
            </>
          )}
        </nav>

        <div className="flex-1" />

        {session ? (
          <Link
            href="/dashboard"
            className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="rounded-[12px] border border-border-hair px-4 py-2 text-sm">
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-[12px] bg-gradient-to-b from-rose-bright to-rose px-4 py-2 text-sm font-semibold text-white"
            >
              Join free
            </Link>
          </>
        )}
        </div>
      </header>
    </>
  );
}
