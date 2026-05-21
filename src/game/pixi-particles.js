import { Application, Graphics } from 'pixi.js';
import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange, getQualityProfile } from './render-scale.js';

const COLORS = [0x00d4ff, 0x7b68ee, 0xff6b9d, 0xc084fc, 0x34d399, 0xfbbf24];
const GRAVITY = 420;
const BOUNCE_DAMPING = 0.7;
const RAMP_INTERVAL = 2;
const RAMP_AMOUNT = 50;
const INITIAL_COUNT = 200;
const MAX_PARTICLES = 5000;

export async function startPixiParticles(canvas) {
  const profile = getQualityProfile();
  const app = new Application();
  await app.init({
    canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x0a0a0f,
    antialias: profile.antialias,
    resolution: getRenderScale(),
    autoDensity: true,
  });

  const unsubRenderScale = onRenderScaleChange((v) => {
    app.renderer.resize(window.innerWidth, window.innerHeight, v);
  });

  const particles = [];
  const loop = new GameLoop();
  let W = app.screen.width;
  let H = app.screen.height;
  let elapsed = 0;
  let targetCount = INITIAL_COUNT;

  function spawn(x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 280;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const r = 2 + Math.random() * 4.5;

    const gfx = new Graphics();
    gfx.circle(0, 0, r).fill({ color, alpha: 0.85 });

    gfx.x = x;
    gfx.y = y;
    app.stage.addChild(gfx);

    particles.push({
      gfx,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      r,
      life: 1,
      decay: 0.15 + Math.random() * 0.35,
      color,
    });
  }

  function recycleParticle(p) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 280;
    p.x = Math.random() * W;
    p.y = Math.random() * H * 0.3;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 80;
    p.life = 1;
    p.decay = 0.15 + Math.random() * 0.35;
  }

  for (let i = 0; i < INITIAL_COUNT; i++) {
    spawn(Math.random() * W, Math.random() * H * 0.5);
  }

  function onResize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    W = app.screen.width;
    H = app.screen.height;
  }

  window.addEventListener('resize', onResize);

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

  function update(dt) {
    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_PARTICLES) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_PARTICLES);
    }

    while (particles.length < targetCount) {
      spawn(Math.random() * W, Math.random() * H * 0.4);
    }

    for (const p of particles) {
      p.vy += GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.x < p.r) { p.x = p.r; p.vx *= -BOUNCE_DAMPING; }
      if (p.x > W - p.r) { p.x = W - p.r; p.vx *= -BOUNCE_DAMPING; }
      if (p.y > H - p.r) { p.y = H - p.r; p.vy *= -BOUNCE_DAMPING; }

      if (p.life <= 0) recycleParticle(p);

      p.gfx.x = p.x;
      p.gfx.y = p.y;
      p.gfx.alpha = Math.max(0, p.life) * 0.85;
      p.gfx.scale.set(Math.max(0.1, p.life));
    }

    updateHudCount(particles.length);
  }

  function render() {
    app.renderer.render(app.stage);
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', onResize);
    unsubRenderScale();
    app.destroy(true, { children: true });
  };
}
