<?php
// api_bind_club.php - 申请绑定同好会
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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

// GET - 获取可绑定的同好会列表
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $province = $_GET['province'] ?? null;
    
    if ($currentUser['role'] === Auth::ROLE_VISITOR) {
        // 访客可以搜索同好会进行绑定
        $sql = "SELECT id, name, school_name, province, type FROM clubs WHERE status = 'active'";
        $params = [];
        
        if ($province) {
            $sql .= " AND province = ?";
            $params[] = $province;
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $clubs = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $clubs]);
    } else {
        echo json_encode(['success' => false, 'message' => '您已绑定同好会，无需再申请']);
    }
    exit();
}

// POST - 提交绑定申请
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['club_id']) || !isset($input['real_name'])) {
        echo json_encode(['success' => false, 'message' => '请填写完整信息']);
        exit();
    }
    
    // 验证同好会是否存在
    $club = $auth->getClubById($input['club_id']);
    if (!$club) {
        echo json_encode(['success' => false, 'message' => '同好会不存在']);
        exit();
    }
    
    // 处理证明材料上传
    $proofPath = null;
    if (isset($_FILES['proof']) && $_FILES['proof']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/proofs/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $proofPath = $uploadDir . uniqid() . '_' . $_FILES['proof']['name'];
        move_uploaded_file($_FILES['proof']['tmp_name'], $proofPath);
    }
    
    $result = $auth->applyJoinClub(
        $currentUser['id'],
        $input['club_id'],
        $input['real_name'],
        $input['student_id'] ?? null,
        $input['reason'] ?? null,
        $proofPath
    );
    
    echo json_encode($result);
    exit();
}
?>