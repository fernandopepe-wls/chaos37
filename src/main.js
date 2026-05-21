import './style.css';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@wildlife/platform-capacitor';
import { initLoader, setStatus, setProgress, setIndeterminate, setShellVersion, setContentVersion, hideLoader } from './shell/loader.js';
import { initError, showError } from './shell/error.js';
import { OTAUpdater } from './ota/updater.js';
import { bootGame } from './game/index.js';
let debugPanel = null;

const canvas = document.getElementById('game-canvas');

const log = (...args) => console.log('[Shell]', ...args);

async function main() {
  // Load + init the debug panel FIRST so its ConsoleInterceptor is in place
  // before anything else logs. Without this, native-log forwarding from the
  // platform SDK races against the interceptor install and its early logs
  // land in logcat only.
  if (__DEBUG_ENABLED__) {
    const { DebugPanel } = await import('./debug/debug-panel.js');
    debugPanel = DebugPanel;
    DebugPanel.init({ appName: __APP_NAME__, buildMode: __BUILD_MODE__ });
  }

  log('Booting...', `platform=${Capacitor.getPlatform()}`, `native=${Capacitor.isNativePlatform()}`);

  try {
    await Platform().initialize({
      appId: __APP_NAME__ || 'bunny-chaos-37',
      environment: __BUILD_MODE__,
    });
    log('[WildlifePlatform] initialized, version =', await Platform().getPlatformVersion());
  } catch (e) {
    log('[WildlifePlatform] initialize failed:', e?.message ?? e);
  }

  initLoader();
  initError();

  let shellVersion = __APP_VERSION__;
  if (Capacitor.isNativePlatform()) {
    try {
      const info = await CapApp.getInfo();
      shellVersion = info.version || shellVersion;
      log('Native app info:', JSON.stringify(info));
    } catch (e) {
      log('Could not get native app info:', e.message);
    }

    log('Entering fullscreen mode...');
    await StatusBar.hide();
    await StatusBar.setOverlaysWebView({ overlay: true });
    await SplashScreen.hide();
    log('Fullscreen + splash hidden');
  }
  setShellVersion(shellVersion);
  if (debugPanel) debugPanel.updateExtras({ shellVersion, contentVersion: __APP_VERSION__ });
  log('Shell version:', shellVersion, '| Content version:', __APP_VERSION__);

  OTAUpdater.on('status', (msg) => {
    log('OTA status:', msg);
    setStatus(msg);
  });
  OTAUpdater.on('progress', (pct) => {
    log('OTA progress:', pct + '%');
    setProgress(pct);
  });
  OTAUpdater.on('error', (msg) => log('OTA error:', msg));

  try {
    log('Initializing OTA updater...');
    await OTAUpdater.init();
    log('OTA updater initialized');

    const contentVersion = await OTAUpdater.getContentVersion();
    log('Content version:', contentVersion);
    setContentVersion(contentVersion);

    log('Checking for updates...');
    const manifest = await OTAUpdater.checkForUpdate();

    if (manifest) {
      log('Update manifest:', JSON.stringify(manifest));
      setStatus('Downloading update...');
      await OTAUpdater.downloadUpdate(manifest);
      setStatus('Applying update...');
      log('Applying update immediately...');
      await OTAUpdater.applyNow();
      return;
    } else {
      log('No update available');
    }

    setStatus('Starting game...');
    setProgress(100);
    log('Launching game...');
    await sleep(300);

    bootGame(canvas);
    log('Game menu ready — hiding loader');
    await hideLoader();
    log('Boot complete');
  } catch (err) {
    console.error('[Shell] Startup error:', err);
    showError(err.message || 'Failed to start the game.', () => main());
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main();
