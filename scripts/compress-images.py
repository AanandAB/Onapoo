"""Compress + downscale site images in-place (public/images).

- Resizes any image wider than MAX_W to MAX_W (aspect preserved).
- Re-encodes as progressive JPEG, quality QUALITY, optimize=True (strips EXIF).
- Skips files already small (< SKIP_BYTES) unless they're oversized.
- Only overwrites the original if the new file is smaller (never grows a file).
- Prints a before/after table + total savings.

Originals are recoverable via git (public/images is tracked).
"""
import os, glob, sys
from PIL import Image

MAX_W = 900
QUALITY = 74
SKIP_BYTES = 40_000  # leave already-light files alone unless oversized

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "images")

def main():
    files = sorted(glob.glob(os.path.join(ROOT, "**", "*.*"), recursive=True))
    files = [f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    total_before = total_after = 0
    changed = 0
    print(f"{'before':>8}  {'after':>8}  {'WxH':>12}  file")
    for p in files:
        before = os.path.getsize(p)
        total_before += before
        try:
            im = Image.open(p)
            w, h = im.size
            fmt = im.format
            # convert PNG (or palette/transparency) to RGB for JPEG save
            if fmt == "PNG" or im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            do_resize = w > MAX_W
            if do_resize:
                nh = round(h * MAX_W / w)
                im = im.resize((MAX_W, nh), Image.LANCZOS)
            if not do_resize and before < SKIP_BYTES:
                continue  # already light and correctly sized
            # save to temp, only replace if smaller
            tmp = p + ".tmp.jpg"
            im.save(tmp, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            after = os.path.getsize(tmp)
            if after < before:
                os.replace(tmp, p)
                changed += 1
                total_after += after
                print(f"{before:>8}  {after:>8}  {w:>5}x{h:<6}  {os.path.relpath(p, ROOT)}  (resized)" if do_resize else
                      f"{before:>8}  {after:>8}  {w:>5}x{h:<6}  {os.path.relpath(p, ROOT)}")
            else:
                os.remove(tmp)
                total_after += before
        except Exception as e:
            total_after += before
            print(f"{before:>8}  {'SKIP':>8}  {os.path.relpath(p, ROOT)}  ({e})")
    print("-" * 50)
    print(f"TOTAL: {total_before/1024:.0f} KB -> {total_after/1024:.0f} KB  "
          f"(saved {max(0, total_before-total_after)/1024:.0f} KB, {changed} files changed)")

if __name__ == "__main__":
    main()
