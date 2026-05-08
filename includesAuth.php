<?php
// includes/Auth.php
class Auth {
    private $pdo;
    private $session_prefix = 'galmap_';
    
    // 权限层级定义
    const ROLE_VISITOR = 'visitor';        // 等级1
    const ROLE_MEMBER = 'member';          // 等级2
    const ROLE_MANAGER = 'manager';        // 等级3
    const ROLE_REPRESENTATIVE = 'representative'; // 等级4
    const ROLE_SUPER_ADMIN = 'super_admin';       // 等级5
    
    private $roleHierarchy = [
        self::ROLE_VISITOR => 1,
        self::ROLE_MEMBER => 2,
        self::ROLE_MANAGER => 3,
        self::ROLE_REPRESENTATIVE => 4,
        self::ROLE_SUPER_ADMIN => 5
    ];
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->initSession();
    }
    
    private function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
    
    /**
     * 检查用户是否有权限访问某个同好会的信息
     * 核心权限逻辑
     */
    public function canViewContactInfo($user, $clubProvince, $clubId = null) {
        // 超级管理员都可以看
        if ($this->checkPermission(self::ROLE_SUPER_ADMIN)) {
            return ['can_view' => true, 'reason' => 'super_admin'];
        }
        
        // 等级1（未绑定访客）：不能看任何群号
        if (!$user || $user['role'] === self::ROLE_VISITOR) {
            return ['can_view' => false, 'reason' => 'visitor'];
        }
        
        // 等级2（成员）：只能看自己学校和本省的群号
        if ($user['role'] === self::ROLE_MEMBER) {
            // 查看自己学校的同好会
            if ($clubId && $user['club_id'] == $clubId) {
                return ['can_view' => true, 'reason' => 'own_club'];
            }
            // 查看本省的同好会
            if ($clubProvince === $this->getUserProvince($user['id'])) {
                return ['can_view' => true, 'reason' => 'same_province'];
            }
            return ['can_view' => false, 'reason' => 'different_province'];
        }
        
        // 等级3、4、5都可以看
        if ($this->checkPermission(self::ROLE_MANAGER)) {
            return ['can_view' => true, 'reason' => 'manager_or_higher'];
        }
        
        return ['can_view' => false, 'reason' => 'unknown'];
    }
    
    /**
     * 检查用户是否可以编辑某个同好会
     */
    public function canEditClub($userId, $clubId) {
        // 超级管理员可以编辑所有
        if ($this->checkPermission(self::ROLE_SUPER_ADMIN)) {
            return true;
        }
        
        // 获取用户在目标同好会中的角色
        $stmt = $this->pdo->prepare("
            SELECT role FROM users WHERE id = ? AND club_id = ?
        ");
        $stmt->execute([$userId, $clubId]);
        $user = $stmt->fetch();
        
        if (!$user) return false;
        
        // 负责人和管理员可以编辑
        return in_array($user['role'], [self::ROLE_MANAGER, self::ROLE_REPRESENTATIVE]);
    }
    
    /**
     * 检查用户是否可以管理成员（审核加入申请）
     */
    public function canManageMembers($userId, $clubId) {
        if ($this->checkPermission(self::ROLE_SUPER_ADMIN)) return true;
        
        $stmt = $this->pdo->prepare("
            SELECT role FROM users WHERE id = ? AND club_id = ?
        ");
        $stmt->execute([$userId, $clubId]);
        $user = $stmt->fetch();
        
        return $user && in_array($user['role'], [self::ROLE_MANAGER, self::ROLE_REPRESENTATIVE]);
    }
    
    /**
     * 获取用户所在省份
     */
    public function getUserProvince($userId) {
        $stmt = $this->pdo->prepare("
            SELECT c.province FROM users u 
            LEFT JOIN clubs c ON u.club_id = c.id 
            WHERE u.id = ?
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        return $result['province'] ?? null;
    }
    
    /**
     * 用户登录
     */
    public function login($username, $password) {
        $stmt = $this->pdo->prepare("
            SELECT * FROM users WHERE username = ? AND status = 'active'
        ");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION[$this->session_prefix . 'user_id'] = $user['id'];
            $_SESSION[$this->session_prefix . 'username'] = $user['username'];
            $_SESSION[$this->session_prefix . 'role'] = $user['role'];
            $_SESSION[$this->session_prefix . 'club_id'] = $user['club_id'];
            
            // 更新最后登录时间
            $updateStmt = $this->pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$user['id']]);
            
            $this->logOperation($user['id'], $user['username'], 'login', 'user', $user['id']);
            
            // 返回时隐藏敏感信息
            unset($user['password_hash']);
            return ['success' => true, 'user' => $user];
        }
        
        return ['success' => false, 'message' => '用户名或密码错误'];
    }
    
    /**
     * 用户注册（默认等级为 visitor）
     */
    public function register($username, $password, $email = null) {
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => '用户名已存在'];
        }
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("
            INSERT INTO users (username, password_hash, email, role, status) 
            VALUES (?, ?, ?, 'visitor', 'pending')
        ");
        
        if ($stmt->execute([$username, $passwordHash, $email])) {
            $userId = $this->pdo->lastInsertId();
            return ['success' => true, 'message' => '注册成功，请等待管理员审核'];
        }
        
        return ['success' => false, 'message' => '注册失败'];
    }
    
    /**
     * 申请绑定同好会
     */
    public function applyJoinClub($userId, $clubId, $realName, $studentId, $reason, $proof = null) {
        // 检查是否已经绑定
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE id = ? AND club_id IS NOT NULL");
        $stmt->execute([$userId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => '您已经绑定了同好会'];
        }
        
        // 检查是否已有待审核的申请
        $stmt = $this->pdo->prepare("
            SELECT id FROM club_join_requests 
            WHERE user_id = ? AND status = 'pending'
        ");
        $stmt->execute([$userId]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => '您已有待审核的申请，请耐心等待'];
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO club_join_requests (user_id, club_id, real_name, student_id, reason, proof) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([$userId, $clubId, $realName, $studentId, $reason, $proof])) {
            $this->logOperation($userId, null, 'apply_join_club', 'club', $clubId);
            return ['success' => true, 'message' => '申请已提交，请等待审核'];
        }
        
        return ['success' => false, 'message' => '提交失败'];
    }
    
    /**
     * 审核绑定申请（仅管理员/负责人）
     */
    public function reviewJoinRequest($requestId, $reviewerId, $action, $comment = null) {
        // 获取申请信息
        $stmt = $this->pdo->prepare("
            SELECT r.*, c.representative_id 
            FROM club_join_requests r 
            JOIN clubs c ON r.club_id = c.id 
            WHERE r.id = ?
        ");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();
        
        if (!$request) {
            return ['success' => false, 'message' => '申请不存在'];
        }
        
        // 检查权限
        $reviewer = $this->getUserById($reviewerId);
        if ($reviewer['role'] !== self::ROLE_SUPER_ADMIN && 
            $reviewer['club_id'] != $request['club_id']) {
            return ['success' => false, 'message' => '无权审核此申请'];
        }
        
        if ($action === 'approve') {
            // 更新用户角色和绑定信息
            $updateStmt = $this->pdo->prepare("
                UPDATE users SET role = 'member', club_id = ?, verified_at = NOW() 
                WHERE id = ?
            ");
            $updateStmt->execute([$request['club_id'], $request['user_id']]);
            
            // 更新申请状态
            $statusStmt = $this->pdo->prepare("
                UPDATE club_join_requests 
                SET status = 'approved', reviewer_id = ?, review_comment = ?, reviewed_at = NOW() 
                WHERE id = ?
            ");
            $statusStmt->execute([$reviewerId, $comment, $requestId]);
            
            $this->logOperation($reviewerId, null, 'approve_join_request', 'user', $request['user_id']);
            return ['success' => true, 'message' => '已批准加入申请'];
        } else {
            $statusStmt = $this->pdo->prepare("
                UPDATE club_join_requests 
                SET status = 'rejected', reviewer_id = ?, review_comment = ?, reviewed_at = NOW() 
                WHERE id = ?
            ");
            $statusStmt->execute([$reviewerId, $comment, $requestId]);
            
            return ['success' => true, 'message' => '已拒绝申请'];
        }
    }
    
    /**
     * 申请创建新同好会（适用于未成立的高校）
     */
    public function applyCreateClub($userId, $schoolName, $province, $city, $reason, $proof = null) {
        $stmt = $this->pdo->prepare("
            INSERT INTO club_creation_requests (applicant_id, school_name, province, city, reason, proof) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        if ($stmt->execute([$userId, $schoolName, $province, $city, $reason, $proof])) {
            $this->logOperation($userId, null, 'apply_create_club', 'club_creation', null);
            return ['success' => true, 'message' => '申请已提交，请等待管理员审核'];
        }
        
        return ['success' => false, 'message' => '提交失败'];
    }
    
    /**
     * 审核创建同好会申请（仅超级管理员）
     */
    public function reviewCreateClubRequest($requestId, $reviewerId, $action, $comment = null) {
        if (!$this->checkPermission(self::ROLE_SUPER_ADMIN)) {
            return ['success' => false, 'message' => '权限不足'];
        }
        
        $stmt = $this->pdo->prepare("SELECT * FROM club_creation_requests WHERE id = ?");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();
        
        if (!$request) {
            return ['success' => false, 'message' => '申请不存在'];
        }
        
        if ($action === 'approve') {
            // 创建同好会
            $clubStmt = $this->pdo->prepare("
                INSERT INTO clubs (name, school_name, province, city, type, status, created_by) 
                VALUES (?, ?, ?, ?, 'school', 'pending', ?)
            ");
            $clubStmt->execute([
                $request['school_name'] . '同好会',
                $request['school_name'],
                $request['province'],
                $request['city'],
                $request['applicant_id']
            ]);
            $clubId = $this->pdo->lastInsertId();
            
            // 将申请人设为负责人
            $userStmt = $this->pdo->prepare("
                UPDATE users SET role = 'representative', club_id = ?, status = 'active' 
                WHERE id = ?
            ");
            $userStmt->execute([$clubId, $request['applicant_id']]);
            
            // 更新同好会负责人字段
            $repStmt = $this->pdo->prepare("UPDATE clubs SET representative_id = ? WHERE id = ?");
            $repStmt->execute([$request['applicant_id'], $clubId]);
            
            // 更新申请状态
            $statusStmt = $this->pdo->prepare("
                UPDATE club_creation_requests 
                SET status = 'approved', reviewer_id = ?, review_comment = ?, reviewed_at = NOW() 
                WHERE id = ?
            ");
            $statusStmt->execute([$reviewerId, $comment, $requestId]);
            
            $this->logOperation($reviewerId, null, 'approve_club_creation', 'club', $clubId);
            return ['success' => true, 'message' => '同好会已创建', 'club_id' => $clubId];
        } else {
            $statusStmt = $this->pdo->prepare("
                UPDATE club_creation_requests 
                SET status = 'rejected', reviewer_id = ?, review_comment = ?, reviewed_at = NOW() 
                WHERE id = ?
            ");
            $statusStmt->execute([$reviewerId, $comment, $requestId]);
            
            return ['success' => true, 'message' => '已拒绝申请'];
        }
    }
    
    /**
     * 指定管理员（仅负责人）
     */
    public function assignManager($representativeId, $targetUserId, $clubId) {
        $representative = $this->getUserById($representativeId);
        
        // 检查是否是负责人
        if ($representative['role'] !== self::ROLE_REPRESENTATIVE || 
            $representative['club_id'] != $clubId) {
            return ['success' => false, 'message' => '权限不足，仅负责人可指定管理员'];
        }
        
        $targetUser = $this->getUserById($targetUserId);
        if ($targetUser['club_id'] != $clubId) {
            return ['success' => false, 'message' => '目标用户不属于本同好会'];
        }
        
        $stmt = $this->pdo->prepare("UPDATE users SET role = 'manager' WHERE id = ?");
        if ($stmt->execute([$targetUserId])) {
            $this->logOperation($representativeId, null, 'assign_manager', 'user', $targetUserId);
            return ['success' => true, 'message' => '已设为管理员'];
        }
        
        return ['success' => false, 'message' => '操作失败'];
    }
    
    /**
     * 撤销管理员（仅负责人）
     */
    public function revokeManager($representativeId, $targetUserId, $clubId) {
        $representative = $this->getUserById($representativeId);
        
        if ($representative['role'] !== self::ROLE_REPRESENTATIVE || 
            $representative['club_id'] != $clubId) {
            return ['success' => false, 'message' => '权限不足'];
        }
        
        $stmt = $this->pdo->prepare("UPDATE users SET role = 'member' WHERE id = ? AND role = 'manager'");
        if ($stmt->execute([$targetUserId])) {
            $this->logOperation($representativeId, null, 'revoke_manager', 'user', $targetUserId);
            return ['success' => true, 'message' => '已撤销管理员权限'];
        }
        
        return ['success' => false, 'message' => '操作失败'];
    }
    
    /**
     * 获取当前用户信息
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) return null;
        
        $stmt = $this->pdo->prepare("
            SELECT u.id, u.username, u.email, u.real_name, u.role, u.status, 
                   u.club_id, u.created_at, c.name as club_name, c.province as club_province
            FROM users u
            LEFT JOIN clubs c ON u.club_id = c.id
            WHERE u.id = ?
        ");
        $stmt->execute([$_SESSION[$this->session_prefix . 'user_id']]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * 检查登录状态
     */
    public function isLoggedIn() {
        return isset($_SESSION[$this->session_prefix . 'user_id']);
    }
    
    /**
     * 检查权限
     */
    public function checkPermission($requiredRole) {
        if (!$this->isLoggedIn()) return false;
        
        $currentRole = $_SESSION[$this->session_prefix . 'role'];
        $currentLevel = $this->roleHierarchy[$currentRole] ?? 0;
        $requiredLevel = $this->roleHierarchy[$requiredRole] ?? 0;
        
        return $currentLevel >= $requiredLevel;
    }
    
    /**
     * 获取用户信息
     */
    public function getUserById($userId) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * 获取同好会信息
     */
    public function getClubById($clubId) {
        $stmt = $this->pdo->prepare("SELECT * FROM clubs WHERE id = ?");
        $stmt->execute([$clubId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * 注册新用户后需要管理员审核
     */
    public function getPendingUsers($page = 1, $limit = 20) {
        if (!$this->checkPermission(self::ROLE_SUPER_ADMIN)) {
            return ['success' => false, 'message' => '权限不足'];
        }
        
        $offset = ($page - 1) * $limit;
        $stmt = $this->pdo->prepare("
            SELECT id, username, email, created_at 
            FROM users WHERE status = 'pending' 
            ORDER BY created_at LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $users = $stmt->fetchAll();
        
        $countStmt = $this->pdo->query("SELECT COUNT(*) FROM users WHERE status = 'pending'");
        $total = $countStmt->fetchColumn();
        
        return ['success' => true, 'data' => $users, 'total' => $total];
    }
    
    /**
     * 激活用户（超级管理员审核新注册用户）
     */
    public function activateUser($adminId, $userId) {
        if (!$this->checkPermission(self::ROLE_SUPER_ADMIN)) {
            return ['success' => false, 'message' => '权限不足'];
        }
        
        $stmt = $this->pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
        if ($stmt->execute([$userId])) {
            $this->logOperation($adminId, null, 'activate_user', 'user', $userId);
            return ['success' => true];
        }
        
        return ['success' => false, 'message' => '操作失败'];
    }
    
    /**
     * 用户登出
     */
    public function logout() {
        if ($this->isLoggedIn()) {
            $userId = $_SESSION[$this->session_prefix . 'user_id'];
            $username = $_SESSION[$this->session_prefix . 'username'];
            $this->logOperation($userId, $username, 'logout', 'user', $userId);
        }
        session_destroy();
        return ['success' => true];
    }
    
    /**
     * 记录操作日志
     */
    public function logOperation($userId, $username, $action, $targetType, $targetId, $details = null) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // 获取用户角色
        $role = null;
        if ($userId) {
            $user = $this->getUserById($userId);
            $role = $user ? $user['role'] : null;
            $username = $username ?? $user['username'];
        }
        
        $stmt = $this->pdo->prepare("
            INSERT INTO operation_logs (user_id, username, role, action, target_type, target_id, details, ip_address) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $username, $role, $action, $targetType, $targetId, $details, $ip]);
    }
}
?>