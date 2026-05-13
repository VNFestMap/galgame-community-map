/**
 * build-exe.mjs — Build Windows EXE for Galgame Map
 *
 * Steps:
 *   1. Clean and create www/ directory
 *   2. Copy frontend files (HTML/CSS/JS/images) to www/
 *   3. Replace relative API paths with absolute URLs
 *   4. Run electron-builder to produce installer + portable
 */

import { execSync } from 'child_process';
import { copyFileSync, readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const WWW = join(ROOT, 'www');
const DIST = join(ROOT, 'dist');

// ============================================================
// Step 1: Clean www/ and dist/
// ============================================================
for (const dir of [WWW, DIST]) {
  if (existsSync(dir)) {
    console.log(`Cleaning ${relative(ROOT, dir)}/ ...`);
    rmSync(dir, { recursive: true });
  }
}
mkdirSync(WWW, { recursive: true });

// ============================================================
// Step 2: Copy frontend files
// ============================================================
console.log('Copying frontend files...');

const ALLOWED_EXTENSIONS = new Set([
  '.html', '.js', '.css', '.json', '.ico', '.png', '.jpg',
  '.jpeg', '.gif', '.svg', '.webp', '.woff', '.woff2', '.ttf',
  '.eot', '.map'
]);

const ALLOWED_ROOT_FILES = new Set([
  'index.html', 'submit.html', 'submit_event.html', 'submit_publication.html',
  'favicon.ico'
]);

function isExcluded(relPath) {
  const topDir = relPath.split(/[/\\]/)[0];
  const excluded = ['www', 'node_modules', 'android', 'electron', '.git', 'api',
                    'admin', 'includes', 'data', 'uploads', 'scripts', 'docs',
                    'dist'];
  if (excluded.includes(topDir)) return true;
  return false;
}

function copyDir(src, dest) {
  if (!existsSync(src)) return;
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    const relPath = relative(ROOT, srcPath);

    if (entry.isDirectory()) {
      if (isExcluded(relPath)) continue;
      mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (ALLOWED_ROOT_FILES.has(relPath) || ALLOWED_EXTENSIONS.has(ext)) {
        mkdirSync(dest, { recursive: true });
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Copy allowed top-level directories explicitly
const TOP_DIRS = ['css', 'js', 'images', 'Galgame_events'];
for (const dir of TOP_DIRS) {
  copyDir(join(ROOT, dir), join(WWW, dir));
}

// Copy allowed root files
for (const file of ALLOWED_ROOT_FILES) {
  const src = join(ROOT, file);
  if (existsSync(src)) {
    copyFileSync(src, join(WWW, file));
  }
}
console.log('Frontend files copied.');

// ============================================================
// Step 3: Replace API paths with remote URL
// ============================================================
console.log('Replacing API paths with remote URL...');

const API_BASE = 'https://www.map.vnfest.top';

function replacePaths(filePath) {
  const ext = extname(filePath);
  if (!['.html', '.js'].includes(ext)) return;

  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Replace fetch/XHR paths: './api/xxx' -> 'https://www.map.vnfest.top/api/xxx'
  content = content.replace(
    /(['"`])\.\/(api\/|data\/)/g,
    `$1${API_BASE}/$2`
  );

  // Replace window.location.href redirects
  content = content.replace(
    /(location\.href\s*=\s*['"`])\.\/(api\/)/g,
    `$1${API_BASE}/$2`
  );

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`  replaced: ${relative(ROOT, filePath)}`);
  }
}

function walkDir(dir) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isFile()) {
      replacePaths(fullPath);
    } else if (entry.isDirectory()) {
      walkDir(fullPath);
    }
  }
}

walkDir(WWW);
console.log('API path replacement done.');

// ============================================================
// Step 4: Run electron-packager
// ============================================================
console.log('Building Windows EXE with electron-packager...');

execSync(
  'npx electron-packager . "Galgame同好会地图" ' +
  '--platform=win32 --arch=x64 ' +
  '--out=dist --overwrite ' +
  '--electron-version=33.4.11 ' +
  '--ignore="node_modules|api|admin|includes|data|uploads|scripts|docs|android|.git|dist|capacitor.config.ts|.capacitorignore"',
  { cwd: ROOT, stdio: 'inherit' }
);

console.log('\nWindows EXE build complete!');
console.log('Output: ' + DIST);
