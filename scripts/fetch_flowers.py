#!/usr/bin/env python3
"""Fetch license-free flower photos from Wikipedia pageimages API -> public/images/flowers/.
Uses curl (not urllib/requests) to dodge stale-CA issues. Resumable + validating."""
import json, subprocess, os, sys, time, glob

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "images", "flowers")
UA = "OnapookkalSiteBuilder/1.0 (flower catalog placeholder sourcing)"

# slug -> Wikipedia title (common name preferred; scientific where common is ambiguous)
ITEMS = {
    "chethi-ixora": "Ixora coccinea",
    "thumba": "Leucas aspera",
    "kakka-poovu": "Tridax procumbens",
    "kanakambaram-crossandra": "Crossandra infundibuliformis",
    "chemparathi-hibiscus": "Hibiscus rosa-sinensis",
    "vadamalli-globe-amaranth": "Gomphrena globosa",
    "shankhupushpam-butterfly-pea": "Clitoria ternatea",
    "mulla-jasmine": "Jasminum sambac",
    "arali-oleander": "Nerium oleander",
    "nandiarvattam-crape-jasmine": "Tabernaemontana divaricata",
    "kongini-lantana": "Lantana camara",
    "mukkutti": "Biophytum sensitivum",
    "rose-petals": "Garden roses",
    "jamanthi-marigold": "Tagetes",
    "chrysanthemum": "Chrysanthemum",
    "thamara-lotus": "Nelumbo nucifera",
    "mixed-petal-pack": "Flower bouquet",
    "red-petal-pack": "Rose",
    "yellow-petal-pack": "Yellow flowers",
    "pookalam-kit-small": "Pookalam",
    "pookalam-kit-large": "Pookalam",
    "thiruvonam-special-kit": "Onam",
    "marigold-bulk": "Tagetes erecta",
    "rose-petals-bulk": "Rose petals",
    "tulasi-karuka": "Ocimum tenuiflorum",
}

# fallbacks used when a title has no usable image (picked by colour)
FALLBACKS = {
    "Flower": "fallback_red",
    "Wildflower": "fallback_multi",
    "Yellow_flower": "fallback_yellow",
    "White_flower": "fallback_white",
}

def curl_json(url):
    r = subprocess.run(["curl", "-s", "-L", "-A", UA, "--max-time", "20", url],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None

def curl_download(url, dest):
    r = subprocess.run(["curl", "-s", "-L", "-A", UA, "--max-time", "40", "-o", dest, url],
                       capture_output=True, text=True)
    return r.returncode == 0

def valid_image(path):
    if not os.path.exists(path):
        return False
    if os.path.getsize(path) < 4000:
        return False
    with open(path, "rb") as f:
        head = f.read(12)
    if head[:3] == b"\xff\xd8\xff":   # JPEG
        return True
    if head[:8] == b"\x89PNG\r\n\x1a\n":  # PNG
        return True
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return True
    return False

def get_thumb(title, width=900):
    url = ("https://en.wikipedia.org/w/api.php?action=query&titles="
           + title.replace(" ", "_")
           + "&prop=pageimages&format=json&pithumbsize=" + str(width))
    data = curl_json(url)
    if not data or "query" not in data:
        return None
    for pid, page in data["query"]["pages"].items():
        if pid == "-1":
            continue
        thumb = page.get("thumbnail")
        if thumb and thumb.get("source"):
            return thumb["source"]
    return None

def main():
    os.makedirs(BASE, exist_ok=True)

    # Pre-fetch fallbacks
    for title, out in FALLBACKS.items():
        dest = os.path.join(BASE, out + ".jpg")
        if valid_image(dest):
            continue
        src = get_thumb(title, 900)
        if src:
            curl_download(src, dest)
        time.sleep(1.5)

    ok, fail = 0, []
    for slug, title in ITEMS.items():
        dest = os.path.join(BASE, slug + ".jpg")
        if valid_image(dest):
            ok += 1
            print(f"[skip] {slug}")
            continue
        src = get_thumb(title)
        if not src:
            fail.append((slug, title, "no image"))
            print(f"[MISS] {slug} <- {title}")
            time.sleep(1.5)
            continue
        curl_download(src, dest)
        if valid_image(dest):
            ok += 1
            print(f"[ ok ] {slug} <- {title}")
        else:
            fail.append((slug, title, "invalid download"))
            print(f"[BAD ] {slug} <- {title}")
        time.sleep(1.5)

    print(f"\nDone. ok={ok} failed={len(fail)}")
    for slug, title, why in fail:
        print(f"  FAILED {slug} ({title}) - {why}")

if __name__ == "__main__":
    main()
