# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Capacitor 7 game template for shipping HTML5 games (Canvas 2D, PixiJS, Three.js) as native Android/iOS apps. Includes OTA updates via S3, multi-environment builds, and GitLab CI/CD.

## Common Commands

```bash
npm run dev              # Vite dev server at localhost:3000
npm run build            # Production build (outputs to dist/)
npm run build:dev        # Development build
npm run build:staging    # Staging build
npm run cap:sync         # Sync web assets to native projects (Android/iOS)
npm run apk:dev          # Build development APK
npm run apk:dev:fresh    # Clean build + ADB install on connected device
```

## Architecture

### Boot Sequence (src/main.js)

The app follows a strict linear boot flow:
1. Load debug panel (development/staging only, guarded by `__DEBUG_ENABLED__`)
2. Show animated loader screen (`src/shell/loader.js`)
3. Check native platform via Capacitor
4. Run OTA update check (`src/ota/updater.js`) — downloads bundle.zip from S3 if available
5. Call `bootGame(canvas)` from `src/game/index.js`

If anything fails, `src/shell/error.js` displays a fatal error screen with a retry button.

### Scene System (src/game/)

`src/game/index.js` is the game entry point. It manages scene switching:
- Each scene is a function that receives a canvas and returns a cleanup function
- Scenes create their own canvas element fresh (prevents cross-scene state pollution)
- Demo scenes (canvas2d-demo, pixi-particles, three-demo, etc.) are benchmarks — the default scene is `hello-world.js`
- `GameLoop` class (`loop.js`) provides delta-time updates with configurable FPS capping (30/60/120)

### Quality Tier (3D / GPU-intensive games)

`src/game/render-scale.js` exposes a global quality tier (`LOW` / `MED` / `HIGH`) gating pixel ratio plus a profile of GPU-cost knobs: antialias, Three.js shadow type and map size, tone mapping, and fog. Post-processing (AA, tone mapping, fog) is enabled on HIGH only.

On a player's first launch the tier is auto-detected from `navigator.deviceMemory` (< 4 GB → LOW, 4–7 GB → MED, ≥ 8 GB → HIGH) and persisted to localStorage; later launches honor the persisted (or user-toggled) value. The auto-detect runs at module-init the first time `render-scale.js` is imported.

**You do not need to build a UI for tier selection.** The auto-detect + localStorage flow handles per-device defaults transparently — players never see a picker unless you choose to expose one. The RES button group in `src/game/menu.js` is part of the **benchmark suite** to demonstrate the cost ladder; it's not required code for a real game. Strip it (and the rest of the benchmark UI) when you ship. The minimum integration for a 3D PoC is just **import + read profile + apply on renderer construction** — no settings screen, no buttons, no listeners.

**For 3D / GPU-intensive games, resolve the tier before the first frame.** Otherwise a first-time player on a weak device sees a heavy default render until the first import of `render-scale.js` — a session-1 stutter that doesn't recover. The fix is one line: `import './game/render-scale.js'` at the top of `src/main.js`, before any scene loads. Then in your renderer setup, read `getQualityProfile()` and apply the relevant knobs — see `src/game/lit-scene.js` for the canonical Three.js wire-up (antialias on context creation, shadow type/size per light, tone mapping on renderer, fog gated on the scene).

Only `pixelRatio` is live-toggleable via `onRenderScaleChange` — wire this only if you later add an in-game settings menu with a quality picker. The other knobs are WebGL-context (antialias) or shader-recompile (shadow/tonemap/fog) settings, so they apply on scene mount.

For 2D-only games the lazy-import flow is fine — pixel ratio is the only knob that matters and it's applied cleanly on scene mount.

### OTA Update System (src/ota/updater.js)

Event-based updater using `@capgo/capacitor-updater`:
- **Production**: compares semantic versions from manifest.json
- **Dev/Staging**: compares SHA256 checksums (always updates on content change)
- Downloads bundle.zip asynchronously, applies on next app resume
- Falls back gracefully to current version on network error

### Build-Time Constants

Vite injects these via `define` in `vite.config.js` — use them as globals in source code:
- `__APP_NAME__`, `__APP_VERSION__`, `__BG_COLOR__`
- `__BUILD_MODE__` (development/staging/production)
- `__DEBUG_ENABLED__` (boolean)
- `__OTA_ENABLED__`, `__OTA_MANIFEST_URL__`

### Environment Configuration

Three `.env.<mode>` files control per-environment behavior:
- `.env.development` — debug panel on, local SDK paths (JAVA_HOME, ANDROID_HOME)
- `.env.staging` — debug panel on, staging OTA endpoint
- `.env.production` — debug off, production OTA with version comparison

Copy `.env.example` to `.env.development` for local setup.

### Debug Panel (src/debug/)

Development-only overlay with Console (captured logs), System info, and Profiler (FPS, frame time, JS heap + native Android memory). Completely excluded from production builds via `__DEBUG_ENABLED__` guard.

### Build Scripts (scripts/)

- `build-apk.js` — loads `.env.<mode>` → Vite build → `npx cap sync android` → Gradle APK (signed if `KEYSTORE_PATH` exists, debug otherwise) → copy to `releases/game-<mode>-v<ver>.apk` → optional `adb install` + launch with `--install`
- `sync-native-version.js` — propagates `package.json` version to Android/iOS native configs
- `utils.js` — shared helpers: env loading, version reads, `ensureAndroidEnv()` (asserts JAVA_HOME + ANDROID_HOME set in the env)

Project bootstrapping (rewriting placeholders like appId, bundleId, displayName) is handled by **cookiecutter** at template-render time, not by an in-repo script.

## Code Conventions

- ES modules throughout (`import`/`export`), no TypeScript
- Console logs prefixed with module name: `[Shell]`, `[OTA]`, `[DebugPanel]`
- camelCase for variables/functions, UPPER_CASE for constants
- Game scenes return cleanup functions for proper teardown
- CSS uses custom properties for theming (accent: `#00d4ff`, dark background palette)

## CI/CD

GitLab CI (`.gitlab-ci.yml`) with two manually-triggered jobs:
- **build-apk**: builds signed/debug APK artifact (requires `KEYSTORE_BASE64` for signing)
- **ota-publish**: uploads OTA bundle to S3 (requires S3 credentials + optional `CI_GIT_PUSH_TOKEN` for version bump commits)

## Asset Hub MCP

Copy `.mcp.json.example` to `.mcp.json` and fill in your key to give Claude Code live access to Wildlife game assets directly in this project.

```bash
cp .mcp.json.example .mcp.json
# edit .mcp.json: replace YOUR_ASSET_HUB_KEY with your actual key
# get a key at assets.wildlifestudios.com
```

| Tool | What it does |
|------|-------------|
| `list_projects` | List all Wildlife game projects (zooba, farm-day, sniper-3d, …) |
| `search_assets` | Search by name, tag, or type within a project |
| `get_thumbnail` | Return a base64 WebP preview — Claude renders it inline |
| `get_download_url` | Generate a 1-hour presigned S3 URL for the full-res file |
| `get_asset_bundle` | Fetch a bundle manifest with all included assets |
| `get_referenced_assets` | Walk asset references (model → textures → materials) |
| `list_tags` | Browse available tags per project |

Example prompts:
```
Search for the Zooba fox character texture and show me a thumbnail.
Find all audio assets tagged "ui" in the farm-day project.
Get the download URL for asset ID 3fa1a20a-086b-4645-b330-4057eb1d79f4.
```

## PixiJS Project

### Documentation
For PixiJS API reference, fetch:
https://pixijs.com/llms.txt

## Wildlife Platform SDK

Consumed via `@wildlife/platform-capacitor`, pinned to a git tag in `package.json` (currently `v0.1.1`) and resolved over git-SSH from `git+https://git.topfreegames.com/wazp/wildlife-platform-sdk-capacitor.git`. SSH access to `git.topfreegames.com` is a prerequisite for `npm install`.

- `src/main.js` calls `Platform().initialize({ appId: __APP_NAME__, environment: __BUILD_MODE__ })` at boot. Failure is caught — OTA + game boot proceed even if the SDK fails to initialize.
- Debug-panel surface: `src/debug/platform-sdk-info.js` populates the System tab via `collectPlatformSdkInfo()` and exposes two test triggers — `sendAnalyticsSmokeEvent()` (fires `debug_smoke_test`) and `sendSingularSmokeEvents()` (fires `smoke_test_event` + `smoke_test_revenue`). Wired to buttons in `debug-panel.js`. There is no separate smoke-test scene.
- Method-channel names match the Flutter plugin 1:1. For ergonomic usage prefer the `Platform()` singleton; raw channels are available via `WildlifePlatform.*`.
- **Singular API key/secret are hardcoded inside the plugin's native source** (`SingularService.kt` / `SingularService.swift`) — `wildlife_c2311ad7`. Nothing to configure at the app level; `Platform().initialize()` kicks off Singular as part of its setup chain.

### Android integration

- Wildlife Artifactory + Singular Maven repos in `android/build.gradle` (Artifactory creds are baked in for the shared `game-dev` account)
- `minSdkVersion = 26` in `android/variables.gradle` (required by SDK's `ddmlib`/`protobuf-java` transitive deps)
- `coreLibraryDesugaring`, Java 11 source/target, and META-INF license excludes in `android/app/build.gradle`
- Build host needs **JDK 21+** — Capacitor 7's `capacitor-android` module compiles at Java 21 even though the app module is Java 11. Set `JAVA_HOME` in `.env.<mode>` (Homebrew: `/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home`).

### iOS integration

- Two `source` lines in the Podfile: CocoaPods CDN + private spec repo `git@git.topfreegames.com:libs-frameworks/ios-podspecs.git` (required for `WildlifePlatform/Core` to resolve)
- `use_frameworks!` **plus** `use_modular_headers!` — the SDK is a static framework with mixed Swift/Obj-C; modular headers are mandatory for its generated bridging header to resolve
- Pods pulled in beyond stock Capacitor: `CapacitorStatusBar`, `WildlifePlatformCapacitor`
- `post_install` block:
  - Sets `ENABLE_USER_SCRIPT_SANDBOXING = NO` on the `WildlifePlatform` target so a shell-script build phase can run (Xcode warns about delayed `Copy Headers`; build still succeeds)
  - Adds a `Fix Swift Header Imports` phase that rewrites `#import <WildlifePlatform-Swift.h>` → `<WildlifePlatform/WildlifePlatform-Swift.h>` in the SDK's `.m`/`.mm` files. Defensive — `WildlifePlatform 1.52.1` already uses module-qualified imports, so the `sed` finds nothing and exits 0. Keep the hook for older/future SDK revisions.
- `Info.plist` sets `NSAppTransportSecurity → NSAllowsArbitraryLoads = true` and `NSUserTrackingUsageDescription` (Singular's iOS SDK requires the latter to attempt IDFA attribution). Note: no ATT prompt is wired in app code yet — Singular's `waitForTrackingAuthorizationWithTimeoutInterval = 60` will time out and attribution falls back to no-IDFA.
- `ios/App/Podfile.lock` is **gitignored** — regenerated per machine on `pod install`. Don't check it in.
- Manual code signing is pre-wired for team `94JU5975PM` (Texas PFCG Aplicativos) + `Development General Profile`. Devs without that team's Development cert + profile installed need to either switch to automatic signing in Xcode or override `DEVELOPMENT_TEAM` / `PROVISIONING_PROFILE_SPECIFIER`.