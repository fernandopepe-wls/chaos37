let profilerTick = null;

const FPS_STORAGE_KEY = 'wildlife.targetFps';
const VALID_FPS = [30, 60, 120];

function readStoredFps() {
  try {
    const v = parseInt(localStorage.getItem(FPS_STORAGE_KEY), 10);
    if (VALID_FPS.includes(v)) return v;
  } catch {}
  return null;
}

let targetFps = readStoredFps() ?? 60;

export function setProfilerHook(fn) {
  profilerTick = fn;
}

export function setTargetFps(fps) {
  targetFps = fps;
  try {
    localStorage.setItem(FPS_STORAGE_KEY, String(fps));
  } catch {}
}

export function getTargetFps() {
  return targetFps;
}

export class GameLoop {
  constructor() {
    this._rafId = null;
    this._lastTime = 0;
    this._lastRender = 0;
    this._running = false;
    this._updateFn = null;
    this._renderFn = null;
    this._fps = 0;
    this._frames = 0;
    this._fpsTime = 0;
  }

  start(updateFn, renderFn) {
    this._updateFn = updateFn;
    this._renderFn = renderFn;
    this._running = true;
    this._lastTime = performance.now();
    this._lastRender = this._lastTime;
    this._fpsTime = this._lastTime;
    this._tick = this._tick.bind(this);
    this._rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  pause() {
    this._running = false;
  }

  resume() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._lastRender = this._lastTime;
    this._rafId = requestAnimationFrame(this._tick);
  }

  get fps() {
    return this._fps;
  }

  _tick(now) {
    if (!this._running) return;

    const interval = 1000 / targetFps;
    const elapsed = now - this._lastRender;

    if (elapsed < interval - 1) {
      this._rafId = requestAnimationFrame(this._tick);
      return;
    }

    this._lastRender = now - (elapsed % interval);

    const dt = Math.min((now - this._lastTime) / 1000, 0.1);
    this._lastTime = now;

    this._frames++;
    if (now - this._fpsTime >= 1000) {
      this._fps = this._frames;
      this._frames = 0;
      this._fpsTime = now;
    }

    if (this._updateFn) this._updateFn(dt);
    if (this._renderFn) this._renderFn(dt);

    if (profilerTick) profilerTick(now);

    this._rafId = requestAnimationFrame(this._tick);
  }
}
