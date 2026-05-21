const STORAGE_KEY = 'wildlife.renderScale';
const VALID_SCALES = [0.8, 1.0, 2.0];
const DEFAULT_SCALE = 1.0;

const TIER_PROFILES = {
  low: {
    pixelRatio: 0.8,
    antialias: false,
    shadowMapType: 'basic',
    shadowMapSize: 256,
    toneMapping: 'none',
    fog: false,
  },
  med: {
    pixelRatio: 1.0,
    antialias: false,
    shadowMapType: 'pcf',
    shadowMapSize: 512,
    toneMapping: 'none',
    fog: false,
  },
  high: {
    pixelRatio: 2.0,
    antialias: true,
    shadowMapType: 'pcfsoft',
    shadowMapSize: 1024,
    toneMapping: 'aces',
    fog: true,
  },
};

const SCALE_TO_TIER = { 0.8: 'low', 1.0: 'med', 2.0: 'high' };

function readStored() {
  try {
    const v = parseFloat(localStorage.getItem(STORAGE_KEY));
    if (VALID_SCALES.includes(v)) return v;
  } catch {}
  return null;
}

function writeStored(v) {
  try {
    localStorage.setItem(STORAGE_KEY, String(v));
  } catch {}
}

function autoDetectScale() {
  const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
  let scale;
  if (typeof mem === 'number') {
    if (mem < 4) scale = 0.8;
    else if (mem < 8) scale = 1.0;
    else scale = 2.0;
  } else {
    scale = DEFAULT_SCALE;
  }
  console.log(`[RenderScale] auto-detected scale=${scale} (deviceMemory=${mem ?? 'n/a'})`);
  return scale;
}

function resolveInitialScale() {
  const stored = readStored();
  if (stored !== null) return stored;
  const detected = autoDetectScale();
  writeStored(detected);
  return detected;
}

let renderScale = resolveInitialScale();
const subs = new Set();

export function getRenderScale() {
  return renderScale;
}

export function setRenderScale(v) {
  if (v === renderScale) return;
  renderScale = v;
  writeStored(v);
  for (const fn of subs) fn(v);
}

export function onRenderScaleChange(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function getQualityTier() {
  return SCALE_TO_TIER[renderScale] || 'med';
}

export function getQualityProfile() {
  return TIER_PROFILES[getQualityTier()];
}
