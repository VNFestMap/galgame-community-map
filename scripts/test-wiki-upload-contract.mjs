import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiSource = fs.readFileSync(path.join(root, 'api/wiki.php'), 'utf8');
const editorSource = fs.readFileSync(path.join(root, 'admin/wiki_editor.html'), 'utf8');

assert.match(apiSource, /action\s*===\s*['"]upload['"]/, 'wiki API should expose an upload action');
assert.match(apiSource, /wiki\/uploads/, 'wiki uploads should be stored under wiki/uploads');
assert.match(apiSource, /move_uploaded_file/, 'wiki upload should move the uploaded file safely');
assert.match(apiSource, /UPLOAD_ERR_OK/, 'wiki upload should check PHP upload errors');
assert.match(apiSource, /IMAGETYPE_WEBP/, 'wiki upload should allow WebP images');
assert.match(apiSource, /10\s*\*\s*1024\s*\*\s*1024/, 'wiki upload should allow images up to 10MB');
assert.match(apiSource, /width_percent/, 'wiki API should preserve image display width');
assert.match(apiSource, /align/, 'wiki API should preserve image alignment');
assert.match(apiSource, /fit/, 'wiki API should preserve image fit mode');

assert.match(editorSource, /type="file"/, 'wiki editor should include a file input');
assert.match(editorSource, /FormData/, 'wiki editor should submit uploads with FormData');
assert.match(editorSource, /action=upload/, 'wiki editor should call the wiki upload action');
assert.match(editorSource, /data-action="upload-image"/, 'each image row should have an upload button');
assert.match(editorSource, /WIKI_IMAGE_MAX_BYTES\s*=\s*10\s*\*\s*1024\s*\*\s*1024/, 'wiki editor should enforce a 10MB upload limit');
assert.match(editorSource, /data-field="width_percent"/, 'wiki editor should expose image width controls');
assert.match(editorSource, /data-field="align"/, 'wiki editor should expose image alignment controls');
assert.match(editorSource, /data-field="fit"/, 'wiki editor should expose image fit controls');

console.log('wiki upload contract tests passed');
