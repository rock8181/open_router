"""
Preprocess buildings.json:
- Estimate missing heights from neighbors (inverse-distance weighted).
- Estimate missing built years from neighbors.
- Correct a few famous landmarks' years.
- Simplify dataset for rendering (keep centroid, dims, height, year, name).
Outputs data/buildings_processed.json
"""
import json
import math
import os
import random

SRC = os.path.join(os.path.dirname(__file__), "..", "data", "buildings.json")
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "buildings_processed.json")

# Manual corrections for famous buildings (only major ones).
LANDMARK_YEARS = {
    "롯데호텔서울": 1981,
    "서울시청": 1926,
    "한국은행": 1912,
    "덕수궁": None,
    "광화문": 1395,
    "세종문화회관": 1978,
    "LG아트센터": None,
    "교보생명빌딩": 1980,
    "대우빌딩": None,
    "삼일빌딩": 1970,
    "Center Building": None,
}


def dist_m(lat1, lon1, lat2, lon2):
    R = 6378137
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def main():
    with open(SRC, encoding="utf-8") as f:
        data = json.load(f)
    bs = data["buildings"]

    # Apply landmark year corrections by name match.
    for b in bs:
        if b["name"] in LANDMARK_YEARS:
            y = LANDMARK_YEARS[b["name"]]
            if y is not None:
                b["builtYear"] = y

    # Build spatial grid for neighbor lookup.
    cell = 0.002  # ~200m
    grid = {}
    for b in bs:
        key = (int(b["lat"] / cell), int(b["lon"] / cell))
        grid.setdefault(key, []).append(b)

    def neighbors(b, rings=2):
        gx, gy = int(b["lat"] / cell), int(b["lon"] / cell)
        out = []
        for dx in range(-rings, rings + 1):
            for dy in range(-rings, rings + 1):
                out.extend(grid.get((gx + dx, gy + dy), []))
        return out

    # Estimate missing heights.
    for b in bs:
        if b["height"] is None:
            ns = [n for n in neighbors(b) if n["height"] and n is not b]
            if ns:
                # inverse-distance weighted, nearest 8
                ns.sort(key=lambda n: dist_m(b["lat"], b["lon"], n["lat"], n["lon"]))
                ns = ns[:8]
                wsum = 0.0
                hsum = 0.0
                for n in ns:
                    d = dist_m(b["lat"], b["lon"], n["lat"], n["lon"]) + 10
                    w = 1.0 / d
                    wsum += w
                    hsum += n["height"] * w
                b["height"] = round(hsum / wsum, 1) if wsum else 15.0
            else:
                b["height"] = 12.0  # default low-rise

    # Estimate missing built years from neighbors (median of known).
    for b in bs:
        if b["builtYear"] is None:
            ns = [n for n in neighbors(b) if n["builtYear"]]
            if ns:
                years = sorted(n["builtYear"] for n in ns)
                b["builtYear"] = years[len(years) // 2]
            else:
                # spread unknown years across timeline deterministically
                b["builtYear"] = 1970 + (b["id"] * 37) % 55

    # Clamp heights to a sane minimum.
    for b in bs:
        if b["height"] is None or b["height"] < 3:
            b["height"] = 9.0

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump({"bounds": data["bounds"], "buildings": bs}, f, ensure_ascii=False)

    print(f"Wrote {len(bs)} processed buildings -> {OUT}")
    yr = [b["builtYear"] for b in bs if b["builtYear"]]
    print(f"year range: {min(yr)}..{max(yr)}")


if __name__ == "__main__":
    main()