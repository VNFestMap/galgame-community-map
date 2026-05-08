<?php
// api_clubs.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

require_once 'includes/config.php';
require_once 'includes/Auth.php';

$auth = new Auth($pdo);
$currentUser = $auth->getCurrentUser();

// GET - 获取同好会列表（根据权限隐藏联系方式）
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $clubs = getClubsFromJson(); // 从 JSON 或数据库获取
    
    // 根据用户权限处理联系方式可见性
    $processedClubs = [];
    foreach ($clubs as $club) {
        $canView = $auth->canViewContactInfo($currentUser, $club['province'], $club['id'] ?? null);
        
        $processedClub = $club;
        if (!$canView['can_view']) {
            // 隐藏联系方式
            $processedClub['info'] = $canView['reason'] === 'visitor' ? '登录后可见' : '仅本省同好可见';
            $processedClub['contact_hidden'] = true;
            $processedClub['hide_reason'] = $canView['reason'];
        } else {
            $processedClub['contact_hidden'] = false;
        }
        
        $processedClubs[] = $processedClub;
    }
    
    echo json_encode([
        'success' => true,
        'total' => count($processedClubs),
        'data' => $processedClubs,
        'user' => $currentUser ? [
            'role' => $currentUser['role'],
            'club_id' => $currentUser['club_id'],
            'province' => $currentUser['club_province'] ?? null
        ] : null
    ]);
    exit();
}

// POST, PUT, DELETE 等其他方法需要相应权限...
?>