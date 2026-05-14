import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const editorPath = path.join(rootDir, 'admin', 'wiki_editor.html');
const source = fs.readFileSync(editorPath, 'utf8');

function assertContains(needle, description) {
  if (!source.includes(needle)) {
    throw new Error(`wiki editor contract failed: missing ${description}`);
  }
}

assertContains('wikiEditorDraft:', 'per-club local draft key');
assertContains('beforeunload', 'unsaved-change warning');
assertContains('renderPreview', 'live preview renderer');
assertContains('previewPane', 'preview pane markup');
assertContains('insertTemplateBtn', 'basic section template action');
assertContains('exportJsonBtn', 'JSON export action');
assertContains('importJsonBtn', 'JSON import action');
assertContains('data-action="duplicate-row"', 'duplicate row action');
assertContains('restoreDraftBtn', 'draft restore action');
assertContains('clearDraftBtn', 'draft clear action');

console.log('wiki editor tool contract ok');
