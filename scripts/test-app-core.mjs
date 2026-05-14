import { readFileSync } from 'fs';
import vm from 'vm';

const source = readFileSync(new URL('../js/app-core.js', import.meta.url), 'utf8');

function loadCore(protocol = 'https:', capacitor = false) {
  const sandbox = {
    window: {
      location: { protocol },
      matchMedia: () => ({ matches: false }),
      Capacitor: capacitor ? {} : undefined,
    },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: 'js/app-core.js' });
  return sandbox.window.AppCore;
}

const core = loadCore();
if (!core || !core.CONFIG || !core.Utils) {
  throw new Error('AppCore should expose CONFIG and Utils');
}

const html = core.Utils.escapeHTML('<b>"x"&</b>');
if (html !== '&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;') {
  throw new Error(`escapeHTML returned ${html}`);
}

const webUrl = core.Utils.resolveMediaUrl('uploads/avatar.png');
if (webUrl !== 'uploads/avatar.png') {
  throw new Error(`web media URL should stay relative, got ${webUrl}`);
}

const fileCore = loadCore('file:');
const bundledUrl = fileCore.Utils.resolveMediaUrl('./uploads/avatar.png');
if (bundledUrl !== 'https://www.map.vnfest.top/uploads/avatar.png') {
  throw new Error(`bundled media URL should become absolute, got ${bundledUrl}`);
}

console.log('app core tests passed');
