"use client";

import { useRef, useState } from "react";

const MAX_IMAGES = 8;

/**
 * Multi-image picker for a product gallery. Images are stored as an array of
 * strings (image URLs or compressed data URLs). The first image is the cover.
 * Renders a hidden <input name="images"> (JSON) so it plugs into the form.
 */
export function GalleryPicker({ defaultValue }: { defaultValue?: string[] | null }) {
  const [images, setImages] = useState<string[]>(defaultValue?.filter(Boolean) ?? []);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addUrl = () => {
    const u = url.trim();
    if (!u) return;
    if (images.length >= MAX_IMAGES) {
      setErr(`Max ${MAX_IMAGES} images.`);
      return;
    }
    setImages((prev) => [...prev, u]);
    setUrl("");
    setErr("");
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const processed: string[] = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        if (images.length + processed.length >= MAX_IMAGES) break;
        processed.push(await compressImage(f, 900, 0.75));
      }
      setImages((prev) => [...prev, ...processed].slice(0, MAX_IMAGES));
    } catch {
      setErr("Could not process one of those images.");
    } finally {
      setBusy(false);
    }
  };

  const remove = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={i}
            className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-cream-dark"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-cream">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-ink/50 py-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move left"
                className="rounded bg-white/20 px-1.5 text-xs text-white disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
                aria-label="Move right"
                className="rounded bg-white/20 px-1.5 text-xs text-white disabled:opacity-30"
              >
                →
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove image"
                className="rounded bg-white/20 px-1.5 text-xs text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-ink/25 bg-cream text-xs text-muted hover:border-gold hover:text-ink disabled:opacity-60"
          >
            <span className="text-lg">+</span>
            {busy ? "Processing…" : "Upload"}
          </button>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="flex-1 rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm focus:border-gold focus:outline-none"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-lg border border-ink/15 px-3 py-2 text-sm font-semibold hover:bg-cream"
        >
          Add
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />

      {err && <p className="mt-1 text-xs text-chethi">{err}</p>}
      <p className="mt-1 text-[11px] text-muted">
        First image is the cover. Uploads are compressed; for best page speed prefer image URLs.
      </p>
    </div>
  );
}

/** Downscale to maxDim and re-encode as a JPEG data URL to keep size small. */
function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("ctx"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
