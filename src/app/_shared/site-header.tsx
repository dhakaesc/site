import Link from "next/link";
import { getSession } from "@/lib/auth/session";

/**
 * The prototype's `navbar()` / `navbarLoggedIn()`, using its own CSS classes
 * (.navbar, .logo, .links, .btn) so spacing, colour and type match exactly.
 */
export default async function SiteHeader() {
  const session = await getSession();

  return (
    <>
      <div className="topbanner">
        ✦ Limited time — 20% off your first month of Premium · ends Sunday
      </div>

      <div className="navbar">
        <Link href="/" className="logo">
          <span className="dot">♥</span> AMOURA
        </Link>

        <div className="links">
          {session ? (
            <>
              <Link href="/browse">Discover</Link>
              <Link href="/likes-me">Matches</Link>
              <Link href="/messages">Messages</Link>
            </>
          ) : (
            <>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/#reviews">Reviews</Link>
              <Link href="/pricing">Premium</Link>
            </>
          )}
        </div>

        <div className="spacer" />

        {session ? (
          <Link className="btn btn-rose btn-sm" href="/dashboard">
            Dashboard
          </Link>
        ) : (
          <>
            <Link className="btn btn-ghost btn-sm" href="/login">
              Log in
            </Link>
            <Link className="btn btn-rose btn-sm" href="/register">
              Join free
            </Link>
          </>
        )}
      </div>
    </>
  );
}
