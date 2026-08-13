#!/usr/bin/env python3
"""Second-pass flower image fetch via Wikimedia Commons search API (with pageimages fallback)."""
import json, subprocess, os, time

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "images", "flowers")
UA = "OnapookkalSiteBuilder/1.0 (flower catalog placeholder sourcing)"

# slug -> list of search terms / titles to try (Commons search first, then pageimages)
ITEMS = {
    "kakka-poovu": ["Tridax procumbens flower"],
    "chemparathi-hibiscus": ["Hibiscus rosa-sinensis flower"],
    "arali-oleander": ["Nerium oleander flower"],
    "mixed-petal-pack": ["colorful flower bouquet"],
    "red-petal-pack": ["red rose flower"],
    "yellow-petal-pack": ["yellow marigold"],
    "pookalam-kit-small": ["pookalam"],
    "pookalam-kit-large": ["pookalam onam"],
    "thiruvonam-special-kit": ["onam pookalam flowers"],
    "marigold-bulk": ["marigold flowers"],
    "rose-petals-bulk": ["rose petals red"],
    "tulasi-karuka": ["tulsi holy basil plant"],
}

def curl_json(url):
    r = subprocess.run(["curl", "-s", "-L", "-A", UA, "--max-time", "25", url],
                       capture_output=True, text=True)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None

def curl_download(url, dest):
    r = subprocess.run(["curl", "-s", "-L", "-A", UA, "--max-time", "45", "-o", dest, url],
                       capture_output=True, text=True)
    return r.returncode == 0

def valid_image(path):
    if not os.path.exists(path) or os.path.getsize(path) < 4000:
        return False
    with open(path, "rb") as f:
        head = f.read(12)
    return (head[:3] == b"\xff\xd8\xff" or head[:8] == b"\x89PNG\r\n\x1a\n"
            or (head[:4] == b"RIFF" and head[8:12] == b"WEBP"))

def commons_search(term):
    url = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
           "&gsrsearch=" + term.replace(" ", "%20") +
           "&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|size&iiurlwidth=900&format=json")
    data = curl_json(url)
    if not data or "query" not in data:
        return None
    for pid, page in data["query"]["pages"].items():
        info = (page.get("imageinfo") or [{}])[0]
        if info.get("mime") in ("image/jpeg", "image/png", "image/webp") and info.get("thumburl"):
            return info["thumburl"]
    return None

def main():
    for slug, terms in ITEMS.items():
        dest = os.path.join(BASE, slug + ".jpg")
        if valid_image(dest):
            print(f"[skip] {slug}")
            continue
        got = False
        for term in terms:
            src = commons_search(term)
            if src and curl_download(src, dest) and valid_image(dest):
                print(f"[ ok ] {slug} <- commons:{term}")
                got = True
                break
            time.sleep(1.2)
        if not got:
            print(f"[MISS] {slug} (tried {terms})")
        time.sleep(1.2)

if __name__ == "__main__":
    main()
