-- NextBill 데이터베이스 초기화 스크립트
-- 프로덕션 환경용 테이블 생성 스크립트

-- 문자셋 설정
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 기존 테이블 삭제 (개발 환경에서만 사용, 프로덕션에서는 주석 처리)
-- DROP TABLE IF EXISTS alert_statuses;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS subscriptions;
-- DROP TABLE IF EXISTS users;

-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100),
    name VARCHAR(50),
    phone_number VARCHAR(20),
    is_email_alert_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_alert_7days BOOLEAN NOT NULL DEFAULT TRUE,
    email_alert_3days BOOLEAN NOT NULL DEFAULT TRUE,
    email_alert_1day BOOLEAN NOT NULL DEFAULT TRUE,
    email_alert_dday BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    cost INTEGER NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('YEARLY', 'MONTHLY', 'WEEKLY', 'CUSTOM')),
    start_date DATE NOT NULL,
    next_payment_date DATE NOT NULL,
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at DATETIME(6),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_subscriptions_user_id (user_id),
    INDEX idx_subscriptions_next_payment_date (next_payment_date),
    INDEX idx_subscriptions_is_paused (is_paused),
    INDEX idx_subscriptions_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subscription_id BIGINT,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PAYMENT_DUE', 'PAYMENT_TODAY', 'PAYMENT_OVERDUE', 'SUBSCRIPTION_ADDED', 'SUBSCRIPTION_PAUSED', 'SUBSCRIPTION_RESUMED', 'SYSTEM')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME(6),
    days_until INTEGER,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. alert_statuses 테이블 생성
CREATE TABLE IF NOT EXISTS alert_statuses (
    alert_status_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subscription_id BIGINT NOT NULL,
    alert_date DATE NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('D_7', 'D_3', 'D_1', 'D_DAY')),
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at DATETIME(6),
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE,
    INDEX idx_alert_statuses_subscription_id (subscription_id),
    INDEX idx_alert_statuses_alert_date (alert_date),
    INDEX idx_alert_statuses_alert_type (alert_type),
    INDEX idx_alert_statuses_is_sent (is_sent),
    UNIQUE KEY uk_alert_statuses (subscription_id, alert_date, alert_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 샘플 데이터 삽입 (개발/테스트 환경용)
-- 프로덕션에서는 주석 처리하거나 제거하세요

-- 테스트 사용자 생성
INSERT IGNORE INTO users (email, name, is_email_alert_enabled, email_alert_7days, email_alert_3days, email_alert_1day, email_alert_dday) 
VALUES 
('test@example.com', '테스트 사용자', TRUE, TRUE, TRUE, TRUE, TRUE),
('admin@nextbill.com', '관리자', TRUE, TRUE, TRUE, TRUE, TRUE);

-- 테스트 구독 생성 (test@example.com 사용자용)
INSERT IGNORE INTO subscriptions (user_id, name, cost, billing_cycle, start_date, next_payment_date, is_paused)
SELECT 
    u.user_id,
    '넷플릭스 프리미엄',
    17000,
    'MONTHLY',
    '2024-01-15',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    FALSE
FROM users u WHERE u.email = 'test@example.com'
UNION ALL
SELECT 
    u.user_id,
    'YouTube Premium',
    14900,
    'MONTHLY',
    '2024-02-01',
    DATE_ADD(CURDATE(), INTERVAL 3 DAY),
    FALSE
FROM users u WHERE u.email = 'test@example.com'
UNION ALL
SELECT 
    u.user_id,
    'Spotify Premium',
    10900,
    'MONTHLY',
    '2024-01-01',
    DATE_ADD(CURDATE(), INTERVAL 1 DAY),
    FALSE
FROM users u WHERE u.email = 'test@example.com';

-- 테스트 알림 생성
INSERT IGNORE INTO notifications (user_id, subscription_id, message, type, priority, is_read, days_until)
SELECT 
    u.user_id,
    s.subscription_id,
    CONCAT(s.name, ' 구독이 곧 결제됩니다.'),
    'PAYMENT_DUE',
    'MEDIUM',
    FALSE,
    DATEDIFF(s.next_payment_date, CURDATE())
FROM users u 
JOIN subscriptions s ON u.user_id = s.user_id 
WHERE u.email = 'test@example.com' 
AND s.name = '넷플릭스 프리미엄';

-- 인덱스 최적화
OPTIMIZE TABLE users;
OPTIMIZE TABLE subscriptions;
OPTIMIZE TABLE notifications;
OPTIMIZE TABLE alert_statuses;

-- 권한 설정 (필요시)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON nextbill_prod.* TO 'nextbill_user'@'%';
-- FLUSH PRIVILEGES;

-- 완료 메시지
SELECT 'NextBill 데이터베이스 초기화가 완료되었습니다.' as message;
