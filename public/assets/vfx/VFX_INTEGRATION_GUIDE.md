# Bunny Chaos — VFX Integration Guide

**Share this file with `/art-generation:2d-create-vfx` so the skill produces in-game-ready output for this project.**

This game has a specific architecture, frame model, and conventions. Generic Canvas 2D VFX snippets won't drop in cleanly. Follow the rules below.

---

## 1. Project shape (TL;DR)

- **Single-file game:** all gameplay code lives in [`index.html`](../../index.html) (~9000 lines). No `src/`, no modules, no bundler-managed imports. Vite is only used for HTML/asset packaging.
- **Renderer:** vanilla Canvas 2D. Globals `canvas` (`#game`) + `ctx` defined at `index.html:2664`.
- **Engine flavor:** Capacitor 7 wrapper around HTML5 Canvas — ships as Android/iOS APK. Treat it as a 60fps mobile-first game.
- **No frameworks:** no Pixi, no Phaser, no Three. Just `ctx.fill / stroke / drawImage`.

---

## 2. Frame model (CRITICAL — read first)

The game uses **fixed-timestep frame counters**, NOT dt-in-seconds.

```js
// Spawn pattern (see spawnSlashVFX at index.html:5131)
arena.slashVFXs.push({
  ...,
  frame: 0,        // counter, incremented each tick
  lifeFrames: 30,  // total frames the VFX exists
});

// Tick pattern (see index.html:5848)
for (let i = arena.slashVFXs.length - 1; i >= 0; i--) {
  const vfx = arena.slashVFXs[i];
  vfx.frame++;
  // ...update positions, motes, etc by INTEGER frames...
  if (vfx.frame >= vfx.lifeFrames) arena.slashVFXs.splice(i, 1);
}

// Draw pattern (see drawSlashVFXs at index.html:5971)
const t = vfx.frame / vfx.lifeFrames;  // 0..1 normalized
```

**Implications when porting external VFX:**

| Generic Canvas 2D demo | Bunny Chaos equivalent |
|---|---|
| `lifetime: 0.5` (seconds) | `lifeFrames: 30` (frames at 60fps) |
| `vx, vy` in px/sec | `vx, vy` in px/**frame** (divide seconds-based by 60) |
| `gy: 900` (gravity px/sec²) | ~`gy: 0.25` (px/frame²) — gravity terms divide by 3600 |
| `dt`-based delays | counter check: `if (vfx.frame === 6) doClimax()` |
| `setTimeout(fn, 100)` | sub-spawn inline when `frame >= delayFrames` (NEVER `setTimeout` — pauses break it) |

The fixed timestep clamps at `FIXED_DT` (60fps target). Don't rely on real wall-clock time.

---

## 3. State storage convention

Every VFX type gets its own array on `arena.*`:

```js
// At arena reset (index.html:3586 and similar)
arena.slashVFXs = [];
arena.explosionVFXs = [];   // ← new VFX type goes here
```

Initialize in `arena` declaration (around `index.html:3483`) and reset everywhere `arena.slashVFXs` is reset (currently 4 sites: 3586, 3745, 3760, 4990).

---

## 4. Three-function pattern per VFX type

Look at slash VFX as the canonical example (`spawnSlashVFX`, inline tick block, `drawSlashVFXs`). Mirror this exactly:

### a. Spawn function

```js
function spawnExplosionVFX(cx, cy, scale = 1){
  if (!arena.explosionVFXs) arena.explosionVFXs = [];
  arena.explosionVFXs.push({
    cx, cy, scale,
    frame: 0, lifeFrames: 60,  // ~1s at 60fps
    // pre-baked random offsets, sub-particle pools, seeds, etc.
    puffs: [/* ... */],
    sparks: [/* ... */],
  });
}
```

### b. Tick block (inside the main update path, near `index.html:5848`)

```js
if (arena.explosionVFXs) {
  for (let i = arena.explosionVFXs.length - 1; i >= 0; i--) {
    const vfx = arena.explosionVFXs[i];
    vfx.frame++;
    // ...update sub-particle positions, drag, gravity by FRAME...
    if (vfx.frame >= vfx.lifeFrames) arena.explosionVFXs.splice(i, 1);
  }
}
```

### c. Draw function (called from `renderArena`, after enemies, before HUD)

```js
function drawExplosionVFXs(){
  if (!arena.explosionVFXs || !arena.explosionVFXs.length) return;
  ctx.save();
  for (const vfx of arena.explosionVFXs) {
    const t = vfx.frame / vfx.lifeFrames;
    // ...phase logic by t, draw shapes...
  }
  ctx.restore();
}
```

Hook the draw call into `renderArena()` (`index.html:7018`) at the appropriate render layer. For explosions: AFTER enemies, AFTER slash VFX, BEFORE `arena.effects`. See `index.html:7086` for the slash VFX hook as reference.

---

## 5. Render order in `renderArena()`

Current order at `index.html:7018+`:

```
1. background grid
2. gems          (arena.gems)
3. enemies       (arena.enemies)
4. swings/blade  (drawCarrotSword inside arena.swings loop)
5. slash VFX     (drawSlashVFXs)
6. effects       (arena.effects — shockwave, beam, rangedProj, orbiter…)
7. particles     (arena.particles — small dots)
8. damage numbers
9. HUD
```

For a new VFX, pick a slot:
- **Explosion on enemy death** → between effects and particles (above world, below UI sparkles).
- **Aura around bunny** → before enemies (renders under them).
- **Ground-decal AoE telegraph** → before gems (lowest layer).

---

## 6. Cartoon dissipation rule (project-specific)

This project follows strict cartoon VFX rules from `/art-generation:2d-create-vfx`. **NEVER smooth alpha fade on dissipation** for crisp graphic shapes. Use:

1. **Scale-to-zero** — `easeInQuart` last 30% of life. For sparkles, debris, shards.
2. **Hold-then-collapse** — full size until ~70%, snap to 0 in last 30%. For solid silhouettes.
3. **Hard cut** — `alpha=1` whole life, particle removed at `frame >= lifeFrames`. For shockwaves, big stars, flash cores.
4. **Dissolve mask** — pre-baked tileable noise + `destination-out` blend. For puffs/smoke. Implementation tricky — see `vfx-explosion.js` reference for working noise-bake pattern, but be warned: rectangular `fillRect` erase artifacts are common, must clip to particle silhouette via offscreen canvas.

### Exception: atmospheric gray smoke tail

The terminal gray smoke layer at the end of explosions/big bursts IS allowed to use smooth alpha fade. User-validated for chibi Legend of Mushroom style — strict cartoon hard-cut on tail smoke "fades out very quickly" and feels clunky. Apply only to the late atmospheric haze layer, not climax shapes.

Implementation:
```js
const fadeLate = t => {
  if (t < 0.45) return 0;
  const u = (t - 0.45) / 0.55;
  return u * u * (3 - 2 * u);  // smoothstep
};
// alpha lerp 1→0 via fadeLate, paired with gentle easeOutQuad shrink (size1 ≈ size0 * 0.75)
```

---

## 7. Style: Legend of Mushroom chibi

Project's existing VFX (slash, see `SLASH_CARTOON.md`) follow chibi/cartoon style. New VFX should match:

- **Saturated candy palette** — yellows / oranges / reds for fire+explosion; cyans / navy outline for slash; magentas / pink for magic.
- **Thick painterly outlines** — minimum 4-10px stroke depending on shape scale.
- **Chunky readable silhouettes** — 3 colors max per element, hard edges.
- **No gradients in silhouettes** — gradients only inside additive flash cores (`softCircle` with radial gradient).
- **1.0–1.5s total VFX duration** — chibi mobile reads slightly slower than strict 0.25–0.6s cartoon timing. Lean toward 1.0s.

Reference palette buckets:

| Use | Hue range | Sat | Light |
|---|---|---|---|
| Hot core flash (additive) | 50–55 | 100 | 88 |
| Star/burst fill | 38–48 | 95–100 | 60–78 |
| Outline (dark) | 14–22 | 85–95 | 20–35 |
| Smoke (orange→gray shift) | 22–28 | 85→25 | 55→70 |
| Atmospheric gray smoke | 22–25 | 14–28 | 58–72 |

---

## 8. Two output flavors

The skill can output VFX in one of two ways. Ask the user which:

### Flavor A: Procedural particle code

Inline JS particle system in `index.html`. Best for explosions, bursts, smoke, sparkles. Add the three functions (spawn / tick / draw) + state array + render hook. No PNG asset.

**Use when:** dynamic, varied count, physics-driven, color-coded by gameplay state.

### Flavor B: Single hero PNG asset

Generate via Layer.ai (model: `gpt-image-2`), save to `public/assets/vfx/<name>_<style>.png`, plus a sibling `<NAME>_<STYLE>.md` integration doc (see `SLASH_CARTOON.md` for template). Game loads via `new Image()`, renders with `ctx.drawImage`.

**Use when:** static silhouette (slash, ground decal, AoE marker, shield), needs hand-crafted detail, performance-critical (one draw call vs N particles).

When in doubt: ask the user.

---

## 9. Coordinate space + camera

There is no camera transform. All coordinates are screen-space pixels relative to the canvas top-left. Arena play area is bounded by `ARENA.TOP_Y / BOT_Y / LEFT_X / RIGHT_X`. Bunny is at `arena.bx, arena.by`.

VFX positions: pass world (= screen) coords. No `ctx.translate` for camera needed.

---

## 10. Performance budget (mobile)

This game ships to Android/iOS via Capacitor. Mobile GPU/CPU constraints:

- **Max concurrent VFX particles: ~200** across the whole `arena.*VFXs` pool.
- **Max draw calls per frame for VFX: ~80** (each `ctx.fill / stroke / drawImage` = 1 call).
- **Avoid:** `ctx.filter`, `ctx.shadowBlur`, large offscreen canvas re-allocations every frame.
- **Prefer:** pre-baked noise canvas (once at init), `globalCompositeOperation = 'lighter'` for additive (cheap), flat fills over gradients.
- **Particle count guide:** a single explosion should peak at ~60 particles, decay to ~20 by halfway, gone by lifetime end.

If the VFX needs > 60 particles, generate it as a Flavor B PNG asset instead.

---

## 11. Existing reference VFX (study these)

**Folder convention going forward:** every new VFX gets its own subfolder under `public/assets/vfx/<name>/` containing:
- `<NAME>_<STYLE>.md` — integration doc
- `<name>-snippets.js` — paste-ready frame-based code blocks (for Flavor A) OR `<name>.png` (for Flavor B)
- `preview.html` — standalone testable preview (dt-based OK for visual iteration, NOT the in-game code)

The slash VFX predates this convention and lives at the `vfx/` root — don't move it (would break asset paths). New VFX MUST use the subfolder convention.

Canonical reference impl: [`explosion/`](explosion/) — full Flavor A procedural VFX, frame-based, follows all rules in this doc. Study its three files before authoring a new VFX.

| Effect | Location | Notes |
|---|---|---|
| **Explosion (chibi)** | [`explosion/`](explosion/) | **Canonical Flavor A reference.** Frame-based, 60-frame total, three-function pattern, sub-particle pool with delayed spawn-at offsets. |
| Slash VFX (energy arc) | `index.html:5131 / 5848 / 5971` + `assets/vfx/slash_cartoon.png` + `SLASH_CARTOON.md` | Canonical Flavor B (PNG + procedural motes). Three-function pattern. Crit variant via flag. Lives at vfx/ root (legacy, predates subfolder convention). |
| Shockwave | `index.html:7090` | Procedural rings, in `arena.effects`. Linear alpha fade — predates cartoon rule, do not copy. |
| Beam | `index.html:7104` | Procedural rect, in `arena.effects`. Single frame style, no decay logic. |
| Ranged projectile (carrot arrow) | `index.html:7115` | Travels via `vx, vy` per-frame, has hit detection. Not a VFX per se but uses same pool model. |
| Orbiter | `index.html:7138+` | Long-lived (`ef.lifeFrames-30`), fades at end via linear alpha. |
| Particles (small dots) | `arena.particles` | Tiny `fillRect` confetti. ~8 frame life. |

---

## 12. Output requirements for the skill

When `/art-generation:2d-create-vfx` is invoked with this guide attached, the skill MUST:

0. **Write all output to `public/assets/vfx/<name>/`** (new subfolder per VFX). Include `<NAME>_<STYLE>.md`, `<name>-snippets.js` (Flavor A) or `<name>.png` (Flavor B), and `preview.html`. Mirror the [`explosion/`](explosion/) reference structure.
1. **Default to Flavor A (procedural)** unless user explicitly asks for an asset PNG.
2. **Convert all timing** from seconds → frames at 60fps. State all `lifeFrames` as integers.
3. **Convert all velocities** from px/sec → px/frame (÷ 60). Gravity ÷ 3600.
4. **Provide three function blocks** named `spawn<X>VFX`, an inline tick block, and `draw<X>VFXs`. Plus the state array init + reset sites + render hook line in `renderArena`.
5. **State exact insertion line numbers** in `index.html` for each block.
6. **No `setTimeout` for VFX timing.** Use frame-count gates.
7. **No `dt`-based math.** Everything per-frame integer-stepped.
8. **Respect cartoon dissipation rule** (§6). Tail gray smoke may use smooth fade.
9. **Match chibi palette** (§7). No semi-realistic gradients in silhouettes.
10. **Particle budget ≤ 60 peak** per single VFX instance (§10). If higher needed, switch to Flavor B PNG.
11. **Comment style:** match existing code — pt-BR or en, short, no decorative banners. Existing comments mix Portuguese and English freely; pick whichever fits, keep it brief.

---

## 13. Quick-start template (procedural VFX)

```js
// === <vfx-name> VFX ===========================================
// Insert state init near index.html:3483 (arena = {...})
//   <vfxName>VFXs: [],

// Insert state reset alongside arena.slashVFXs = [] (4 sites: 3586, 3745, 3760, 4990)
//   arena.<vfxName>VFXs = [];

// Spawn — call from gameplay code (enemy death, ability cast, etc)
function spawn<VfxName>VFX(cx, cy /*, scale, archetype, ... */){
  if(!arena.<vfxName>VFXs) arena.<vfxName>VFXs = [];
  arena.<vfxName>VFXs.push({
    cx, cy,
    frame: 0, lifeFrames: 60,
    // ...sub-particles, seeds, prebaked offsets...
  });
}

// Tick — insert near index.html:5848 (alongside slashVFXs tick)
if(arena.<vfxName>VFXs){
  for(let i=arena.<vfxName>VFXs.length-1;i>=0;i--){
    const vfx = arena.<vfxName>VFXs[i];
    vfx.frame++;
    // ...update sub-particle positions per frame...
    if(vfx.frame >= vfx.lifeFrames) arena.<vfxName>VFXs.splice(i,1);
  }
}

// Draw — define alongside drawSlashVFXs near index.html:5971
function draw<VfxName>VFXs(){
  if(!arena.<vfxName>VFXs || !arena.<vfxName>VFXs.length) return;
  ctx.save();
  for(const vfx of arena.<vfxName>VFXs){
    const t = vfx.frame / vfx.lifeFrames;
    // ...phase logic + drawing...
  }
  ctx.restore();
}

// Hook — add call inside renderArena near index.html:7086 (after drawSlashVFXs)
//   draw<VfxName>VFXs();
```

---

## 14. Source

- VFX skill: `/art-generation:2d-create-vfx` (Wildlife art-generation plugin)
- Game project: Capacitor 7 + Canvas 2D, ships APK via OTA
- Style: Chibi / Legend of Mushroom (saturated candy palette, thick outlines, chunky silhouettes)
- This doc lives next to VFX assets so the skill can find it via `read_file` when invoked in this repo.
