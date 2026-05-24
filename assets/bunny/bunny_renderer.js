// bunny_renderer.js — drop-in renderer for the bunny + weapon system
// Path B: bunny sheets ship weaponless, weapon is overlaid at runtime using
// the per-frame hand-anchor track in each animation's JSON.
//
// Usage (minimal):
//   const bunny = await BunnyRenderer.load('assets/bunny/');
//   const sword = await BunnyRenderer.loadWeapon('assets/bunny/weapons/sword_placeholder');
//   bunny.setState('walk');          // call when game state changes
//   bunny.setWeapon(sword);          // optional; can be null
//   // each frame:
//   bunny.draw(ctx, x, y, scale, flipX);
//
// Integration into bunny-chaos:
//   - Replace the fillRect calls in drawArenaBunny() with:
//       bunny.draw(ctx, arena.bx, arena.by, BUNNY_DRAW_SCALE);
//   - When arenaMeleeSwing fires:   bunny.trigger('melee');
//   - When arenaRangedShot fires:   bunny.trigger('ranged');
//   - When arena.hp <= 0:           bunny.trigger('death');
//   - Otherwise:                    bunny.setState(moving ? 'walk' : 'idle');
//
// Looping states (idle, walk) play forever. One-shot states (melee, ranged,
// death) play once then auto-return to the previous looping state (except
// death, which holds the last frame). Use trigger() for one-shots, setState()
// for looping.

const BunnyRenderer = (() => {
  const STATES = ['idle', 'walk', 'melee', 'ranged', 'death'];

  async function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
  async function loadJson(src) {
    // First check inlined JSON cache (window.BUNNY_JSON_DATA) — works on
    // file:// and bypasses fetch/CORS quirks. Falls back to fetch otherwise.
    if (typeof window !== 'undefined' && window.BUNNY_JSON_DATA && window.BUNNY_JSON_DATA[src]) {
      // Deep-clone so renderer can mutate freely without poisoning the cache
      return JSON.parse(JSON.stringify(window.BUNNY_JSON_DATA[src]));
    }
    try {
      const r = await fetch(src);
      if (!r.ok) throw new Error('fetch failed: ' + src);
      return await r.json();
    } catch (e) {
      // Last-ditch: try stripping leading "./" or "/"
      const variants = [src.replace(/^\.\//, ''), src.replace(/^\//, '')];
      for (const v of variants) {
        if (window.BUNNY_JSON_DATA && window.BUNNY_JSON_DATA[v]) {
          return JSON.parse(JSON.stringify(window.BUNNY_JSON_DATA[v]));
        }
      }
      throw e;
    }
  }

  async function load(basePath) {
    // basePath ends with '/'
    if (!basePath.endsWith('/')) basePath += '/';
    const manifest = await loadJson(basePath + 'bunny.json');
    const states = {};
    await Promise.all(STATES.map(async (s) => {
      const meta = await loadJson(basePath + `bunny_${s}.json`);
      const img = await loadImage(basePath + meta.files.spritesheet);
      states[s] = { meta, img };
    }));
    return new Bunny(states, manifest);
  }

  async function loadWeapon(basePathNoExt) {
    const meta = await loadJson(basePathNoExt + '.json');
    const dir = basePathNoExt.substring(0, basePathNoExt.lastIndexOf('/') + 1);
    const img = await loadImage(dir + meta.image);
    return { meta, img };
  }

  class Bunny {
    constructor(states, manifest) {
      this.states = states;          // { idle: {meta, img}, walk: {...}, ... }
      this.manifest = manifest;
      this.currentState = 'idle';
      this.prevLoopState = 'idle';   // state to return to after a one-shot
      this.stateStartTime = performance.now() / 1000;
      this.weapon = null;            // { meta, img } or null
      this.onComplete = null;        // callback when one-shot finishes
    }

    setWeapon(w) { this.weapon = w; }

    // Set a looping state. No-op if already in that state.
    // Doesn't interrupt a playing one-shot (melee/ranged/death) — those auto-revert
    // to prevLoopState when done. Without this guard, the game's per-frame
    // setState('walk'|'idle') would kill the swing mid-anim.
    setState(state) {
      if (this.currentState === state) return;
      const currMeta = this.states[this.currentState] && this.states[this.currentState].meta;
      if (currMeta && !currMeta.loop) {
        // Update prevLoopState so the one-shot reverts to the latest desired loop.
        const newMeta = this.states[state] && this.states[state].meta;
        if (newMeta && newMeta.loop) this.prevLoopState = state;
        return;
      }
      this.currentState = state;
      this.stateStartTime = performance.now() / 1000;
      const meta = this.states[state].meta;
      if (meta.loop) this.prevLoopState = state;
    }

    // Trigger a one-shot animation. Returns immediately; auto-reverts to the
    // previous looping state when the clip finishes (except death, which holds).
    // If the same one-shot is already playing and hasn't finished, the retrigger
    // is ignored — protects long swings from being cut by a faster attack cadence.
    trigger(state, onDone) {
      const meta = this.states[state].meta;
      if (meta.loop) { this.setState(state); return; }
      if (this.currentState === state) {
        const now = performance.now() / 1000;
        const elapsed = now - this.stateStartTime;
        if (elapsed < meta.frames / meta.fps) return;
      }
      this.currentState = state;
      this.stateStartTime = performance.now() / 1000;
      this.onComplete = onDone || null;
    }

    // How far into the current animation are we, in frames?
    _frameIndex(now) {
      const meta = this.states[this.currentState].meta;
      const elapsed = now - this.stateStartTime;
      let idx = Math.floor(elapsed * meta.fps);
      if (meta.loop) {
        idx = ((idx % meta.frames) + meta.frames) % meta.frames;
      } else {
        if (idx >= meta.frames) {
          idx = meta.frames - 1;
          // One-shot complete — auto-revert (except death, which stays dead)
          if (this.currentState !== 'death') {
            const finished = this.currentState;
            this.currentState = this.prevLoopState;
            this.stateStartTime = now;
            if (this.onComplete) { const cb = this.onComplete; this.onComplete = null; cb(finished); }
            return this._frameIndex(now);
          }
        }
        idx = Math.max(0, idx);
      }
      return idx;
    }

    // Draw at (x, y) with `scale` (1.0 = native 256×256 frame). flipX mirrors
    // horizontally. The bunny's foot anchor lands at (x, y).
    draw(ctx, x, y, scale = 1, flipX = false) {
      const now = performance.now() / 1000;
      const state = this.currentState;
      const { meta, img } = this.states[state];
      const idx = this._frameIndex(now);
      const fw = meta.frame_width, fh = meta.frame_height;
      const cols = meta.cols;
      const sx = (idx % cols) * fw;
      const sy = Math.floor(idx / cols) * fh;
      const dw = fw * scale, dh = fh * scale;
      // The bunny is centered horizontally in the frame; the foot anchor is at
      // canvas (0.5, 0.85) of the frame.
      const dx = x - dw * 0.5;
      const dy = y - dh * 0.85;
      ctx.save();
      if (flipX) {
        ctx.translate(x + dw * 0.5, 0);
        ctx.scale(-1, 1);
        ctx.translate(-(x - dw * 0.5), 0);
      }
      ctx.drawImage(img, sx, sy, fw, fh, dx, dy, dw, dh);
      ctx.restore();

      // Weapon overlay — only for states that flag it (melee + ranged) AND if a weapon is set.
      if (this.weapon && this._stateHasWeapon(state)) {
        // Interpolate between track frames so big rotation jumps (e.g., frame 9→10
        // is +76° in one tick) become a smooth visible arc instead of a 1-frame snap.
        const elapsed = now - this.stateStartTime;
        const fIdx = elapsed * meta.fps;
        const a = Math.max(0, Math.min(meta.frames - 1, fIdx));
        const i0 = Math.floor(a);
        const i1 = Math.min(meta.frames - 1, i0 + 1);
        const t = a - i0;
        const tA = meta.track[i0];
        const tB = meta.track[i1];
        if (!tA || !tB) return;
        const lerp = (u, v, k) => u + (v - u) * k;
        // Rotation can wrap large (>180°). Take the short arc per spline-frame.
        let r0 = tA.weapon.rot_world_deg;
        let r1 = tB.weapon.rot_world_deg;
        let dr = r1 - r0;
        if (dr > 180) dr -= 360; else if (dr < -180) dr += 360;
        const rotDeg = r0 + dr * t;
        const handX = lerp(tA.hand_anchor_canvas[0], tB.hand_anchor_canvas[0], t);
        const handY = lerp(tA.hand_anchor_canvas[1], tB.hand_anchor_canvas[1], t);
        const screenHandX = dx + handX * scale * (flipX ? -1 : 1) + (flipX ? dw : 0);
        const screenHandY = dy + handY * scale;
        this._drawWeapon(ctx, screenHandX, screenHandY, rotDeg * (flipX ? -1 : 1), scale, flipX);
      }
    }

    _stateHasWeapon(state) {
      // Weapon overlay disabled — bunny-chaos draws the equipped weapon
      // externally (see drawArenaHandSprite) using arena.swings data, so
      // the swing arcs toward the target instead of relative to the bunny
      // body. The renderer still loads weapon assets for that consumer.
      return false;
    }

    _drawWeapon(ctx, handX, handY, rotDeg, scale, flipX) {
      const { meta, img } = this.weapon;
      const wScale = scale * (this.manifest && this.manifest.sword_render_scale != null
                              ? this.manifest.sword_render_scale : 0.95);
      const pivotX = meta.pivot_px[0];
      const pivotY = meta.pivot_px[1];
      ctx.save();
      ctx.translate(handX, handY);
      ctx.rotate(rotDeg * Math.PI / 180);
      // Mirror weapon art when bunny faces left. Art is authored facing right,
      // so without this the blade points the wrong way during left-side swings.
      if (flipX) ctx.scale(-1, 1);
      ctx.drawImage(img,
        -pivotX * wScale, -pivotY * wScale,
        meta.width * wScale, meta.height * wScale);
      ctx.restore();
    }

    // Optional: red tint for hurt flash. Call inside your draw loop when arena.hurtTimer > 0.
    drawHurtTint(ctx, x, y, scale = 1, intensity = 0.5) {
      const now = performance.now() / 1000;
      const state = this.currentState;
      const { meta, img } = this.states[state];
      const idx = this._frameIndex(now);
      const fw = meta.frame_width, fh = meta.frame_height;
      const cols = meta.cols;
      const sx = (idx % cols) * fw;
      const sy = Math.floor(idx / cols) * fh;
      const dw = fw * scale, dh = fh * scale;
      const dx = x - dw * 0.5;
      const dy = y - dh * 0.85;
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = intensity;
      ctx.fillStyle = '#ff3030';
      ctx.fillRect(dx, dy, dw, dh);
      ctx.restore();
    }
  }

  return { load, loadWeapon, STATES };
})();

// CommonJS / ESM compatibility (the game uses neither; expose globally too)
if (typeof module !== 'undefined') module.exports = BunnyRenderer;
if (typeof window !== 'undefined') window.BunnyRenderer = BunnyRenderer;
