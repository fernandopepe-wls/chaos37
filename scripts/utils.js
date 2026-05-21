import { readFileSync, existsSync, rmSync } from 'fs';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { config as loadDotenv } from 'dotenv';

export function loadEnv(mode) {
  const envPath = resolve(`.env.${mode}`);
  const result = loadDotenv({ path: envPath });
  if (result.error) {
    console.error(`Failed to load ${envPath}:`, result.error.message);
    process.exit(1);
  }
  console.log(`Loaded environment: ${mode} (${envPath})`);
  return result.parsed;
}

export function getVersion() {
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
  return pkg.version;
}

export function getEnvArg() {
  const mode = process.argv[2];
  if (!['development', 'staging', 'production'].includes(mode)) {
    console.error('Usage: node <script> <development|staging|production>');
    process.exit(1);
  }
  return mode;
}

export function ensureAndroidEnv() {
  if (!process.env.JAVA_HOME) {
    console.error('JAVA_HOME is not set. Add it to your .env file.');
    console.error('  Example: JAVA_HOME=C:\\Program Files\\Android\\Android Studio\\jbr');
    process.exit(1);
  }

  if (!process.env.ANDROID_HOME) {
    console.error('ANDROID_HOME is not set. Add it to your .env file.');
    console.error('  Example: ANDROID_HOME=C:\\Users\\You\\AppData\\Local\\Android\\Sdk');
    process.exit(1);
  }
}

export function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env }, ...opts });
}

export function hasFlag(flag) {
  return process.argv.includes(flag);
}

export function getAppId() {
  const cap = JSON.parse(readFileSync(resolve('capacitor.config.json'), 'utf-8'));
  return cap.appId;
}

export function cleanBuildCaches() {
  const dirs = [
    'dist',
    'android/build',
    'android/app/build',
    'android/.gradle',
  ];

  for (const dir of dirs) {
    const full = resolve(dir);
    if (existsSync(full)) {
      rmSync(full, { recursive: true, force: true });
      console.log(`  Removed ${dir}/`);
    }
  }
}
