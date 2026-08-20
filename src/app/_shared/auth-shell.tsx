import Link from "next/link";

/**
 * The split-screen auth layout from the design prototype: cover art on the
 * left with a pull quote, form on the right.
 */
export default function AuthShell({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div
        className="hidden md:flex flex-1 items-end p-12 relative"
        style={{
          background:
            "linear-gradient(120deg,#2B0D12,#3A131A,#210A0E)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(201,166,107,0.14), transparent 60%)",
          }}
        />
        <p className="font-serif italic text-[26px] leading-snug max-w-[400px] relative">
          &quot;Free to look around. Premium when you are ready to talk.&quot;
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-10">
        <div className="w-full max-w-[340px]">
          <Link
            href="/"
            className="font-serif italic text-xl flex items-center gap-2 mb-7"
          >
            <span className="text-rose-bright not-italic">♥</span> AMOURA
          </Link>
          <h1 className="font-serif text-[26px]">{title}</h1>
          <p className="text-stone text-[13px] mt-1.5">{sub}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
