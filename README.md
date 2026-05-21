# Capacitor Game Template

A production-ready template for building **2D and 3D HTML5 games** that ship as native Android/iOS apps via [Capacitor](https://capacitorjs.com). Includes over-the-air updates, multi-environment builds, and CI/CD pipelines out of the box.

| Layer | Technology |
|-------|------------|
| Build | Vite |
| Runtime | Capacitor 7 |
| 2D Engine | [PixiJS](https://pixijs.com) |
| 3D Engine | [Three.js](https://threejs.org) |
| OTA Updates | [@capgo/capacitor-updater](https://capgo.app) → S3/R2/MinIO |
| CI/CD | GitLab CI/CD (manual triggers) |

---

## Prerequisites

Browser-only development (`npm run dev`) just needs **Node.js**. Building mobile binaries locally requires the platform toolchains below.

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 20+ | [nodejs.org/en/download](https://nodejs.org/en/download) |
| **Java (JDK)** | 17+ (21 recommended) | Android Studio ships JDK 21 at `<Android Studio>/jbr` — easiest to point `JAVA_HOME` there. Standalone: [Temurin 21](https://adoptium.net/temurin/releases/?version=21). |
| **Android Studio** | Latest | [developer.android.com/studio](https://developer.android.com/studio) |
| **Android SDK Platform** | API 35 (compile/target) | SDK Manager → SDK Platforms |
| **Android SDK Build-Tools** | 35.x | SDK Manager → SDK Tools |
| **Min device API** | 26 (Android 8.0) | Defined in `android/variables.gradle`. Bumped from Capacitor 7's default (22) because the Wildlife native SDK requires `ddmlib`/`protobuf-java` at API 26+. |
| **ADB** | bundled | Part of Android SDK Platform-Tools |
| **Xcode** *(iOS only)* | 15+ | macOS only — [developer.apple.com/xcode](https://developer.apple.com/xcode/) |
| **CocoaPods** *(iOS only)* | 1.15+ | `sudo gem install cocoapods` or `brew install cocoapods` |

After installing, set these in your `.env.development`:

```ini
JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
ANDROID_HOME=C:\Users\YOU\AppData\Local\Android\Sdk
```

> **Tip:** On macOS/Linux the paths are typically `~/Library/Android/sdk` and the JDK bundled with Android Studio (or a standalone JDK 17+).

### Wildlife platform SDK access

This template consumes `@wildlife/platform-capacitor` from a private git repo and pulls Wildlife's native Android SDK from Artifactory. Before your first `npm install` / Gradle build, make sure:

| Requirement | What / why | How to verify |
|-------------|-----------|---------------|
| **SSH access to `git.topfreegames.com`** | `package.json` resolves `@wildlife/platform-capacitor` from `git+ssh://git@git.topfreegames.com/wazp/wildlife-platform-sdk-capacitor.git#vX.Y.Z`. Same SSH key you use to clone this template. | `ssh -T git@git.topfreegames.com` should report a login banner. |
| **Wildlife Artifactory (Android Maven)** | The native Android SDK (`com.wildlifestudios:platform`) resolves from `https://artifactory.tfgco.com/artifactory/gradle-release-local`. | `android/build.gradle` already declares the repo with shared dev credentials baked in — works out of the box. To use a personal token: `./gradlew :app:assembleDebug -DartifactoryUsername=<you> -DartifactoryPassword=<token>`. |
| **Wildlife private CocoaPods spec repo** (iOS only) | The iOS pod `WildlifePlatform/Core` lives in a private spec repo. | `pod repo list` should include a Wildlife entry. If missing: `pod repo add wildlife-specs <url>` — ask #infra for the URL. |

No changes to app source are required — the template's Gradle and podspec config already point at the right places.

### APK Signing (optional for debug)

To build signed release APKs, generate a keystore:

```bash
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

Then set the keystore variables in `.env.development` (or GitLab CI/CD variables for pipeline builds):

```ini
KEYSTORE_PATH=./release.keystore
KEYSTORE_ALIAS=release
KEYSTORE_PASSWORD=your_password
KEYSTORE_ALIAS_PASSWORD=your_password
```

Without a keystore, `npm run apk:dev` builds a **debug APK** automatically.

---

## Quick Start

### 1. Clone & Setup

```bash
git clone git@git.topfreegames.com:leonardo.dimano/capacitor-template.git
cd my-game
npm install
npm run dev
```

When generating this project with cookiecutter, provide:

| Prompt | Example | What it changes |
|--------|---------|-----------------|
| App display name | `Space Blaster` | capacitor.config.json, strings.xml, index.html |
| App ID | `com.studio.spaceblaster` | capacitor.config.json, build.gradle, strings.xml, Java packages |
| npm package name | `space-blaster` | package.json |
| Starting version | `1.0.0` | package.json |

### 2. Configure Environment

```bash
cp .env.example .env.development
```

Edit `.env.development` with your local Android SDK paths and S3/OTA settings.

### 3. Develop

```bash
npm run dev        # Browser with hot-reload at localhost:3000
```

### 4. Test on Device

```bash
npm run apk:dev          # Build debug APK
npm run apk:dev:fresh    # Clean build + install on connected device
```

### 5. Push & Deploy

```bash
git init
git add -A
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

Then trigger builds from **CI/CD → Pipelines → Run pipeline** in GitLab.

---

## Project Structure

```
├── index.html                  # Entry HTML (loader, error screen, canvas)
├── package.json                # Dependencies & npm scripts
├── capacitor.config.json       # Capacitor app ID, name, plugin settings
├── vite.config.js              # Vite build config (defines, manifest gen)
├── .gitlab-ci.yml              # GitLab CI/CD pipeline (APK + OTA)
├── .env.example                # Environment variable template
│
├── src/
│   ├── main.js                 # Boot: OTA check → loader → game
│   ├── style.css               # Shell styles
│   ├── ota/
│   │   └── updater.js          # OTA update logic
│   ├── shell/
│   │   ├── loader.js           # Animated loading screen
│   │   └── error.js            # Error screen with retry
│   ├── game/
│   │   ├── index.js            # Game entry (boots hello-world by default)
│   │   ├── hello-world.js      # Default scene shown on launch
│   │   ├── menu.js             # Benchmarks selector (opened from debug panel)
│   │   ├── menu.css            # Menu styles
│   │   ├── loop.js             # Game loop (delta time, FPS cap)
│   │   ├── canvas2d-demo.js    # Canvas 2D particles demo
│   │   ├── sprite-flood.js     # Sprite rendering demo
│   │   ├── collision-grid.js   # Collision detection demo
│   │   ├── pixi-particles.js   # PixiJS particles demo
│   │   ├── three-demo.js       # Three.js wireframe demo
│   │   ├── lit-scene.js        # Three.js lit scene demo
│   │   ├── pro-pass-popup.js   # Sample popup wired to platform SDK
│   │   └── pro-pass-popup.css  # Popup styles
│   ├── debug/                  # Debug panel + console/profiler/SDK info (non-production)
│   └── plugins/                # Native plugin bridges (e.g. native-memory.js)
│
├── scripts/
│   ├── setup.js                # Cookie-cutter project init
│   ├── build-apk.js            # Build & sign APK
│   ├── ota-publish.js          # Bundle & upload OTA to S3
│   ├── bump-version.js         # Semantic version bumping
│   ├── sync-native-version.js  # Sync version to Android/iOS
│   └── utils.js                # Shared utilities
│
├── android/                    # Capacitor Android project
└── ios/                        # Capacitor iOS project
```

---

## Building Your Game

The template boots `src/game/hello-world.js` as the default scene; benchmark/demo scenes (Canvas 2D, PixiJS, Three.js) are reachable from the debug panel and exist to verify the engines work. To build your own game, replace the default scene:

### 2D Game (PixiJS)

Edit `src/game/index.js` (or replace `hello-world.js`) to launch your game on boot:

```javascript
import { Application, Sprite } from 'pixi.js';

export async function bootGame(canvas) {
  const app = new Application();
  await app.init({ canvas, resizeTo: window, background: '#1a1a2e' });

  // Your game code here
  const sprite = Sprite.from('hero.png');
  app.stage.addChild(sprite);

  app.ticker.add((ticker) => {
    // Game loop
  });
}
```

### 3D Game (Three.js)

```javascript
import * as THREE from 'three';

export function bootGame(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);

  // Your 3D scene here

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}
```

---

## CI/CD Pipelines

Both jobs are defined in `.gitlab-ci.yml` and are **manually triggered** from the GitLab UI.

Go to **CI/CD → Pipelines → Run pipeline**, then set the variables for the job you want to run.

### Build APK (`build-apk`)

Set these variables when running the pipeline:

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | `development`, `staging`, or `production` |
| `CLEAN_BUILD` | `false` | Set to `true` to wipe caches first |

The APK is saved as a pipeline artifact (retained 30 days).

### OTA Publish (`ota-publish`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `development` | `development`, `staging`, or `production` |
| `VERSION_BUMP` | `patch` | `none`, `patch`, `minor`, or `major` |

Builds the web bundle, zips it, and uploads to S3. The app checks for updates on launch.

To push the version bump commit back, add a **Project Access Token** with `write_repository` scope and set it as `CI_GIT_PUSH_TOKEN` in CI/CD variables.

### Required CI/CD Variables

Set these in **Settings → CI/CD → Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `S3_BUCKET` | Yes | S3 bucket name |
| `S3_REGION` | Yes | AWS region (e.g. `us-east-1`) |
| `S3_PREFIX` | Yes | Key prefix (e.g. `ota/production`) |
| `S3_ACCESS_KEY` | Yes | S3 access key ID |
| `S3_SECRET_KEY` | Yes | S3 secret access key |
| `S3_ENDPOINT` | No | Custom S3 endpoint (MinIO, R2) |
| `OTA_ENABLED` | No | Set to `true` to bake OTA URL into build |
| `OTA_BASE_URL` | No | CDN override for OTA manifest URL |
| `KEYSTORE_BASE64` | APK only | Base64-encoded keystore file |
| `KEYSTORE_ALIAS` | APK only | Keystore alias name |
| `KEYSTORE_PASSWORD` | APK only | Keystore password |
| `KEYSTORE_ALIAS_PASSWORD` | APK only | Key alias password |
| `CI_GIT_PUSH_TOKEN` | OTA only | Project Access Token for pushing version bumps |

To encode your keystore:

```bash
base64 -w 0 release.keystore > keystore.b64
# Copy contents into KEYSTORE_BASE64 variable
```

---

## Environment Configuration

Three environments are supported, each with its own `.env.<mode>` file:

| File | Mode | Use Case |
|------|------|----------|
| `.env.development` | `development` | Local dev, debug panel enabled |
| `.env.staging` | `staging` | Testing, debug panel enabled |
| `.env.production` | `production` | Release, debug disabled |

---

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server (localhost:3000) |
| `npm run preview` | Preview production build locally |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run build:staging` | Staging build |
| `npm run build:production` | Production build (alias of `build`) |
| `npm run apk:dev` | Build development APK |
| `npm run apk:staging` | Build staging APK |
| `npm run apk:production` | Build production APK |
| `npm run apk:dev:fresh` | Clean dev build + install on device |
| `npm run apk:staging:fresh` | Clean staging build + install on device |
| `npm run apk:production:fresh` | Clean production build + install on device |
| `npm run ota:dev` | Publish OTA to development |
| `npm run ota:staging` | Publish OTA to staging |
| `npm run ota:production` | Publish OTA to production |
| `npm run bump` | Interactive version bump |
| `npm run bump:patch` | Bump patch version (1.0.0 → 1.0.1) |
| `npm run bump:minor` | Bump minor version (1.0.0 → 1.1.0) |
| `npm run bump:major` | Bump major version (1.0.0 → 2.0.0) |
| `npm run cap:sync` | Sync web assets to native projects |

---

## Workflow Diagram

```
Clone repo
   │
   ▼
npm run dev            ← Prototype in browser (hot reload)
   │
   ▼
npm run apk:dev:fresh  ← Test on device
   │
   ▼
git push               ← Push to repository
   │
   ├──── GitLab CI ────→ "build-apk"     (manual trigger)
   │                         └─→ APK artifact download
   │
   └──── GitLab CI ────→ "ota-publish"   (manual trigger)
                             └─→ Bundle uploaded to S3
                             └─→ App auto-updates on next launch
```

---

## Troubleshooting

### `Cannot find module '@rollup/rollup-<platform>-<arch>'`

Rollup 4 ships a native parser binary per OS/arch as **optional dependencies** (`@rollup/rollup-darwin-arm64`, `@rollup/rollup-linux-x64-gnu`, `@rollup/rollup-win32-x64-msvc`, etc.). npm is supposed to install the one matching your platform automatically — but a [long-standing npm bug](https://github.com/npm/cli/issues/4828) sometimes leaves the wrong binary in `node_modules` after switching machines, switching branches, or having a stale lockfile authored on a different OS.

**Fix:**

```bash
rm -rf node_modules package-lock.json
npm install
```

This reinstalls the correct platform binary via npm's optional-deps resolution. **Never** add `@rollup/rollup-<platform>` to your own `package.json` as a direct dep — that pins one platform and silently breaks builds on the others. If you see it in a PR diff, remove it.

### Git SSH failures on `npm install`

The Wildlife platform SDK is a `git+ssh://` dependency. If `npm install` hangs or errors with "permission denied" / "repository not found":

- Verify your key is registered: `ssh -T git@git.topfreegames.com` should print a login banner.
- Check the dep URL in `package.json` matches exactly — version pin is after the `#` (e.g., `#v0.1.0`).
- First-time pulls trigger an SSH host-key prompt. If `npm install` runs non-interactively (CI), pre-seed `~/.ssh/known_hosts` or connect once manually.

### Gradle can't find `com.wildlifestudios:platform`

The Wildlife native Android SDK resolves from `https://artifactory.tfgco.com/artifactory/gradle-release-local`. If Gradle reports it can't find the artifact:

- Confirm the Artifactory repo block is still present in `android/build.gradle`.
- The shared `game-dev` credentials are baked in — works out of the box on most dev boxes. If your company account disables the shared creds, override: `./gradlew :app:assembleDebug -DartifactoryUsername=<you> -DartifactoryPassword=<token>`.
- Check you're on Wildlife VPN if required by your company policy.

### Android build fails with "minSdkVersion too low"

The template sets `minSdkVersion = 26` (Android 8.0). Lower than that is incompatible with the Wildlife native SDK's transitive deps (`ddmlib`, `protobuf-java`). Leave `android/variables.gradle` at 26 or higher.

---

## License

MIT
