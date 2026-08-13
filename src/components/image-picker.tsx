"use client";

import { useState } from "react";

export function ImagePicker({ defaultValue }: { defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) setUrl(data.url);
      else setError(data.error ?? "Upload failed");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name="image" value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-cream-dark text-xs text-muted">
            No img
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste image URL"
            className="w-full rounded-lg border border-ink/15 bg-cream px-3 py-2 text-sm"
          />
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-gold-deep">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" />
            </svg>
            {uploading ? "Uploading…" : "Upload image (R2)"}
            <input type="file" accept="image/*" onChange={onFile} className="hidden" />
          </label>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-chethi">{error}</p>}
    </div>
  );
}
