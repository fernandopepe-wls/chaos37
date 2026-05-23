"""
Resize/crop STORE 01-03 marketing PNGs for phone + Android viewports.
iPad is skipped — too narrow in source aspect (9:16 vs 3:4); regenerate via Layer.ai.
"""
from PIL import Image
import os

SOURCES = {
    'screen1': 'store-assets/screenshots/_marketing/STORE_01.png',
    'screen2': 'store-assets/screenshots/_marketing/STORE_02.png',
    'screen3': 'store-assets/screenshots/_marketing/STORE_03.png',
}

# Skip iPad — handled by Layer.ai regen (different aspect)
TARGETS = {
    'iphone-6.5-1284x2778': (1284, 2778),
    'iphone-6.9-1320x2868': (1320, 2868),
    'android-1080x2400':    (1080, 2400),
}

def cover_crop(src_img, target_w, target_h):
    """Resize src to cover target, center-crop excess. object-fit: cover semantics."""
    sw, sh = src_img.size
    scale = max(target_w / sw, target_h / sh)
    new_w, new_h = int(round(sw * scale)), int(round(sh * scale))
    resized = src_img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))

for screen_name, src_path in SOURCES.items():
    img = Image.open(src_path).convert('RGB')
    for device_folder, (w, h) in TARGETS.items():
        out_path = f'store-assets/screenshots/portrait/{device_folder}/{screen_name}.png'
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        cover_crop(img, w, h).save(out_path, optimize=True, quality=92)
        print(f'  -> {out_path}  ({w}x{h})')

print('Done. iPad variants pending Layer.ai regeneration.')
