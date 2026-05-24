// Resize enemy sprite sheets 50% pra cortar VRAM iOS.
// 1536×1280 (cells 192×256) → 768×640 (cells 96×128). Mantém proporção exata
// das cells (50% / 50%). Drawn em ~80×100 backing px, 96×128 cobre.
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
  let totalBefore = 0, totalAfter = 0;
  let vramBefore = 0, vramAfter = 0;
  let i = 0;
  for (const f of files) {
    const before = fs.statSync(f).size;
    const metaBefore = await sharp(f).metadata();
    // Pular se sprite for pequeno (<= 768 largura). Bunny sheets já estão em 256/512.
    if (metaBefore.width <= 768) {
      i++;
      continue;
    }
    const newW = Math.floor(metaBefore.width / 2);
    const newH = Math.floor(metaBefore.height / 2);
    totalBefore += before;
    vramBefore += metaBefore.width * metaBefore.height * 4;
    const tmp = f + '.tmp.png';
    await sharp(f)
      .resize(newW, newH, { kernel: 'lanczos3' })
      .png({ palette: true, quality: 92, compressionLevel: 9 })
      .toFile(tmp);
    fs.renameSync(tmp, f);
    const after = fs.statSync(f).size;
    totalAfter += after;
    vramAfter += newW * newH * 4;
    i++;
    if (i % 10 === 0) console.log('  ' + i + '/' + files.length + ' processed');
  }
  console.log('\nDisk:', (totalBefore/1024/1024).toFixed(1), 'MB →', (totalAfter/1024/1024).toFixed(1), 'MB');
  console.log('VRAM:', (vramBefore/1024/1024).toFixed(0), 'MB →', (vramAfter/1024/1024).toFixed(0), 'MB');
})().catch(e => { console.error(e); process.exit(1); });
