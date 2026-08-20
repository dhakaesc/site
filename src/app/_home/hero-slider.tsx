"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
};

/**
 * Full-width hero slider. Auto-advances, pauses on hover, and can be driven by
 * the arrows or the dots. Uses the prototype's own tokens (.btn, .pill, colour
 * variables) so it sits inside the existing design rather than beside it.
 */
export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ padding: "24px 48px 8px" }}
    >
      <div className="hero-slider" style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        border: "1px solid var(--border-hair)", background: "var(--bg-surface)",
      }}>
        {slides.map((s, i) => (
          <div
            key={s.href + i}
            aria-hidden={i !== index}
            style={{
              position: i === index ? "relative" : "absolute",
              inset: i === index ? undefined : 0,
              opacity: i === index ? 1 : 0,
              transition: "opacity .6s ease",
              pointerEvents: i === index ? "auto" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt=""
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center center",
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background:
                "linear-gradient(90deg, rgba(20,6,9,.92) 0%, rgba(20,6,9,.72) 45%, rgba(20,6,9,.25) 100%)",
            }} />

            <div className="slide-body" style={{ position: "relative", padding: "56px 48px" }}>
              <div className="eyebrow">{s.eyebrow}</div>
              <h1 className="slide-title" style={{ maxWidth: 620, marginTop: 12 }}>
                {s.title}
              </h1>
              <p className="stone" style={{ maxWidth: 460, marginTop: 14, fontSize: 15 }}>
                {s.desc}
              </p>
              <Link className="btn btn-rose" style={{ marginTop: 24 }} href={s.href}>
                {s.cta}
              </Link>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="slide-arrow"
              style={{ left: 16 }}
            >
              ‹
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="slide-arrow"
              style={{ right: 16 }}
            >
              ›
            </button>

            <div style={{
              position: "absolute", bottom: 18, left: 0, right: 0,
              display: "flex", justifyContent: "center", gap: 8,
            }}>
              {slides.map((s, i) => (
                <button
                  key={s.href + i}
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === index ? 22 : 8, height: 8, borderRadius: 999,
                    border: "none", cursor: "pointer", transition: ".25s",
                    background: i === index ? "var(--gold-bright)" : "rgba(255,255,255,.35)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
