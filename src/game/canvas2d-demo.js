import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange } from './render-scale.js';

const COLORS = ['#00d4ff', '#7b68ee', '#ff6b9d', '#c084fc', '#34d399', '#fbbf24'];
const GRAVITY = 420;
const BOUNCE_DAMPING = 0.7;
const TRAIL_ALPHA = 0.06;
const RAMP_INTERVAL = 2;
const RAMP_AMOUNT = 50;
const INITIAL_COUNT = 200;
const MAX_PARTICLES = 5000;

export function startCanvas2DDemo(canvas) {
  const ctx = canvas.getContext('2d');
  const particles = [];
  const loop = new GameLoop();
  let W, H;
  let elapsed = 0;
  let targetCount = INITIAL_COUNT;

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

  function spawn(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 280;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      r: 2 + Math.random() * 4.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.15 + Math.random() * 0.35,
    });
  }

  function spawnBatch(count) {
    for (let i = 0; i < count; i++) {
      spawn(Math.random() * W, Math.random() * H * 0.5);
    }
  }

  function handleInteraction(e) {
    const rect = canvas.getBoundingClientRect();
    const touches = e.touches || [e];
    for (const t of touches) {
      const x = (t.clientX || t.pageX) - rect.left;
      const y = (t.clientY || t.pageY) - rect.top;
      for (let i = 0; i < 15; i++) spawn(x, y);
    }
  }

  canvas.addEventListener('pointerdown', handleInteraction);
  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons > 0) handleInteraction(e);
  });

  spawnBatch(INITIAL_COUNT);

  function update(dt) {
    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_PARTICLES) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_PARTICLES);
    }

    while (particles.length < targetCount) {
      spawn(Math.random() * W, Math.random() * H * 0.4);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.x < p.r) { p.x = p.r; p.vx *= -BOUNCE_DAMPING; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx *= -BOUNCE_DAMPING; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy *= -BOUNCE_DAMPING; }

      if (p.life <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 280;
        p.x = Math.random() * W;
        p.y = Math.random() * H * 0.3;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed - 80;
        p.life = 1;
        p.decay = 0.15 + Math.random() * 0.35;
        p.r = 2 + Math.random() * 4.5;
        p.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    }

    updateHudCount(particles.length);
  }

  function render() {
    ctx.fillStyle = `rgba(10, 10, 15, ${TRAIL_ALPHA})`;
    ctx.fillRect(0, 0, W, H);

    ctx.shadowBlur = 0;
    for (const p of particles) {
      const alpha = Math.max(0, p.life);
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * alpha, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', resize);
    unsubRenderScale();
  };
}
