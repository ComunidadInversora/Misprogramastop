"use client";

import { useEffect, useState } from "react";
import type { Screenshot } from "@/lib/supabase";

function Lightbox({
  screenshots,
  index,
  onIndexChange,
  onClose,
}: {
  screenshots: Screenshot[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const current = screenshots[index];
  const goPrev = () => onIndexChange((index - 1 + screenshots.length) % screenshots.length);
  const goNext = () => onIndexChange((index + 1) % screenshots.length);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{ background: "rgba(8,11,16,0.92)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 text-2xl leading-none"
        style={{ color: "var(--fg)" }}
      >
        ×
      </button>

      {screenshots.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Anterior"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: "var(--panel)", color: "var(--fg)", border: "1px solid var(--line)" }}
        >
          ‹
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.url}
        alt={current.caption || "Captura ampliada"}
        className="max-w-full max-h-[80vh] rounded-sm"
        onClick={(e) => e.stopPropagation()}
      />

      {screenshots.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Siguiente"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xl"
          style={{ background: "var(--panel)", color: "var(--fg)", border: "1px solid var(--line)" }}
        >
          ›
        </button>
      )}

      <div className="mt-4 text-center max-w-lg" onClick={(e) => e.stopPropagation()}>
        {current.caption && (
          <p className="text-sm mb-1" style={{ color: "var(--fg)" }}>
            {current.caption}
          </p>
        )}
        {screenshots.length > 1 && (
          <p className="font-mono text-xs" style={{ color: "var(--fg-soft)" }}>
            {index + 1} / {screenshots.length}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Gallery({ screenshots, name }: { screenshots: Screenshot[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (screenshots.length === 0) return null;
  const current = screenshots[Math.min(selected, screenshots.length - 1)];

  return (
    <div className="mb-5">
      <button onClick={() => setLightboxOpen(true)} className="block w-full text-left" aria-label={`Ampliar captura de ${name}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.caption || `Captura de ${name}`}
          className="w-full rounded-sm cursor-zoom-in"
          style={{ border: "1px solid var(--line)" }}
        />
      </button>

      {current.caption && (
        <p className="text-xs mt-2" style={{ color: "var(--fg-soft)" }}>
          {current.caption}
        </p>
      )}

      {screenshots.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {screenshots.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="shrink-0 rounded-sm overflow-hidden"
              style={{ border: i === selected ? "2px solid var(--accent)" : "1px solid var(--line)" }}
              aria-label={`Ver captura ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.url} alt="" className="h-16 block" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          screenshots={screenshots}
          index={Math.min(selected, screenshots.length - 1)}
          onIndexChange={setSelected}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
