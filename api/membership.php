<?php
// api/membership.php - 同好会绑定申请/审批 API
// 动作: my, apply, approve, reject, pending, members

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/audit.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'my':
        // 获取当前用户的所有绑定
        $user = getCurrentUser();
        if (!$user) {
            echo json_encode(['success' => true, 'memberships' => []]);
            exit();
        }
        $db = getDB();
        $stmt = $db->prepare(
            "SELECT id, club_id, role, status, joined_at
             FROM club_memberships WHERE user_id = ? ORDER BY joined_at DESC"
        );
        $stmt->execute([$user['id']]);
        echo json_encode(['success' => true, 'memberships' => $stmt->fetchAll()]);
        exit();

    case 'apply':
        // 申请绑定同好会
        $user = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            echo json_encode(['success' => false, 'message' => '请求数据格式错误']);
            exit();
        }
        $clubId = (int)($input['club_id'] ?? 0);
        $country = $input['country'] ?? 'china';
        $qqAccount = $input['qq_account'] ?? '';
        $applyRole = $input['apply_role'] ?? 'member';
        $isStudent = !empty($input['is_student']) ? 1 : 0;

        // 验证申请身份
        $validRoles = ['member', 'manager', 'representative'];
        if (!in_array($applyRole, $validRoles)) $applyRole = 'member';

        if (!$clubId) {
            echo json_encode(['success' => false, 'message' => '无效的同好会 ID']);
            exit();
        }

        $db = getDB();

        // 确保扩展列存在（兼容 MySQL 和 SQLite）
        ensureColumnExists($db, 'club_memberships', 'qq_account', "VARCHAR(255) DEFAULT ''");
        ensureColumnExists($db, 'club_memberships', 'apply_role', "VARCHAR(50) DEFAULT 'member'");
        ensureColumnExists($db, 'club_memberships', 'is_student', "INT DEFAULT 0");

        // 检查是否已经申请过
        $stmt = $db->prepare(
            "SELECT id, status FROM club_memberships WHERE user_id = ? AND club_id = ?"
        );
        $stmt->execute([$user['id'], $clubId]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($existing['status'] === 'active') {
                echo json_encode(['success' => false, 'message' => '你已绑定该同好会']);
            } elseif ($existing['status'] === 'pending') {
                echo json_encode(['success' => false, 'message' => '绑定申请已提交，请等待审核']);
            } else {
                echo json_encode(['success' => false, 'message' => '已存在绑定记录']);
            }
            exit();
        }

        // 创建申请（事务保证原子性）
        $db->beginTransaction();
        try {
            $stmt = $db->prepare(
                "INSERT INTO club_memberships (user_id, club_id, role, status, qq_account, apply_role, is_student)
                 VALUES (?, ?, ?, 'pending', ?, ?, ?)"
            );
            $stmt->execute([$user['id'], $clubId, $applyRole, $qqAccount, $applyRole, $isStudent]);
            $membershipId = $db->lastInsertId();

            logAction('membership.apply', 'club_membership', $membershipId, [
                'club_id' => $clubId, 'country' => $country, 'apply_role' => $applyRole
            ]);

            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => '操作失败：' . $e->getMessage()]);
            exit();
        }

        echo json_encode([
            'success' => true,
            'message' => '绑定申请已提交，等待管理员审核',
            'membership' => [
                'id' => (int)$membershipId,
                'status' => 'pending'
            ]
        ]);
        exit();

    case 'members':
        // 获取指定俱乐部的成员名单
        $clubId = (int)($_GET['club_id'] ?? 0);
        if (!$clubId) {
            echo json_encode(['success' => false, 'message' => '无效的俱乐部 ID']);
            exit();
        }

        // 权限：管理员/负责人可查看
        $currentUser = requireLogin();
        if (!canManageClub($currentUser, $clubId)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit();
        }

        $db = getDB();
        $stmt = $db->prepare(
            "SELECT cm.id, cm.user_id, cm.role, cm.status, cm.joined_at,
                    u.username, u.avatar_url
             FROM club_memberships cm
             JOIN users u ON u.id = cm.user_id
             WHERE cm.club_id = ? AND cm.status = 'active'
             ORDER BY cm.joined_at ASC"
        );
        $stmt->execute([$clubId]);
        $members = $stmt->fetchAll();

        // 转换 int 类型
        foreach ($members as &$m) {
            $m['id'] = (int)$m['id'];
            $m['user_id'] = (int)$m['user_id'];
        }

        echo json_encode(['success' => true, 'members' => $members]);
        exit();

    case 'pending':
        // 获取待审批列表
        $currentUser = requireLogin();
        $db = getDB();

        // 确保扩展列存在（兼容旧表结构）
        ensureColumnExists($db, 'club_memberships', 'qq_account', "VARCHAR(255) DEFAULT ''");
        ensureColumnExists($db, 'club_memberships', 'apply_role', "VARCHAR(50) DEFAULT 'member'");
        ensureColumnExists($db, 'club_memberships', 'is_student', "INT DEFAULT 0");

        // 支持按状态筛选（默认 pending，传 all 返回全部）
        $statusFilter = $_GET['status'] ?? 'pending';
        $statusCondition = $statusFilter === 'all' ? '' : "AND cm.status = 'pending'";

        if ($currentUser['role'] === 'super_admin') {
            // 超级管理员：查看所有
            $stmt = $db->query(
                "SELECT cm.id, cm.user_id, cm.club_id, cm.status, cm.joined_at,
                        cm.apply_role, cm.qq_account, cm.is_student, u.username
                 FROM club_memberships cm
                 JOIN users u ON u.id = cm.user_id
                 WHERE 1=1 $statusCondition
                 ORDER BY cm.joined_at ASC"
            );
        } else {
            // 负责人/管理员：只查看自己俱乐部的待审批
            $stmt = $db->prepare(
                "SELECT cm.id, cm.user_id, cm.club_id, cm.status, cm.joined_at,
                        cm.apply_role, cm.qq_account, cm.is_student, u.username
                 FROM club_memberships cm
                 JOIN users u ON u.id = cm.user_id
                 WHERE 1=1 $statusCondition
                   AND cm.club_id IN (
                       SELECT club_id FROM club_memberships
                       WHERE user_id = ? AND role IN ('representative', 'manager') AND status = 'active'
                   )
                 ORDER BY cm.joined_at ASC"
            );
            $stmt->execute([$currentUser['id']]);
        }

        $memberships = $stmt->fetchAll();
        foreach ($memberships as &$m) {
            $m['id'] = (int)$m['id'];
            $m['user_id'] = (int)$m['user_id'];
            $m['club_id'] = (int)$m['club_id'];
        }

        echo json_encode(['success' => true, 'memberships' => $memberships]);
        exit();

    case 'approve':
        // 批准绑定
        $currentUser = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        $membershipId = (int)($input['membership_id'] ?? 0);

        if (!$membershipId) {
            echo json_encode(['success' => false, 'message' => '无效的成员 ID']);
            exit();
        }

        $db = getDB();

        // 获取申请信息用于权限检查
        $stmt = $db->prepare("SELECT cm.*, cm.club_id FROM club_memberships cm WHERE cm.id = ?");
        $stmt->execute([$membershipId]);
        $membership = $stmt->fetch();

        if (!$membership || $membership['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => '未找到待审批的申请']);
            exit();
        }

        // 权限检查
        if (!canManageClub($currentUser, $membership['club_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit();
        }

        $db->beginTransaction();
        try {
            $stmt = $db->prepare(
                "UPDATE club_memberships SET status = 'active' WHERE id = ? AND status = 'pending'"
            );
            $stmt->execute([$membershipId]);

            if ($stmt->rowCount() === 0) {
                $db->rollBack();
                echo json_encode(['success' => false, 'message' => '未找到待审批的申请']);
                exit();
            }

            logAction('membership.approve', 'club_membership', $membershipId, [
                'club_id' => $membership['club_id'],
            ]);
            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => '操作失败：' . $e->getMessage()]);
            exit();
        }
        echo json_encode(['success' => true, 'message' => '已批准绑定']);
        exit();

    case 'reject':
        // 拒绝绑定
        $currentUser = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        $membershipId = (int)($input['membership_id'] ?? 0);

        if (!$membershipId) {
            echo json_encode(['success' => false, 'message' => '无效的成员 ID']);
            exit();
        }

        $db = getDB();

        // 获取申请信息用于权限检查
        $stmt = $db->prepare("SELECT cm.*, cm.club_id FROM club_memberships cm WHERE cm.id = ?");
        $stmt->execute([$membershipId]);
        $membership = $stmt->fetch();

        if (!$membership || $membership['status'] !== 'pending') {
            echo json_encode(['success' => false, 'message' => '未找到待审批的申请']);
            exit();
        }

        // 权限检查
        if (!canManageClub($currentUser, $membership['club_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit();
        }

        $db->beginTransaction();
        try {
            $stmt = $db->prepare(
                "UPDATE club_memberships SET status = 'rejected' WHERE id = ? AND status = 'pending'"
            );
            $stmt->execute([$membershipId]);

            if ($stmt->rowCount() === 0) {
                $db->rollBack();
                echo json_encode(['success' => false, 'message' => '未找到待审批的申请']);
                exit();
            }

            logAction('membership.reject', 'club_membership', $membershipId, [
                'club_id' => $membership['club_id'],
            ]);
            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(['success' => false, 'message' => '操作失败：' . $e->getMessage()]);
            exit();
        }
        echo json_encode(['success' => true, 'message' => '已拒绝绑定']);
        exit();

    case 'leave':
        // 用户自行退出同好会
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => '仅支持 POST 请求']);
            exit();
        }
        $currentUser = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        $membershipId = (int)($input['membership_id'] ?? 0);

        if (!$membershipId) {
            echo json_encode(['success' => false, 'message' => '无效的成员 ID']);
            exit();
        }

        $db = getDB();

        // 获取申请信息
        $stmt = $db->prepare("SELECT * FROM club_memberships WHERE id = ?");
        $stmt->execute([$membershipId]);
        $membership = $stmt->fetch();

        if (!$membership) {
            echo json_encode(['success' => false, 'message' => '未找到绑定记录']);
            exit();
        }

        // 只能退出自己的绑定
        if ((int)$membership['user_id'] !== (int)$currentUser['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '只能退出自己的同好会绑定']);
            exit();
        }

        // 只能退出 active 状态的绑定
        if ($membership['status'] !== 'active') {
            echo json_encode(['success' => false, 'message' => '该绑定记录已经处于非活跃状态']);
            exit();
        }

        // 仅普通 member 可自行退出
        if ($membership['role'] !== 'member') {
            echo json_encode(['success' => false, 'message' => '管理员/负责人角色无法自行退出，请联系超级管理员']);
            exit();
        }

        $db->prepare(
            "UPDATE club_memberships SET status = 'left', left_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'"
        )->execute([$membershipId]);

        logAction('membership.leave', 'club_membership', $membershipId, [
            'club_id' => $membership['club_id'],
        ]);
        echo json_encode(['success' => true, 'message' => '已退出同好会']);
        exit();

    case 'kick':
        // 踢出成员（负责人/管理员操作）
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => '仅支持 POST 请求']);
            exit();
        }
        $currentUser = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        $membershipId = (int)($input['membership_id'] ?? 0);

        if (!$membershipId) {
            echo json_encode(['success' => false, 'message' => '无效的成员 ID']);
            exit();
        }

        $db = getDB();

        // 获取目标成员记录
        $stmt = $db->prepare("SELECT * FROM club_memberships WHERE id = ?");
        $stmt->execute([$membershipId]);
        $membership = $stmt->fetch();

        if (!$membership || $membership['status'] !== 'active') {
            echo json_encode(['success' => false, 'message' => '未找到活跃的成员记录']);
            exit();
        }

        // 权限检查：是否可管理该俱乐部
        if (!canManageClub($currentUser, $membership['club_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit();
        }

        // 不能踢自己
        if ((int)$membership['user_id'] === (int)$currentUser['id']) {
            echo json_encode(['success' => false, 'message' => '不能踢出自己']);
            exit();
        }

        // 非 super_admin 需要按角色限制可踢的目标
        if ($currentUser['role'] !== 'super_admin') {
            $stmt = $db->prepare("SELECT role FROM club_memberships WHERE user_id = ? AND club_id = ? AND status = 'active'");
            $stmt->execute([$currentUser['id'], $membership['club_id']]);
            $myRole = $stmt->fetchColumn();

            if ($myRole === 'manager' && $membership['role'] !== 'member') {
                echo json_encode(['success' => false, 'message' => '管理员只能踢出普通成员']);
                exit();
            }
            if ($myRole === 'representative' && !in_array($membership['role'], ['member', 'manager'])) {
                echo json_encode(['success' => false, 'message' => '无法踢出该角色的成员']);
                exit();
            }
        }

        $db->prepare("UPDATE club_memberships SET status = 'kicked', left_at = CURRENT_TIMESTAMP WHERE id = ?")
            ->execute([$membershipId]);

        logAction('membership.kick', 'club_membership', $membershipId, [
            'club_id' => $membership['club_id'],
            'target_user_id' => $membership['user_id'],
        ]);
        echo json_encode(['success' => true, 'message' => '已踢出成员']);
        exit();

    case 'change_role':
        // 修改成员角色（负责人操作）
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => '仅支持 POST 请求']);
            exit();
        }
        $currentUser = requireLogin();
        $input = json_decode(file_get_contents('php://input'), true);
        $membershipId = (int)($input['membership_id'] ?? 0);
        $newRole = $input['role'] ?? '';

        if (!$membershipId) {
            echo json_encode(['success' => false, 'message' => '无效的成员 ID']);
            exit();
        }

        $validRoles = ['member', 'manager', 'representative'];
        if (!in_array($newRole, $validRoles)) {
            echo json_encode(['success' => false, 'message' => '无效的角色']);
            exit();
        }

        $db = getDB();

        // 获取目标成员记录
        $stmt = $db->prepare("SELECT * FROM club_memberships WHERE id = ?");
        $stmt->execute([$membershipId]);
        $membership = $stmt->fetch();

        if (!$membership || $membership['status'] !== 'active') {
            echo json_encode(['success' => false, 'message' => '未找到活跃的成员记录']);
            exit();
        }

        // 权限检查：是否可管理该俱乐部
        if (!canManageClub($currentUser, $membership['club_id'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => '权限不足']);
            exit();
        }

        // 非 super_admin 权限限制
        if ($currentUser['role'] !== 'super_admin') {
            // 获取当前用户在俱乐部中的角色
            $stmt = $db->prepare("SELECT role FROM club_memberships WHERE user_id = ? AND club_id = ? AND status = 'active'");
            $stmt->execute([$currentUser['id'], $membership['club_id']]);
            $myRole = $stmt->fetchColumn();

            // 只有负责人可以修改角色
            if ($myRole !== 'representative') {
                echo json_encode(['success' => false, 'message' => '只有负责人可以修改成员角色']);
                exit();
            }

            // 不能设为负责人
            if ($newRole === 'representative') {
                echo json_encode(['success' => false, 'message' => '无权设置为负责人角色']);
                exit();
            }

            // 不能修改负责人的角色
            if ($membership['role'] === 'representative') {
                echo json_encode(['success' => false, 'message' => '无法修改负责人的角色']);
                exit();
            }
        }

        $oldRole = $membership['role'];
        $db->prepare("UPDATE club_memberships SET role = ? WHERE id = ?")
            ->execute([$newRole, $membershipId]);

        logAction('membership.change_role', 'club_membership', $membershipId, [
            'club_id' => $membership['club_id'],
            'old_role' => $oldRole,
            'new_role' => $newRole,
        ]);
        echo json_encode(['success' => true, 'message' => '角色已更新']);
        exit();

    default:
        echo json_encode(['success' => false, 'message' => '未知动作', 'available_actions' => [
            'my', 'apply', 'approve', 'reject', 'pending', 'members', 'leave', 'kick', 'change_role'
        ]]);
        exit();
}

// ====== 辅助函数 ======

/**
 * 检查列是否存在，不存在则添加（兼容 MySQL 和 SQLite）
 */
function ensureColumnExists(PDO $db, string $table, string $column, string $definition): void {
    try {
        // SQLite
        $stmt = $db->query("PRAGMA table_info($table)");
        $cols = $stmt->fetchAll(PDO::FETCH_COLUMN, 1);
        if (in_array($column, $cols)) return;
    } catch (Exception $e) {
        // MySQL
        try {
            $stmt = $db->query("SHOW COLUMNS FROM `$table` LIKE '$column'");
            if ($stmt->fetch()) return;
        } catch (Exception $e2) {}
    }
    try {
        $db->exec("ALTER TABLE `$table` ADD COLUMN `$column` $definition");
    } catch (Exception $e) {}
}

/**
 * 检查当前用户是否有权限管理指定俱乐部
 * 管理员/超级管理员可以管理所有俱乐部，负责人只能管理自己的俱乐部
 */
function canManageClub(array $user, int $clubId): bool {
    // 超级管理员拥有全局管理权限
    if ($user['role'] === 'super_admin') {
        return true;
    }

    // 检查是否是负责人或管理员
    $db = getDB();
    $stmt = $db->prepare(
        "SELECT id FROM club_memberships WHERE user_id = ? AND club_id = ? AND role IN ('representative', 'manager') AND status = 'active'"
    );
    $stmt->execute([$user['id'], $clubId]);
    return (bool)$stmt->fetch();
}
