import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export function syncNativeVersion(version) {
  const parts = version.split('.').map(Number);
  const versionCode = parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);

  console.log(`Syncing native version: ${version} (code: ${versionCode})`);

  syncAndroid(version, versionCode);
  syncIos(version, versionCode);
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
    pbx = pbx.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`);
    pbx = pbx.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`);
    writeFileSync(pbxPath, pbx);
    console.log(`  ios project.pbxproj → MARKETING_VERSION ${version}, CURRENT_PROJECT_VERSION ${versionCode}`);
  } catch (e) {
    console.warn(`  Skipping iOS: ${e.message}`);
  }
}
