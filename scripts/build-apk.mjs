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
import { copyFileSync, readdirSync, mkdirSync, existsSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { rewriteFrontendPaths } from './frontend-paths.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const WWW = join(ROOT, 'www');
const ANDROID_DIR = join(ROOT, 'android');

console.log('Generating wiki pages...');
execSync('node scripts/generate-wiki-pages.mjs', { cwd: ROOT, stdio: 'inherit' });

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

const ALLOWED_ROOT_FILES = new Set([
  'index.html', 'submit.html', 'submit_event.html', 'submit_publication.html',
  'feedback.html', 'favicon.ico'
]);

function isExcluded(relPath) {
  const topDir = relPath.split(/[/\\]/)[0];
  // Exclude these top-level directories
  const excluded = ['www', 'node_modules', 'android', 'electron', '.git', 'api', 'admin',
                    'includes', 'data', 'uploads', 'scripts', 'docs', 'dist'];
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
console.log('Replacing API/data paths with remote URL...');
const replacedCount = rewriteFrontendPaths(WWW, ROOT);
console.log(`Replaced ${replacedCount} file(s).`);
console.log('API path replacement done.');

// ============================================================
// Step 4: Sync native Android metadata
// ============================================================
console.log('Syncing Android version and launcher icons...');

function getPackageVersion() {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return pkg.version || '1.0.0';
}

function versionToCode(version) {
  const [major = 0, minor = 0, patch = 0] = version
    .split(/[.-]/)
    .slice(0, 3)
    .map((part) => Number.parseInt(part, 10) || 0);
  return major * 10000 + minor * 100 + patch;
}

function syncAndroidVersion() {
  const versionName = getPackageVersion();
  const versionCode = versionToCode(versionName);
  const gradlePath = join(ANDROID_DIR, 'app', 'build.gradle');
  let gradle = readFileSync(gradlePath, 'utf8');
  gradle = gradle
    .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
    .replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  writeFileSync(gradlePath, gradle);
  console.log(`Android versionName=${versionName}, versionCode=${versionCode}`);
}

function syncAndroidIcons() {
  const iconSource = join(ROOT, 'images', 'logo.png');
  const mipmapDirs = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
  const iconNames = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'];

  for (const dir of mipmapDirs) {
    const destDir = join(ANDROID_DIR, 'app', 'src', 'main', 'res', dir);
    mkdirSync(destDir, { recursive: true });
    for (const iconName of iconNames) {
      copyFileSync(iconSource, join(destDir, iconName));
    }
  }
}

syncAndroidVersion();
syncAndroidIcons();
console.log('Android native metadata synced.');

// ============================================================
// Step 5: Run Capacitor sync
// ============================================================
console.log('Running capacitor sync...');
execSync('npx cap copy', { cwd: ROOT, stdio: 'inherit' });
execSync('npx cap sync', { cwd: ROOT, stdio: 'inherit' });
console.log('Capacitor sync done.');

// ============================================================
// Step 6: Build APK
// ============================================================
console.log('Building APK...');
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
