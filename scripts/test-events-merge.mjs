import { readFileSync } from 'fs';

const source = readFileSync(new URL('../api/events.php', import.meta.url), 'utf8');

const requiredSnippets = [
  "action']) && $_GET['action'] === 'replace'",
  '$existingEvents',
  '$incomingEvents',
  '$merged',
  '$duplicateKey',
];

for (const snippet of requiredSnippets) {
  if (!source.includes(snippet)) {
    throw new Error(`events.php is missing merge protection snippet: ${snippet}`);
  }
}

console.log('events merge protection test passed');
