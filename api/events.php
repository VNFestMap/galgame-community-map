<?php
// api_events.php - 活动数据管理 API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = __DIR__ . '/../data/events.json';
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
        $content = file_get_contents($dataFile);
        // 验证 JSON 格式
        if (json_decode($content) === null) {
            // JSON 格式错误，返回空数组
            echo json_encode(['events' => []]);
        } else {
            echo $content;
        }
    } else {
        echo json_encode(['events' => []]);
    }
    exit();
}

// POST - 保存数据（需要验证）
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!checkAuth()) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '未授权访问']);
        exit();
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['events'])) {
        echo json_encode(['success' => false, 'message' => '无效的数据']);
        exit();
    }
    
    $result = ['events' => $input['events']];
    $success = file_put_contents($dataFile, json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    if ($success !== false) {
        echo json_encode(['success' => true, 'message' => '保存成功']);
    } else {
        echo json_encode(['success' => false, 'message' => '保存失败，请检查文件权限']);
    }
    exit();
}

echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
?>