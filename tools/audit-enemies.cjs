// One-shot script: audit enemy sprite sheet sizes + VRAM.
// Run: node tools/audit-enemies.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, results);
    else if (/\.png$/i.test(e.name)) results.push(full);
  }
  return results;
}

(async () => {
  const files = walk('public/assets/enemies');
  console.log('Enemy PNGs:', files.length);
  let totalDisk = 0, totalVRAM = 0;
  const sized = [];
  for (const f of files) {
    const stat = fs.statSync(f);
    const meta = await sharp(f).metadata();
    totalDisk += stat.size;
    totalVRAM += meta.width * meta.height * 4;
    sized.push({
      f: f.replace(/\\/g, '/').replace('public/assets/enemies/', ''),
      kb: stat.size / 1024,
      w: meta.width,
      h: meta.height,
    });
  }
  console.log('Disk:', (totalDisk / 1024 / 1024).toFixed(1), 'MB');
  console.log('VRAM if all loaded:', (totalVRAM / 1024 / 1024).toFixed(0), 'MB');
  sized.sort((a, b) => b.kb - a.kb);
  console.log('\nTop 10:');
  for (const s of sized.slice(0, 10)) {
    console.log('  ' + s.kb.toFixed(0).padStart(4) + 'KB  ' + (s.w + 'x' + s.h).padEnd(11) + '  ' + s.f);
  }
})();
