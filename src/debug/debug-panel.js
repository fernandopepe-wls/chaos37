import './debug-panel.css';
import { ConsoleInterceptor } from './console-interceptor.js';
import { Profiler } from './profiler.js';
import { setProfilerHook } from '../game/loop.js';
import { collectSystemInfo } from './system-info.js';
import { collectPlatformSdkInfo, sendAnalyticsSmokeEvent, sendSingularSmokeEvents } from './platform-sdk-info.js';
import { openBenchmarks, closeBenchmarks, isBenchmarkMode } from '../game/index.js';

let root = null;
let overlay = null;
let trigger = null;
let isOpen = false;
let activeTab = 'console';
let consoleFilter = 'all';
let consoleSearch = '';
let consoleListEl = null;
let autoScroll = true;
let extras = {};

let fpsOverlay = null;
let fpsOverlayCanvas = null;
let fpsOverlayPinned = false;

const TABS = [
  { id: 'console', label: 'Console' },
  { id: 'system',  label: 'System'  },
  { id: 'profiler', label: 'Profiler' },
];

// ── Public API ──────────────────────────────────────

let fallbackRafId = null;

function fallbackTick(now) {
  Profiler.tick(now);
  fallbackRafId = requestAnimationFrame(fallbackTick);
}

function stopFallbackLoop() {
  if (fallbackRafId) {
    cancelAnimationFrame(fallbackRafId);
    fallbackRafId = null;
  }
}

export const DebugPanel = {
  init(opts = {}) {
    extras = opts;
    ConsoleInterceptor.install();
    Profiler.start();
    createTrigger();
    createOverlay();

    fallbackRafId = requestAnimationFrame(fallbackTick);

    setProfilerHook((now) => {
      stopFallbackLoop();
      Profiler.tick(now);
    });

    ConsoleInterceptor.subscribe(() => {
      updateErrorBadge();
      if (isOpen && activeTab === 'console') renderConsole();
    });

    Profiler.subscribe(() => {
      if (isOpen && activeTab === 'profiler') renderProfiler();
      if (fpsOverlayPinned) updateFpsOverlay();
    });

    createFpsOverlay();
  },

  updateExtras(newExtras) {
    Object.assign(extras, newExtras);
    if (isOpen && activeTab === 'system') renderSystem();
  },

  open()   { setOpen(true); },
  close()  { setOpen(false); },
  toggle() { setOpen(!isOpen); },
  destroy() {
    Profiler.stop();
    stopFallbackLoop();
    setProfilerHook(null);
    if (root) { root.remove(); root = null; }
    if (trigger) { trigger.remove(); trigger = null; }
    if (fpsOverlay) { fpsOverlay.remove(); fpsOverlay = null; }
  },
};

// ── Trigger Button ──────────────────────────────────

function createTrigger() {
  trigger = document.createElement('button');
  trigger.className = 'dbg-trigger';
  trigger.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2z"/><path d="M18 16v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`;
  trigger.addEventListener('click', () => DebugPanel.toggle());
  document.body.appendChild(trigger);
}

function updateErrorBadge() {
  if (!trigger) return;
  const counts = ConsoleInterceptor.getCounts();
  trigger.classList.toggle('has-errors', counts.error > 0);
}

// ── Overlay Structure ───────────────────────────────

function createOverlay() {
  root = document.createElement('div');
  root.id = 'dbg-root';
  root.style.pointerEvents = 'none';

  overlay = document.createElement('div');
  overlay.className = 'dbg-overlay';
  root.appendChild(overlay);

  // Header
  const header = el('div', 'dbg-header');
  const title = el('span', 'dbg-header__title');
  title.textContent = 'Debug';
  const close = el('button', 'dbg-header__close');
  close.innerHTML = '✕';
  close.addEventListener('click', () => setOpen(false));
  header.append(title, close);
  overlay.appendChild(header);

  // Tabs
  const tabBar = el('div', 'dbg-tabs');
  for (const tab of TABS) {
    const btn = el('button', 'dbg-tab');
    btn.dataset.tab = tab.id;
    btn.innerHTML = `${tab.label}<span class="dbg-tab__badge" data-badge="${tab.id}"></span>`;
    btn.addEventListener('click', () => switchTab(tab.id));
    tabBar.appendChild(btn);
  }
  overlay.appendChild(tabBar);

  // Content
  const content = el('div', 'dbg-content');
  for (const tab of TABS) {
    const panel = el('div', 'dbg-panel');
    panel.dataset.panel = tab.id;
    content.appendChild(panel);
  }
  overlay.appendChild(content);

  document.body.appendChild(root);
  switchTab(activeTab);
}

// ── Tab Switching ───────────────────────────────────

function switchTab(id) {
  activeTab = id;
  overlay.querySelectorAll('.dbg-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === id);
  });
  overlay.querySelectorAll('.dbg-panel').forEach((p) => {
    p.classList.toggle('active', p.dataset.panel === id);
  });

  if (id === 'console')  renderConsole();
  if (id === 'system')   renderSystem();
  if (id === 'profiler') renderProfiler();
}

function setOpen(state) {
  isOpen = state;
  root.style.pointerEvents = state ? 'auto' : 'none';
  overlay.classList.toggle('open', state);
  if (state) {
    switchTab(activeTab);
  }
}

// ── System Tab ──────────────────────────────────────

function renderSystem() {
  const panel = getPanel('system');
  const info = collectSystemInfo(extras);
  let html = '';

  html += `<div class="dbg-sys-section">`;
  html += `<div class="dbg-sys-section__title">OTA Update</div>`;
  html += `<button class="dbg-ota-btn" data-ota-btn>Check for Update</button>`;
  html += `<div class="dbg-ota-status" data-ota-status></div>`;
  html += `</div>`;

  for (const [section, pairs] of Object.entries(info)) {
    html += `<div class="dbg-sys-section">`;
    html += `<div class="dbg-sys-section__title">${section}</div>`;
    for (const [key, val] of Object.entries(pairs)) {
      html += `<div class="dbg-sys-row"><span class="dbg-sys-row__key">${esc(key)}</span><span class="dbg-sys-row__val">${esc(val)}</span></div>`;
    }
    html += `</div>`;
  }

  // Platform SDK sections — async. Render a placeholder, fill in once
  // collectPlatformSdkInfo() resolves.
  html += `<div class="dbg-sys-section" data-sdk-block>`;
  html += `<div class="dbg-sys-section__title">Wildlife SDK</div>`;
  html += `<div class="dbg-sys-row"><span class="dbg-sys-row__key">Status</span><span class="dbg-sys-row__val">loading…</span></div>`;
  html += `</div>`;

  panel.innerHTML = html;

  panel.querySelector('[data-ota-btn]').addEventListener('click', () => {
    triggerOtaUpdate(panel);
  });

  populatePlatformSdkBlock(panel);
}

async function populatePlatformSdkBlock(panel) {
  const anchor = panel.querySelector('[data-sdk-block]');
  if (!anchor) return;

  const sections = await collectPlatformSdkInfo();

  let html = '';
  for (const [section, pairs] of Object.entries(sections)) {
    html += `<div class="dbg-sys-section">`;
    html += `<div class="dbg-sys-section__title">${section}</div>`;
    for (const [key, val] of Object.entries(pairs)) {
      html += `<div class="dbg-sys-row"><span class="dbg-sys-row__key">${esc(key)}</span><span class="dbg-sys-row__val">${esc(val)}</span></div>`;
    }
    if (section === 'Wildlife Analytics') {
      html += `<button class="dbg-ota-btn" data-analytics-btn>Fire Smoke Event</button>`;
      html += `<div class="dbg-ota-status" data-analytics-status></div>`;
    }
    html += `</div>`;
  }

  // Singular trigger section
  html += `<div class="dbg-sys-section">`;
  html += `<div class="dbg-sys-section__title">Singular</div>`;
  html += `<button class="dbg-ota-btn" data-singular-btn>Fire Smoke Event + Revenue</button>`;
  html += `<div class="dbg-ota-status" data-singular-status></div>`;
  html += `</div>`;

  // Replace the placeholder in place
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  anchor.replaceWith(...wrapper.children);

  panel.querySelector('[data-analytics-btn]')?.addEventListener('click', async () => {
    const btn = panel.querySelector('[data-analytics-btn]');
    const statusEl = panel.querySelector('[data-analytics-status]');
    btn.disabled = true;
    btn.textContent = 'Firing…';
    statusEl.textContent = '';
    const result = await sendAnalyticsSmokeEvent();
    statusEl.textContent = result;
    btn.disabled = false;
    btn.textContent = 'Fire Smoke Event';
  });

  panel.querySelector('[data-singular-btn]')?.addEventListener('click', async () => {
    const btn = panel.querySelector('[data-singular-btn]');
    const statusEl = panel.querySelector('[data-singular-status]');
    btn.disabled = true;
    btn.textContent = 'Firing…';
    statusEl.textContent = '';
    const result = await sendSingularSmokeEvents();
    statusEl.textContent = result;
    btn.disabled = false;
    btn.textContent = 'Fire Smoke Event + Revenue';
  });
}

async function triggerOtaUpdate(panel) {
  const btn = panel.querySelector('[data-ota-btn]');
  const statusEl = panel.querySelector('[data-ota-status]');

  btn.disabled = true;
  btn.textContent = 'Checking...';
  statusEl.textContent = '';

  try {
    const { OTAUpdater } = await import('../ota/updater.js');

    statusEl.textContent = 'Checking for updates...';
    const manifest = await OTAUpdater.checkForUpdate();

    if (!manifest) {
      statusEl.textContent = 'Already up to date.';
      btn.textContent = 'Check for Update';
      btn.disabled = false;
      return;
    }

    statusEl.textContent = `Downloading v${manifest.version}...`;
    btn.textContent = 'Downloading...';
    await OTAUpdater.downloadUpdate(manifest);

    statusEl.textContent = `Applying v${manifest.version}...`;
    btn.textContent = 'Applying...';
    await OTAUpdater.applyNow();
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    btn.textContent = 'Retry';
    btn.disabled = false;
  }
}

// ── Console Tab ─────────────────────────────────────

function renderConsole() {
  const panel = getPanel('console');

  if (!consoleListEl || !panel.querySelector('.dbg-console-list')) {
    const counts = ConsoleInterceptor.getCounts();
    let html = `<div class="dbg-console-toolbar">`;
    for (const f of ['all', 'log', 'info', 'warn', 'error', 'debug']) {
      const cls = f === consoleFilter ? 'active' : '';
      const lvl = f !== 'all' ? ` level-${f}` : '';
      const label = f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`;
      html += `<button class="dbg-console-filter${lvl} ${cls}" data-filter="${f}">${label}</button>`;
    }
    html += `<input class="dbg-console-search" placeholder="Search..." value="${esc(consoleSearch)}">`;
    html += `<button class="dbg-console-clear">Clear</button>`;
    html += `</div>`;
    html += `<div class="dbg-console-list"></div>`;
    panel.innerHTML = html;

    panel.querySelectorAll('.dbg-console-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        consoleFilter = btn.dataset.filter;
        renderConsole();
      });
    });

    panel.querySelector('.dbg-console-search').addEventListener('input', (e) => {
      consoleSearch = e.target.value;
      renderConsoleEntries();
    });

    panel.querySelector('.dbg-console-clear').addEventListener('click', () => {
      ConsoleInterceptor.clear();
      renderConsole();
    });

    consoleListEl = panel.querySelector('.dbg-console-list');
  }

  updateFilterCounts();
  renderConsoleEntries();
}

function updateFilterCounts() {
  const panel = getPanel('console');
  const counts = ConsoleInterceptor.getCounts();
  panel.querySelectorAll('.dbg-console-filter').forEach((btn) => {
    const f = btn.dataset.filter;
    const n = f === 'all' ? counts.all : counts[f];
    btn.textContent = `${f} (${n})`;
  });

  const errBadge = overlay.querySelector('[data-badge="console"]');
  if (errBadge) {
    errBadge.textContent = counts.error > 0 ? counts.error : '';
  }
}

function renderConsoleEntries() {
  if (!consoleListEl) return;

  let entries = ConsoleInterceptor.getEntries();

  if (consoleFilter !== 'all') {
    entries = entries.filter((e) => e.level === consoleFilter);
  }

  if (consoleSearch) {
    const q = consoleSearch.toLowerCase();
    entries = entries.filter((e) => e.message.toLowerCase().includes(q));
  }

  if (entries.length === 0) {
    consoleListEl.innerHTML = `<div class="dbg-console-empty">No entries</div>`;
    return;
  }

  const visible = entries.slice(-300);

  let html = '';
  for (const e of visible) {
    const t = new Date(e.timestamp);
    const ts = `${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}.${pad3(t.getMilliseconds())}`;
    const countHtml = e.count > 1 ? `<span class="dbg-console-count">${e.count}</span>` : '';
    html += `<div class="dbg-console-entry level-${e.level}">`;
    html += `<span class="dbg-console-time">${ts}</span>`;
    html += `<span class="dbg-console-badge">${e.level}</span>`;
    html += `<span class="dbg-console-msg">${esc(e.message)}</span>`;
    html += countHtml;
    html += `</div>`;
  }

  consoleListEl.innerHTML = html;

  if (autoScroll) {
    const scrollParent = consoleListEl.closest('.dbg-panel');
    if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
  }
}

// ── Profiler Tab ────────────────────────────────────

let fpsCanvas = null;
let ftCanvas = null;
let memCanvas = null;
let nativeMemCanvas = null;

function renderProfiler() {
  const panel = getPanel('profiler');
  const s = Profiler.getStats();

  if (!panel.querySelector('.dbg-prof-stats')) {
    const pinLabel = fpsOverlayPinned ? 'Unpin Overlay' : 'Pin FPS Overlay';
    const pinCls = fpsOverlayPinned ? ' active' : '';
    const benchLabel = isBenchmarkMode() ? 'Close Benchmarks' : 'Open Benchmarks';
    const benchCls = isBenchmarkMode() ? ' active' : '';
    panel.innerHTML = `
      <div class="dbg-prof-pin-row">
        <button class="dbg-prof-pin${pinCls}" data-pin-btn>${pinLabel}</button>
        <button class="dbg-prof-pin dbg-prof-bench${benchCls}" data-bench-btn>${benchLabel}</button>
      </div>
      <div class="dbg-prof-stats">
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="fps">0</div><div class="dbg-prof-stat__label">FPS</div></div>
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="avg">0</div><div class="dbg-prof-stat__label">Avg FPS</div></div>
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="ft">0</div><div class="dbg-prof-stat__label">Frame (ms)</div></div>
      </div>
      <div class="dbg-prof-stats">
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="min">0</div><div class="dbg-prof-stat__label">Min FPS</div></div>
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="max">0</div><div class="dbg-prof-stat__label">Max FPS</div></div>
        <div class="dbg-prof-stat"><div class="dbg-prof-stat__value" data-pv="ftAvg">0</div><div class="dbg-prof-stat__label">Avg (ms)</div></div>
      </div>
      <div class="dbg-prof-graph-wrap"><div class="dbg-prof-graph-label">FPS History</div><div class="dbg-prof-graph"><canvas data-graph="fps"></canvas></div></div>
      <div class="dbg-prof-graph-wrap"><div class="dbg-prof-graph-label">Frame Time (ms)</div><div class="dbg-prof-graph"><canvas data-graph="ft"></canvas></div></div>
      <div class="dbg-prof-mem" data-mem-section></div>
      <div class="dbg-prof-mem" data-native-mem-section></div>
    `;

    panel.querySelector('[data-pin-btn]').addEventListener('click', () => {
      toggleFpsOverlay();
      const btn = panel.querySelector('[data-pin-btn]');
      btn.textContent = fpsOverlayPinned ? 'Unpin Overlay' : 'Pin FPS Overlay';
      btn.classList.toggle('active', fpsOverlayPinned);
    });

    panel.querySelector('[data-bench-btn]').addEventListener('click', () => {
      const btn = panel.querySelector('[data-bench-btn]');
      if (isBenchmarkMode()) {
        closeBenchmarks();
        btn.textContent = 'Open Benchmarks';
        btn.classList.remove('active');
      } else {
        setOpen(false);
        openBenchmarks();
        btn.textContent = 'Close Benchmarks';
        btn.classList.add('active');
      }
    });

    fpsCanvas = panel.querySelector('[data-graph="fps"]');
    ftCanvas = panel.querySelector('[data-graph="ft"]');
  }

  setStatVal(panel, 'fps', s.fps, fpsColor(s.fps));
  setStatVal(panel, 'avg', s.fpsAvg, fpsColor(s.fpsAvg));
  setStatVal(panel, 'ft', s.frameTime.toFixed(1), ftColor(s.frameTime));
  setStatVal(panel, 'min', s.fpsMin === Infinity ? '—' : s.fpsMin, fpsColor(s.fpsMin));
  setStatVal(panel, 'max', s.fpsMax, fpsColor(s.fpsMax));
  setStatVal(panel, 'ftAvg', s.frameTimeAvg.toFixed(1), ftColor(s.frameTimeAvg));

  drawGraph(fpsCanvas, Profiler.getFpsHistory(), 0, 120, '#00d4ff', '#4ade80', [120, 60, 0]);
  drawGraph(ftCanvas, Profiler.getFrameTimeHistory(), 0, 50, '#fbbf24', '#f87171', [50, 33, 16, 0]);

  // JS Heap Memory
  const memSection = panel.querySelector('[data-mem-section]');
  if (s.memoryAvailable) {
    const usedMB = (s.jsHeapUsed / 1048576).toFixed(1);
    const totalMB = (s.jsHeapTotal / 1048576).toFixed(1);
    const limitMB = (s.jsHeapLimit / 1048576).toFixed(1);
    const pct = ((s.jsHeapUsed / s.jsHeapLimit) * 100).toFixed(0);
    const maxMB = Math.ceil(s.jsHeapLimit / 1048576);

    if (!memCanvas) {
      memSection.innerHTML = `
        <div class="dbg-prof-graph-label">JS Heap Memory</div>
        <div class="dbg-prof-mem-bar-wrap">
          <div class="dbg-prof-mem-label"><span data-mem-used>${usedMB} MB / ${totalMB} MB</span><span>${limitMB} MB limit</span></div>
          <div class="dbg-prof-mem-bar"><div class="dbg-prof-mem-bar__fill" data-mem-fill style="width:${pct}%"></div></div>
        </div>
        <div class="dbg-prof-graph" style="margin-top:6px"><canvas data-graph="mem"></canvas></div>
      `;
      memCanvas = panel.querySelector('[data-graph="mem"]');
    } else {
      const usedEl = memSection.querySelector('[data-mem-used]');
      if (usedEl) usedEl.textContent = `${usedMB} MB / ${totalMB} MB`;
      const fillEl = memSection.querySelector('[data-mem-fill]');
      if (fillEl) fillEl.style.width = `${pct}%`;
    }

    const memTicks = [0, Math.round(maxMB / 2), maxMB];
    drawGraph(memCanvas, Profiler.getMemoryHistory(), 0, maxMB, '#c084fc', '#7b68ee', memTicks);
  } else {
    memSection.innerHTML = `<div class="dbg-prof-graph-label" style="padding:0 0 8px;color:#52525b">Memory API not available on this platform</div>`;
  }

  // Native Memory (Android/iOS only)
  const nativeMemSection = panel.querySelector('[data-native-mem-section]');
  if (s.nativeMemoryAvailable && s.nativeMemory) {
    const nm = s.nativeMemory;
    const totalPssMB = (nm.totalPss / 1048576).toFixed(1);
    const nativeHistory = Profiler.getNativeMemoryHistory();
    const maxNativeMB = nativeHistory.length > 0 ? Math.ceil(Math.max(...nativeHistory) * 1.3) : 512;

    if (!nativeMemCanvas) {
      let detailHtml = '';
      if (nm.jvmUsed !== undefined) {
        // Android
        const jvmMB = (nm.jvmUsed / 1048576).toFixed(1);
        const nativeHeapMB = (nm.nativeHeapUsed / 1048576).toFixed(1);
        const dalvikPssMB = (nm.dalvikPss / 1048576).toFixed(1);
        const nativePssMB = (nm.nativePss / 1048576).toFixed(1);
        const otherPssMB = (nm.otherPss / 1048576).toFixed(1);
        detailHtml = `
          <div class="dbg-prof-native-detail">
            <span>JVM: ${jvmMB} MB</span>
            <span>Native Heap: ${nativeHeapMB} MB</span>
          </div>
          <div class="dbg-prof-native-detail">
            <span>Dalvik PSS: ${dalvikPssMB} MB</span>
            <span>Native PSS: ${nativePssMB} MB</span>
            <span>Other PSS: ${otherPssMB} MB</span>
          </div>
        `;
      } else {
        // iOS
        const residentMB = (nm.residentSize / 1048576).toFixed(1);
        const availMB = (nm.availableMemory / 1048576).toFixed(0);
        const physMB = (nm.physicalMemory / 1048576).toFixed(0);
        detailHtml = `
          <div class="dbg-prof-native-detail">
            <span>Resident: ${residentMB} MB</span>
            <span>Available: ${availMB} MB / ${physMB} MB</span>
          </div>
        `;
      }

      nativeMemSection.innerHTML = `
        <div class="dbg-prof-graph-label">Native App Memory</div>
        <div class="dbg-prof-mem-bar-wrap">
          <div class="dbg-prof-mem-label"><span data-native-total>Total PSS: ${totalPssMB} MB</span></div>
        </div>
        ${detailHtml}
        <div class="dbg-prof-graph" style="margin-top:6px"><canvas data-graph="native-mem"></canvas></div>
      `;
      nativeMemCanvas = panel.querySelector('[data-graph="native-mem"]');
    } else {
      const totalEl = nativeMemSection.querySelector('[data-native-total]');
      if (totalEl) totalEl.textContent = `Total PSS: ${totalPssMB} MB`;

      if (nm.jvmUsed !== undefined) {
        const details = nativeMemSection.querySelectorAll('.dbg-prof-native-detail');
        if (details[0]) {
          const jvmMB = (nm.jvmUsed / 1048576).toFixed(1);
          const nativeHeapMB = (nm.nativeHeapUsed / 1048576).toFixed(1);
          details[0].innerHTML = `<span>JVM: ${jvmMB} MB</span><span>Native Heap: ${nativeHeapMB} MB</span>`;
        }
        if (details[1]) {
          const dalvikPssMB = (nm.dalvikPss / 1048576).toFixed(1);
          const nativePssMB = (nm.nativePss / 1048576).toFixed(1);
          const otherPssMB = (nm.otherPss / 1048576).toFixed(1);
          details[1].innerHTML = `<span>Dalvik PSS: ${dalvikPssMB} MB</span><span>Native PSS: ${nativePssMB} MB</span><span>Other PSS: ${otherPssMB} MB</span>`;
        }
      } else {
        const detail = nativeMemSection.querySelector('.dbg-prof-native-detail');
        if (detail) {
          const residentMB = (nm.residentSize / 1048576).toFixed(1);
          const availMB = (nm.availableMemory / 1048576).toFixed(0);
          const physMB = (nm.physicalMemory / 1048576).toFixed(0);
          detail.innerHTML = `<span>Resident: ${residentMB} MB</span><span>Available: ${availMB} MB / ${physMB} MB</span>`;
        }
      }
    }

    const nativeMemTicks = [0, Math.round(maxNativeMB / 2), maxNativeMB];
    drawGraph(nativeMemCanvas, nativeHistory, 0, maxNativeMB, '#f97316', '#ef4444', nativeMemTicks);
  } else if (!s.nativeMemoryAvailable && nativeMemSection) {
    nativeMemSection.innerHTML = '';
  }
}

function drawGraph(canvas, data, minVal, maxVal, colorA, colorB, yTicks) {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width * dpr;
  const h = rect.height * dpr;

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const range = maxVal - minVal || 1;
  const labelW = yTicks ? 30 * dpr : 0;
  const plotX = labelW;
  const plotW = w - labelW;

  if (yTicks) {
    ctx.font = `${9 * dpr}px 'SF Mono','Cascadia Code','Consolas',monospace`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (const tick of yTicks) {
      const norm = Math.max(0, Math.min(1, (tick - minVal) / range));
      const y = h - norm * h;
      const clampedY = Math.max(6 * dpr, Math.min(h - 4 * dpr, y));

      ctx.fillStyle = 'rgba(113,113,122,0.6)';
      ctx.fillText(String(tick), labelW - 4 * dpr, clampedY);

      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(w, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();
    }
  }

  if (data.length < 2) return;

  const step = plotW / (data.length - 1);

  ctx.beginPath();
  ctx.moveTo(plotX, h);
  for (let i = 0; i < data.length; i++) {
    const x = plotX + i * step;
    const norm = Math.max(0, Math.min(1, (data[i] - minVal) / range));
    ctx.lineTo(x, h - norm * h);
  }
  ctx.lineTo(plotX + (data.length - 1) * step, h);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, hexAlpha(colorA, 0.3));
  grad.addColorStop(1, hexAlpha(colorB, 0.05));
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = plotX + i * step;
    const norm = Math.max(0, Math.min(1, (data[i] - minVal) / range));
    const y = h - norm * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = colorA;
  ctx.lineWidth = 1.5 * dpr;
  ctx.stroke();
}

// ── FPS Overlay (pinnable mini-widget) ──────────────

function createFpsOverlay() {
  fpsOverlay = document.createElement('div');
  fpsOverlay.className = 'dbg-fps-overlay';
  fpsOverlay.innerHTML = `
    <div class="dbg-fps-overlay__header" data-fps-drag>
      <span class="dbg-fps-overlay__value" data-fps-val>0</span>
      <span class="dbg-fps-overlay__unit">FPS</span>
      <span class="dbg-fps-overlay__ft" data-fps-ft>0.0ms</span>
      <button class="dbg-fps-overlay__close" data-fps-close>✕</button>
    </div>
    <div class="dbg-fps-overlay__graph"><canvas data-fps-graph></canvas></div>
  `;

  fpsOverlayCanvas = fpsOverlay.querySelector('[data-fps-graph]');

  fpsOverlay.querySelector('[data-fps-close]').addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFpsOverlay(false);
    const pinBtn = overlay?.querySelector('[data-pin-btn]');
    if (pinBtn) {
      pinBtn.textContent = 'Pin FPS Overlay';
      pinBtn.classList.remove('active');
    }
  });

  makeDraggable(fpsOverlay, fpsOverlay.querySelector('[data-fps-drag]'));

  document.body.appendChild(fpsOverlay);
}

function toggleFpsOverlay(forceState) {
  fpsOverlayPinned = forceState !== undefined ? forceState : !fpsOverlayPinned;
  fpsOverlay.classList.toggle('visible', fpsOverlayPinned);
  if (fpsOverlayPinned) updateFpsOverlay();
}

function updateFpsOverlay() {
  if (!fpsOverlay || !fpsOverlayPinned) return;
  const s = Profiler.getStats();
  const valEl = fpsOverlay.querySelector('[data-fps-val]');
  const ftEl = fpsOverlay.querySelector('[data-fps-ft]');

  valEl.textContent = s.fps;
  valEl.className = `dbg-fps-overlay__value ${fpsColor(s.fps)}`;
  ftEl.textContent = `${s.frameTime.toFixed(1)}ms`;

  drawGraph(fpsOverlayCanvas, Profiler.getFpsHistory(), 0, 120, '#00d4ff', '#4ade80');
}

function makeDraggable(element, handle) {
  let offsetX = 0, offsetY = 0;
  let dragging = false;

  function onStart(e) {
    if (e.target.closest('[data-fps-close]')) return;
    dragging = true;
    const touch = e.touches ? e.touches[0] : e;
    const rect = element.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    element.style.transition = 'none';
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    const touch = e.touches ? e.touches[0] : e;
    let x = touch.clientX - offsetX;
    let y = touch.clientY - offsetY;

    const maxX = window.innerWidth - element.offsetWidth;
    const maxY = window.innerHeight - element.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  function onEnd() {
    dragging = false;
    element.style.transition = '';
  }

  handle.addEventListener('mousedown', onStart);
  handle.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);
}

// ── Helpers ─────────────────────────────────────────

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function getPanel(id) {
  return overlay.querySelector(`[data-panel="${id}"]`);
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function pad(n)  { return String(n).padStart(2, '0'); }
function pad3(n) { return String(n).padStart(3, '0'); }

function setStatVal(panel, key, val, cls) {
  const el = panel.querySelector(`[data-pv="${key}"]`);
  if (!el) return;
  el.textContent = val;
  el.className = `dbg-prof-stat__value ${cls}`;
}

function fpsColor(fps) {
  if (fps >= 55) return 'good';
  if (fps >= 30) return 'warn';
  return 'bad';
}

function ftColor(ms) {
  if (ms <= 18) return 'good';
  if (ms <= 33) return 'warn';
  return 'bad';
}

function hexAlpha(hex, a) {
  return hex + Math.round(a * 255).toString(16).padStart(2, '0');
}
