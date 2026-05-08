<?php
// api_publications.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/publications.json';
$adminToken = 'ciallo';

function checkAuth() {
    global $adminToken;
    $headers = getallheaders();
    $token = $headers['X-Admin-Token'] ?? '';
    return $token === $adminToken;
}

// GET - 读取数据
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode(['publications' => []]);
    }
    exit();
}

// 以下需要验证
if (!checkAuth()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '未授权访问']);
    exit();
}

// POST - 添加
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['clubName']) || !isset($input['publicationName'])) {
        echo json_encode(['success' => false, 'message' => '缺少必填字段']);
        exit();
    }
    
    $current = json_decode(file_get_contents($dataFile), true);
    $publications = $current['publications'] ?? [];
    
    $maxId = 0;
    foreach ($publications as $item) {
        if (($item['id'] ?? 0) > $maxId) $maxId = $item['id'];
    }
    
    $newItem = [
        'id' => $maxId + 1,
        'clubName' => $input['clubName'],
        'publicationName' => $input['publicationName'],
        'status' => $input['status'] ?? 'planning',
        'submitContact' => $input['submitContact'] ?? '',  // 改为 submitContact（投稿账号/邮箱）
        'submitLink' => $input['submitLink'] ?? '',        // 保留链接作为备用
        'deadline' => $input['deadline'] ?? '',
        'description' => $input['description'] ?? '',
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $publications[] = $newItem;
    $result = ['publications' => $publications];
    file_put_contents($dataFile, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => '添加成功', 'data' => $newItem]);
    exit();
}

// PUT - 更新
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => '无效数据']);
        exit();
    }
    
    $current = json_decode(file_get_contents($dataFile), true);
    $publications = $current['publications'] ?? [];
    $updated = false;
    
    foreach ($publications as $i => $item) {
        if ($item['id'] == $input['id']) {
            $publications[$i]['clubName'] = $input['clubName'] ?? $item['clubName'];
            $publications[$i]['publicationName'] = $input['publicationName'] ?? $item['publicationName'];
            $publications[$i]['status'] = $input['status'] ?? $item['status'];
            $publications[$i]['submitContact'] = $input['submitContact'] ?? $item['submitContact'];
            $publications[$i]['submitLink'] = $input['submitLink'] ?? $item['submitLink'];
            $publications[$i]['deadline'] = $input['deadline'] ?? $item['deadline'];
            $publications[$i]['description'] = $input['description'] ?? $item['description'];
            $publications[$i]['updated_at'] = date('Y-m-d H:i:s');
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        echo json_encode(['success' => false, 'message' => '未找到要更新的数据']);
        exit();
    }
    
    $result = ['publications' => $publications];
    file_put_contents($dataFile, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => '更新成功']);
    exit();
}

// DELETE - 删除
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'])) {
        echo json_encode(['success' => false, 'message' => '无效数据']);
        exit();
    }
    
    $current = json_decode(file_get_contents($dataFile), true);
    $publications = $current['publications'] ?? [];
    $newPublications = [];
    
    foreach ($publications as $item) {
        if ($item['id'] != $input['id']) {
            $newPublications[] = $item;
        }
    }
    
    $result = ['publications' => $newPublications];
    file_put_contents($dataFile, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => '删除成功']);
    exit();
}

echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
?>