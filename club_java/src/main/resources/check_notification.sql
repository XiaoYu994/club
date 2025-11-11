-- 检查user_notification表是否存在
SHOW TABLES LIKE 'user_notification';

-- 查看表结构
DESC user_notification;

-- 查看所有通知数据
SELECT * FROM user_notification ORDER BY create_time DESC;

-- 查看特定用户的通知（请将1替换为你的测试用户ID）
SELECT * FROM user_notification WHERE user_id = 1 ORDER BY create_time DESC;

-- 查看未读通知数量
SELECT user_id, COUNT(*) as unread_count
FROM user_notification
WHERE is_read = 0
GROUP BY user_id;

-- 插入测试数据（用于测试，user_id请改为你的测试用户ID）
-- INSERT INTO user_notification (user_id, type, title, message, related_id, is_read, create_time)
-- VALUES (1, 'activity_cancel', '活动取消通知', '您报名的活动 "测试活动" 已被取消', 1, 0, UNIX_TIMESTAMP() * 1000);
