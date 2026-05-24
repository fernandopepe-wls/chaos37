// ============================================================
// Cartoon Stab VFX — Legends of Mushroom style
// ES module. Drop-in for Canvas 2D rendering.
//
// Usage:
//   import { spawnStabVFX, updateParticles, renderParticles } from './vfx/stab-vfx.js';
//
//   const state = { particles: [], shake: { t: 0, amp: 0 } };
//   // on attack:
//   spawnStabVFX(state, originX, originY, targetX, targetY);
//   // each frame:
//   updateParticles(state, dt);
//   const { shx, shy } = getShakeOffset(state, dt);  // optional camera shake
//   renderParticles(ctx, state.particles);
// ============================================================

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// --- Easings ----------------------------------------------------
export const Easings = {
  easeOutBack: t => { const c1=1.70158, c3=c1+1; return 1 + c3*Math.pow(t-1,3) + c1*Math.pow(t-1,2); },
  easeOutExpo: t => t===1 ? 1 : 1 - Math.pow(2, -10*t),
  easeOutQuad: t => 1 - (1-t)*(1-t),
  easeOutCubic: t => 1 - Math.pow(1-t, 3),
  easeInQuart: t => t*t*t*t,
  easeInCubic: t => t*t*t,
  smoothstep:  t => t*t*(3-2*t),
  holdThenCollapse: t => t < 0.72 ? 0 : (t-0.72)/0.28,
  dissolveLate: t => t < 0.45 ? 0 : (t-0.45)/0.55,
};
const E = Easings;

// --- Particle ---------------------------------------------------
export class Particle {
  constructor(o) {
    Object.assign(this, {
      life:0, rot:0, rotV:0, seed:Math.random()*1000,
      drag:0, gx:0, gy:0, vx:0, vy:0,
      blend:'source-over'
    }, o);
  }
  update(dt) {
    this.life += dt;
    if (this.drag) { this.vx -= this.vx*this.drag*dt; this.vy -= this.vy*this.drag*dt; }
    this.vx += this.gx*dt; this.vy += this.gy*dt;
    this.x += this.vx*dt; this.y += this.vy*dt;
    if (this.rotV) this.rot += this.rotV*dt;
  }
  get dead() { return this.life >= this.lifetime; }
  get t() { return Math.min(1, this.life / this.lifetime); }
}

// --- Shape drawers ----------------------------------------------
function shadeHSL(h, s, l, dl) { return `hsl(${h} ${s}% ${clamp(l+dl,0,100)}%)`; }

function drawShape(ctx, p, size, alpha, h, s, l, stroke) {
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = p.blend;
  ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  const fill = `hsl(${h} ${s}% ${l}%)`;

  switch (p.shape) {
    case 'circle': {
      const r = size/2;
      ctx.beginPath(); ctx.arc(0,0,r,0,TAU);
      const g = ctx.createRadialGradient(-r*0.3, -r*0.3, 0, 0, 0, r);
      g.addColorStop(0, shadeHSL(h,s,l,12));
      g.addColorStop(1, fill);
      ctx.fillStyle = g; ctx.fill();
      if (p.outline) { ctx.lineWidth = p.outline; ctx.strokeStyle = stroke; ctx.stroke(); }
      break;
    }
    case 'bloom': {
      const r = size/2;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `hsla(${h}, ${s}%, ${clamp(l+18,0,100)}%, ${alpha})`);
      g.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${alpha*0.5})`);
      g.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.fillStyle = g;
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(0,0,r,0,TAU); ctx.fill();
      break;
    }
    case 'spike': {
      const len = size * (p.aspect || 3.2), w = size * (p.wFactor || 0.42);
      ctx.beginPath();
      ctx.moveTo(len*0.5, 0); ctx.lineTo(0, -w*0.5);
      ctx.lineTo(-len*0.5, 0); ctx.lineTo(0, w*0.5); ctx.closePath();
      const g = ctx.createLinearGradient(-len*0.5, -w*0.5, len*0.5, w*0.5);
      g.addColorStop(0, shadeHSL(h,s,l,-15));
      g.addColorStop(0.5, shadeHSL(h,s,l,10));
      g.addColorStop(1, shadeHSL(h,s,l,-5));
      ctx.fillStyle = g; ctx.fill();
      if (p.outline) { ctx.lineWidth = p.outline; ctx.strokeStyle = stroke; ctx.lineJoin='round'; ctx.stroke(); }
      ctx.beginPath();
      ctx.moveTo(len*0.45, 0);
      ctx.lineTo(-len*0.05, -w*0.32);
      ctx.lineTo(-len*0.2, -w*0.18);
      ctx.lineTo(len*0.35, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();
      break;
    }
    case 'star': {
      const pts = p.points || 6, inner = size*0.5*(p.innerRatio||0.45), outer = size*0.5;
      ctx.beginPath();
      for (let i=0;i<pts*2;i++) {
        const r = i%2===0 ? outer : inner;
        const a = (i/(pts*2))*TAU - Math.PI/2;
        const x = Math.cos(a)*r, y = Math.sin(a)*r;
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(0, -outer*0.25, 0, 0, 0, outer);
      g.addColorStop(0, shadeHSL(h,s,l,18));
      g.addColorStop(0.55, fill);
      g.addColorStop(1, shadeHSL(h,s,l,-12));
      ctx.fillStyle = g; ctx.fill();
      if (p.outline) { ctx.lineWidth = p.outline; ctx.strokeStyle = stroke; ctx.lineJoin='round'; ctx.stroke(); }
      ctx.beginPath();
      ctx.arc(-outer*0.12, -outer*0.18, inner*0.45, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fill();
      break;
    }
    case 'ring': {
      ctx.beginPath(); ctx.arc(0,0,size/2,0,TAU);
      ctx.lineWidth = p.lineW || 7; ctx.strokeStyle = fill; ctx.stroke();
      if (p.outline) {
        ctx.lineWidth = (p.lineW||7) + p.outline*2;
        ctx.strokeStyle = stroke;
        ctx.globalCompositeOperation='source-over';
        ctx.stroke();
        ctx.lineWidth = p.lineW || 7; ctx.strokeStyle = fill; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(0, 0, size/2 - (p.lineW||7)*0.25, 0, TAU);
      ctx.lineWidth = (p.lineW||7) * 0.35; ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.stroke();
      break;
    }
    case 'crescent': {
      const r = size * 0.5;
      const thickness = size * (p.thinFactor || 0.18);
      const arc = p.arcSpan || 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, -arc/2, arc/2);
      ctx.arc(0, 0, r - thickness, arc/2, -arc/2, true);
      ctx.closePath();
      const g = ctx.createLinearGradient(-r, 0, r, 0);
      g.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0)`);
      g.addColorStop(0.5, fill);
      g.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, r - thickness*0.35, -arc*0.45, arc*0.45);
      ctx.lineWidth = thickness * 0.35; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineCap = 'round'; ctx.stroke();
      break;
    }
    case 'speedline': {
      const len = size * (p.aspect || 5), w = size * 0.22;
      const r = w/2;
      ctx.beginPath();
      ctx.moveTo(-len/2, 0);
      ctx.quadraticCurveTo(-len*0.2, -w*0.7, len/2 - r, -w*0.15);
      ctx.arc(len/2 - r, 0, r*0.6, -Math.PI/2, Math.PI/2);
      ctx.quadraticCurveTo(-len*0.2, w*0.7, -len/2, 0);
      ctx.closePath();
      const g = ctx.createLinearGradient(-len/2, 0, len/2, 0);
      g.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 0)`);
      g.addColorStop(0.5, fill);
      g.addColorStop(1, shadeHSL(h, s, clamp(l+10,0,100), 0));
      ctx.fillStyle = g; ctx.fill();
      break;
    }
    case 'chargeDot': {
      const r = size * 0.5;
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
      g.addColorStop(0, `hsla(${h}, ${s}%, 95%, ${alpha})`);
      g.addColorStop(0.3, `hsla(${h}, ${s}%, ${l}%, ${alpha*0.6})`);
      g.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
      ctx.fillStyle = g; ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(0, 0, r*2, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, TAU);
      ctx.fillStyle = '#ffffff'; ctx.fill();
      break;
    }
  }
}

// --- Render -----------------------------------------------------
export function renderParticle(ctx, p) {
  const t = p.t;
  const tSize  = (p.easeSize  || (x=>x))(t);
  const tAlpha = (p.easeAlpha || (x=>x))(t);
  const tColor = (p.easeColor || (x=>x))(t);
  const size  = p.size0 + (p.size1 - p.size0) * tSize;
  const alpha = p.alpha0 + (p.alpha1 - p.alpha0) * tAlpha;
  const h = (p.h0 ?? 0)  + ((p.h1 ?? p.h0 ?? 0) - (p.h0 ?? 0)) * tColor;
  const s = (p.s0 ?? 0)  + ((p.s1 ?? p.s0 ?? 0) - (p.s0 ?? 0)) * tColor;
  const l = (p.l0 ?? 50) + ((p.l1 ?? p.l0 ?? 50) - (p.l0 ?? 50)) * tColor;
  const stroke = p.strokeColor || '#1a0a26';

  ctx.save();
  drawShape(ctx, p, size, Math.max(0, alpha), h, s, l, stroke);
  ctx.restore();
}

export function renderParticles(ctx, particles) {
  for (let i = 0; i < particles.length; i++) renderParticle(ctx, particles[i]);
}

export function updateParticles(state, dt) {
  const particles = state.particles;
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(dt);
    if (particles[i].dead) particles.splice(i, 1);
  }
}

// --- Shake helper -----------------------------------------------
export function getShakeOffset(state, dt) {
  const shake = state.shake;
  if (!shake || shake.t <= 0) return { shx: 0, shy: 0 };
  shake.t -= dt;
  const k = Math.max(0, shake.t / (shake.duration || 0.14));
  return {
    shx: (Math.random()*2-1) * shake.amp * k,
    shy: (Math.random()*2-1) * shake.amp * k,
  };
}

// --- Spawner ----------------------------------------------------
// state = { particles: [], shake: { t, amp } }
// ox/oy = attacker position (where stab starts)
// tx/ty = target position (where impact happens)
export function spawnStabVFX(state, ox, oy, tx, ty) {
  const particles = state.particles;
  const dx = tx - ox, dy = ty - oy;
  const angle = Math.atan2(dy, dx);
  const dist = Math.min(280, Math.hypot(dx, dy));
  const fwd = { x: Math.cos(angle), y: Math.sin(angle) };
  const mx = ox + fwd.x * dist * 0.6;
  const my = oy + fwd.y * dist * 0.6;
  const ix = ox + fwd.x * dist;
  const iy = oy + fwd.y * dist;

  // 0. Anticipation charge dot
  particles.push(new Particle({
    x: ox + fwd.x * 14, y: oy + fwd.y * 14,
    lifetime: 0.09,
    size0: 5, size1: 20,
    alpha0: 1, alpha1: 1,
    h0: 50, s0: 100, l0: 80,
    shape: 'chargeDot',
    easeSize: E.easeOutCubic,
    easeAlpha: E.holdThenCollapse,
  }));

  // 1. Slash ribbon
  particles.push(new Particle({
    x: mx, y: my, lifetime: 0.24, rot: angle,
    size0: 20, size1: 72,
    alpha0: 1, alpha1: 0,
    h0: 50, s0: 100, l0: 85, h1: 38, s1: 100, l1: 70,
    shape: 'crescent', arcSpan: 1.0, thinFactor: 0.05,
    easeSize: E.easeOutBack,
    easeAlpha: E.easeOutQuad,
    easeColor: E.smoothstep,
  }));

  // 2. Bloom halo
  particles.push(new Particle({
    x: ix, y: iy, lifetime: 0.28,
    size0: 14, size1: 58,
    alpha0: 0.85, alpha1: 0,
    h0: 50, s0: 100, l0: 70,
    shape: 'bloom', blend: 'lighter',
    easeSize: E.easeOutExpo,
    easeAlpha: E.easeOutCubic,
  }));

  // 3. Thrust spike
  particles.push(new Particle({
    x: mx, y: my, lifetime: 0.26, rot: angle,
    size0: 10, size1: 40,
    alpha0: 1, alpha1: 1,
    h0: 55, s0: 100, l0: 78, h1: 40, s1: 100, l1: 62,
    shape: 'spike', aspect: 7.0, wFactor: 0.22, outline: 2.5,
    easeSize: E.easeOutBack,
    easeColor: E.smoothstep,
    easeAlpha: E.holdThenCollapse,
  }));

  // 4. Impact star
  particles.push(new Particle({
    x: ix, y: iy, lifetime: 0.30, rot: rand(0, TAU), rotV: rand(-1.5, 1.5),
    size0: 14, size1: 42,
    alpha0: 1, alpha1: 1,
    h0: 50, s0: 100, l0: 72, h1: 28, s1: 100, l1: 58,
    shape: 'star', points: 6, innerRatio: 0.32, outline: 2.5,
    easeSize: E.easeOutBack, easeColor: E.smoothstep,
    easeAlpha: E.holdThenCollapse,
  }));

  // 5. Mini-star
  particles.push(new Particle({
    x: ix, y: iy, lifetime: 0.34, rot: rand(0, TAU),
    size0: 4, size1: 14,
    alpha0: 1, alpha1: 1,
    h0: 0, s0: 0, l0: 100, h1: 50, s1: 100, l1: 75,
    shape: 'star', points: 4, innerRatio: 0.22, outline: 1.8,
    easeSize: E.easeOutBack, easeColor: E.smoothstep,
    easeAlpha: E.holdThenCollapse,
  }));

  // 6. Shockwave ring
  particles.push(new Particle({
    x: ix, y: iy, lifetime: 0.26,
    size0: 8, size1: 52,
    alpha0: 1, alpha1: 1,
    h0: 50, s0: 100, l0: 88, h1: 38, s1: 100, l1: 72,
    shape: 'ring', lineW: 2.5, outline: 1.5,
    easeSize: E.easeOutExpo, easeColor: E.smoothstep,
    easeAlpha: E.holdThenCollapse,
  }));

  // 7. Speedlines
  for (let i = 0; i < 7; i++) {
    const offN = rand(-0.7, 0.7);
    const nx = -fwd.y, ny = fwd.x;
    const along = rand(0.15, 0.75);
    const slx = ox + fwd.x * dist * along + nx * offN * 28;
    const sly = oy + fwd.y * dist * along + ny * offN * 28;
    particles.push(new Particle({
      x: slx, y: sly, lifetime: rand(0.26, 0.38), rot: angle,
      vx: fwd.x * rand(160, 260), vy: fwd.y * rand(160, 260),
      size0: 30, size1: 60, aspect: 9,
      alpha0: 1, alpha1: 0,
      h0: 50, s0: 100, l0: 96, h1: 50, s1: 100, l1: 92,
      shape: 'speedline',
      easeSize: E.easeOutQuad,
      easeAlpha: E.easeOutCubic,
    }));
  }

  // 8. Tiny embers
  for (let i = 0; i < 5; i++) {
    const a = angle + rand(-1.0, 1.0);
    const sp = rand(160, 280);
    particles.push(new Particle({
      x: ix, y: iy,
      lifetime: rand(0.45, 0.7),
      vx: Math.cos(a)*sp, vy: Math.sin(a)*sp,
      drag: 3, gy: 420,
      size0: 6, size1: 0,
      alpha0: 1, alpha1: 1,
      h0: 38, s0: 100, l0: 70, h1: 18, s1: 100, l1: 55,
      shape: 'circle', outline: 1, blend: 'lighter',
      easeSize: E.easeInQuart, easeColor: E.smoothstep,
    }));
  }

  // trigger shake
  if (state.shake) {
    state.shake.t = 0.14;
    state.shake.amp = 4;
    state.shake.duration = 0.14;
  }
}

// --- Factory ----------------------------------------------------
export function createVFXState() {
  return { particles: [], shake: { t: 0, amp: 0, duration: 0.14 } };
}
