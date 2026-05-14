import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = join(__dirname, '..');

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function pageNameForClubKey(clubKey) {
  const clean = String(clubKey || '').trim().toLowerCase();
  if (!/^(china|japan)-\d+$/.test(clean)) {
    throw new Error(`Invalid club_key: ${clubKey}`);
  }
  return `${clean}.html`;
}

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function readClubMap(rootDir) {
  const china = readJson(join(rootDir, 'data/clubs.json'), { data: [] }).data || [];
  const japan = readJson(join(rootDir, 'data/clubs_japan.json'), { data: [] }).data || [];
  const map = new Map();

  for (const row of china) {
    map.set(`china-${row.id}`, { ...row, country: 'china' });
  }
  for (const row of japan) {
    map.set(`japan-${row.id}`, { ...row, country: 'japan' });
  }

  return map;
}

function validateContent(content, fileName) {
  if (!content || typeof content !== 'object') {
    throw new Error(`${fileName}: content must be an object`);
  }
  if (!content.club_key) {
    throw new Error(`${fileName}: missing club_key`);
  }
  if (!content.title) {
    throw new Error(`${fileName}: missing title`);
  }
  if (!content.summary) {
    throw new Error(`${fileName}: missing summary`);
  }
  if (!Array.isArray(content.sections) || content.sections.length === 0) {
    throw new Error(`${fileName}: sections must be a non-empty array`);
  }
}

function renderParagraphs(paragraphs) {
  return (paragraphs || [])
    .map((text) => `<p>${escapeHtml(text)}</p>`)
    .join('\n');
}

function renderInfobox(content, club) {
  const rows = {
    学校: club.school || content.infobox?.学校 || '',
    地区: club.province || club.prefecture || content.infobox?.地区 || '',
    类型: content.infobox?.类型 || (club.type === 'school' ? '高校同好会' : '同好会'),
    成立时间: club.created_at || content.infobox?.成立时间 || '',
    状态: content.infobox?.状态 || (Number(club.verified) ? '已认证' : '未认证'),
    ...content.infobox,
  };

  const body = Object.entries(rows)
    .filter(([, value]) => String(value || '').trim())
    .map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join('\n');

  return `<aside class="wiki-infobox">
    <div class="wiki-infobox-title">${escapeHtml(content.title)}</div>
    <table>${body}</table>
  </aside>`;
}

function renderToc(sections) {
  const items = sections
    .map((section, index) => `<li><a href="#section-${index + 1}">${escapeHtml(section.heading)}</a></li>`)
    .join('\n');
  return `<nav class="wiki-toc" aria-label="目录"><div class="wiki-toc-title">目录</div><ol>${items}</ol></nav>`;
}

function renderSections(sections) {
  return sections.map((section, index) => `
    <section class="wiki-section" id="section-${index + 1}">
      <h2>${escapeHtml(section.heading)}</h2>
      ${renderParagraphs(section.body)}
    </section>
  `).join('\n');
}

function renderReferences(references) {
  if (!Array.isArray(references) || references.length === 0) return '';
  const items = references.map((ref) => {
    const label = escapeHtml(ref.label || ref.url || '参考资料');
    const url = escapeHtml(ref.url || '#');
    return `<li><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></li>`;
  }).join('\n');
  return `<section class="wiki-section wiki-references"><h2>参考资料</h2><ol>${items}</ol></section>`;
}

function countryLabel(country) {
  return country === 'japan' ? '日本' : '中国';
}

function regionForClub(club, content) {
  return club.province || club.prefecture || content.infobox?.地区 || content.infobox?.地域 || '';
}

function displayNameForClub(club) {
  return club.display_name || club.name || club.school || '';
}

function safeImageUrl(value) {
  const url = String(value || '').trim();
  if (!url || /^\s*javascript:/i.test(url)) return '';
  return url;
}

function imageWidthPercent(value) {
  const width = Number.parseInt(value, 10);
  if (!Number.isFinite(width)) return 100;
  return Math.min(100, Math.max(25, width));
}

function imageOption(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function renderImages(images) {
  if (!Array.isArray(images) || images.length === 0) return '';
  const items = images.map((image) => {
    const src = safeImageUrl(image.url);
    if (!src) return '';
    const caption = image.caption ? `<figcaption>${escapeHtml(image.caption)}</figcaption>` : '';
    const width = imageWidthPercent(image.width_percent ?? 100);
    const align = imageOption(image.align || 'center', ['left', 'center', 'right'], 'center');
    const fit = imageOption(image.fit || 'cover', ['cover', 'contain'], 'cover');
    return `<figure class="wiki-image-card wiki-image-align-${align} wiki-image-fit-${fit}" style="--wiki-image-width:${width}%">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(image.alt || image.caption || '')}" loading="lazy">
      ${caption}
    </figure>`;
  }).filter(Boolean).join('\n');
  if (!items) return '';
  return `<section class="wiki-image-gallery" aria-label="图片">${items}</section>`;
}

function renderPage(content, club) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(content.title)} - 同好会维基</title>
  <link rel="stylesheet" href="../wiki.css">
</head>
<body>
  <header class="wiki-header">
    <a href="../../index.html">Galgame 同好会地图</a>
    <a href="../index.html">VNFest WIKI</a>
    <span>同好会维基</span>
  </header>
  <main class="wiki-page">
    <article class="wiki-article">
      <h1>${escapeHtml(content.title)}</h1>
      ${renderInfobox(content, club)}
      <p class="wiki-summary">${escapeHtml(content.summary)}</p>
      ${renderImages(content.images)}
      ${renderToc(content.sections)}
      ${renderSections(content.sections)}
      ${renderReferences(content.references)}
      <footer class="wiki-footer">最后更新：${escapeHtml(content.updated_at || '未记录')}</footer>
    </article>
  </main>
</body>
</html>
`;
}

function readLibraryIndex(rootDir) {
  const libraryDir = join(rootDir, 'wiki/library');
  mkdirSync(libraryDir, { recursive: true });
  const libraryIndex = readJson(join(libraryDir, 'index.json'), { docs: [] });
  const docs = Array.isArray(libraryIndex.docs) ? libraryIndex.docs : [];
  return docs
    .filter((doc) => doc && doc.title && doc.url)
    .map((doc) => ({
      title: String(doc.title || ''),
      url: String(doc.url || ''),
      category: String(doc.category || '文档'),
      description: String(doc.description || ''),
      updated_at: String(doc.updated_at || ''),
    }));
}

function readFeatureSlots(rootDir) {
  const slots = readJson(join(rootDir, 'wiki/feature-slots.json'), { slots: [] }).slots;
  const defaults = [
    { key: 'featured', title: '精选 Wiki', description: '后续可展示完成度较高或资料较完整的高校页面。', status: 'reserved' },
    { key: 'recent', title: '最近更新', description: '后续可按 updated_at 自动聚合近期修改内容。', status: 'reserved' },
    { key: 'todo', title: '待完善页面', description: '后续可根据摘要、章节、图片、参考资料完整度生成维护队列。', status: 'reserved' },
    { key: 'contributors', title: '贡献者与修订记录', description: '后续可接入编辑历史、审核记录和贡献统计。', status: 'reserved' },
    { key: 'templates', title: '模板中心', description: '后续可维护学校 Wiki、活动记录、社团介绍等内容模板。', status: 'reserved' },
    { key: 'taxonomy', title: '分类与标签', description: '后续可按国家、地区、学校类型、活动类型、作品方向组织内容。', status: 'reserved' },
  ];
  const list = Array.isArray(slots) && slots.length ? slots : defaults;
  return list.map((slot) => ({
    key: String(slot.key || ''),
    title: String(slot.title || ''),
    description: String(slot.description || ''),
    status: String(slot.status || 'reserved'),
    url: String(slot.url || ''),
  })).filter((slot) => slot.key && slot.title);
}

function renderWikiHome(manifest, libraryDocs, featureSlots) {
  const entries = Object.entries(manifest)
    .map(([clubKey, item]) => ({ club_key: clubKey, ...item }))
    .sort((a, b) => {
      if (a.country !== b.country) return String(a.country).localeCompare(String(b.country));
      if (a.region !== b.region) return String(a.region).localeCompare(String(b.region), 'zh-CN');
      return String(a.title).localeCompare(String(b.title), 'zh-CN');
    });

  const countries = [
    ['china', '中国'],
    ['japan', '日本'],
  ];

  const total = entries.length;
  const countryBlocks = countries.map(([country, label]) => {
    const countryEntries = entries.filter((item) => item.country === country);
    const regions = [...new Set(countryEntries.map((item) => item.region || '未标注地区'))];
    const regionBlocks = regions.map((region) => {
      const cards = countryEntries
        .filter((item) => (item.region || '未标注地区') === region)
        .map((item) => `<article class="wiki-index-card" data-search="${escapeHtml([
          item.title,
          item.club_name,
          item.school,
          item.region,
          item.summary,
        ].join(' ').toLowerCase())}">
          <div class="wiki-index-card-meta">${escapeHtml(item.school || item.club_name || '未标注学校')} · ${escapeHtml(item.updated_at || '未记录更新')}</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary || '该页面已建立，内容可继续补充。')}</p>
          <a href="${escapeHtml(item.url)}">进入页面</a>
        </article>`).join('\n');
      return `<section class="wiki-index-region">
        <h3>${escapeHtml(region)} <span>${countryEntries.filter((item) => (item.region || '未标注地区') === region).length}</span></h3>
        <div class="wiki-index-grid">${cards}</div>
      </section>`;
    }).join('\n');
    return `<section class="wiki-index-country" id="country-${country}">
      <div class="wiki-index-section-heading">
        <h2>${label}</h2>
        <span>${countryEntries.length} 个页面</span>
      </div>
      ${regionBlocks || '<p class="wiki-index-empty">暂无已生成的高校 Wiki 页面。</p>'}
    </section>`;
  }).join('\n');

  const libraryCards = libraryDocs.map((doc) => `<article class="wiki-library-card" data-search="${escapeHtml([
    doc.title,
    doc.category,
    doc.description,
  ].join(' ').toLowerCase())}">
    <div class="wiki-index-card-meta">${escapeHtml(doc.category)} · ${escapeHtml(doc.updated_at || '未记录更新')}</div>
    <h3>${escapeHtml(doc.title)}</h3>
    <p>${escapeHtml(doc.description || '文档库条目')}</p>
    <a href="${escapeHtml(doc.url)}">查看文档</a>
  </article>`).join('\n');

  const extensionCards = featureSlots.map((slot) => {
    const enabled = slot.status === 'active' && slot.url;
    return `<article class="wiki-extension-card${enabled ? '' : ' is-disabled'}">
      <div class="wiki-index-card-meta">${escapeHtml(enabled ? '已启用' : '预留模块')} · ${escapeHtml(slot.key)}</div>
      <h3>${escapeHtml(slot.title)}</h3>
      <p>${escapeHtml(slot.description)}</p>
      <a href="${escapeHtml(enabled ? slot.url : '#')}">${enabled ? '进入模块' : '等待后续开发'}</a>
    </article>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VNFest WIKI</title>
  <link rel="stylesheet" href="./wiki.css">
</head>
<body>
  <header class="wiki-header">
    <a href="../index.html">Galgame 同好会地图</a>
    <span>VNFest WIKI</span>
  </header>
  <main class="wiki-index-page">
    <section class="wiki-index-hero">
      <div>
        <p class="wiki-index-kicker">VNFest WIKI</p>
        <h1>高校同好会与资料文档库</h1>
        <p>集中索引已填写并生成的高校 Wiki 页面，同时预留文档库用于整理编写规范、运营资料、活动资料和公开教程。</p>
      </div>
      <div class="wiki-index-stats" aria-label="统计">
        <div><strong>${total}</strong><span>高校 Wiki</span></div>
        <div><strong>${libraryDocs.length}</strong><span>文档条目</span></div>
      </div>
    </section>

    <section class="wiki-index-tools" aria-label="检索">
      <input id="wikiIndexSearch" type="search" placeholder="搜索学校、同好会、地区或文档">
      <nav>
        <a href="#country-china">中国</a>
        <a href="#country-japan">日本</a>
        <a href="#wiki-library">文档库</a>
      </nav>
    </section>

    <section class="wiki-index-notice">
      <strong>索引规则</strong>
      <span>本页由生成器检测 wiki/content 中已填写的高校 Wiki 内容后生成。新增或保存学校 Wiki 后，重新运行生成器即可同步到这里。</span>
    </section>

    <section class="wiki-index-country" id="wiki-extensions">
      <div class="wiki-index-section-heading">
        <h2>后续功能预留</h2>
        <span>${featureSlots.length} 个扩展位</span>
      </div>
      <div class="wiki-extension-grid">${extensionCards}</div>
    </section>

    ${countryBlocks}

    <section class="wiki-index-country" id="wiki-library">
      <div class="wiki-index-section-heading">
        <h2>文档库</h2>
        <span>${libraryDocs.length} 个文档</span>
      </div>
      <div class="wiki-index-grid">
        ${libraryCards || '<p class="wiki-index-empty">暂无文档。可以在 wiki/library/index.json 中添加文档条目。</p>'}
      </div>
    </section>
  </main>
  <script>
  (function () {
    var input = document.getElementById('wikiIndexSearch');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.wiki-index-card, .wiki-library-card'));
    if (!input) return;
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        card.style.display = !keyword || card.getAttribute('data-search').indexOf(keyword) !== -1 ? '' : 'none';
      });
    });
  })();
  </script>
</body>
</html>
`;
}

export function generateWikiPages({ rootDir = DEFAULT_ROOT } = {}) {
  const contentDir = join(rootDir, 'wiki/content');
  const pagesDir = join(rootDir, 'wiki/pages');
  const manifestPath = join(rootDir, 'wiki/index.json');
  const homePath = join(rootDir, 'wiki/index.html');
  const clubMap = readClubMap(rootDir);
  const manifest = {};

  mkdirSync(contentDir, { recursive: true });
  mkdirSync(pagesDir, { recursive: true });

  const contentFiles = readdirSync(contentDir).filter((file) => file.endsWith('.json'));
  for (const file of contentFiles) {
    const content = readJson(join(contentDir, file), null);
    validateContent(content, file);
    const pageName = pageNameForClubKey(content.club_key);
    const club = clubMap.get(content.club_key) || {};
    const html = renderPage(content, club);
    writeFileSync(join(pagesDir, pageName), html, 'utf8');
    manifest[content.club_key] = {
      title: content.title,
      url: `./pages/${pageName}`,
      country: club.country || String(content.club_key).split('-')[0],
      country_label: countryLabel(club.country || String(content.club_key).split('-')[0]),
      school: club.school || content.infobox?.学校 || '',
      club_name: displayNameForClub(club),
      region: regionForClub(club, content),
      summary: content.summary || '',
      updated_at: content.updated_at || '',
    };
  }

  const libraryDocs = readLibraryIndex(rootDir);
  const featureSlots = readFeatureSlots(rootDir);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  writeFileSync(homePath, renderWikiHome(manifest, libraryDocs, featureSlots), 'utf8');
  return { count: contentFiles.length, manifest, libraryDocs, featureSlots };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = generateWikiPages();
  console.log(`Generated ${result.count} wiki page(s).`);
}
