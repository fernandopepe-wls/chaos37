const PARTICLE_COUNT = 18;

let loaderEl;
let progressBar;
let statusEl;
let titleEl;
let shellVersionEl;
let contentVersionEl;
let particlesEl;

export function initLoader() {
  loaderEl = document.getElementById('loader');
  progressBar = document.getElementById('progress-bar');
  statusEl = document.getElementById('loader-status');
  titleEl = document.getElementById('loader-title');
  shellVersionEl = document.getElementById('loader-shell-version');
  contentVersionEl = document.getElementById('loader-content-version');
  particlesEl = document.getElementById('particles');

  titleEl.textContent = __APP_NAME__;
  shellVersionEl.textContent = `Shell v...`;
  contentVersionEl.textContent = `Content v${__APP_VERSION__}`;

  spawnParticles();
  setIndeterminate(true);
}

export function setShellVersion(version) {
  if (shellVersionEl) shellVersionEl.textContent = `Shell v${version}`;

  const errorShellEl = document.getElementById('error-shell-version');
  if (errorShellEl) errorShellEl.textContent = `Shell v${version}`;
}

export function setContentVersion(version) {
  if (contentVersionEl) contentVersionEl.textContent = `Content v${version}`;

  const errorContentEl = document.getElementById('error-content-version');
  if (errorContentEl) errorContentEl.textContent = `Content v${version}`;

  const checksumEl = document.getElementById('loader-bundle-checksum');
  if (checksumEl) {
    const stored = localStorage.getItem('ota_current_checksum') || '';
    checksumEl.textContent = stored ? `Bundle: ${stored.slice(7, 19)}` : 'Bundle: built-in';
  }
}

function spawnParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 4;
    const left = Math.random() * 100;
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * duration;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      bottom: -${size}px;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
    `;
    particlesEl.appendChild(p);
  }
}

export function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

export function setProgress(pct) {
  if (!progressBar) return;
  setIndeterminate(false);
  progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

export function setIndeterminate(on) {
  if (!progressBar) return;
  if (on) {
    progressBar.classList.add('indeterminate');
  } else {
    progressBar.classList.remove('indeterminate');
  }
}

export function hideLoader() {
  return new Promise((resolve) => {
    if (!loaderEl) return resolve();
    loaderEl.classList.add('fade-out');
    setTimeout(() => {
      loaderEl.style.display = 'none';
      resolve();
    }, 500);
  });
}
