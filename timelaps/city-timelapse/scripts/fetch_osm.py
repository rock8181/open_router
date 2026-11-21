"""
Fetch building footprints within 2km of Seoul City Hall from OpenStreetMap
via the Overpass API. Outputs data/buildings.json with lat/lon of centroid,
approximate width/depth (meters), height, levels, and built year when present.
"""
import json
import math
import os
import urllib.request
import urllib.parse

# Seoul City Hall
CENTER_LAT = 37.5665
CENTER_LON = 126.9780
RADIUS_M = 2000

OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "buildings.json")

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]


def build_query():
    return f"""
    [out:json][timeout:180];
    (
      way["building"](around:{RADIUS_M},{CENTER_LAT},{CENTER_LON});
      relation["building"](around:{RADIUS_M},{CENTER_LAT},{CENTER_LON});
    );
    out body geom;
    """


def fetch():
    query = build_query()
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last_err = None
    for url in OVERPASS_URLS:
        try:
            req = urllib.request.Request(
                url,
                data=data,
                headers={"User-Agent": "city-timelapse/1.0 (educational)"},
            )
            with urllib.request.urlopen(req, timeout=200) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:  # noqa
            last_err = e
            print(f"Failed {url}: {e}")
    raise RuntimeError(f"All Overpass endpoints failed: {last_err}")


def haversine(lat1, lon1, lat2, lon2):
    R = 6378137
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def polygon_centroid(coords):
    # coords: list of (lat, lon). Use shoelace on local projection.
    lat0 = sum(c[0] for c in coords) / len(coords)
    lon0 = sum(c[1] for c in coords) / len(coords)
    R = 6378137
    xs = [math.radians(c[1] - lon0) * R * math.cos(math.radians(lat0)) for c in coords]
    ys = [math.radians(c[0] - lat0) * R for c in coords]
    area = 0.0
    cx = 0.0
    cy = 0.0
    n = len(coords)
    for i in range(n):
        x0, y0 = xs[i], ys[i]
        x1, y1 = xs[(i + 1) % n], ys[(i + 1) % n]
        cross = x0 * y1 - x1 * y0
        area += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if abs(area) < 1e-9:
        return lat0, lon0, 0.0, 0.0
    area *= 0.5
    cx /= 6 * area
    cy /= 6 * area
    clat = lat0 + math.degrees(cy / R)
    clon = lon0 + math.degrees(cx / (R * math.cos(math.radians(lat0))))
    # Bounding box dims as width/depth.
    width = max(xs) - min(xs)
    depth = max(ys) - min(ys)
    return clat, clon, width, depth


def parse_height(tags):
    h = tags.get("height")
    if h:
        try:
            val = float("".join(ch for ch in h if ch.isdigit() or ch == "."))
            if val > 0:
                return val
        except ValueError:
            pass
    levels = tags.get("building:levels")
    if levels:
        try:
            lv = float(levels)
            if lv > 0:
                return lv * 3.2
        except ValueError:
            pass
    return None


def parse_levels(tags):
    lv = tags.get("building:levels")
    if lv:
        try:
            return float(lv)
        except ValueError:
            pass
    return None


def parse_year(tags):
    for key in ("start_date", "built", "building:year_built", "year_built"):
        v = tags.get(key)
        if v:
            digits = "".join(ch for ch in v if ch.isdigit())
            if len(digits) >= 4:
                try:
                    y = int(digits[:4])
                    if 1800 <= y <= 2030:
                        return y
                except ValueError:
                    pass
    return None


def main():
    print("Querying Overpass API ...")
    result = fetch()
    elements = result.get("elements", [])
    print(f"Received {len(elements)} elements")

    buildings = []
    lats, lons = [], []
    bid = 0
    for el in elements:
        tags = el.get("tags", {})
        if tags.get("building") in ("no", None):
            continue
        geom = el.get("geometry")
        if not geom:
            # relation: use members' geometry (outer ways)
            pts = []
            for m in el.get("members", []):
                if m.get("role") in ("outer", "") and m.get("geometry"):
                    pts.extend((p["lat"], p["lon"]) for p in m["geometry"])
            coords = pts
        else:
            coords = [(p["lat"], p["lon"]) for p in geom]

        if len(coords) < 3:
            continue

        clat, clon, width, depth = polygon_centroid(coords)
        dist = haversine(CENTER_LAT, CENTER_LON, clat, clon)
        if dist > RADIUS_M:
            continue

        height = parse_height(tags)
        levels = parse_levels(tags)
        year = parse_year(tags)
        name = tags.get("name") or tags.get("name:ko")

        buildings.append(
            {
                "id": bid,
                "lat": round(clat, 6),
                "lon": round(clon, 6),
                "height": round(height, 1) if height else None,
                "width": round(width, 1) if width else None,
                "depth": round(depth, 1) if depth else None,
                "levels": levels,
                "builtYear": year,
                "name": name,
            }
        )
        lats.append(clat)
        lons.append(clon)
        bid += 1

    bounds = {
        "minLat": min(lats),
        "maxLat": max(lats),
        "minLon": min(lons),
        "maxLon": max(lons),
        "centerLat": CENTER_LAT,
        "centerLon": CENTER_LON,
    }

    out = {"bounds": bounds, "buildings": buildings}
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    with_h = sum(1 for b in buildings if b["height"])
    with_y = sum(1 for b in buildings if b["builtYear"])
    print(f"Wrote {len(buildings)} buildings -> {OUT_PATH}")
    print(f"  with height: {with_h}, with builtYear: {with_y}")


if __name__ == "__main__":
    main()