import Link from "next/link";

/** The prototype's `siteFooter()`, using its own `footer.site` styling. */
export default function SiteFooter() {
  return (
    <footer className="site">
      <div>
        <div className="logo" style={{ marginBottom: 10 }}>
          <span className="dot">♥</span> AMOURA
        </div>
        <p style={{ maxWidth: 280 }}>
          A modern space to meet people who are actually looking for the same
          thing you are.
        </p>
      </div>
      <div>
        <b style={{ fontSize: 12 }}>Company</b>
        <br />
        <br />
        About
        <br />
        Careers
        <br />
        Press
      </div>
      <div>
        <b style={{ fontSize: 12 }}>Support</b>
        <br />
        <br />
        Safety Tips
        <br />
        Help Center
        <br />
        Contact
      </div>
      <div>
        <b style={{ fontSize: 12 }}>Legal</b>
        <br />
        <br />
        Terms
        <br />
        <Link href="/privacy">Privacy</Link>
        <br />
        <Link href="/pricing">Community Guidelines</Link>
      </div>
    </footer>
  );
}
