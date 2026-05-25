// scripts/deploy-pages.js — one-shot GitHub Pages deploy.
//
// Wraps the three steps we need every time:
//   1. Build production with base=/chaos37/ (with MSYS_NO_PATHCONV=1 so Git
//      Bash on Windows doesn't mangle the absolute path into
//      C:/Program Files/Git/chaos37/ — the bug that killed the first deploy)
//   2. Sync the built dist/ into the orphan `gh-pages` branch (preserves
//      gh-pages history, so each deploy = 1 commit)
//   3. Force-push to github.com/fernandopepe-wls/chaos37 → gh-pages
//
// Live URL: https://fernandopepe-wls.github.io/chaos37/
//
// Usage: npm run deploy:pages
//        (optional `-- "commit message"` to override default message)
//
// Requirements:
//   - Git remote `github` configured (pointing to chaos37 repo)
//   - gh CLI authenticated with write access to the repo
//   - Working tree of dist/ doesn't matter — fully overwritten each run

import { execSync, spawnSync } from 'child_process';
import { resolve, join } from 'path';
import { existsSync } from 'fs';

const REPO_URL    = 'https://github.com/fernandopepe-wls/chaos37.git';
const PAGES_BASE  = '/chaos37/';
const BRANCH      = 'gh-pages';
const SITE_URL    = 'https://fernandopepe-wls.github.io/chaos37/';

const customMsg = process.argv.slice(2).join(' ').trim();
const commitMsg = customMsg || `deploy: ${new Date().toISOString()}`;

function run(cmd, opts = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function runIn(cwd, cmd, opts = {}) {
  return run(cmd, { cwd, ...opts });
}

// ---- 1. Build production ----
console.log('\n[1/3] Building production with base=' + PAGES_BASE);
// MSYS_NO_PATHCONV=1 disables Git Bash's auto-translation of /chaos37/
// into a Windows path. Set in env (not prefix) so it works across shells.
const buildResult = spawnSync(
  'npx',
  ['vite', 'build', '--mode', 'production', `--base=${PAGES_BASE}`],
  {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  }
);
if (buildResult.status !== 0) {
  console.error('\n✗ Build failed');
  process.exit(buildResult.status || 1);
}

const distDir = resolve('dist');
if (!existsSync(distDir)) {
  console.error('✗ dist/ not found after build');
  process.exit(1);
}

// ---- 2. Sync dist/ to gh-pages branch ----
console.log('\n[2/3] Preparing dist/ as gh-pages branch');

// Drop a .nojekyll so GitHub Pages skips Jekyll processing (preserves
// underscore-prefixed files and serves everything literally).
execSync(`touch "${join(distDir, '.nojekyll')}"`, { stdio: 'inherit' });

const distGit = join(distDir, '.git');
if (!existsSync(distGit)) {
  // First-time: init orphan repo inside dist
  runIn(distDir, `git init -b ${BRANCH} -q`);
  runIn(distDir, `git remote add origin ${REPO_URL}`);
} else {
  // Already a git repo — ensure remote is correct
  try {
    runIn(distDir, `git remote set-url origin ${REPO_URL}`);
  } catch {
    runIn(distDir, `git remote add origin ${REPO_URL}`);
  }
}

runIn(distDir, 'git add -A');
// `--allow-empty` so re-running with no changes still works (no-op push)
runIn(distDir, `git commit --allow-empty -q -m "${commitMsg.replace(/"/g, '\\"')}"`);

// ---- 3. Push ----
console.log('\n[3/3] Force-pushing to ' + REPO_URL + ' (' + BRANCH + ')');
runIn(distDir, `git push -f origin ${BRANCH}`);

console.log('\n✔ Deployed.');
console.log('  Pages will rebuild in ~30-60s.');
console.log('  Live: ' + SITE_URL);
