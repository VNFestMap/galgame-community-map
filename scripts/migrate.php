<?php
// scripts/migrate.php - 创建数据库表（CLI 脚本）
// 用法: php scripts/migrate.php
// 支持 SQLite 和 MySQL 两种驱动，由 config.php 中 DB_DRIVER 控制

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../includes/db.php';

echo "开始创建数据库表... (驱动: " . (defined('DB_DRIVER') ? DB_DRIVER : 'sqlite') . ")\n";

$db = getDB();
$isMysql = defined('DB_DRIVER') && DB_DRIVER === 'mysql';

if ($isMysql) {
    // ==================== MySQL 建表 ====================

    // MySQL 不支持 CREATE INDEX IF NOT EXISTS，用 try-catch 包装
    $tryIndex = function (string $sql) use ($db) {
        try { $db->exec($sql); } catch (PDOException $e) { /* 索引已存在，忽略 */ }
    };

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            qq_openid     VARCHAR(255) UNIQUE,
            discord_id    VARCHAR(255) UNIQUE,
            qq_unionid    VARCHAR(255),
            password_hash VARCHAR(255),
            username      VARCHAR(255) NOT NULL UNIQUE,
            avatar_url    VARCHAR(500) DEFAULT '',
            role          VARCHAR(50) NOT NULL DEFAULT 'visitor',
            status        VARCHAR(50) NOT NULL DEFAULT 'active',
            created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            last_login_at DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "[OK] users 表已创建\n";

    // 迁移：添加新列（安全，列已存在时忽略）
    $tryAlter = function (string $sql) use ($db) {
        try { $db->exec($sql); } catch (PDOException $e) { /* 列已存在，忽略 */ }
    };
    $tryAlter("ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE");
    $tryAlter("ALTER TABLE users ADD COLUMN email_verified_at DATETIME");
    $tryAlter("ALTER TABLE users ADD COLUMN avatar_updated_at DATETIME");
    $tryAlter("ALTER TABLE users ADD COLUMN nickname VARCHAR(255) DEFAULT '' AFTER username");

    $db->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id           VARCHAR(128) PRIMARY KEY,
            user_id      INT NOT NULL,
            ip_address   VARCHAR(45),
            user_agent   TEXT,
            created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at   DATETIME NOT NULL,
            is_valid     TINYINT(1) NOT NULL DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $tryIndex("CREATE INDEX idx_sessions_user ON sessions(user_id)");
    $tryIndex("CREATE INDEX idx_sessions_expires ON sessions(expires_at)");
    echo "[OK] sessions 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS clubs (
            id            INT AUTO_INCREMENT PRIMARY KEY,
            province      VARCHAR(255) NOT NULL DEFAULT '',
            prefecture    VARCHAR(255) DEFAULT '',
            representative_id INT,
            visibility    VARCHAR(50) DEFAULT 'public',
            country       VARCHAR(50) DEFAULT 'china'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "[OK] clubs 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS audit_logs (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT,
            action      VARCHAR(255) NOT NULL,
            target_type VARCHAR(255),
            target_id   INT,
            details     TEXT,
            ip_address  VARCHAR(45),
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $tryIndex("CREATE INDEX idx_audit_user ON audit_logs(user_id)");
    $tryIndex("CREATE INDEX idx_audit_created ON audit_logs(created_at)");
    echo "[OK] audit_logs 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip_address   VARCHAR(45) NOT NULL,
            endpoint     VARCHAR(255) NOT NULL,
            hit_count    INT DEFAULT 1,
            window_start DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (ip_address, endpoint)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    echo "[OK] rate_limits 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS club_memberships (
            id       INT AUTO_INCREMENT PRIMARY KEY,
            user_id  INT NOT NULL,
            club_id  INT NOT NULL,
            role     VARCHAR(50) NOT NULL DEFAULT 'member',
            status   VARCHAR(50) NOT NULL DEFAULT 'active',
            joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            left_at  DATETIME,
            UNIQUE(user_id, club_id),
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $tryIndex("CREATE INDEX idx_memberships_user ON club_memberships(user_id)");
    $tryIndex("CREATE INDEX idx_memberships_club ON club_memberships(club_id)");
    echo "[OK] club_memberships 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS club_verification_codes (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            club_id     INT NOT NULL,
            code        VARCHAR(255) NOT NULL,
            created_by  INT NOT NULL,
            max_uses    INT DEFAULT 50,
            use_count   INT DEFAULT 0,
            expires_at  DATETIME,
            is_active   TINYINT(1) NOT NULL DEFAULT 1,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $tryIndex("CREATE INDEX idx_verify_codes_club ON club_verification_codes(club_id)");
    echo "[OK] club_verification_codes 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS email_verifications (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     INT NOT NULL,
            email       VARCHAR(255) NOT NULL,
            code        VARCHAR(10) NOT NULL,
            expires_at  DATETIME NOT NULL,
            used        TINYINT(1) NOT NULL DEFAULT 0,
            created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $tryIndex("CREATE INDEX idx_email_verify_user ON email_verifications(user_id)");
    echo "[OK] email_verifications 表已创建\n";

} else {
    // ==================== SQLite 建表 ====================

    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            qq_openid     TEXT UNIQUE,
            discord_id    TEXT UNIQUE,
            qq_unionid    TEXT,
            password_hash TEXT,
            username      TEXT NOT NULL UNIQUE,
            avatar_url    TEXT DEFAULT '',
            role          TEXT NOT NULL DEFAULT 'visitor'
                          CHECK(role IN ('visitor','member','manager','representative','super_admin')),
            status        TEXT NOT NULL DEFAULT 'active'
                          CHECK(status IN ('active','disabled','banned')),
            created_at    TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
            last_login_at TEXT
        )
    ");
    echo "[OK] users 表已创建\n";

    // 迁移：为已有数据库添加新列（如果尚不存在）
    $tryAlter = function (string $sql) use ($db) {
        try { $db->exec($sql); } catch (PDOException $e) { /* 列已存在，忽略 */ }
    };
    $tryAlter("ALTER TABLE users ADD COLUMN password_hash TEXT");
    $tryAlter("ALTER TABLE users ADD COLUMN email TEXT");
    $tryAlter("ALTER TABLE users ADD COLUMN email_verified_at TEXT");
    $tryAlter("ALTER TABLE users ADD COLUMN avatar_updated_at TEXT");
    $tryAlter("ALTER TABLE users ADD COLUMN nickname TEXT DEFAULT ''");

    $db->exec("CREATE INDEX IF NOT EXISTS idx_users_qq ON users(qq_openid)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_users_discord ON users(discord_id)");
    $db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)");

    $db->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id           TEXT PRIMARY KEY,
            user_id      INTEGER NOT NULL REFERENCES users(id),
            ip_address   TEXT,
            user_agent   TEXT,
            created_at   TEXT NOT NULL DEFAULT (datetime('now')),
            expires_at   TEXT NOT NULL,
            is_valid     INTEGER NOT NULL DEFAULT 1
        )
    ");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)");
    echo "[OK] sessions 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS clubs (
            id            INTEGER PRIMARY KEY,
            province      TEXT NOT NULL DEFAULT '',
            prefecture    TEXT DEFAULT '',
            representative_id INTEGER REFERENCES users(id),
            visibility    TEXT DEFAULT 'public' CHECK(visibility IN ('public','members_only')),
            country       TEXT DEFAULT 'china'
        )
    ");
    echo "[OK] clubs 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS audit_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER REFERENCES users(id),
            action      TEXT NOT NULL,
            target_type TEXT,
            target_id   INTEGER,
            details     TEXT,
            ip_address  TEXT,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        )
    ");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)");
    echo "[OK] audit_logs 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS rate_limits (
            ip_address  TEXT NOT NULL,
            endpoint    TEXT NOT NULL,
            hit_count   INTEGER DEFAULT 1,
            window_start TEXT NOT NULL DEFAULT (datetime('now')),
            PRIMARY KEY (ip_address, endpoint)
        )
    ");
    echo "[OK] rate_limits 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS club_memberships (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            club_id     INTEGER NOT NULL,
            role        TEXT NOT NULL DEFAULT 'member'
                        CHECK(role IN ('member','manager','representative')),
            status      TEXT NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active','pending','rejected','left','kicked')),
            joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
            left_at     TEXT,
            UNIQUE(user_id, club_id)
        )
    ");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_memberships_user ON club_memberships(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_memberships_club ON club_memberships(club_id)");
    echo "[OK] club_memberships 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS club_verification_codes (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id     INTEGER NOT NULL,
            code        TEXT NOT NULL,
            created_by  INTEGER NOT NULL REFERENCES users(id),
            max_uses    INTEGER DEFAULT 50,
            use_count   INTEGER DEFAULT 0,
            expires_at  TEXT,
            is_active   INTEGER NOT NULL DEFAULT 1,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        )
    ");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_verify_codes_club ON club_verification_codes(club_id)");
    echo "[OK] club_verification_codes 表已创建\n";

    $db->exec("
        CREATE TABLE IF NOT EXISTS email_verifications (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            email       TEXT NOT NULL,
            code        TEXT NOT NULL,
            expires_at  TEXT NOT NULL,
            used        INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        )
    ");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_email_verify_user ON email_verifications(user_id)");
    echo "[OK] email_verifications 表已创建\n";
}

echo "\n所有数据库表创建完成！\n";
