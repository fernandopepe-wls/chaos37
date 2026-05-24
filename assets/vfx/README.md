# VFX

Cartoon VFX modules. ES modules, Canvas 2D. Drop-in for game integration.

## Files

| File | Role |
|---|---|
| `stab-vfx.js` | Forward stab attack VFX. ES module. |
| `preview.html` | Standalone preview (mushroom hero + click to fire). |

## Preview

Open `vfx/preview.html` in browser:
- Direct: double-click file
- Via Vite dev server: `npm run dev`, then `http://localhost:3000/vfx/preview.html`

ES modules require HTTP server when not using `file://` workarounds. Vite handles it.

## Integration

```js
import {
  spawnStabVFX,
  updateParticles,
  renderParticles,
  getShakeOffset,
  createVFXState,
} from './vfx/stab-vfx.js';

// One-time setup
const vfx = createVFXState();

// On attack — origin = attacker, target = hit point
spawnStabVFX(vfx, attackerX, attackerY, targetX, targetY);

// Each frame
const { shx, shy } = getShakeOffset(vfx, dt);  // optional camera shake
// apply shx/shy to camera transform if desired
updateParticles(vfx, dt);
renderParticles(ctx, vfx.particles);
```

## Exports

| Export | Notes |
|---|---|
| `spawnStabVFX(state, ox, oy, tx, ty)` | Spawn full stab effect. Triggers shake. |
| `updateParticles(state, dt)` | Step + cull dead particles. |
| `renderParticles(ctx, particles)` | Draw all. |
| `renderParticle(ctx, p)` | Draw one (custom loops). |
| `getShakeOffset(state, dt)` | Returns `{shx, shy}` in pixels. |
| `createVFXState()` | Factory: `{ particles: [], shake: {...} }`. |
| `Particle` | Particle class — extend or spawn custom shapes. |
| `Easings` | Curve fns (easeOutBack, holdThenCollapse, etc.) |

## Supported shapes

`spike`, `star`, `ring`, `crescent`, `speedline`, `bloom`, `chargeDot`, `circle`

## Style

Cartoon — Legends of Mushroom mobile reference. Bright yellow/white core, hard outlines, hold-frame climax, scale-to-zero or hold-then-collapse dissipation (NO smooth alpha fade on solid shapes).
