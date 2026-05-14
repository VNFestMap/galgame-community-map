import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { escapeHtml, generateWikiPages, pageNameForClubKey } from './generate-wiki-pages.mjs';

const root = process.cwd();
const fixture = join(root, '.tmp-wiki-test');

rmSync(fixture, { recursive: true, force: true });
mkdirSync(join(fixture, 'wiki/content'), { recursive: true });
mkdirSync(join(fixture, 'wiki/pages'), { recursive: true });
mkdirSync(join(fixture, 'wiki/library'), { recursive: true });
mkdirSync(join(fixture, 'data'), { recursive: true });

writeFileSync(join(fixture, 'data/clubs.json'), JSON.stringify({
  success: true,
  data: [
    {
      id: 2,
      country: 'china',
      school: '安徽理工大学',
      province: '安徽',
      name: '安徽理工大学_安理二次元同好交流圈',
      display_name: '安理二次元同好交流圈',
      type: 'school',
      verified: 1,
      created_at: '2022-05-10'
    }
  ]
}, null, 2), 'utf8');

writeFileSync(join(fixture, 'data/clubs_japan.json'), JSON.stringify({
  success: true,
  data: []
}, null, 2), 'utf8');

writeFileSync(join(fixture, 'wiki/content/china-2.json'), JSON.stringify({
  club_key: 'china-2',
  title: '安理二次元同好交流圈',
  summary: '公开资料页 <script>alert(1)</script>',
  images: [
    { url: '../images/sample.png', caption: '示例图片', alt: '示例', width_percent: 50, align: 'right', fit: 'contain' }
  ],
  sections: [
    { heading: '概要', body: ['第一段', '第二段'] }
  ],
  references: [
    { label: '登记资料', url: '../index.html' }
  ],
  updated_at: '2026-05-14'
}, null, 2), 'utf8');

writeFileSync(join(fixture, 'wiki/library/index.json'), JSON.stringify({
  docs: [
    {
      title: '编写说明',
      url: './library/guide.html',
      category: '规范',
      description: '说明如何维护 Wiki 内容。',
      updated_at: '2026-05-15'
    }
  ]
}, null, 2), 'utf8');

if (escapeHtml('<b>"x"&</b>') !== '&lt;b&gt;&quot;x&quot;&amp;&lt;/b&gt;') {
  throw new Error('escapeHtml should escape dangerous HTML characters');
}

if (pageNameForClubKey('china-2') !== 'china-2.html') {
  throw new Error('pageNameForClubKey should create a stable HTML filename');
}

const result = generateWikiPages({ rootDir: fixture });
if (result.count !== 1) {
  throw new Error(`Expected 1 page, got ${result.count}`);
}

const pagePath = join(fixture, 'wiki/pages/china-2.html');
if (!existsSync(pagePath)) {
  throw new Error('Expected generated wiki HTML page');
}

const html = readFileSync(pagePath, 'utf8');
if (!html.includes('安理二次元同好交流圈')) {
  throw new Error('Generated page should contain the title');
}
if (html.includes('<script>alert(1)</script>')) {
  throw new Error('Generated page should escape content HTML');
}
if (!html.includes('&lt;script&gt;alert(1)&lt;/script&gt;')) {
  throw new Error('Generated page should preserve escaped text content');
}
if (!html.includes('wiki-image-gallery') || !html.includes('../images/sample.png')) {
  throw new Error('Generated page should render wiki images');
}
if (!html.includes('wiki-image-align-right') || !html.includes('wiki-image-fit-contain') || !html.includes('--wiki-image-width:50%')) {
  throw new Error('Generated page should render image display controls');
}

const manifest = JSON.parse(readFileSync(join(fixture, 'wiki/index.json'), 'utf8'));
if (manifest['china-2'].url !== './pages/china-2.html') {
  throw new Error('Manifest should point to the generated page URL');
}
if (manifest['china-2'].country !== 'china' || manifest['china-2'].region !== '安徽') {
  throw new Error('Manifest should include country and region metadata');
}

const homePath = join(fixture, 'wiki/index.html');
if (!existsSync(homePath)) {
  throw new Error('Expected generated VNFest WIKI index HTML');
}
const home = readFileSync(homePath, 'utf8');
if (!home.includes('VNFest WIKI') || !home.includes('高校同好会与资料文档库')) {
  throw new Error('Wiki index should render the VNFest WIKI home page');
}
if (!home.includes('文档库') || !home.includes('编写说明')) {
  throw new Error('Wiki index should render library documents');
}
if (!home.includes('后续功能预留') || !home.includes('精选 Wiki')) {
  throw new Error('Wiki index should render reserved feature slots');
}

rmSync(fixture, { recursive: true, force: true });
console.log('wiki generator tests passed');
