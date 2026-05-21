import { Capacitor } from '@capacitor/core';
import NativeMemory from '../plugins/native-memory.js';

const GRAPH_SAMPLES = 120;
const SMOOTH_WINDOW = 10;

let running = false;
let lastTime = 0;
let frames = 0;
let fpsHistory = [];
let frameTimeHistory = [];
let memoryHistory = [];
let nativeMemoryHistory = [];
let subscribers = [];

let stats = {
  fps: 0,
  fpsAvg: 0,
  fpsMin: Infinity,
  fpsMax: 0,
  frameTime: 0,
  frameTimeAvg: 0,
  jsHeapUsed: 0,
  jsHeapTotal: 0,
  jsHeapLimit: 0,
  memoryAvailable: false,
  nativeMemory: null,
  nativeMemoryAvailable: false,
};

let prevFrame = 0;

function sampleMemory() {
  if (performance.memory) {
    stats.memoryAvailable = true;
    stats.jsHeapUsed = performance.memory.usedJSHeapSize;
    stats.jsHeapTotal = performance.memory.totalJSHeapSize;
    stats.jsHeapLimit = performance.memory.jsHeapSizeLimit;

    const usedMB = stats.jsHeapUsed / 1048576;
    memoryHistory.push(usedMB);
    if (memoryHistory.length > GRAPH_SAMPLES) memoryHistory.shift();
  }

  if (Capacitor.isNativePlatform()) {
    NativeMemory.getInfo().then((info) => {
      if (info.available) {
        stats.nativeMemoryAvailable = true;
        stats.nativeMemory = info;

        const totalMB = info.totalPss / 1048576;
        nativeMemoryHistory.push(totalMB);
        if (nativeMemoryHistory.length > GRAPH_SAMPLES) nativeMemoryHistory.shift();
      }
    }).catch(() => {});
  }
}


function processTick(now) {
  frames++;
  const dt = now - lastTime;

  if (dt >= 1000) {
    stats.fps = Math.round((frames * 1000) / dt);
    frames = 0;
    lastTime = now;

    fpsHistory.push(stats.fps);
    if (fpsHistory.length > GRAPH_SAMPLES) fpsHistory.shift();

    const recent = fpsHistory.slice(-SMOOTH_WINDOW);
    stats.fpsAvg = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);
    stats.fpsMin = Math.min(stats.fpsMin, stats.fps);
    stats.fpsMax = Math.max(stats.fpsMax, stats.fps);

    sampleMemory();
    notify();
  }

  const frameDt = now - (prevFrame || now);
  prevFrame = now;
  stats.frameTime = frameDt;

  frameTimeHistory.push(frameDt);
  if (frameTimeHistory.length > GRAPH_SAMPLES) frameTimeHistory.shift();

  const ftRecent = frameTimeHistory.slice(-SMOOTH_WINDOW);
  stats.frameTimeAvg = ftRecent.reduce((a, b) => a + b, 0) / ftRecent.length;
}

function notify() {
  for (const fn of subscribers) fn(stats);
}

export const Profiler = {
  start() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    frames = 0;
    prevFrame = 0;
    stats.fpsMin = Infinity;
    stats.fpsMax = 0;
  },

  stop() {
    running = false;
  },

  tick(now) {
    if (!running) return;
    processTick(now);
  },

  reset() {
    fpsHistory = [];
    frameTimeHistory = [];
    memoryHistory = [];
    nativeMemoryHistory = [];
    stats.fpsMin = Infinity;
    stats.fpsMax = 0;
  },

  getStats() { return { ...stats }; },
  getFpsHistory() { return [...fpsHistory]; },
  getFrameTimeHistory() { return [...frameTimeHistory]; },
  getMemoryHistory() { return [...memoryHistory]; },
  getNativeMemoryHistory() { return [...nativeMemoryHistory]; },
  isRunning() { return running; },

  subscribe(fn) {
    subscribers.push(fn);
    return () => {
      const i = subscribers.indexOf(fn);
      if (i !== -1) subscribers.splice(i, 1);
    };
  },
};
