import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export function syncNativeVersion(version, opts = {}) {
  // opts: { versionCode?: number, versionNameSuffix?: string }
  // If versionCode is provided, use it verbatim. Otherwise derive from semver.
  // versionNameSuffix is appended to versionName (e.g. ".42-a1b2c3d") so
  // testers can identify the exact commit from a Firebase Distribution build.
  const parts = version.split('.').map(Number);
  const versionCode = opts.versionCode != null
    ? Number(opts.versionCode)
    : parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
  const versionName = version + (opts.versionNameSuffix || '');

  console.log(`Syncing native version: ${versionName} (code: ${versionCode})`);

  syncAndroid(versionName, versionCode);
  syncIos(versionName, versionCode);
}

function syncAndroid(version, versionCode) {
  const gradlePath = resolve('android/app/build.gradle');
  try {
    let gradle = readFileSync(gradlePath, 'utf-8');
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
    writeFileSync(gradlePath, gradle);
    console.log(`  android/app/build.gradle → versionName "${version}", versionCode ${versionCode}`);
  } catch (e) {
    console.warn(`  Skipping Android: ${e.message}`);
  }
}

function syncIos(version, versionCode) {
  const pbxPath = resolve('ios/App/App.xcodeproj/project.pbxproj');
  try {
    let pbx = readFileSync(pbxPath, 'utf-8');
    // Apple ITMS-90060: CFBundleShortVersionString (= MARKETING_VERSION)
    // só aceita LISTA DE NO MÁXIMO 3 inteiros separados por ponto.
    // Android aceita 4 partes (`0.1.0.134`), Apple não. Strip o suffix de
    // commitCount aqui pro iOS — `0.1.0.134` → `0.1.0`. O versionCode
    // (commit count) ainda vai pra CURRENT_PROJECT_VERSION, que é o
    // "build number" iOS e aceita até 18 chars.
    const marketingVersion = version.split('.').slice(0, 3).join('.');
    pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${marketingVersion};`);
    pbx = pbx.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`);
    writeFileSync(pbxPath, pbx);
    console.log(`  ios project.pbxproj → MARKETING_VERSION ${marketingVersion}, CURRENT_PROJECT_VERSION ${versionCode}`);
  } catch (e) {
    console.warn(`  Skipping iOS: ${e.message}`);
  }
}
