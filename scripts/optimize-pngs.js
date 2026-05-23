#!/usr/bin/env node
// Optimize all PNGs under public/assets/ in-place.
//
// Strategy per file:
//   1. Skip if < 50 KB (overhead not worth it)
//   2. Try palette quantization (indexed 256-color) — huge wins on
//      sprites with limited palettes, near-lossless visual quality
//   3. Compare with truecolor max-compression encode — keep whichever
//      is smaller (palette can lose vs truecolor on photographic content)
//   4. Only overwrite if new file is smaller than original
//
// Originals backed up to .png-bak/ at project root (gitignored, OUTSIDE
// public/ so Vite doesn't bundle them into dist/). `git checkout HEAD~N`
// also recovers them via the pre-optimization commit.
//
// Concurrency: 4 workers (most modern CPUs benefit; sharp itself uses
// libvips with internal threading too).
//
// Run:    npm run optimize-pngs
// Or:     node scripts/optimize-pngs.js

import { readFileSync, writeFileSync, mkdirSync, statSync, copyFileSync, existsSync } from 'fs';
import { resolve, dirname, relative } from 'path';
import { readdir } from 'fs/promises';
import sharp from 'sharp';

const SRC_DIR = resolve('public/assets');
const BAK_DIR = resolve('.png-bak');  // raiz do projeto — FORA de public/
const MIN_SIZE = 50 * 1024;      // 50 KB — skip tiny files
const CONCURRENCY = 4;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.png')) out.push(p);
  }
  return out;
}

function fmtMB(bytes) {
  return (bytes / 1048576).toFixed(2) + ' MB';
}

async function optimizeOne(srcPath) {
  const origSize = statSync(srcPath).size;
  if (origSize < MIN_SIZE) {
    return { srcPath, origSize, newSize: origSize, skipped: 'small' };
  }

  const orig = readFileSync(srcPath);

  // Try BOTH encoders and pick whichever is smaller. Sharp's palette mode
  // is great for sprites with bounded palette; for high-color photographic
  // content, truecolor + max zlib can beat it.
  const [palette, truecolor] = await Promise.all([
    sharp(orig)
      .png({ palette: true, quality: 90, effort: 10, compressionLevel: 9 })
      .toBuffer()
      .catch(() => null),
    sharp(orig)
      .png({ palette: false, effort: 10, compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer()
      .catch(() => null),
  ]);

  const candidates = [
    palette   && { kind: 'palette',   buf: palette },
    truecolor && { kind: 'truecolor', buf: truecolor },
  ].filter(Boolean);
  if (candidates.length === 0) {
    return { srcPath, origSize, newSize: origSize, skipped: 'encode-failed' };
  }
  candidates.sort((a, b) => a.buf.length - b.buf.length);
  const best = candidates[0];

  // Only commit the new encode if it's a real win (>5% smaller) — avoids
  // recompressing files that are already near-optimal.
  if (best.buf.length >= origSize * 0.95) {
    return { srcPath, origSize, newSize: origSize, skipped: 'no-gain', tried: best.kind };
  }

  // Backup original (preserves dir structure under .png-bak)
  const rel = relative(SRC_DIR, srcPath);
  const bakPath = resolve(BAK_DIR, rel);
  mkdirSync(dirname(bakPath), { recursive: true });
  if (!existsSync(bakPath)) copyFileSync(srcPath, bakPath);

  writeFileSync(srcPath, best.buf);
  return { srcPath, origSize, newSize: best.buf.length, kind: best.kind };
}

async function runPool(items, worker, concurrency) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('=== PNG Optimizer ===');
  console.log(`Source: ${SRC_DIR}`);
  console.log(`Backup: ${BAK_DIR}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  const files = await walk(SRC_DIR);
  console.log(`Found ${files.length} PNG files\n`);

  let done = 0;
  const total = files.length;
  const results = await runPool(files, async (srcPath) => {
    const r = await optimizeOne(srcPath);
    done++;
    const tag = r.skipped ? `[skip:${r.skipped}]` : `[${r.kind}]`;
    const delta = r.skipped ? '' : ` (-${((1 - r.newSize / r.origSize) * 100).toFixed(0)}%)`;
    const name = relative(SRC_DIR, srcPath);
    process.stdout.write(`  [${done}/${total}] ${tag} ${name}: ${fmtMB(r.origSize)} → ${fmtMB(r.newSize)}${delta}\n`);
    return r;
  }, CONCURRENCY);

  const totalBefore = results.reduce((s, r) => s + r.origSize, 0);
  const totalAfter  = results.reduce((s, r) => s + r.newSize, 0);
  const optimized   = results.filter(r => !r.skipped).length;
  const saved       = totalBefore - totalAfter;

  console.log('\n=== Summary ===');
  console.log(`Optimized: ${optimized} / ${total} files`);
  console.log(`Skipped:   ${total - optimized} files (small / no-gain / encode-failed)`);
  console.log(`Before:    ${fmtMB(totalBefore)}`);
  console.log(`After:     ${fmtMB(totalAfter)}`);
  console.log(`Saved:     ${fmtMB(saved)} (-${((saved / totalBefore) * 100).toFixed(1)}%)`);
  console.log(`\nOriginals backed up to: ${BAK_DIR}`);
  console.log(`Revert one file:   cp .png-bak/<path>.png public/assets/<path>.png`);
  console.log(`Revert all:        git checkout HEAD -- public/assets`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
