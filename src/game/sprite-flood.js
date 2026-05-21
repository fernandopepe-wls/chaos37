import { GameLoop } from './loop.js';
import { updateHudCount } from './menu.js';
import { getRenderScale, onRenderScaleChange } from './render-scale.js';

const RAMP_INTERVAL = 2;
const RAMP_AMOUNT = 80;
const INITIAL_COUNT = 150;
const MAX_SPRITES = 6000;

const PALETTE = [
  ['#00d4ff', '#0066ff'],
  ['#7b68ee', '#c084fc'],
  ['#ff6b9d', '#ff3366'],
  ['#34d399', '#059669'],
  ['#fbbf24', '#f97316'],
  ['#f472b6', '#a855f7'],
];

export function startSpriteFlood(canvas) {
  const ctx = canvas.getContext('2d');
  const loop = new GameLoop();
  const sprites = [];
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

  function makeSprite() {
    const size = 12 + Math.random() * 36;
    const colors = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 120,
      vy: (Math.random() - 0.5) * 120,
      w: size,
      h: size * (0.6 + Math.random() * 0.8),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 3,
      scale: 0.5 + Math.random() * 0.5,
      scaleDir: (Math.random() - 0.5) * 0.8,
      c1: colors[0],
      c2: colors[1],
      alpha: 0.4 + Math.random() * 0.5,
    };
  }

  for (let i = 0; i < INITIAL_COUNT; i++) sprites.push(makeSprite());

  function update(dt) {
    elapsed += dt;

    if (elapsed >= RAMP_INTERVAL && targetCount < MAX_SPRITES) {
      elapsed = 0;
      targetCount = Math.min(targetCount + RAMP_AMOUNT, MAX_SPRITES);
    }

    while (sprites.length < targetCount) sprites.push(makeSprite());

    for (const s of sprites) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += s.rotSpeed * dt;
      s.scale += s.scaleDir * dt;

      if (s.scale > 1.2 || s.scale < 0.3) s.scaleDir *= -1;

      if (s.x < -s.w) s.x = W + s.w;
      else if (s.x > W + s.w) s.x = -s.w;
      if (s.y < -s.h) s.y = H + s.h;
      else if (s.y > H + s.h) s.y = -s.h;
    }

    updateHudCount(sprites.length);
  }

  function render() {
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, W, H);

    for (const s of sprites) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.scale(s.scale, s.scale);
      ctx.globalAlpha = s.alpha;

      const grad = ctx.createLinearGradient(-s.w / 2, -s.h / 2, s.w / 2, s.h / 2);
      grad.addColorStop(0, s.c1);
      grad.addColorStop(1, s.c2);
      ctx.fillStyle = grad;

      const r = 3;
      const hw = s.w / 2, hh = s.h / 2;
      ctx.beginPath();
      ctx.moveTo(-hw + r, -hh);
      ctx.lineTo(hw - r, -hh);
      ctx.quadraticCurveTo(hw, -hh, hw, -hh + r);
      ctx.lineTo(hw, hh - r);
      ctx.quadraticCurveTo(hw, hh, hw - r, hh);
      ctx.lineTo(-hw + r, hh);
      ctx.quadraticCurveTo(-hw, hh, -hw, hh - r);
      ctx.lineTo(-hw, -hh + r);
      ctx.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
      ctx.fill();

      ctx.restore();
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
