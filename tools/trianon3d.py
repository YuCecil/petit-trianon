"""把 OpenStreetMap 的小特里亞儂一帶資料，轉成網站 3D 場景用的 docs/assets/trianon3d.json。

用法：python3 tools/trianon3d.py [raw/maps/trianon-osm-日期.xml]
原始資料：https://api.openstreetmap.org/api/0.6/map?bbox=2.1040,48.8145,2.1150,48.8205
（© OpenStreetMap contributors，ODbL 授權；網站上要標示）
標記點（故事裡提到的地點）寫在 data/trianon3d-spots.json，每一點都要有 topic 與 source。
只用 Python 標準函式庫。
"""
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else sorted((ROOT / "raw/maps").glob("trianon-osm-*.xml"))[-1]
BBOX = (48.8145, 2.1058, 48.8210, 2.1152)        # 南、西、北、東：王后的領地（不含大特里亞儂）
LAT0, LNG0 = 48.8175, 2.1105                     # 場景原點
MLAT = 111320.0
MLNG = 111320.0 * math.cos(math.radians(LAT0))

r = ET.parse(SRC).getroot()
nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in r.iter("node")}
ways = {w.get("id"): w for w in r.iter("way")}
tags = lambda el: {t.get("k"): t.get("v") for t in el.iter("tag")}


def xy(lat, lng):
    return [round((lng - LNG0) * MLNG, 1), round((LAT0 - lat) * MLAT, 1)]   # x 往東、z 往南（公尺）


def ring(way):
    return [nodes[nd.get("ref")] for nd in way.iter("nd") if nd.get("ref") in nodes]


def join(rings):
    """把多段外框接成封閉的環"""
    rings = [list(x) for x in rings if x]
    out = []
    while rings:
        cur = rings.pop(0)
        changed = True
        while cur[0] != cur[-1] and changed:
            changed = False
            for i, seg in enumerate(rings):
                if seg[0] == cur[-1]: cur += seg[1:]
                elif seg[-1] == cur[-1]: cur += seg[::-1][1:]
                elif seg[-1] == cur[0]: cur = seg[:-1] + cur
                elif seg[0] == cur[0]: cur = seg[::-1][:-1] + cur
                else: continue
                rings.pop(i); changed = True; break
        out.append(cur)
    return out


def inside(poly):
    la = sum(p[0] for p in poly) / len(poly); lo = sum(p[1] for p in poly) / len(poly)
    return BBOX[0] < la < BBOX[2] and BBOX[1] < lo < BBOX[3]


def height(t, kind):
    if t.get("height"):
        try: return max(3.0, float(t["height"]))
        except ValueError: pass
    lv = t.get("building:levels")
    fixed = {"Le Petit Trianon": 15.0, "Théâtre de la Reine": 11.0, "Temple de l'Amour": 8.0, "Belvédère": 7.0, "Chapelle du Petit Trianon": 10.0}   # 示意高度（公尺），沒有實測
    if t.get("name") in fixed: return fixed[t["name"]]
    if lv:
        try: return float(lv) * 3.6 + 1.5
        except ValueError: pass
    if kind in ("greenhouse", "ruins"): return 3.0
    return 6.0


feats = {"buildings": [], "water": []}
shapes = []
for w in ways.values():
    t = tags(w)
    shapes.append(("way", w.get("id"), t, [ring(w)]))
for rel in r.iter("relation"):
    t = tags(rel)
    outers = [ring(ways[m.get("ref")]) for m in rel.iter("member") if m.get("type") == "way" and m.get("role") == "outer" and m.get("ref") in ways]
    shapes.append(("relation", rel.get("id"), t, join(outers)))

for typ, oid, t, rings in shapes:
    is_b = "building" in t or t.get("historic") == "monument"
    is_w = t.get("natural") == "water" or "water" in t
    if not (is_b or is_w): continue
    for rg in rings:
        if len(rg) < 4 or rg[0] != rg[-1] or not inside(rg): continue
        pts = [xy(*p) for p in rg[:-1]]
        if is_b:
            kind = t.get("building", "monument")
            feats["buildings"].append({"id": f"{typ[0]}{oid}", "name": t.get("name", ""), "h": height(t, kind), "kind": kind, "pts": pts})
        else:
            feats["water"].append({"id": f"{typ[0]}{oid}", "pts": pts})

# 標記點：位置取 OSM 物件的中心
spots = json.loads((ROOT / "data/trianon3d-spots.json").read_text(encoding="utf-8"))
centers = {}
for typ, oid, t, rings in shapes:
    pts = [p for rg in rings for p in rg]
    if pts: centers[f"{typ[0]}{oid}"] = (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))
for n in r.iter("node"):
    centers["n" + n.get("id")] = (float(n.get("lat")), float(n.get("lon")))
out_spots = []
for s in spots:
    c = centers.get(s["osm"])
    if not c:
        print("找不到 OSM 物件：", s["osm"], s["name"]); continue
    b = next((x for x in feats["buildings"] if x["id"] == s["osm"]), None)
    out_spots.append({**{k: s[k] for k in ("name", "note", "topic", "source")}, "pos": xy(*c), "h": b["h"] if b else 2})

feats["spots"] = out_spots
feats["size"] = [round((BBOX[3] - BBOX[1]) * MLNG), round((BBOX[2] - BBOX[0]) * MLAT)]
feats["credit"] = "建築與水域輪廓：© OpenStreetMap contributors（ODbL），" + SRC.stem.replace("trianon-osm-", "") + " 擷取"
dst = ROOT / "docs/assets/trianon3d.json"
dst.write_text(json.dumps(feats, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"OK：建築 {len(feats['buildings'])}、水域 {len(feats['water'])}、標記 {len(out_spots)} → {dst.relative_to(ROOT)}（{dst.stat().st_size // 1024} KB）")
