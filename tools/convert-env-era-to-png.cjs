// One-shot: convert all env-era*.webp from public/assets/ to high-quality PNG
// in store-assets/env-era/. Preserves native resolution (1024×1404).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'public', 'assets');
const OUT_DIR = path.join(__dirname, '..', 'store-assets', 'env-era');

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => /^env-era\d+.*\.webp$/.test(f));

(async () => {
  for (const f of files) {
    const src = path.join(SRC_DIR, f);
    const outName = f.replace(/\.webp$/i, '.png');
    const out = path.join(OUT_DIR, outName);
    await sharp(src)
      .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
      .toFile(out);
    const { size } = fs.statSync(out);
    console.log(`✔ ${outName}  (${(size / 1024 / 1024).toFixed(2)} MB)`);
  }
  console.log(`\nDone. ${files.length} files → ${OUT_DIR}`);
})().catch(e => { console.error(e); process.exit(1); });
