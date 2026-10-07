"""Apply Kipwa's warm, sun-faded film grade to a folder of photos.

usage:  python scripts/grade.py <input-folder> <output-folder>
needs:  pip install Pillow

Gently desaturates, lifts blacks toward the night-sea ink, rolls highlights
off toward lime-washed bone, cools the shadows (sea) and warms the
highlights (sun). Caps width at 2000px.
"""
import os
import sys

from PIL import Image, ImageEnhance

src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)


def channel_lut(lo, hi, shadow_shift, high_shift):
    lut = []
    for i in range(256):
        t = i / 255.0
        s = t * t * (3 - 2 * t)          # soft S-curve
        t = 0.35 * s + 0.65 * t
        v = lo + t * (hi - lo)           # faded film: lifted blacks, soft whites
        v += shadow_shift * (1 - t) ** 2 + high_shift * t ** 2
        lut.append(max(0, min(255, int(round(v)))))
    return lut


# per-channel: (black point, white point, shadow tint, highlight tint)
R = channel_lut(16, 246, -3, 6)
G = channel_lut(15, 241, 0, 2)
B = channel_lut(18, 230, 7, -8)


def grade(img):
    img = ImageEnhance.Color(img).enhance(0.8)
    r, g, b = img.split()
    return Image.merge("RGB", (r.point(R), g.point(G), b.point(B)))


for f in sorted(os.listdir(src)):
    if not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        continue
    im = Image.open(os.path.join(src, f)).convert("RGB")
    if im.width > 2000:
        im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
    out = os.path.splitext(f)[0] + ".jpg"
    grade(im).save(os.path.join(dst, out), "JPEG", quality=80, optimize=True, progressive=True)
    print(out, im.size)
