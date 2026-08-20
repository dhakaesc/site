import Link from "next/link";

/** The site footer from the design prototype. Appears on every public page. */
export default function SiteFooter() {
  return (
    <>
      <footer className="border-t border-border-hair">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-8 text-[13px] text-stone">
        <div>
          <div className="font-serif italic text-xl mb-2.5">♥ AMOURA</div>
          <p className="max-w-[280px]">
            A modern space to meet people who are actually looking for the same
            thing you are.
          </p>
        </div>
        <div>
          <b className="text-xs text-ivory">Company</b>
          <br />
          <br />
          About
          <br />
          Careers
          <br />
          Press
        </div>
        <div>
          <b className="text-xs text-ivory">Support</b>
          <br />
          <br />
          Safety Tips
          <br />
          Help Center
          <br />
          Contact
        </div>
        <div>
          <b className="text-xs text-ivory">Legal</b>
          <br />
          <br />
          Terms
          <br />
          Privacy
          <br />
          <Link href="/pricing" className="hover:text-ivory">Premium</Link>
        </div>
        </div>
      </footer>
      <div className="text-center text-stone-dim text-xs pb-8">
        © {new Date().getFullYear()} AMOURA
      </div>
    </>
  );
}
