import { startHelloWorld } from './hello-world.js';
import { createMenu, showMenu, hideMenu, showHud, hideHud, destroyMenu } from './menu.js';

let cleanupFn = null;
let canvasRef = null;
let parentEl = null;
let benchmarkMode = false;
let menuCreated = false;

function freshCanvas() {
  if (canvasRef) canvasRef.remove();

  const c = document.createElement('canvas');
  c.id = 'game-canvas';
  parentEl.appendChild(c);
  canvasRef = c;
  return c;
}

function clearScene() {
  if (cleanupFn) {
    cleanupFn();
    cleanupFn = null;
  }
  if (canvasRef) {
    canvasRef.classList.remove('visible');
  }
}

function startDefaultScene() {
  const canvas = freshCanvas();
  cleanupFn = startHelloWorld(canvas);
  canvas.classList.add('visible');
  benchmarkMode = false;
}

async function launchScene(id) {
  hideMenu();
  showHud();

  const canvas = freshCanvas();

  let startFn;
  switch (id) {
    case 'particles': {
      const m = await import('./canvas2d-demo.js');
      startFn = m.startCanvas2DDemo;
      break;
    }
    case 'sprites': {
      const m = await import('./sprite-flood.js');
      startFn = m.startSpriteFlood;
      break;
    }
    case 'collision': {
      const m = await import('./collision-grid.js');
      startFn = m.startCollisionGrid;
      break;
    }
    case 'pixi': {
      const m = await import('./pixi-particles.js');
      startFn = m.startPixiParticles;
      break;
    }
    case 'geometry': {
      const m = await import('./three-demo.js');
      startFn = m.startThreeDemo;
      break;
    }
    case 'litscene': {
      const m = await import('./lit-scene.js');
      startFn = m.startLitScene;
      break;
    }
    default:
      console.warn('Unknown benchmark:', id);
      showMenu();
      return;
  }

  cleanupFn = await startFn(canvas);
  canvas.classList.add('visible');
}

function handleBack() {
  clearScene();
  showMenu();
}

function ensureMenu() {
  if (menuCreated) return;
  createMenu(
    (id) => launchScene(id),
    () => handleBack(),
    () => closeBenchmarks(),
  );
  menuCreated = true;
}

export function openBenchmarks() {
  clearScene();
  ensureMenu();
  benchmarkMode = true;
  showMenu();
}

export function closeBenchmarks() {
  if (!benchmarkMode) return;
  clearScene();
  hideMenu();
  hideHud();
  startDefaultScene();
}

export function isBenchmarkMode() {
  return benchmarkMode;
}

export function bootGame(canvas) {
  canvasRef = canvas;
  parentEl = canvas.parentElement;
  startDefaultScene();

  return () => {
    clearScene();
    if (menuCreated) destroyMenu();
  };
}
