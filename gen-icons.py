# Tạo icon app (mặt trời trên nền xanh) vào icons/mipmap-*/. Chạy: python3 gen-icons.py
import math, os
from PIL import Image, ImageDraw

BG = (14, 107, 82, 255)      # #0e6b52
SUN = (245, 175, 25, 255)
DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

def sun(size, scale_inner):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = S / 2
    R = S * scale_inner / 2          # bán kính vùng vẽ
    core = R * 0.42
    d.ellipse([c - core, c - core, c + core, c + core], fill=SUN)
    for i in range(12):
        a = math.radians(i * 30)
        r1, r2, w = R * 0.60, R * (1.0 if i % 2 == 0 else 0.86), R * 0.085
        x1, y1 = c + r1 * math.cos(a), c + r1 * math.sin(a)
        x2, y2 = c + r2 * math.cos(a), c + r2 * math.sin(a)
        d.line([x1, y1, x2, y2], fill=SUN, width=int(w * 2))
        for x, y in ((x1, y1), (x2, y2)):
            d.ellipse([x - w, y - w, x + w, y + w], fill=SUN)
    return im.resize((size, size), Image.LANCZOS)

for name, k in DENS.items():
    out = f'icons/mipmap-{name}'
    os.makedirs(out, exist_ok=True)
    fg = int(108 * k)
    sun(fg, 0.56).save(f'{out}/ic_launcher_foreground.png')          # adaptive: nằm trong vùng an toàn
    ls = int(48 * k)
    base = Image.new('RGBA', (ls * 4, ls * 4), (0, 0, 0, 0))
    ImageDraw.Draw(base).rounded_rectangle([0, 0, ls * 4 - 1, ls * 4 - 1], radius=ls * 4 * 0.22, fill=BG)
    base = base.resize((ls, ls), Image.LANCZOS)
    base.alpha_composite(sun(ls, 0.78)); base.save(f'{out}/ic_launcher.png')
    rnd = Image.new('RGBA', (ls * 4, ls * 4), (0, 0, 0, 0))
    ImageDraw.Draw(rnd).ellipse([0, 0, ls * 4 - 1, ls * 4 - 1], fill=BG)
    rnd = rnd.resize((ls, ls), Image.LANCZOS)
    rnd.alpha_composite(sun(ls, 0.70)); rnd.save(f'{out}/ic_launcher_round.png')
print('icons OK')
