import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const appSource = fs.readFileSync(path.join(process.cwd(), 'js/app.js'), 'utf8');
const managerSource = fs.readFileSync(path.join(process.cwd(), 'admin/club_manager.html'), 'utf8');

assert.match(appSource, /function\s+openClubEditFromUrl\s*\(/, 'main page should handle edit_club deep links');
assert.match(appSource, /URLSearchParams\(window\.location\.search\)/, 'deep link handler should read URL parameters');
assert.match(appSource, /params\.get\(['"]edit_club['"]\)/, 'deep link handler should read edit_club');
assert.match(appSource, /State\.japanRows/, 'deep link handler should support Japan clubs');
assert.match(appSource, /openEditPanel\(club,\s*false\)/, 'deep link handler should open the edit panel');
assert.match(appSource, /deleteClub[\s\S]*clubs_japan\.php/, 'delete flow should use Japan API for Japan clubs');
assert.match(appSource, /deleteClub[\s\S]*credentials:\s*['"]same-origin['"]/, 'delete flow should include credentials');

assert.match(managerSource, /let\s+allClubOptions\s*=\s*\[\]/, 'manager should keep all club options for super admin');
assert.match(managerSource, /managedClubs\s*=\s*\[\{\s*club_id:\s*0[\s\S]*\.concat\(allClubOptions\)/, 'super admin should be able to select real clubs');
assert.match(managerSource, /sel\.selectedIndex\s*=\s*0/, 'single managed club should select the first real option');
assert.match(managerSource, /selectedCountry\s*=\s*managedClubs\[0\]\.country/, 'single managed club should sync country');
assert.match(managerSource, /window\.location\.href\s*=\s*['"]\.\.\/index\.html\?edit_club=/, 'manager edit should navigate without popup blockers');

console.log('club edit contract tests passed');
