import './menu.css';
import { setTargetFps, getTargetFps } from './loop.js';
import { setRenderScale, getRenderScale } from './render-scale.js';

const FPS_OPTIONS = [30, 60, 120];
const RES_OPTIONS = [
  { label: 'LOW', value: 0.8 },
  { label: 'MED', value: 1.0 },
  { label: 'HIGH', value: 2.0 },
];
let onClose = null;

const BENCHMARKS = [
  {
    id: 'particles',
    name: 'Particle Stress',
    desc: 'Canvas 2D particles with gravity, alpha blending, glow trails',
    badge: '2d',
    icon: '\u2728',
  },
  {
    id: 'sprites',
    name: 'Sprite Flood',
    desc: 'Rotating, scaling rects with gradients and transforms',
    badge: '2d',
    icon: '\u25A0',
  },
  {
    id: 'collision',
    name: 'Collision Grid',
    desc: 'Circle-circle physics with spatial hashing, ramping to 1200 bodies',
    badge: '2d',
    icon: '\u{26AA}',
  },
  {
    id: 'pixi',
    name: 'Pixi Particles',
    desc: 'PixiJS WebGL-accelerated particles, same physics as Canvas 2D',
    badge: '2d',
    icon: '\u{1F525}',
  },
  {
    id: 'geometry',
    name: 'Geometry Storm',
    desc: 'Instanced Three.js meshes, ramping draw calls and vertices',
    badge: '3d',
    icon: '\u2B22',
  },
  {
    id: 'litscene',
    name: 'Lit Scene',
    desc: 'Multiple lights, shadows, reflective materials, bloom',
    badge: '3d',
    icon: '\u2600',
  },
];

let menuEl = null;
let hudEl = null;
let statsValEl = null;
let onSelect = null;
let onBack = null;

export function createMenu(selectCb, backCb, closeCb) {
  onSelect = selectCb;
  onBack = backCb;
  onClose = closeCb || null;

  menuEl = document.createElement('div');
  menuEl.className = 'bench-menu';

  let html = `<div class="bench-menu__header"><button class="bench-menu__close" data-menu-close>✕</button><h1 class="bench-menu__title">Benchmarks</h1><p class="bench-menu__sub">Select a scene to stress-test performance</p></div>`;
  html += `<div class="bench-menu__grid">`;

  for (const b of BENCHMARKS) {
    html += `<div class="bench-card" data-bench="${b.id}">`;
    html += `<span class="bench-card__badge badge-${b.badge}">${b.badge}</span>`;
    html += `<span class="bench-card__name">${b.name}</span>`;
    html += `<span class="bench-card__desc">${b.desc}</span>`;
    html += `<span class="bench-card__icon">${b.icon}</span>`;
    html += `</div>`;
  }

  html += `</div>`;
  menuEl.innerHTML = html;

  menuEl.querySelectorAll('.bench-card').forEach((card) => {
    card.addEventListener('click', () => {
      if (onSelect) onSelect(card.dataset.bench);
    });
  });

  menuEl.querySelector('[data-menu-close]').addEventListener('click', () => {
    if (onClose) onClose();
  });

  hudEl = document.createElement('div');
  hudEl.className = 'bench-hud';
  hudEl.style.display = 'none';

  const currentFps = getTargetFps();
  const fpsButtons = FPS_OPTIONS.map((f) => {
    const active = f === currentFps ? ' active' : '';
    return `<button class="bench-fps-btn${active}" data-fps="${f}">${f}</button>`;
  }).join('');

  const currentRes = getRenderScale();
  const resButtons = RES_OPTIONS.map((r) => {
    const active = r.value === currentRes ? ' active' : '';
    return `<button class="bench-fps-btn${active}" data-res="${r.value}">${r.label}</button>`;
  }).join('');

  hudEl.innerHTML = `
    <button class="bench-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
    <div class="bench-stats"><span class="bench-stats__item">Objects: <span class="bench-stats__val" data-bench-count>0</span></span></div>
    <div class="bench-fps-cap"><span class="bench-fps-label">RES</span>${resButtons}</div>
    <div class="bench-fps-cap"><span class="bench-fps-label">CAP</span>${fpsButtons}</div>
  `;

  hudEl.querySelector('.bench-back').addEventListener('click', () => {
    if (onBack) onBack();
  });

  hudEl.querySelectorAll('.bench-fps-btn[data-fps]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const fps = Number(btn.dataset.fps);
      setTargetFps(fps);
      hudEl.querySelectorAll('.bench-fps-btn[data-fps]').forEach((b) => {
        b.classList.toggle('active', Number(b.dataset.fps) === fps);
      });
    });
  });

  hudEl.querySelectorAll('.bench-fps-btn[data-res]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const res = Number(btn.dataset.res);
      setRenderScale(res);
      hudEl.querySelectorAll('.bench-fps-btn[data-res]').forEach((b) => {
        b.classList.toggle('active', Number(b.dataset.res) === res);
      });
    });
  });

  statsValEl = hudEl.querySelector('[data-bench-count]');

  document.body.appendChild(menuEl);
  document.body.appendChild(hudEl);
}

export function showMenu() {
  if (!menuEl) return;
  if (hudEl) hudEl.style.display = 'none';
  menuEl.classList.add('visible');
}

export function hideMenu() {
  if (!menuEl) return;
  menuEl.classList.remove('visible');
}

export function showHud() {
  if (hudEl) hudEl.style.display = '';
}

export function hideHud() {
  if (hudEl) hudEl.style.display = 'none';
}

export function updateHudCount(n) {
  if (statsValEl) statsValEl.textContent = n;
}

export function destroyMenu() {
  if (menuEl) { menuEl.remove(); menuEl = null; }
  if (hudEl) { hudEl.remove(); hudEl = null; }
}
