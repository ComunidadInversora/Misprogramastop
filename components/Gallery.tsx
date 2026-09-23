"use client";

import { useState } from "react";
import type { Screenshot } from "@/lib/supabase";

export default function Gallery({ screenshots, name }: { screenshots: Screenshot[]; name: string }) {
  const [selected, setSelected] = useState(0);

  if (screenshots.length === 0) return null;
  const current = screenshots[Math.min(selected, screenshots.length - 1)];

  return (
    <div className="mb-5">
      <a href={current.url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.caption || `Captura de ${name}`}
          className="w-full rounded-sm cursor-zoom-in"
          style={{ border: "1px solid var(--line)" }}
        />
      </a>

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
    </div>
  );
}

