"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Person = {
  id: number;
  name: string;
  age: number;
  location: string | null;
  photo: string | null;
};

export default function LikesMePage() {
  const [locked, setLocked] = useState(false);
  const [count, setCount] = useState(0);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [decidedIds, setDecidedIds] = useState<Set<number>>(new Set());
  const [matchNotice, setMatchNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/likes/received")
      .then((r) => r.json())
      .then((data) => {
        setLocked(Boolean(data.locked));
        setCount(data.count ?? 0);
        setPeople(data.people ?? []);
      });
  }, []);

  async function decide(personId: number, liked: boolean) {
    setMatchNotice(null);
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: personId, liked }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.matched) {
        setMatchNotice("It's a match! 🎉");
      }
    }
    setDecidedIds((prev) => new Set(prev).add(personId));
  }

  const visiblePeople = people?.filter((p) => !decidedIds.has(p.id)) ?? [];

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="font-serif italic text-xl">♥ AMOURA</div>
        <Link href="/dashboard" className="text-sm text-stone hover:text-ivory">
          Dashboard
        </Link>
      </div>

      <h1 className="font-serif text-2xl mb-1">Who liked you</h1>
      <p className="text-stone text-sm mb-6">
        {count === 0
          ? "No one yet — check back soon."
          : `${count} ${count === 1 ? "person has" : "people have"} liked you.`}
      </p>

      {matchNotice && (
        <div className="rounded-[14px] bg-gradient-to-b from-gold-bright to-gold text-[#2a1c05] text-sm font-semibold text-center py-3 mb-4">
          {matchNotice}
        </div>
      )}

      {locked ? (
        <div className="rounded-[22px] border border-border-hair bg-surface p-8 text-center">
          <p className="text-ivory text-sm mb-2">
            {count > 0
              ? `See who's interested — upgrade to Plus to reveal ${count === 1 ? "them" : "all of them"}.`
              : "Upgrade to Plus to see who likes you the moment it happens."}
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 rounded-[12px] bg-gradient-to-b from-gold-bright to-gold px-6 py-2.5 text-sm font-semibold text-[#2a1c05]"
          >
            Upgrade to Plus
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {visiblePeople.map((p) => (
            <div
              key={p.id}
              className="rounded-[18px] border border-border-hair bg-surface overflow-hidden"
            >
              <div className="aspect-square bg-surface-2 flex items-center justify-center">
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-stone-dim text-xs">No photo</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">
                  {p.name}, {p.age}
                </p>
                {p.location && <p className="text-stone text-xs">{p.location}</p>}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => decide(p.id, false)}
                    className="flex-1 rounded-[10px] border border-border-hair-2 py-1.5 text-xs"
                  >
                    Pass
                  </button>
                  <button
                    onClick={() => decide(p.id, true)}
                    className="flex-1 rounded-[10px] bg-gradient-to-b from-rose-bright to-rose py-1.5 text-xs font-semibold text-white"
                  >
                    Like back
                  </button>
                </div>
              </div>
            </div>
          ))}

          {people && visiblePeople.length === 0 && (
            <p className="col-span-2 text-stone text-sm text-center py-8">
              No one waiting on you right now.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
