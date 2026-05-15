<?php
// api/wiki.php - wiki content editor API

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../includes/auth.php';

$rootDir = dirname(__DIR__);
$contentDir = $rootDir . '/wiki/content';
$pagesDir = $rootDir . '/wiki/pages';
$indexFile = $rootDir . '/wiki/index.json';
$homeFile = $rootDir . '/wiki/index.html';
$uploadsDir = $rootDir . '/wiki/uploads';

function wikiJsonResponse(array $payload): void {
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit();
}

function wikiParseClubKey(string $clubKey): array {
    if (!preg_match('/^(china|japan)-([0-9]+)$/', $clubKey, $matches)) {
        wikiJsonResponse(['success' => false, 'message' => '无效的 wiki 标识']);
    }
    return [$matches[1], (int)$matches[2]];
}

function wikiReadJson(string $file, array $fallback): array {
    if (!file_exists($file)) return $fallback;
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : $fallback;
}

function wikiWriteJson(string $file, array $data): bool {
    $dir = dirname($file);
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    return file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) !== false;
}

function wikiEscape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function wikiSafeHref(string $value): string {
    $url = trim($value);
    if ($url === '') return '#';
    if (preg_match('/^\s*javascript:/i', $url)) return '#';
    return $url;
}

function wikiImageWidthPercent($value): int {
    $width = (int)$value;
    if ($width < 25) return 25;
    if ($width > 100) return 100;
    return $width;
}

function wikiImageOption($value, array $allowed, string $fallback): string {
    $value = trim((string)$value);
    return in_array($value, $allowed, true) ? $value : $fallback;
}

function wikiSectionHeadingLevel($value): int {
    return (int)$value === 3 ? 3 : 2;
}

function wikiPageName(string $clubKey): string {
    [$country, $id] = wikiParseClubKey($clubKey);
    return $country . '-' . $id . '.html';
}

function wikiCountryLabel(string $country): string {
    return $country === 'japan' ? '日本' : '中国';
}

function wikiDisplayName(array $club): string {
    return (string)($club['display_name'] ?? $club['name'] ?? $club['school'] ?? '');
}

function wikiNormalizeRegionName(string $value, string $country = 'china'): string {
    $value = trim($value);
    if ($value === '') return '';
    if ($country === 'japan') return $value;
    return preg_replace('/(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/u', '', $value) ?? $value;
}

function wikiRegionForClub(array $club, array $content): string {
    $country = (string)($club['country'] ?? explode('-', (string)($content['club_key'] ?? 'china'))[0] ?? 'china');
    return wikiNormalizeRegionName((string)($club['province'] ?? $club['prefecture'] ?? ($content['infobox']['地区'] ?? '') ?? ''), $country);
}

function wikiGetClub(string $country, int $clubId): array {
    $file = $country === 'japan' ? __DIR__ . '/../data/clubs_japan.json' : __DIR__ . '/../data/clubs.json';
    $json = wikiReadJson($file, ['data' => []]);
    foreach (($json['data'] ?? []) as $row) {
        if ((int)($row['id'] ?? 0) === $clubId) {
            $row['country'] = $country;
            return $row;
        }
    }
    return ['id' => $clubId, 'country' => $country];
}

function wikiDefaultContent(string $clubKey, array $club): array {
    $title = trim((string)($club['display_name'] ?? $club['name'] ?? $club['school'] ?? $clubKey));
    $region = trim((string)($club['province'] ?? $club['prefecture'] ?? ''));
    return [
        'club_key' => $clubKey,
        'title' => $title,
        'summary' => $title . ' 是登记在 Galgame 同好会地图中的高校同好会之一。',
        'infobox' => [
            '学校' => (string)($club['school'] ?? ''),
            '地区' => $region,
            '类型' => (($club['type'] ?? 'school') === 'school') ? '高校同好会' : '同好会',
            '成立时间' => (string)($club['created_at'] ?? ''),
            '状态' => !empty($club['verified']) ? '已认证' : '未认证',
        ],
        'sections' => [
            [
                'heading' => '概要',
                'level' => 2,
                'body' => ['本页面用于整理该同好会的公开资料、发展历史、活动记录和对外链接。'],
            ],
        ],
        'images' => [],
        'references' => [
            ['label' => 'Galgame 同好会地图登记资料', 'url' => '../../index.html'],
        ],
        'updated_at' => date('Y-m-d'),
    ];
}

function wikiNormalizeLocalizedContent(array $input): array {
    $title = trim((string)($input['title'] ?? ''));
    $summary = trim((string)($input['summary'] ?? ''));

    $infobox = [];
    if (isset($input['infobox']) && is_array($input['infobox'])) {
        foreach ($input['infobox'] as $key => $value) {
            $key = trim((string)$key);
            $value = trim((string)$value);
            if ($key !== '' && $value !== '') $infobox[$key] = $value;
        }
    }

    $sections = [];
    foreach (($input['sections'] ?? []) as $section) {
        if (!is_array($section)) continue;
        $heading = trim((string)($section['heading'] ?? ''));
        $bodyText = $section['body'] ?? [];
        if (is_string($bodyText)) {
            $bodyText = preg_split('/\r\n|\r|\n/', $bodyText);
        }
        $body = [];
        foreach ((array)$bodyText as $paragraph) {
            $paragraph = trim((string)$paragraph);
            if ($paragraph !== '') $body[] = $paragraph;
        }
        if ($heading !== '' && $body) {
            $sections[] = [
                'heading' => $heading,
                'level' => wikiSectionHeadingLevel($section['level'] ?? 2),
                'body' => $body,
            ];
        }
    }

    $hasContent = $title !== '' || $summary !== '' || !empty($infobox) || !empty($sections);
    if (!$hasContent) return [];

    $content = [];
    if ($title !== '') $content['title'] = $title;
    if ($summary !== '') $content['summary'] = $summary;
    if (!empty($infobox)) $content['infobox'] = $infobox;
    if (!empty($sections)) $content['sections'] = $sections;
    return $content;
}

function wikiNormalizeContent(array $input, string $clubKey, array $club): array {
    $default = wikiDefaultContent($clubKey, $club);
    $title = trim((string)($input['title'] ?? $default['title']));
    $summary = trim((string)($input['summary'] ?? $default['summary']));
    if ($title === '' || $summary === '') {
        wikiJsonResponse(['success' => false, 'message' => '标题和摘要不能为空']);
    }

    $infobox = [];
    if (isset($input['infobox']) && is_array($input['infobox'])) {
        foreach ($input['infobox'] as $key => $value) {
            $key = trim((string)$key);
            $value = trim((string)$value);
            if ($key !== '' && $value !== '') $infobox[$key] = $value;
        }
    }
    if (!$infobox) $infobox = $default['infobox'];

    $sections = [];
    foreach (($input['sections'] ?? []) as $section) {
        if (!is_array($section)) continue;
        $heading = trim((string)($section['heading'] ?? ''));
        $bodyText = $section['body'] ?? [];
        if (is_string($bodyText)) {
            $bodyText = preg_split('/\r\n|\r|\n/', $bodyText);
        }
        $body = [];
        foreach ((array)$bodyText as $paragraph) {
            $paragraph = trim((string)$paragraph);
            if ($paragraph !== '') $body[] = $paragraph;
        }
        if ($heading !== '' && $body) {
            $sections[] = [
                'heading' => $heading,
                'level' => wikiSectionHeadingLevel($section['level'] ?? 2),
                'body' => $body,
            ];
        }
    }
    if (!$sections) {
        wikiJsonResponse(['success' => false, 'message' => '至少需要一个章节，且章节正文不能为空']);
    }

    $images = [];
    foreach (($input['images'] ?? []) as $image) {
        if (!is_array($image)) continue;
        $url = wikiSafeHref((string)($image['url'] ?? ''));
        $caption = trim((string)($image['caption'] ?? ''));
        $alt = trim((string)($image['alt'] ?? ''));
        if ($url !== '#') {
            $images[] = [
                'url' => $url,
                'caption' => $caption,
                'alt' => $alt,
                'width_percent' => wikiImageWidthPercent($image['width_percent'] ?? 100),
                'aspect_ratio' => wikiImageOption($image['aspect_ratio'] ?? '16/10', ['auto', '16/9', '4/3', '1/1', '3/4', '16/10'], '16/10'),
                'align' => wikiImageOption($image['align'] ?? 'center', ['left', 'center', 'right'], 'center'),
                'fit' => wikiImageOption($image['fit'] ?? 'cover', ['cover', 'contain'], 'cover'),
            ];
        }
    }

    $references = [];
    foreach (($input['references'] ?? []) as $ref) {
        if (!is_array($ref)) continue;
        $label = trim((string)($ref['label'] ?? ''));
        $url = trim((string)($ref['url'] ?? ''));
        if ($label !== '' || $url !== '') {
            $references[] = ['label' => $label ?: $url, 'url' => wikiSafeHref($url)];
        }
    }

    $i18n = [];
    if (isset($input['i18n']['ja']) && is_array($input['i18n']['ja'])) {
        $ja = wikiNormalizeLocalizedContent($input['i18n']['ja']);
        if (!empty($ja)) $i18n['ja'] = $ja;
    }

    return [
        'club_key' => $clubKey,
        'title' => $title,
        'summary' => $summary,
        'infobox' => $infobox,
        'sections' => $sections,
        'images' => $images,
        'references' => $references,
        'i18n' => $i18n,
        'updated_at' => date('Y-m-d'),
    ];
}

function wikiRenderParagraphs(array $paragraphs): string {
    return implode("\n", array_map(function ($text) {
        return '<p>' . wikiEscape((string)$text) . '</p>';
    }, $paragraphs));
}

function wikiRenderImages(array $images): string {
    $items = '';
    foreach ($images as $image) {
        if (!is_array($image)) continue;
        $url = wikiSafeHref((string)($image['url'] ?? ''));
        if ($url === '#') continue;
        $caption = trim((string)($image['caption'] ?? ''));
        $alt = trim((string)($image['alt'] ?? $caption));
        $width = wikiImageWidthPercent($image['width_percent'] ?? 100);
        $ratio = wikiImageOption($image['aspect_ratio'] ?? '16/10', ['auto', '16/9', '4/3', '1/1', '3/4', '16/10'], '16/10');
        $align = wikiImageOption($image['align'] ?? 'center', ['left', 'center', 'right'], 'center');
        $fit = wikiImageOption($image['fit'] ?? 'cover', ['cover', 'contain'], 'cover');
        $ratioStyle = $ratio !== 'auto' ? '--wiki-image-ratio:' . $ratio . ';' : '--wiki-image-ratio:auto;';
        $items .= '<figure class="wiki-image-card wiki-image-align-' . $align . ' wiki-image-fit-' . $fit . '" style="--wiki-image-width:' . $width . '%;' . $ratioStyle . '">';
        $items .= '<img src="' . wikiEscape($url) . '" alt="' . wikiEscape($alt) . '" loading="lazy">';
        if ($caption !== '') {
            $items .= '<figcaption>' . wikiEscape($caption) . '</figcaption>';
        }
        $items .= "</figure>\n";
    }
    if ($items === '') return '';
    return '<section class="wiki-image-gallery" aria-label="图片">' . $items . '</section>';
}

function wikiLocalizedContent(array $content, string $lang): array {
    $localized = $lang === 'ja' && isset($content['i18n']['ja']) && is_array($content['i18n']['ja'])
        ? $content['i18n']['ja']
        : [];
    return array_merge($content, [
        'title' => (string)($localized['title'] ?? $content['title'] ?? ''),
        'summary' => (string)($localized['summary'] ?? $content['summary'] ?? ''),
        'infobox' => !empty($localized['infobox']) && is_array($localized['infobox']) ? $localized['infobox'] : ($content['infobox'] ?? []),
        'sections' => !empty($localized['sections']) && is_array($localized['sections']) ? $localized['sections'] : ($content['sections'] ?? []),
        'images' => !empty($localized['images']) && is_array($localized['images']) ? $localized['images'] : ($content['images'] ?? []),
        'references' => !empty($localized['references']) && is_array($localized['references']) ? $localized['references'] : ($content['references'] ?? []),
    ]);
}

function wikiRenderArticle(array $content, array $club, string $lang): string {
    $rows = $content['infobox'] ?? [];
    $infoboxRows = '';
    foreach ($rows as $key => $value) {
        if (trim((string)$value) === '') continue;
        $infoboxRows .= '<tr><th>' . wikiEscape((string)$key) . '</th><td>' . wikiEscape((string)$value) . "</td></tr>\n";
    }

    $toc = '';
    foreach (($content['sections'] ?? []) as $i => $section) {
        $toc .= '<li><a href="#section-' . ($i + 1) . '">' . wikiEscape((string)$section['heading']) . "</a></li>\n";
    }

    $sections = '';
    foreach (($content['sections'] ?? []) as $i => $section) {
        $level = wikiSectionHeadingLevel($section['level'] ?? 2);
        $sections .= '<section class="wiki-section" id="section-' . ($i + 1) . "\">\n";
        $sections .= '<h' . $level . '>' . wikiEscape((string)$section['heading']) . '</h' . $level . ">\n";
        $sections .= wikiRenderParagraphs($section['body'] ?? []);
        $sections .= "\n</section>\n";
    }

    $refs = '';
    foreach (($content['references'] ?? []) as $ref) {
        $label = wikiEscape((string)($ref['label'] ?? $ref['url'] ?? '参考资料'));
        $url = wikiEscape(wikiSafeHref((string)($ref['url'] ?? '#')));
        $refs .= '<li><a href="' . $url . '" target="_blank" rel="noopener noreferrer">' . $label . "</a></li>\n";
    }
    $references = $refs ? '<section class="wiki-section wiki-references"><h2>参考资料</h2><ol>' . $refs . '</ol></section>' : '';

    $title = wikiEscape((string)$content['title']);
    $summary = wikiEscape((string)$content['summary']);
    $updated = wikiEscape((string)($content['updated_at'] ?? '未记录'));
    $images = wikiRenderImages($content['images'] ?? []);

    return '<article class="wiki-article" data-wiki-lang="' . wikiEscape($lang) . '">
      <h1>' . $title . '</h1>
      <aside class="wiki-infobox">
        <div class="wiki-infobox-title">' . $title . '</div>
        <table>' . $infoboxRows . '</table>
      </aside>
      <p class="wiki-summary">' . $summary . '</p>
      ' . $images . '
      <nav class="wiki-toc" aria-label="目录"><div class="wiki-toc-title">目录</div><ol>' . $toc . '</ol></nav>
      ' . $sections . '
      ' . $references . '
      <footer class="wiki-footer">最后更新：' . $updated . '</footer>
    </article>';
}

function wikiRenderPage(array $content, array $club): string {
    $zhArticle = wikiRenderArticle(wikiLocalizedContent($content, 'zh'), $club, 'zh');
    $jaArticle = wikiRenderArticle(wikiLocalizedContent($content, 'ja'), $club, 'ja');
    $title = wikiEscape((string)$content['title']);

    return '<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>' . $title . ' - 同好会维基</title>
  <link rel="stylesheet" href="../wiki.css">
</head>
<body>
  <header class="wiki-header">
    <a href="../../index.html">Galgame 同好会地图</a>
    <a href="../index.html">VNFest WIKI</a>
    <span>同好会维基</span>
  </header>
  <main class="wiki-page">
    <nav class="wiki-language-switch" id="wikiLanguageSwitch" aria-label="Language"><a href="?lang=zh" data-wiki-switch-lang="zh">中文</a><a href="?lang=ja" data-wiki-switch-lang="ja">日本語</a></nav>
    ' . $zhArticle . '
    ' . $jaArticle . '
  </main>
  <script>(function(){var p=new URLSearchParams(window.location.search);var lang=p.get("lang")||localStorage.getItem("language")||"zh";lang=lang==="ja"?"ja":"zh";document.documentElement.lang=lang==="ja"?"ja":"zh-CN";document.querySelectorAll("[data-wiki-lang]").forEach(function(n){n.hidden=n.getAttribute("data-wiki-lang")!==lang;});document.querySelectorAll("[data-wiki-switch-lang]").forEach(function(n){n.classList.toggle("active",n.getAttribute("data-wiki-switch-lang")===lang);});})();</script>
</body>
</html>
';
}

function wikiReadLibraryDocs(string $rootDir): array {
    $data = wikiReadJson($rootDir . '/wiki/library/index.json', ['docs' => []]);
    $docs = [];
    foreach (($data['docs'] ?? []) as $doc) {
        if (!is_array($doc) || empty($doc['title']) || empty($doc['url'])) continue;
        $docs[] = [
            'title' => (string)$doc['title'],
            'url' => (string)$doc['url'],
            'category' => (string)($doc['category'] ?? '文档'),
            'description' => (string)($doc['description'] ?? ''),
            'updated_at' => (string)($doc['updated_at'] ?? ''),
        ];
    }
    return $docs;
}

function wikiReadFeatureSlots(string $rootDir): array {
    $data = wikiReadJson($rootDir . '/wiki/feature-slots.json', ['slots' => []]);
    $slots = [];
    foreach (($data['slots'] ?? []) as $slot) {
        if (!is_array($slot) || empty($slot['key']) || empty($slot['title'])) continue;
        $slots[] = [
            'key' => (string)$slot['key'],
            'title' => (string)$slot['title'],
            'description' => (string)($slot['description'] ?? ''),
            'status' => (string)($slot['status'] ?? 'reserved'),
            'url' => (string)($slot['url'] ?? ''),
        ];
    }
    return $slots;
}

function wikiRenderIndexHome(array $manifest, array $libraryDocs, array $featureSlots): string {
    uasort($manifest, function ($a, $b) {
        $left = (string)($a['country'] ?? '') . (string)($a['region'] ?? '') . (string)($a['title'] ?? '');
        $right = (string)($b['country'] ?? '') . (string)($b['region'] ?? '') . (string)($b['title'] ?? '');
        return strcmp($left, $right);
    });
    $countries = ['china' => '中国', 'japan' => '日本'];
    $countryHtml = '';
    foreach ($countries as $country => $label) {
        $items = array_filter($manifest, function ($item) use ($country) {
            return ($item['country'] ?? '') === $country;
        });
        $regions = [];
        foreach ($items as $item) {
            $regions[(string)($item['region'] ?? '未标注地区')][] = $item;
        }
        $regionHtml = '';
        foreach ($regions as $region => $rows) {
            $cards = '';
            foreach ($rows as $item) {
                $search = strtolower(implode(' ', [$item['title'] ?? '', $item['club_name'] ?? '', $item['school'] ?? '', $item['region'] ?? '', $item['summary'] ?? '']));
                $cards .= '<article class="wiki-index-card" data-search="' . wikiEscape($search) . '">' .
                    '<div class="wiki-index-card-meta">' . wikiEscape((string)($item['school'] ?? '未标注学校')) . ' · ' . wikiEscape((string)($item['updated_at'] ?? '未记录更新')) . '</div>' .
                    '<h3>' . wikiEscape((string)($item['title'] ?? '未命名页面')) . '</h3>' .
                    '<p>' . wikiEscape((string)($item['summary'] ?? '该页面已建立，内容可继续补充。')) . '</p>' .
                    '<a href="' . wikiEscape((string)($item['url'] ?? '#')) . '">进入页面</a>' .
                    '</article>';
            }
            $regionHtml .= '<section class="wiki-index-region"><h3>' . wikiEscape($region) . ' <span>' . count($rows) . '</span></h3><div class="wiki-index-grid">' . $cards . '</div></section>';
        }
        $countryHtml .= '<section class="wiki-index-country" id="country-' . $country . '"><div class="wiki-index-section-heading"><h2>' . $label . '</h2><span>' . count($items) . ' 个页面</span></div>' . ($regionHtml ?: '<p class="wiki-index-empty">暂无已生成的高校 Wiki 页面。</p>') . '</section>';
    }

    $slotHtml = '';
    foreach ($featureSlots as $slot) {
        $enabled = ($slot['status'] ?? '') === 'active' && !empty($slot['url']);
        $slotHtml .= '<article class="wiki-extension-card' . ($enabled ? '' : ' is-disabled') . '">' .
            '<div class="wiki-index-card-meta">' . ($enabled ? '已启用' : '预留模块') . ' · ' . wikiEscape((string)$slot['key']) . '</div>' .
            '<h3>' . wikiEscape((string)$slot['title']) . '</h3>' .
            '<p>' . wikiEscape((string)$slot['description']) . '</p>' .
            '<a href="' . wikiEscape($enabled ? (string)$slot['url'] : '#') . '">' . ($enabled ? '进入模块' : '等待后续开发') . '</a>' .
            '</article>';
    }

    $libraryHtml = '';
    foreach ($libraryDocs as $doc) {
        $search = strtolower(implode(' ', [$doc['title'], $doc['category'], $doc['description']]));
        $libraryHtml .= '<article class="wiki-library-card" data-search="' . wikiEscape($search) . '">' .
            '<div class="wiki-index-card-meta">' . wikiEscape($doc['category']) . ' · ' . wikiEscape($doc['updated_at'] ?: '未记录更新') . '</div>' .
            '<h3>' . wikiEscape($doc['title']) . '</h3>' .
            '<p>' . wikiEscape($doc['description'] ?: '文档库条目') . '</p>' .
            '<a href="' . wikiEscape($doc['url']) . '">查看文档</a>' .
            '</article>';
    }

    return '<!DOCTYPE html>
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
      <div><p class="wiki-index-kicker">VNFest WIKI</p><h1>高校同好会与资料文档库</h1><p>集中索引已填写并生成的高校 Wiki 页面，同时预留文档库用于整理编写规范、运营资料、活动资料和公开教程。</p></div>
      <div class="wiki-index-stats"><div><strong>' . count($manifest) . '</strong><span>高校 Wiki</span></div><div><strong>' . count($libraryDocs) . '</strong><span>文档条目</span></div></div>
    </section>
    <section class="wiki-index-tools"><input id="wikiIndexSearch" type="search" placeholder="搜索学校、同好会、地区或文档"><nav><a href="#country-china">中国</a><a href="#country-japan">日本</a><a href="#wiki-library">文档库</a></nav></section>
    <section class="wiki-index-notice"><strong>索引规则</strong><span>本页由后台保存或生成器检测 wiki/content 中已填写的高校 Wiki 内容后生成。</span></section>
    <section class="wiki-index-country" id="wiki-extensions"><div class="wiki-index-section-heading"><h2>后续功能预留</h2><span>' . count($featureSlots) . ' 个扩展位</span></div><div class="wiki-extension-grid">' . $slotHtml . '</div></section>
    ' . $countryHtml . '
    <section class="wiki-index-country" id="wiki-library"><div class="wiki-index-section-heading"><h2>文档库</h2><span>' . count($libraryDocs) . ' 个文档</span></div><div class="wiki-index-grid">' . ($libraryHtml ?: '<p class="wiki-index-empty">暂无文档。可以在 wiki/library/index.json 中添加文档条目。</p>') . '</div></section>
  </main>
  <script>(function(){var input=document.getElementById("wikiIndexSearch");var cards=Array.prototype.slice.call(document.querySelectorAll(".wiki-index-card,.wiki-library-card"));if(!input)return;input.addEventListener("input",function(){var keyword=input.value.trim().toLowerCase();cards.forEach(function(card){card.style.display=!keyword||card.getAttribute("data-search").indexOf(keyword)!==-1?"":"none";});});})();</script>
</body>
</html>';
}

function wikiGeneratePageAndIndex(string $clubKey, array $content, array $club, string $rootDir, string $contentDir, string $pagesDir, string $indexFile, string $homeFile): array {
    if (!is_dir($pagesDir)) mkdir($pagesDir, 0755, true);
    $pageName = wikiPageName($clubKey);
    file_put_contents($pagesDir . '/' . $pageName, wikiRenderPage($content, $club), LOCK_EX);

    $manifest = [];
    if (is_dir($contentDir)) {
        foreach (glob($contentDir . '/*.json') ?: [] as $file) {
            $row = wikiReadJson($file, []);
            if (empty($row['club_key']) || empty($row['title'])) continue;
            $name = wikiPageName((string)$row['club_key']);
            [$rowCountry, $rowId] = wikiParseClubKey((string)$row['club_key']);
            $rowClub = wikiGetClub($rowCountry, $rowId);
            $rowManifest = [
                'title' => (string)$row['title'],
                'url' => './pages/' . $name,
                'country' => $rowCountry,
                'country_label' => wikiCountryLabel($rowCountry),
                'school' => (string)($rowClub['school'] ?? ($row['infobox']['学校'] ?? '')),
                'club_name' => wikiDisplayName($rowClub),
                'region' => wikiRegionForClub($rowClub, $row),
                'summary' => (string)($row['summary'] ?? ''),
                'updated_at' => (string)($row['updated_at'] ?? ''),
            ];
            if (!empty($row['i18n']['ja']) && is_array($row['i18n']['ja'])) {
                $rowManifest['i18n'] = [
                    'ja' => [
                        'title' => (string)($row['i18n']['ja']['title'] ?? $row['title'] ?? ''),
                        'summary' => (string)($row['i18n']['ja']['summary'] ?? $row['summary'] ?? ''),
                        'region' => (string)($row['i18n']['ja']['region'] ?? ($row['i18n']['ja']['infobox']['Region'] ?? ($row['i18n']['ja']['infobox']['地域'] ?? ''))),
                    ],
                ];
            }
            $manifest[$row['club_key']] = $rowManifest;
        }
    }
    wikiWriteJson($indexFile, $manifest);
    if (!file_exists($homeFile)) {
        file_put_contents($homeFile, wikiRenderIndexHome($manifest, wikiReadLibraryDocs($rootDir), wikiReadFeatureSlots($rootDir)), LOCK_EX);
    }

    return ['page_url' => './wiki/pages/' . $pageName, 'manifest' => $manifest];
}

function wikiUploadImage(string $clubKey, string $uploadsDir): void {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        wikiJsonResponse(['success' => false, 'message' => '上传失败，请重新选择图片']);
    }

    $file = $_FILES['image'];
    if ($file['size'] > 10 * 1024 * 1024) {
        wikiJsonResponse(['success' => false, 'message' => '图片大小不能超过 10MB']);
    }

    $detectedType = null;
    if (function_exists('exif_imagetype')) {
        $detectedType = @exif_imagetype($file['tmp_name']);
    } elseif (function_exists('getimagesize')) {
        $info = @getimagesize($file['tmp_name']);
        $detectedType = $info[2] ?? null;
    } else {
        $extMap = [
            'jpg' => IMAGETYPE_JPEG,
            'jpeg' => IMAGETYPE_JPEG,
            'png' => IMAGETYPE_PNG,
            'gif' => IMAGETYPE_GIF,
            'webp' => IMAGETYPE_WEBP,
        ];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $detectedType = $extMap[$ext] ?? null;
    }

    $allowedTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP];
    if (!in_array($detectedType, $allowedTypes, true)) {
        wikiJsonResponse(['success' => false, 'message' => '仅支持 JPEG、PNG、GIF、WebP 格式']);
    }

    $extMap = [
        IMAGETYPE_JPEG => 'jpg',
        IMAGETYPE_PNG => 'png',
        IMAGETYPE_GIF => 'gif',
        IMAGETYPE_WEBP => 'webp',
    ];
    $ext = $extMap[$detectedType];
    $dir = $uploadsDir . '/' . $clubKey;
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $fileBase = date('YmdHis') . '_' . bin2hex(random_bytes(4));
    $destPath = $dir . '/' . $fileBase . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $destPath)) {
        wikiJsonResponse(['success' => false, 'message' => '图片保存失败']);
    }

    $imageUrl = '../uploads/' . $clubKey . '/' . $fileBase . '.' . $ext . '?t=' . time();
    wikiJsonResponse([
        'success' => true,
        'message' => '图片上传成功',
        'image_url' => $imageUrl,
    ]);
}

$action = $_GET['action'] ?? '';
$clubKey = trim((string)($_GET['club_key'] ?? ''));
if ($clubKey === '') {
    $inputForKey = json_decode(file_get_contents('php://input'), true);
    if (is_array($inputForKey)) $clubKey = trim((string)($inputForKey['club_key'] ?? ''));
}
[$country, $clubId] = wikiParseClubKey($clubKey);

$user = requireLogin();
if (!canManageClubInCountry($user, $clubId, $country)) {
    http_response_code(403);
    wikiJsonResponse(['success' => false, 'message' => '无权编辑该同好会维基']);
}

$club = wikiGetClub($country, $clubId);
$contentFile = $contentDir . '/' . $clubKey . '.json';

if ($action === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $exists = file_exists($contentFile);
    $content = $exists ? wikiReadJson($contentFile, []) : wikiDefaultContent($clubKey, $club);
    wikiJsonResponse([
        'success' => true,
        'exists' => $exists,
        'club' => $club,
        'content' => $content,
        'page_url' => './wiki/pages/' . wikiPageName($clubKey),
    ]);
}

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    wikiUploadImage($clubKey, $uploadsDir);
}

if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        wikiJsonResponse(['success' => false, 'message' => '无效数据']);
    }
    $content = wikiNormalizeContent($input, $clubKey, $club);
    if (!wikiWriteJson($contentFile, $content)) {
        wikiJsonResponse(['success' => false, 'message' => '保存内容失败']);
    }
    $generated = wikiGeneratePageAndIndex($clubKey, $content, $club, $rootDir, $contentDir, $pagesDir, $indexFile, $homeFile);
    wikiJsonResponse([
        'success' => true,
        'message' => '维基内容已保存',
        'content' => $content,
        'page_url' => $generated['page_url'],
    ]);
}

wikiJsonResponse(['success' => false, 'message' => '不支持的操作']);
