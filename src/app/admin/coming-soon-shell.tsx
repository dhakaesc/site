export default function ComingSoonShell({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  note?: string;
}) {
  return (
    <div>
      <h1 className="font-serif text-2xl mb-1">{title}</h1>
      <p className="text-stone text-sm mb-6 max-w-xl">{description}</p>

      <div className="rounded-[18px] border border-dashed border-border-hair-2 bg-surface/50 p-10 text-center">
        <p className="text-stone text-sm">
          This section isn&apos;t wired up yet — the page exists but there&apos;s no
          backend behind it.
        </p>
        {note && (
          <p className="text-stone-dim text-xs mt-3 max-w-md mx-auto">{note}</p>
        )}
      </div>
    </div>
  );
}
