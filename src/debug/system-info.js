import { Capacitor } from '@capacitor/core';

export function collectSystemInfo(extras = {}) {
  const nav = navigator;
  const scr = screen;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  return {
    app: {
      'App Name': extras.appName || __APP_NAME__,
      'Shell Version': extras.shellVersion || __APP_VERSION__,
      'Content Version': extras.contentVersion || __APP_VERSION__,
      'Build Mode': extras.buildMode || '—',
      'OTA Enabled': String(__OTA_ENABLED__),
    },
    device: {
      'Platform': Capacitor.getPlatform(),
      'Native': String(Capacitor.isNativePlatform()),
      'User Agent': nav.userAgent,
      'Language': nav.language,
      'Languages': (nav.languages || []).join(', '),
      'Cores': String(nav.hardwareConcurrency || '—'),
      'Max Touch Points': String(nav.maxTouchPoints || 0),
    },
    display: {
      'Screen': `${scr.width} × ${scr.height}`,
      'Viewport': `${window.innerWidth} × ${window.innerHeight}`,
      'Device Pixel Ratio': String(window.devicePixelRatio),
      'Orientation': scr.orientation?.type || '—',
      'Color Depth': `${scr.colorDepth}-bit`,
    },
    network: {
      'Online': String(nav.onLine),
      'Type': conn?.effectiveType || '—',
      'Downlink': conn ? `${conn.downlink} Mbps` : '—',
      'RTT': conn ? `${conn.rtt} ms` : '—',
      'Save Data': conn ? String(conn.saveData) : '—',
    },
    runtime: {
      'JS Engine': detectEngine(),
      'Cookie Enabled': String(nav.cookieEnabled),
      'WebGL': detectWebGL(),
      'WebAssembly': String(typeof WebAssembly !== 'undefined'),
      'Service Worker': String('serviceWorker' in nav),
    },
  };
}

function detectEngine() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'V8 (Chromium)';
  if (ua.includes('Safari')) return 'JavaScriptCore (WebKit)';
  if (ua.includes('Firefox')) return 'SpiderMonkey (Gecko)';
  return 'Unknown';
}

function detectWebGL() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'Not supported';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (dbg) return gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    return 'Supported';
  } catch {
    return 'Not supported';
  }
}
