import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange } from './render-scale.js';

const COLORS = [0x00d4ff, 0x7b68ee, 0xff6b9d, 0xc084fc, 0x34d399, 0xfbbf24, 0xf97316, 0x06b6d4];
const INITIAL_COUNT = 80;
const MAX_COUNT = 1200;
const RAMP_INTERVAL = 2;
const RAMP_AMOUNT = 30;
const MIN_RADIUS = 4;
const MAX_RADIUS = 12;
const CELL_SIZE = 28;
const DAMPING = 0.998;
const RESTITUTION = 0.85;

function hexToRgb(hex) {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

function rgbStr(r, g, b, a = 1) {
  return `rgba(${r},${g},${b},${a})`;
}

export function startCollisionGrid(canvas) {
  const ctx = canvas.getContext('2d');
  const loop = new GameLoop();
  const balls = [];
  let W, H;
  let elapsed = 0;
  let targetCount = INITIAL_COUNT;
  const grid = new Map();

  function resize() {
    const scale = getRenderScale();
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(H * scale);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
  const unsubRenderScale = onRenderScaleChange(() => resize());

  function spawn() {
    const r = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
    const colorHex = COLORS[Math.floor(Math.random() * COLORS.length)];
    const [cr, cg, cb] = hexToRgb(colorHex);
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 160;
    balls.push({
      x: r + Math.random() * (W - r * 2),
      y: r + Math.random() * (H - r * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      mass: r * r,
      cr, cg, cb,
    });
  }

  for (let i = 0; i < INITIAL_COUNT; i++) spawn();

  function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    const touches = e.touches || [e];
    for (const t of touches) {
      const mx = (t.clientX || t.pageX) - rect.left;
      const my = (t.clientY || t.pageY) - rect.top;
      for (let i = 0; i < 8; i++) {
        const r = MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS);
        const colorHex = COLORS[Math.floor(Math.random() * COLORS.length)];
        const [cr, cg, cb] = hexToRgb(colorHex);
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 200;
        balls.push({
          x: mx, y: my,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r, mass: r * r, cr, cg, cb,
        });
      }
    }
  }

  canvas.addEventListener('pointerdown', handleInteraction);
  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons > 0) handleInteraction(e);
  });

  function cellKey(cx, cy) {
    return (cx * 73856093) ^ (cy * 19349663);
  }

  function buildGrid() {
    grid.clear();
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const minCx = Math.floor((b.x - b.r) / CELL_SIZE);
      const maxCx = Math.floor((b.x + b.r) / CELL_SIZE);
      const minCy = Math.floor((b.y - b.r) / CELL_SIZE);
      const maxCy = Math.floor((b.y + b.r) / CELL_SIZE);

      for (let cx = minCx; cx <= maxCx; cx++) {
        for (let cy = minCy; cy <= maxCy; cy++) {
          const key = cellKey(cx, cy);
          let cell = grid.get(key);
          if (!cell) { cell = []; grid.set(key, cell); }
          cell.push(i);
        }
      }
    }
  }

  function resolveCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = a.r + b.r;

    if (dist >= minDist || dist < 0.001) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    const totalMass = a.mass + b.mass;
    a.x -= nx * overlap * (b.mass / totalMass);
    a.y -= ny * overlap * (b.mass / totalMass);
    b.x += nx * overlap * (a.mass / totalMass);
    b.y += ny * overlap * (a.mass / totalMass);

    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const dvDotN = dvx * nx + dvy * ny;

    if (dvDotN <= 0) return;

    const impulse = (2 * dvDotN * RESTITUTION) / totalMass;
    a.vx -= impulse * b.mass * nx;
    a.vy -= impulse * b.mass * ny;
    b.vx += impulse * a.mass * nx;
    b.vy += impulse * a.mass * ny;
  }

  function update(dt) {
    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_COUNT) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_COUNT);
    }

    while (balls.length < targetCount) spawn();

    for (const b of balls) {
      b.vx *= DAMPING;
      b.vy *= DAMPING;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * RESTITUTION; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * RESTITUTION; }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * RESTITUTION; }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * RESTITUTION; }
    }

    buildGrid();

    const checked = new Set();
    for (const cell of grid.values()) {
      for (let i = 0; i < cell.length; i++) {
        for (let j = i + 1; j < cell.length; j++) {
          const a = cell[i], b = cell[j];
          const pairKey = a < b ? a * 100000 + b : b * 100000 + a;
          if (checked.has(pairKey)) continue;
          checked.add(pairKey);
          resolveCollision(balls[a], balls[b]);
        }
      }
    }

    updateHudCount(balls.length);
  }

  function render() {
    ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
    ctx.fillRect(0, 0, W, H);

    for (const b of balls) {
      const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      const glow = Math.min(1, speed / 200);

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = rgbStr(b.cr, b.cg, b.cb, 0.6 + glow * 0.4);
      ctx.fill();

      if (glow > 0.3) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = rgbStr(b.cr, b.cg, b.cb, glow * 0.12);
        ctx.fill();
      }
    }
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', resize);
    unsubRenderScale();
  };
}
