<?php
// api/bangumi_proxy.php - Bangumi API 代理（避免跨域 + 缓存）
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

// 缓存目录
$cacheDir = __DIR__ . '/../data/cache/bangumi';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

/**
 * 带缓存的 Bangumi API 请求
 */
function bangumiFetch(string $url, string $cacheKey, int $ttl): array
{
    $cacheDir = __DIR__ . '/../data/cache/bangumi';
    $cacheFile = $cacheDir . '/' . $cacheKey . '.json';

    // 命中缓存
    if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $ttl) {
        return json_decode(file_get_contents($cacheFile), true) ?: [];
    }

    $context = stream_context_create(['http' => [
        'method' => 'GET',
        'timeout' => 10,
        'header' => "User-Agent: VNFest/1.0\r\n",
    ]]);

    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        // 有缓存时返回过期缓存兜底
        if (file_exists($cacheFile)) {
            return json_decode(file_get_contents($cacheFile), true) ?: [];
        }
        return [];
    }

    $data = json_decode($response, true) ?: [];
    file_put_contents($cacheFile, json_encode($data, JSON_UNESCAPED_UNICODE));
    return $data;
}

// ===== 搜索 =====
if ($action === 'search') {
    $keyword = trim($_GET['keyword'] ?? '');
    $type = (int)($_GET['type'] ?? 4); // 默认 Game

    if ($keyword === '') {
        echo json_encode(['success' => false, 'message' => '请输入关键词']);
        exit();
    }

    $cacheKey = 'search_v2_' . md5(strtolower($keyword) . '_' . $type);
    $data = bangumiFetch(
        'https://api.bgm.tv/search/subject/' . urlencode($keyword) . '?type=' . $type . '&responseGroup=large',
        $cacheKey,
        3600 // 搜索缓存 1 小时
    );

    $results = [];
    foreach ($data['list'] ?? [] as $item) {
        $rating = $item['rating'] ?? [];
        $results[] = [
            'bangumi_id' => (int)$item['id'],
            'title'      => $item['name'] ?? '',
            'title_cn'   => $item['name_cn'] ?? '',
            'image_url'  => $item['images']['medium'] ?? $item['images']['large'] ?? '',
            'rating'     => $rating['score'] ?? $item['score'] ?? 0,
            'summary'    => (function_exists('mb_substr') ? mb_substr($item['summary'] ?? '', 0, 200) : substr($item['summary'] ?? '', 0, 200)),
            'air_date'   => $item['air_date'] ?? '',
        ];
    }

    echo json_encode(['success' => true, 'data' => $results], JSON_UNESCAPED_UNICODE);
    exit();
}

// ===== 获取单个条目详情 =====
if ($action === 'get') {
    $id = (int)($_GET['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => '无效 ID']);
        exit();
    }

    $cacheKey = 'subject_' . $id;
    $data = bangumiFetch(
        'https://api.bgm.tv/v0/subjects/' . $id,
        $cacheKey,
        86400 // 条目详情缓存 24 小时
    );

    if (empty($data)) {
        // 回退旧版 API
        $data = bangumiFetch(
            'https://api.bgm.tv/subject/' . $id . '?responseGroup=large',
            $cacheKey . '_v0',
            86400
        );
    }

    echo json_encode(['success' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit();
}

echo json_encode(['success' => false, 'message' => '未知操作 action=' . $action]);
