import { GameLoop } from './loop.js';

const ACCENT = '#00d4ff';
const GLOW = 'rgba(0, 212, 255, 0.4)';
const BG = '#0a0a0f';

export function startHelloWorld(canvas) {
  const ctx = canvas.getContext('2d');
  const loop = new GameLoop();
  let W, H;
  let time = 0;

  const stars = [];
  const STAR_COUNT = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      size: 0.5 + Math.random() * 1.5,
      speed: 0.2 + Math.random() * 0.6,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function update(dt) {
    time += dt;
  }

  function render() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, W, H);

    // Stars
    for (const s of stars) {
      const alpha = 0.2 + 0.3 * Math.sin(time * s.speed + s.phase);
      const sx = (s.x * 0.5 + 0.5) * W;
      const sy = (s.y * 0.5 + 0.5) * H;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating hexagon
    const hexY = H * 0.38 + Math.sin(time * 1.2) * 12;
    const hexSize = Math.min(W, H) * 0.08;
    const hexRotation = time * 0.4;

    ctx.save();
    ctx.translate(W / 2, hexY);
    ctx.rotate(hexRotation);

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(angle) * hexSize;
      const y = Math.sin(angle) * hexSize;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.shadowColor = GLOW;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 212, 255, 0.06)';
    ctx.fill();

    ctx.restore();

    // Title
    const titleSize = Math.min(W * 0.09, 48);
    ctx.font = `600 ${titleSize}px 'Inter', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#e8e8f0';
    ctx.fillText('Hello World', W / 2, H * 0.55);

    // Subtitle with pulsing accent
    const subAlpha = 0.4 + 0.15 * Math.sin(time * 2);
    const subSize = Math.min(W * 0.035, 14);
    ctx.font = `400 ${subSize}px 'Inter', system-ui, sans-serif`;
    ctx.fillStyle = `rgba(232, 232, 240, ${subAlpha})`;
    ctx.fillText('Your game starts here', W / 2, H * 0.62);
  }

  loop.start(update, render);

  return () => {
    loop.stop();
    window.removeEventListener('resize', resize);
  };
}
