"""Upscale picked iPad candidates to native 2048x2732."""
from PIL import Image
import os

PICKS = {
    'screen1': 'store-assets/screenshots/_ipad_candidates/screen1_B.png',
    'screen2': 'store-assets/screenshots/_ipad_candidates/screen2_A.png',
    'screen3': 'store-assets/screenshots/_ipad_candidates/screen3_A.png',
}
OUT_DIR = 'store-assets/screenshots/portrait/ipad-2048x2732'
TARGET = (2048, 2732)

os.makedirs(OUT_DIR, exist_ok=True)
for name, src in PICKS.items():
    img = Image.open(src).convert('RGB')
    # Ensure 3:4 — if Layer returned slightly off, center-crop first
    sw, sh = img.size
    target_aspect = TARGET[0] / TARGET[1]
    src_aspect = sw / sh
    if abs(src_aspect - target_aspect) > 0.001:
        if src_aspect > target_aspect:
            new_w = int(sh * target_aspect)
            left = (sw - new_w) // 2
            img = img.crop((left, 0, left + new_w, sh))
        else:
            new_h = int(sw / target_aspect)
            top = (sh - new_h) // 2
            img = img.crop((0, top, sw, top + new_h))
    out = img.resize(TARGET, Image.LANCZOS)
    out_path = f'{OUT_DIR}/{name}.png'
    out.save(out_path, optimize=True, quality=92)
    print(f'  -> {out_path}  ({TARGET[0]}x{TARGET[1]})')
