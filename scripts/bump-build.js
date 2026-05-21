#!/usr/bin/env node
// Derive build identity from git and stamp it into native configs.
//
// versionCode  = total commit count on the current branch — monotonic +
//                reproducible. Resets the legacy "MAJOR*10000+MINOR*100+PATCH"
//                scheme that produced collisions like 1.0.0=10000 forever.
// versionName  = "<package.json version>.<commitCount>"  e.g. "0.1.0.42"
//                Clean semver-style, no SHA suffix. The full SHA + branch
//                + dirty flag still go into scripts/.build-info.json for
//                anyone who needs the precise commit.
//
// Also writes scripts/.build-info.json so vite.config.js can inject the
// build identity into the JS bundle (used by the diagnostic overlay).
//
// Runs from `npm run prebuild` (via package.json) — fires before every
// vite build, so APKs / IPAs picked up by Firebase Distribution always
// carry a unique, traceable build code.

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { syncNativeVersion } from './sync-native-version.js';

function git(args, fallback) {
  try {
    return execSync(`git ${args}`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf-8'));
const version = pkg.version || '0.0.0';

// git rev-list --count HEAD = total commit count from initial commit to HEAD.
// Monotonic; collision-free across the lifetime of a branch's history.
const commitCount = parseInt(git('rev-list --count HEAD', '0'), 10) || 0;
const shortSha    = git('rev-parse --short HEAD', 'nogit');
const branch      = git('rev-parse --abbrev-ref HEAD', 'unknown');
const dirty       = git('status --porcelain', '').length > 0;
const builtAt     = new Date().toISOString();

const versionCode = commitCount > 0 ? commitCount : 1;
const versionNameSuffix = `.${commitCount}`;

console.log(`bump-build → version ${version}${versionNameSuffix}  code ${versionCode}`);

syncNativeVersion(version, { versionCode, versionNameSuffix });

// Stamp build info for vite.define and runtime display.
const buildInfo = {
  version,
  versionCode,
  versionName: version + versionNameSuffix,
  commitCount,
  shortSha,
  branch,
  dirty,
  builtAt,
};
writeFileSync(resolve('scripts/.build-info.json'), JSON.stringify(buildInfo, null, 2));
console.log(`  scripts/.build-info.json written`);
