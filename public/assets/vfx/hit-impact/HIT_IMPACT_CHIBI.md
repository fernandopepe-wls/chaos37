# Hit-Impact Chibi VFX — Integration Guide

Procedural Canvas 2D hit-impact. Chibi mobile (Legend of Mushroom) style. Frame-based timing per [`VFX_INTEGRATION_GUIDE.md`](../VFX_INTEGRATION_GUIDE.md).

**Total duration:** 13 frames (~0.22s at 60fps)
**Phases:** Climax 4f / Dissipation 9f (no anticipation — snappy hit feedback)
**Peak particles:** 3
**Style:** Cartoon, minimal — designed for every-hit usage without fatigue

---

## What it looks like

1. **Climax (frames 0–4)** — white 6-point star pops in with `easeOutBack`, full opacity.
2. **Dissipation (frames 4–13)** — star scale-to-zero via `easeInQuart`, color shifts white → cyan. 2 gold diamond dots fling outward in opposite directions, decelerating via drag, shrinking via `easeOutQuad`.

Palette: white core (HSL 195/25/95) → cyan (190/60/70). Gold accents (HSL 50/90/70 → 42/85/55) with thick dark outline.

---

## Files in this folder

| File | Purpose |
|---|---|
| `HIT_IMPACT_CHIBI.md` | This doc |
| `hit-impact-snippets.js` | Paste-ready code blocks for `index.html` |
| `preview.html` | Standalone preview (dt-based, for visual iteration only — NOT the in-game code) |

---

## Drop-in steps

### 1. State init — `index.html:3483` (`arena = {...}`)

Add to the arena object literal, alongside `slashVFXs:[]`:

```js
hitImpactVFXs: [],
```

### 2. State reset — 4 sites where `arena.slashVFXs = [];` appears

Add line after each:

```js
arena.hitImpactVFXs = [];
```

Current sites: `index.html:3586, 3745, 3760, 4990`.

### 3. Spawn function

Paste the contents of `hit-impact-snippets.js` § Spawn near `spawnSlashVFX` (around `index.html:5131`).

### 4. Tick block

Paste `hit-impact-snippets.js` § Tick alongside the slash tick (around `index.html:5848`).

### 5. Draw function

Paste `hit-impact-snippets.js` § Draw alongside `drawSlashVFXs` (around `index.html:5971`).

### 6. Render hook — `renderArena` around `index.html:7086`

After `drawSlashVFXs();`, add:

```js
drawHitImpactVFXs();
```

### 7. Trigger it

From gameplay code (melee hit, projectile impact, tick damage):

```js
spawnHitImpactVFX(target.x, target.y, 1.0);  // 3rd arg = scale
```

---

## Tuning knobs

| Knob | Default | Effect |
|---|---|---|
| `lifeFrames: 13` (root) | 13 | Total duration. 10 = even snappier, 18 = lingering. |
| White star phase split | 4 / 8 | Grow / collapse frames. Bump grow to 6 for softer pop. |
| `scale` param | 1.0 | Sizes all particles. 0.7 = tick damage, 1.6 = crit. |
| Gold dot count | 2 | Bump to 4 for crit hit variant. |

---

## Style decisions (locked)

- **No anticipation phase** — hit feedback fires on contact frame. Anticipation would feel delayed/sluggish.
- **White star split-phase** — single particle can't do "pop then collapse" with one easing. Solved by splitting into two sub-particles: grow (frames 0–4, `easeOutBack`) hands off to collapse (frames 4–12, `easeInQuart`) at peak size.
- **Color shift** — white → cyan on collapse adds chibi color identity without losing initial readable flash.
- **Gold dots = secondary** — only 2, opposite-axis, sized small (10px). Read as "spark" accent, not "spray of debris".
- **No additive** — all alphablended for clean cutout silhouettes. No residual glow concern.
- **No outline on white star?** No — outline is 4px dark cyan (`l-40`), required for chibi readability against light/cluttered backgrounds.
- **No alpha fade** — both layers use `alpha0:1, alpha1:1` with size-to-zero dissipation, cartoon-correct.

---

## Perf

3 sub-particles per hit, 13-frame lifetime. Even at 10 concurrent hits = 30 particles peak. Negligible cost.

No `globalCompositeOperation` switching, no `ctx.filter`, no `shadowBlur`. Cheap.

---

## Source

- Skill: `/art-generation:2d-create-vfx`
- Style framework: cartoon (per `references/UNIVERSAL_RULES.md`)
- Validated with user iteration: stripped from 40-particle radial burst → 9-particle speedlines+shards → final 3-particle anime pop (won't fatigue at high hit-rate)
- Preview: `preview.html`
