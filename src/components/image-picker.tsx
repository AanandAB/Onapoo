"use client";

import { useRef, useState } from "react";

/**
 * Dual-mode image control: paste a URL, or upload a file from the device.
 * Uploaded files are downscaled + compressed in the browser to a data URL
 * (no server / R2 needed) and stored directly in the product's `image` column.
 * Renders a hidden <input name="image"> so it plugs into the existing form.
 */
export function ImagePicker({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [mode, setMode] = useState<"url" | "upload">(
    (defaultValue ?? "").startsWith("data:") ? "upload" : "url",
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      setValue(await compressImage(file, 1000, 0.8));
    } catch {
      setErr("Could not process that image.");
    } finally {
      setBusy(false);
    }
  }

  const isData = value.startsWith("data:");
  const sizeKb = isData ? Math.round((value.length * 0.75) / 1024) : null;

  return (
    <div>
      <input type="hidden" name="image" value={value} />

      <div className="flex gap-3">
        {/* Preview */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-cream-dark">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-muted">No img</div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => setValue("")}
              aria-label="Remove image"
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-cream hover:bg-ink"
            >
              ✕
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-ink/15 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex-1 px-2.5 py-1.5 ${mode === "url" ? "bg-gold text-cream" : "text-ink/60 hover:bg-cream"}`}
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex-1 px-2.5 py-1.5 ${mode === "upload" ? "bg-gold text-cream" : "text-ink/60 hover:bg-cream"}`}
            >
              Upload
            </button>
          </div>

          {mode === "url" ? (
            <input
              type="text"
              value={isData ? "" : value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="https://…/image.jpg"
              className="w-full rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm focus:border-gold focus:outline-none"
            />
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink/25 bg-cream px-3 py-2.5 text-sm text-ink/70 hover:border-gold hover:text-ink disabled:opacity-60"
              >
                {busy ? "Processing…" : isData ? "Replace image" : "Choose image file"}
              </button>
              {isData && sizeKb != null && (
                <p className="mt-1 text-[11px] text-leaf">
                  ✓ Image ready ({sizeKb} KB) — saved in the product, no R2 needed
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {err && <p className="mt-1 text-xs text-chethi">{err}</p>}
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
