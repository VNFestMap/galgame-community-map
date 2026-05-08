<?php
// api_club_manager.php - 同好会管理（等级3、4、5可用）
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'includes/config.php';
require_once 'includes/Auth.php';

$auth = new Auth($pdo);
$currentUser = $auth->getCurrentUser();

// 检查是否登录
if (!$auth->isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '请先登录']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$clubId = $_GET['club_id'] ?? null;

// 编辑同好会信息（等级3及以上）
if ($method === 'PUT' && strpos($_SERVER['REQUEST_URI'], 'edit_club') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$clubId) {
        echo json_encode(['success' => false, 'message' => '缺少同好会ID']);
        exit();
    }
    
    // 检查权限
    if (!$auth->canEditClub($currentUser['id'], $clubId)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => '无权编辑此同好会']);
        exit();
    }
    
    // 根据用户角色决定可编辑字段
    $updatableFields = ['qq_group', 'discord_link', 'description', 'remark'];
    
    // 负责人可以编辑更多字段
    if ($currentUser['role'] === Auth::ROLE_REPRESENTATIVE || 
        $currentUser['role'] === Auth::ROLE_SUPER_ADMIN) {
        $updatableFields = array_merge($updatableFields, ['name', 'contact_info', 'founded_date', 'is_public']);
    }
    
    // 更新同好会信息
    $updateFields = [];
    $params = [];
    foreach ($updatableFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (!empty($updateFields)) {
        $params[] = $clubId;
        $sql = "UPDATE clubs SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $auth->logOperation($currentUser['id'], $currentUser['username'], 'edit_club', 'club', $clubId);
        echo json_encode(['success' => true, 'message' => '更新成功']);
    } else {
        echo json_encode(['success' => false, 'message' => '没有要更新的字段']);
    }
    exit();
}

// 获取待审核的加入申请（等级3及以上）
if ($method === 'GET' && strpos($_SERVER['REQUEST_URI'], 'pending_requests') !== false) {
    if (!$clubId) {
        echo json_encode(['success' => false, 'message' => '缺少同好会ID']);
        exit();
    }
    
    if (!$auth->canManageMembers($currentUser['id'], $clubId)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => '无权查看申请']);
        exit();
    }
    
    $stmt = $pdo->prepare("
        SELECT r.*, u.username, u.email 
        FROM club_join_requests r
        JOIN users u ON r.user_id = u.id
        WHERE r.club_id = ? AND r.status = 'pending'
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$clubId]);
    $requests = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $requests]);
    exit();
}

// 审核加入申请（等级3及以上）
if ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], 'review_request') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['request_id']) || !isset($input['action'])) {
        echo json_encode(['success' => false, 'message' => '缺少参数']);
        exit();
    }
    
    $result = $auth->reviewJoinRequest(
        $input['request_id'],
        $currentUser['id'],
        $input['action'],
        $input['comment'] ?? null
    );
    
    echo json_encode($result);
    exit();
}

// 获取同好会成员列表（等级3及以上）
if ($method === 'GET' && strpos($_SERVER['REQUEST_URI'], 'members') !== false) {
    if (!$clubId) {
        echo json_encode(['success' => false, 'message' => '缺少同好会ID']);
        exit();
    }
    
    if (!$auth->canManageMembers($currentUser['id'], $clubId)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => '无权查看成员列表']);
        exit();
    }
    
    $stmt = $pdo->prepare("
        SELECT id, username, real_name, role, email, verified_at, created_at
        FROM users WHERE club_id = ? AND status = 'active'
        ORDER BY FIELD(role, 'representative', 'manager', 'member')
    ");
    $stmt->execute([$clubId]);
    $members = $stmt->fetchAll();
    
    echo json_encode(['success' => true, 'data' => $members]);
    exit();
}

// 指定/撤销管理员（仅负责人，等级4）
if ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], 'assign_manager') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$clubId || !isset($input['target_user_id'])) {
        echo json_encode(['success' => false, 'message' => '缺少参数']);
        exit();
    }
    
    if ($input['action'] === 'assign') {
        $result = $auth->assignManager($currentUser['id'], $input['target_user_id'], $clubId);
    } else {
        $result = $auth->revokeManager($currentUser['id'], $input['target_user_id'], $clubId);
    }
    
    echo json_encode($result);
    exit();
}

echo json_encode(['success' => false, 'message' => '无效的请求']);
?>