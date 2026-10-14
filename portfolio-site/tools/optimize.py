"""写真をサイト用に変換し、works.js に貼る1行を表示します。

使い方:
  python tools/optimize.py originals/DSC001.jpg nature_forest
  python tools/optimize.py originals/DSC001.jpg nature_forest --year 2025
  python tools/optimize.py originals/DSC001.jpg nature_forest --latlng "35.6586, 139.7454"
  python tools/optimize.py originals/DSC001.jpg nature_forest --no-map

  名前の前半はカテゴリー: nature / event / space / portrait
  撮影年・位置情報は、元データのEXIFから自動で取得します。
  ・--latlng  EXIFに位置情報が無いとき、Googleマップで右クリックしてコピーした座標を貼れます
  ・--no-map  位置情報を works.js に入れません（地図に出したくない写真用）
  ・--precision N  座標の小数桁数（既定2＝約1km。3＝約100m、4＝約10m）
必要:    pip install pillow
※ 変換後の画像（webp）にはEXIF（位置情報）は含まれません。座標は works.js にだけ入ります。
"""
import argparse, json
from pathlib import Path
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("name")
ap.add_argument("--year"); ap.add_argument("--latlng")
ap.add_argument("--no-map", action="store_true")
ap.add_argument("--precision", type=int, default=2)
a = ap.parse_args()

cat = a.name.split("_")[0]
root = Path(__file__).resolve().parent.parent
raw = Image.open(a.src)
ex = raw.getexif()

# 撮影年
year = a.year or ""
if not year:
    try:
        sub = ex.get_ifd(0x8769)
        d = sub.get(0x9003) or sub.get(0x9004)
        year = d[:4] if d else ""
    except Exception:
        year = ""
print(f"撮影年: {year}" if year else "撮影年: EXIFに撮影日時がありません（'20XX'を入れます。--year で指定できます）")

# 位置情報
def dms(v, ref):
    d = float(v[0]) + float(v[1]) / 60 + float(v[2]) / 3600
    return -d if ref in ("S", "W") else d

lat = lng = None
if not a.no_map:
    if a.latlng:
        lat, lng = [float(x) for x in a.latlng.replace("，", ",").split(",")]
    else:
        try:
            g = ex.get_ifd(0x8825)
            if g.get(2) and g.get(4):
                lat, lng = dms(g[2], g.get(1)), dms(g[4], g.get(3))
        except Exception:
            pass
    if lat is None:
        print("位置情報: EXIFにありません（地図に出す場合は --latlng \"緯度, 経度\" を指定）")
    else:
        lat, lng = round(lat, a.precision), round(lng, a.precision)
        print(f"位置情報: {lat}, {lng}（小数{a.precision}桁に丸め済み）")
else:
    print("位置情報: 入れません（--no-map）")

im = raw.convert("RGB")
def save(path, n, q):
    c = im.copy(); c.thumbnail((n, n), Image.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    c.save(path, "WEBP", quality=q, method=6); return c.size

w, h = save(root / f"images/works/{a.name}.webp", 1800, 80)
tw, th = save(root / f"images/works/thumb/{a.name}.webp", 900, 78)
e = dict(src=f"images/works/{a.name}.webp", thumb=f"images/works/thumb/{a.name}.webp",
         w=w, h=h, tw=tw, th=th, cat=cat, top=0, pos="50% 50%",
         title="作品タイトル", place="撮影地", year=year or "20XX")
if lat is not None: e.update(lat=lat, lng=lng)
e["alt"] = "写真の説明"
print("\ndata/works.js の配列に次の行を追加してください（上ほど優先表示）:\n")
print("  " + json.dumps(e, ensure_ascii=False) + ",")
