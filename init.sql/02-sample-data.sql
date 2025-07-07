-- NextBill 개발 환경용 추가 테스트 데이터
-- 이 파일은 01-init-database.sql 다음에 실행됩니다

-- 추가 테스트 사용자들
INSERT IGNORE INTO users (email, name, is_email_alert_enabled, email_alert_7days, email_alert_3days, email_alert_1day, email_alert_dday) 
VALUES 
('user1@test.com', '김철수', TRUE, TRUE, FALSE, TRUE, TRUE),
('user2@test.com', '이영희', FALSE, FALSE, FALSE, FALSE, FALSE),
('user3@test.com', '박민수', TRUE, TRUE, TRUE, FALSE, TRUE);

-- 더 많은 테스트 구독 데이터
INSERT IGNORE INTO subscriptions (user_id, name, cost, billing_cycle, start_date, next_payment_date, is_paused)
SELECT u.user_id, '디즈니플러스', 9900, 'MONTHLY', '2024-01-01', CURDATE(), FALSE FROM users u WHERE u.email = 'user1@test.com'
UNION ALL
SELECT u.user_id, 'Apple One', 21500, 'MONTHLY', '2024-02-01', DATE_ADD(CURDATE(), INTERVAL 2 DAY), FALSE FROM users u WHERE u.email = 'user1@test.com'
UNION ALL
SELECT u.user_id, 'Adobe Creative Cloud', 24000, 'MONTHLY', '2024-03-01', DATE_ADD(CURDATE(), INTERVAL 5 DAY), TRUE FROM users u WHERE u.email = 'user1@test.com'
UNION ALL
SELECT u.user_id, 'Microsoft 365', 12500, 'MONTHLY', '2024-01-15', DATE_ADD(CURDATE(), INTERVAL -2 DAY), FALSE FROM users u WHERE u.email = 'user2@test.com'
UNION ALL
SELECT u.user_id, 'Amazon Prime', 8900, 'YEARLY', '2024-01-01', DATE_ADD(CURDATE(), INTERVAL 30 DAY), FALSE FROM users u WHERE u.email = 'user3@test.com';

-- 다양한 상태의 알림 데이터
INSERT IGNORE INTO notifications (user_id, subscription_id, message, type, priority, is_read, days_until)
SELECT 
    u.user_id,
    s.subscription_id,
    CONCAT(s.name, ' 구독이 오늘 결제됩니다!'),
    'PAYMENT_TODAY',
    'HIGH',
    FALSE,
    0
FROM users u 
JOIN subscriptions s ON u.user_id = s.user_id 
WHERE u.email = 'user1@test.com' AND s.name = '디즈니플러스'
UNION ALL
SELECT 
    u.user_id,
    s.subscription_id,
    CONCAT(s.name, ' 구독 결제일이 지났습니다.'),
    'PAYMENT_OVERDUE',
    'HIGH',
    TRUE,
    -2
FROM users u 
JOIN subscriptions s ON u.user_id = s.user_id 
WHERE u.email = 'user2@test.com' AND s.name = 'Microsoft 365'
UNION ALL
SELECT 
    u.user_id,
    NULL,
    'NextBill 서비스에 오신 것을 환영합니다!',
    'SYSTEM',
    'LOW',
    TRUE,
    NULL
FROM users u WHERE u.email = 'test@example.com';

-- 알림 상태 데이터
INSERT IGNORE INTO alert_statuses (subscription_id, alert_date, alert_type, is_sent, sent_at)
SELECT s.subscription_id, CURDATE(), 'D_DAY', TRUE, NOW()
FROM subscriptions s 
JOIN users u ON s.user_id = u.user_id 
WHERE u.email = 'user1@test.com' AND s.name = '디즈니플러스';

-- 통계 정보 출력
SELECT 
    'Database Statistics' as info,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
    (SELECT COUNT(*) FROM notifications) as total_notifications,
    (SELECT COUNT(*) FROM alert_statuses) as total_alert_statuses;
