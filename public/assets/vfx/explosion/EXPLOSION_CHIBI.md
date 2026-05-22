# Explosion Chibi VFX — Integration Guide

Procedural Canvas 2D explosion. Chibi mobile (Legend of Mushroom) style. Frame-based timing per [`VFX_INTEGRATION_GUIDE.md`](../VFX_INTEGRATION_GUIDE.md).

**Total duration:** 60 frames (~1.0s at 60fps)
**Phases:** Anticipation 6f / Climax 12f / Dissipation 42f
**Peak particles:** ~60
**Style:** Cartoon with smooth-fade exception on tail gray smoke

---

## What it looks like

1. **Anticipation (frames 0–6)** — small yellow squash dot, shrinks to zero.
2. **Climax (frames 6–18)** — hot yellow flash core (additive softCircle), big 8-point orange star with thick navy outline + inner 6-point bright star, white shockwave ring, 10 radial speedlines.
3. **Dissipation (frames 18–60)** — 8 orange puffs hold-then-collapse, 5 gray smoke puffs rise + smooth-fade, 12 debris diamonds with gravity, 16 additive sparkle stars trailing.

Palette: HSL hues 14–55 (candy yellow → orange → red), thick `hsl(18, 90%, 22%)` outline on shape silhouettes.

---

## Files in this folder

| File | Purpose |
|---|---|
| `EXPLOSION_CHIBI.md` | This doc |
| `explosion-snippets.js` | Paste-ready code blocks for `index.html` |
| `preview.html` | Standalone preview (dt-based, for visual iteration only — NOT the in-game code) |

---

## Drop-in steps

### 1. State init — `index.html:3483` (`arena = {...}`)

Add to the arena object literal, alongside `slashVFXs:[]`:

```js
explosionVFXs: [],
```

### 2. State reset — 4 sites where `arena.slashVFXs = [];` appears

Add line after each:

```js
arena.explosionVFXs = [];
```

Current sites: `index.html:3586, 3745, 3760, 4990`.

### 3. Spawn function

Paste the contents of `explosion-snippets.js` § Spawn near `spawnSlashVFX` (around `index.html:5131`).

### 4. Tick block

Paste `explosion-snippets.js` § Tick alongside the slash tick (around `index.html:5848`).

### 5. Draw function

Paste `explosion-snippets.js` § Draw alongside `drawSlashVFXs` (around `index.html:5971`).

### 6. Render hook — `renderArena` around `index.html:7086`

After `drawSlashVFXs();`, add:

```js
drawExplosionVFXs();
```

### 7. Trigger it

From gameplay code (boss death, bomb hit, ability cast, etc):

```js
spawnExplosionVFX(targetX, targetY, 1.0);  // 3rd arg = scale
```

---

## Tuning knobs

| Knob | Default | Effect |
|---|---|---|
| `lifeFrames: 60` | 60 | Total duration. 45 = punchier mini-boom. 90 = lingering boss boom. |
| `scale` param | 1.0 | Sizes all particles. 0.5 = mini, 2.0 = boss. |
| Orange puff count | 8 | Density of warm explosion mass. |
| Gray smoke count | 5 | Atmospheric tail. Bump to 8 for dustier scene. |
| Debris count | 12 | Diamond chunks. Drop to 6 on weak devices. |
| Sparkle count | 16 | Additive trail. Drop to 8 if perf issue. |

---

## Style decisions (locked)

- **Anticipation:** scale-to-zero squash dot (no alpha fade).
- **Climax flash:** additive `softCircle` with triple-attack (α↓ + size↓ + lightness↓ to 20). Required for additive — alpha-only leaves residual glow.
- **Star:** hard cut at lifetime (no fade). `easeOutBack` pop, thick `hsl(18,90%,22%)` outline.
- **Shockwave:** hard cut, outline-only ring (no fill).
- **Orange puffs:** `holdThenCollapse` size — hold full size to 70% of life, snap to 0 in last 30%. Colors shift orange→warm gray over life.
- **Gray smoke:** smooth alpha fade (`fadeLate` — smoothstep over last 55% of life). EXCEPTION to cartoon rule, validated for chibi atmospheric tail. Gentle shrink to 75% size, no growth at end.
- **Debris diamonds:** scale-to-zero via `easeInQuart`, real gravity (gy: 0.25 px/frame²).
- **Sparkles:** additive triple-attack fadeout.

---

## Perf

Single explosion peaks at ~60 particles (frame 18) and decays linearly. Should hold 4 concurrent on mid-tier mobile without dropping below 60fps. If chaining > 4 at once, lower sparkle/debris counts via scale arg or hardcode.

No offscreen canvas, no `ctx.filter`, no `shadowBlur`. Only additive uses `globalCompositeOperation = 'lighter'`. Cheap.

---

## Source

- Skill: `/art-generation:2d-create-vfx`
- Style framework: cartoon (per `references/UNIVERSAL_RULES.md`)
- Validated with user iteration: 1s duration, sparse gray smoke (5 puffs not 18), smooth fade tail
- Original standalone preview: `F:\Bunny Chaos\explosion.html` (dt-seconds based — port reference only)
