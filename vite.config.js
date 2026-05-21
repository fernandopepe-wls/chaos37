import { defineConfig, loadEnv } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
const capConfig = JSON.parse(readFileSync(resolve('capacitor.config.json'), 'utf-8'));

const APP_NAME = capConfig.appName;
const APP_VERSION = pkg.version;
const BG_COLOR = capConfig.plugins?.SplashScreen?.backgroundColor || '#0a0a0f';

// Build identity stamped by scripts/bump-build.js (npm prebuild hook).
// Falls back to "dev" labels when the hook hasn't run (raw vite dev).
let BUILD_INFO = {
  versionCode: 0,
  versionName: APP_VERSION,
  shortSha: 'dev',
  branch: 'dev',
  commitCount: 0,
  dirty: false,
  builtAt: new Date().toISOString(),
};
try {
  BUILD_INFO = JSON.parse(readFileSync(resolve('scripts/.build-info.json'), 'utf-8'));
} catch { /* prebuild hasn't run — keep dev fallback. Run `npm run bump-build` to generate. */ }

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const otaEnabled = env.OTA_ENABLED === 'true';
  const otaManifestUrl = otaEnabled && env.OTA_BASE_URL && env.OTA_S3_PREFIX
    ? `${env.OTA_BASE_URL}/${env.OTA_S3_PREFIX}/manifest.json`
    : '';

  return {
    define: {
      __APP_NAME__: JSON.stringify(APP_NAME),
      __APP_VERSION__: JSON.stringify(APP_VERSION),
      __BG_COLOR__: JSON.stringify(BG_COLOR),
      __BUILD_MODE__: JSON.stringify(mode),
      __DEBUG_ENABLED__: mode !== 'production',
      __OTA_ENABLED__: JSON.stringify(otaEnabled),
      __OTA_MANIFEST_URL__: JSON.stringify(otaManifestUrl),
      __BUILD_INFO__: JSON.stringify(BUILD_INFO),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    plugins: [
      {
        name: 'generate-manifest',
        writeBundle() {
          const manifest = {
            name: APP_NAME,
            short_name: APP_NAME,
            description: `${APP_NAME} — powered by Capacitor`,
            start_url: '/',
            display: 'fullscreen',
            orientation: 'any',
            background_color: BG_COLOR,
            theme_color: BG_COLOR,
            icons: [
              { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
              { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            ],
          };
          const outDir = resolve('dist');
          mkdirSync(outDir, { recursive: true });
          writeFileSync(resolve(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
        },
      },
    ],
    server: {
      port: 3000,
      open: true,
    },
  };
});
