import { resolve } from 'path';
import { mkdirSync, copyFileSync, existsSync } from 'fs';
import {
  getEnvArg,
  loadEnv,
  getVersion,
  getAppId,
  ensureAndroidEnv,
  hasFlag,
  cleanBuildCaches,
  run,
} from './utils.js';
import { syncNativeVersion } from './sync-native-version.js';

const mode = getEnvArg();
loadEnv(mode);
ensureAndroidEnv();

const version = getVersion();
syncNativeVersion(version);
const releasesDir = resolve('releases');
const keystorePath = process.env.KEYSTORE_PATH || './release.keystore';
const hasKeystore = existsSync(keystorePath);
const clean = hasFlag('--clean');
const install = hasFlag('--install');

console.log(`\n=== Building APK [${mode}] v${version}${clean ? ' (clean)' : ''}${install ? ' (+install)' : ''} ===\n`);

if (clean) {
  console.log('Cleaning build caches...');
  cleanBuildCaches();
  console.log();
}

run(`npx vite build --mode ${mode}`);

process.env.CAPACITOR_MODE = mode;
run('npx cap sync android');

let apkPath;

if (hasKeystore) {
  const alias = process.env.KEYSTORE_ALIAS || 'release';
  const storePass = process.env.KEYSTORE_PASSWORD || 'changeme';
  const aliasPass = process.env.KEYSTORE_ALIAS_PASSWORD || 'changeme';

  run(
    `npx cap build android --androidreleasetype APK` +
    ` --keystorepath "${resolve(keystorePath)}"` +
    ` --keystorealias "${alias}"` +
    ` --keystorepass "${storePass}"` +
    ` --keystorealiaspass "${aliasPass}"`
  );

  apkPath = resolve('android/app/build/outputs/apk/release/app-release.apk');
} else {
  console.warn(`\nKeystore not found at ${keystorePath} — building debug APK.\n`);
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  run(`${gradlew} assembleDebug`, { cwd: resolve('android') });

  apkPath = resolve('android/app/build/outputs/apk/debug/app-debug.apk');
}

mkdirSync(releasesDir, { recursive: true });

const apkName = `game-${mode}-v${version}.apk`;

if (!existsSync(apkPath)) {
  console.error(`\nExpected APK not found at: ${apkPath}`);
  console.error('Check android/app/build/outputs/ manually.');
  process.exit(1);
}

const dest = resolve(releasesDir, apkName);
copyFileSync(apkPath, dest);
console.log(`\nAPK saved to: ${dest}`);

if (install) {
  const appId = getAppId();

  console.log(`\nUninstalling ${appId} from device...`);
  try {
    run(`adb uninstall ${appId}`);
  } catch {
    console.log('  (app was not installed — skipping)');
  }

  console.log(`\nInstalling ${apkName}...`);
  run(`adb install "${dest}"`);

  console.log(`\nLaunching ${appId}...`);
  run(`adb shell am start -n ${appId}/.MainActivity`);
}

console.log(`\n=== Done [${mode}] ===\n`);
