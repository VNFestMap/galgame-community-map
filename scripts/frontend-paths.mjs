import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { extname, join, relative } from 'path';

export const API_BASE = 'https://www.map.vnfest.top';

export function replaceFrontendPaths(filePath, rootDir) {
  const ext = extname(filePath);
  if (!['.html', '.js'].includes(ext)) return false;

  const original = readFileSync(filePath, 'utf-8');
  let content = original;

  content = content.replace(
    /(['"`])(?:\.\.\/|\.\/)+(api\/|data\/)/g,
    `$1${API_BASE}/$2`
  );

  if (content === original) return false;

  writeFileSync(filePath, content, 'utf-8');
  console.log(`  replaced: ${relative(rootDir, filePath)}`);
  return true;
}

export function rewriteFrontendPaths(dir, rootDir) {
  if (!existsSync(dir)) return 0;

  let replaced = 0;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isFile()) {
      if (replaceFrontendPaths(fullPath, rootDir)) {
        replaced++;
      }
    } else if (entry.isDirectory()) {
      replaced += rewriteFrontendPaths(fullPath, rootDir);
    }
  }
  return replaced;
}
