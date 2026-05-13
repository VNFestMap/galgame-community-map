/**
 * build-apk.mjs - Build APK for Galgame Map
 *
 * Steps:
 *   1. Clean and create www/ directory
 *   2. Copy frontend files (HTML/CSS/JS/images) to www/
 *   3. Replace relative API paths with absolute URLs in www/
 *   4. Run npx cap copy to sync frontend to Android project
 *   5. Run npx cap sync to sync Capacitor config
 *   6. Build APK via gradle assembleDebug
 */

import { execSync } from 'child_process';
import { copyFileSync, readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const WWW = join(ROOT, 'www');

// ============================================================
// Step 1: Clean and create www/ directory
// ============================================================
console.log('Cleaning www/ directory...');
if (existsSync(WWW)) {
  rmSync(WWW, { recursive: true });
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

const ALLOWED_TOP_LEVEL_DIRS = new Set([
  'css', 'js', 'images', 'Galgame_events'
]);

const ALLOWED_ROOT_FILES = new Set([
  'index.html', 'submit.html', 'submit_event.html', 'submit_publication.html',
  'favicon.ico'
]);

function isExcluded(relPath) {
  const topDir = relPath.split(/[/\\]/)[0];
  // Exclude these top-level directories
  const excluded = ['www', 'node_modules', 'android', '.git', 'api', 'admin',
                    'includes', 'data', 'uploads', 'scripts', 'docs'];
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
      if (ALLOWED_ROOT_FILES.has(relPath) || ALLOWED_EXTENSIONS.has(extname(entry.name))) {
        mkdirSync(dest, { recursive: true });
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyDir(ROOT, WWW);
console.log('Frontend files copied.');

// ============================================================
// Step 3: Replace API paths in JS/HTML files
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

  // Replace window.location.href redirects: './api/xxx' -> 'https://www.map.vnfest.top/api/xxx'
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
// Step 4: Run Capacitor sync
// ============================================================
console.log('Running capacitor sync...');
execSync('npx cap copy', { cwd: ROOT, stdio: 'inherit' });
execSync('npx cap sync', { cwd: ROOT, stdio: 'inherit' });
console.log('Capacitor sync done.');

// ============================================================
// Step 5: Build APK
// ============================================================
console.log('Building APK...');
const ANDROID_DIR = join(ROOT, 'android');
const env = { ...process.env, ANDROID_HOME: process.env.ANDROID_HOME || 'C:/Android' };

// Auto-detect JDK 17 (required for Gradle 7.x compatibility)
const JDK17_CANDIDATES = [
  'C:/Java/jdk-17.0.14+7',
  'C:/Program Files/Java/jdk-17',
  'C:/Program Files/Eclipse Adoptium/jdk-17',
];
for (const jdk of JDK17_CANDIDATES) {
  if (existsSync(jdk)) {
    env.JAVA_HOME = jdk;
    break;
  }
}

if (process.platform === 'win32') {
  execSync('gradlew.bat assembleDebug', { cwd: ANDROID_DIR, stdio: 'inherit', shell: 'cmd.exe', env });
} else {
  execSync('./gradlew assembleDebug', { cwd: ANDROID_DIR, stdio: 'inherit', env });
}

// ============================================================
// Done
// ============================================================
const apkPath = join(ANDROID_DIR, 'app/build/outputs/apk/debug/app-debug.apk');
console.log('\nAPK build complete!');
console.log('Output: ' + apkPath);
