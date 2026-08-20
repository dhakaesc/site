"use client";

import { useCallback, useEffect } from "react";

/**
 * Full-screen photo viewer. Opens when a photo in the grid is clicked, and
 * can be moved through with the arrows, the keyboard, or by closing out.
 */
export default function PhotoLightbox({
  photos,
  index,
  onClose,
  onIndexChange,
  name,
}: {
  photos: string[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
  name: string;
}) {
  const go = useCallback(
    (next: number) => onIndexChange(((next % photos.length) + photos.length) % photos.length),
    [photos.length, onIndexChange]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    // Stop the page behind from scrolling while the viewer is open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [index, go, onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60, background: "rgba(8,2,4,.92)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="slide-arrow"
        style={{ top: 20, right: 20, transform: "none", zIndex: 2 }}
      >
        ✕
      </button>

      <div
        className="stone"
        style={{ position: "absolute", top: 28, left: 28, fontSize: 13 }}
      >
        {name} · {index + 1} of {photos.length}
      </div>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(index - 1); }}
            aria-label="Previous photo"
            className="slide-arrow"
            style={{ left: 20, zIndex: 2 }}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(index + 1); }}
            aria-label="Next photo"
            className="slide-arrow"
            style={{ right: 20, zIndex: 2 }}
          >
            ›
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index]}
        alt={`${name}, photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(92vw, 900px)", maxHeight: "86vh",
          objectFit: "contain", borderRadius: 16,
        }}
      />
    </div>
  );
}
