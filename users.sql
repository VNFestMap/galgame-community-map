CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100),
    `real_name` VARCHAR(100),
    `role` ENUM('visitor', 'member', 'manager', 'representative', 'super_admin') DEFAULT 'visitor',
    `status` ENUM('active', 'pending', 'disabled') DEFAULT 'pending',
    `avatar` VARCHAR(255),
    `school_name` VARCHAR(200) COMMENT '学校/组织名称',
    `club_id` INT COMMENT '绑定的同好会ID',
    `verified_at` DATETIME COMMENT '审核通过时间',
    `last_login` DATETIME,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_club_id (club_id),
    INDEX idx_status (status),
    INDEX idx_school (school_name),
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- 创建同好会表
CREATE TABLE IF NOT EXISTS `clubs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(200) NOT NULL COMMENT '同好会名称',
    `school_name` VARCHAR(200) COMMENT '学校/组织全称',
    `province` VARCHAR(50) NOT NULL,
    `city` VARCHAR(50),
    `type` ENUM('school', 'region', 'vnfest') DEFAULT 'school',
    `qq_group` VARCHAR(50) COMMENT 'QQ群号',
    `discord_link` VARCHAR(255) COMMENT 'Discord链接',
    `contact_info` TEXT COMMENT '其他联系方式',
    `description` TEXT COMMENT '简介',
    `remark` TEXT COMMENT '备注',
    `founded_date` DATE COMMENT '成立日期',
    `is_public` BOOLEAN DEFAULT TRUE COMMENT '是否公开到全国',
    `status` ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
    `representative_id` INT COMMENT '负责人ID',
    `created_by` INT COMMENT '创建者ID',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_province (province),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_school (school_name),
    INDEX idx_representative (representative_id),
    FOREIGN KEY (representative_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 用户-同好会绑定申请记录
CREATE TABLE IF NOT EXISTS `club_join_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `club_id` INT NOT NULL,
    `real_name` VARCHAR(100) COMMENT '真实姓名',
    `student_id` VARCHAR(50) COMMENT '学号',
    `reason` TEXT COMMENT '申请理由',
    `proof` VARCHAR(255) COMMENT '证明材料（学生证照片等）',
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `reviewer_id` INT,
    `review_comment` TEXT,
    `reviewed_at` DATETIME,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_club (club_id),
    INDEX idx_user (user_id)
);

-- 新同好会创建申请（用于未成立的高校）
CREATE TABLE IF NOT EXISTS `club_creation_requests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `applicant_id` INT NOT NULL,
    `school_name` VARCHAR(200) NOT NULL,
    `province` VARCHAR(50) NOT NULL,
    `city` VARCHAR(50),
    `reason` TEXT COMMENT '申请理由',
    `proof` TEXT COMMENT '证明材料',
    `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    `reviewer_id` INT,
    `review_comment` TEXT,
    `reviewed_at` DATETIME,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- 活动表
CREATE TABLE IF NOT EXISTS `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `club_id` INT COMMENT '主办同好会ID',
    `title` VARCHAR(200) NOT NULL,
    `date` DATE NOT NULL,
    `time` TIME,
    `location` VARCHAR(255),
    `description` TEXT,
    `image_url` VARCHAR(500),
    `is_official` BOOLEAN DEFAULT FALSE COMMENT '是否官方活动',
    `status` ENUM('active', 'cancelled', 'ended') DEFAULT 'active',
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_club (club_id)
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS `operation_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT,
    `username` VARCHAR(50),
    `role` VARCHAR(20),
    `action` VARCHAR(100),
    `target_type` VARCHAR(50),
    `target_id` INT,
    `details` TEXT,
    `ip_address` VARCHAR(45),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);