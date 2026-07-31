export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="font-serif italic text-3xl mb-4">♥ AMOURA</div>
      <h1 className="font-serif text-4xl sm:text-5xl max-w-2xl leading-tight">
        Find <em className="text-blush-bright not-italic italic">real</em>{" "}
        connections
      </h1>
      <p className="text-stone mt-4 max-w-md">
        Create your free profile in minutes and start meeting people who are
        actually looking for the same thing you are.
      </p>
      <div className="mt-8 flex gap-4">
        <a
          href="/register"
          className="rounded-[14px] bg-gradient-to-b from-rose-bright to-rose px-6 py-3 text-sm font-semibold text-white"
        >
          Create free profile
        </a>
        <a
          href="/login"
          className="rounded-[14px] border border-border-hair px-6 py-3 text-sm font-semibold"
        >
          Log in
        </a>
      </div>
    </main>
  );
}
