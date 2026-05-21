import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

const OTA_MANIFEST_URL = __OTA_MANIFEST_URL__;
const OTA_ENABLED = __OTA_ENABLED__;
const CURRENT_VERSION = __APP_VERSION__;
const BUILD_MODE = __BUILD_MODE__;
const IS_PRODUCTION = BUILD_MODE === 'production';

const log = (...args) => console.log('[OTA]', ...args);

const CHECKSUM_KEY = 'ota_current_checksum';

let updaterPlugin = null;
let pendingBundle = null;
let listeners = {};

function emit(event, data) {
  (listeners[event] || []).forEach((fn) => fn(data));
}

function isNative() {
  return Capacitor.isNativePlatform();
}

async function loadPlugin() {
  if (!isNative()) return;
  const mod = await import('@capgo/capacitor-updater');
  updaterPlugin = mod.CapacitorUpdater;
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export const OTAUpdater = {
  on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(fn);
    return () => {
      listeners[event] = listeners[event].filter((f) => f !== fn);
    };
  },

  async init() {
    log('Config:', JSON.stringify({ OTA_ENABLED, OTA_MANIFEST_URL, CURRENT_VERSION, native: isNative() }));

    if (!OTA_ENABLED || !isNative()) {
      log('Skipping — OTA_ENABLED:', OTA_ENABLED, 'native:', isNative());
      emit('status', 'OTA skipped (web or disabled)');
      return;
    }

    log('Loading plugin...');
    await loadPlugin();
    if (!updaterPlugin) {
      log('Plugin failed to load');
      return;
    }
    log('Plugin loaded');

    log('Calling notifyAppReady()...');
    await updaterPlugin.notifyAppReady();
    log('notifyAppReady() done');
    emit('status', 'App ready notified');

    App.addListener('appStateChange', async ({ isActive }) => {
      log('appStateChange:', isActive, 'pendingBundle:', !!pendingBundle);
      if (!pendingBundle) return;

      if (!isActive) {
        try {
          await updaterPlugin.set({ id: pendingBundle.id });
          emit('status', 'Bundle set — will apply on resume');
        } catch (err) {
          emit('error', `Failed to set bundle: ${err.message}`);
        }
      } else {
        try {
          await updaterPlugin.reload();
        } catch (err) {
          emit('error', `Reload failed: ${err.message}`);
        }
      }
    });
    log('appStateChange listener registered');
  },

  async checkForUpdate() {
    if (!OTA_ENABLED || !OTA_MANIFEST_URL) {
      log('Check skipped — OTA_ENABLED:', OTA_ENABLED, 'OTA_MANIFEST_URL:', OTA_MANIFEST_URL || '(empty)');
      return null;
    }

    const url = `${OTA_MANIFEST_URL}?t=${Date.now()}`;
    log('Fetching manifest:', url);
    emit('status', 'Checking for updates...');

    try {
      const res = await fetch(url);
      log('Manifest response:', res.status, res.statusText);

      if (!res.ok) {
        log('Manifest not found (HTTP', res.status + ')');
        emit('status', 'No updates available');
        return null;
      }

      const manifest = await res.json();
      log('Manifest:', JSON.stringify(manifest));

      if (IS_PRODUCTION) {
        log('Production mode — comparing versions: remote', manifest.version, 'vs local', CURRENT_VERSION);
        if (compareVersions(manifest.version, CURRENT_VERSION) > 0) {
          log('Update available:', manifest.version);
          emit('status', `Update available: v${manifest.version}`);
          return manifest;
        }
      } else {
        const localChecksum = localStorage.getItem(CHECKSUM_KEY) || '';
        log(`${BUILD_MODE} mode — comparing checksums: remote`, manifest.checksum, 'vs local', localChecksum || '(none)');
        if (manifest.checksum && manifest.checksum !== localChecksum) {
          log('New bundle detected:', manifest.version);
          emit('status', `New bundle: v${manifest.version}`);
          return manifest;
        }
      }

      log('Already up to date');
      emit('status', 'Up to date');
      return null;
    } catch (err) {
      log('Fetch failed:', err.message);
      emit('status', 'Update check failed — continuing with current version');
      return null;
    }
  },

  async downloadUpdate(manifest) {
    if (!updaterPlugin) {
      log('Download skipped — plugin not available');
      emit('status', 'Updater not available');
      return null;
    }

    log('Downloading bundle:', manifest.url, 'version:', manifest.version);
    emit('status', `Downloading v${manifest.version}...`);
    emit('progress', 0);

    try {
      const bundle = await updaterPlugin.download({
        url: manifest.url,
        version: manifest.version,
      });

      log('Download complete — bundle id:', bundle.id);
      pendingBundle = bundle;

      if (manifest.checksum) {
        localStorage.setItem(CHECKSUM_KEY, manifest.checksum);
        log('Stored checksum:', manifest.checksum);
      }

      emit('progress', 100);
      emit('status', `v${manifest.version} downloaded`);
      emit('updateReady', manifest.version);
      return bundle;
    } catch (err) {
      log('Download failed:', err.message);
      emit('error', `Download failed: ${err.message}`);
      return null;
    }
  },

  async applyNow() {
    if (!pendingBundle || !updaterPlugin) {
      log('applyNow() skipped — no pending bundle or plugin');
      return;
    }

    try {
      log('Setting bundle:', pendingBundle.id);
      await updaterPlugin.set({ id: pendingBundle.id });
      log('Bundle set — reloading webview...');
      await updaterPlugin.reload();
    } catch (err) {
      log('Apply failed:', err.message);
      emit('error', `Apply failed: ${err.message}`);
    }
  },

  async getShellVersion() {
    if (isNative()) {
      try {
        const info = await App.getInfo();
        return info.version || CURRENT_VERSION;
      } catch (_) { /* fall through */ }
    }
    return CURRENT_VERSION;
  },

  async getContentVersion() {
    if (!updaterPlugin || !isNative()) {
      log('Content version: using shell version (no plugin or web)');
      return CURRENT_VERSION;
    }

    try {
      const { bundle } = await updaterPlugin.current();
      log('Current bundle:', JSON.stringify(bundle));
      if (bundle.version && bundle.version !== 'builtin') {
        return bundle.version;
      }
    } catch (err) {
      log('Failed to get current bundle:', err.message);
    }
    return CURRENT_VERSION;
  },

  hasPendingUpdate() {
    return pendingBundle !== null;
  },
};
