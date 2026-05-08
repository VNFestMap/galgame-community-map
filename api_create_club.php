<?php
// api_create_club.php - 申请创建新同好会
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'includes/config.php';
require_once 'includes/Auth.php';

$auth = new Auth($pdo);

if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '请先登录']);
    exit();
}

$currentUser = $auth->getCurrentUser();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['school_name']) || !isset($input['province'])) {
        echo json_encode(['success' => false, 'message' => '请填写完整信息']);
        exit();
    }
    
    // 检查是否已经存在同名同好会
    $stmt = $pdo->prepare("SELECT id FROM clubs WHERE school_name = ?");
    $stmt->execute([$input['school_name']]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => '该学校已存在同好会，请直接申请加入']);
        exit();
    }
    
    $result = $auth->applyCreateClub(
        $currentUser['id'],
        $input['school_name'],
        $input['province'],
        $input['city'] ?? null,
        $input['reason'] ?? null,
        null
    );
    
    echo json_encode($result);
    exit();
}
?>