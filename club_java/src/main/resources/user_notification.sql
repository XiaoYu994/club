-- 用户消息通知表
CREATE TABLE `user_notification` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `type` VARCHAR(50) NOT NULL COMMENT '通知类型 activity_cancel=活动取消 check_in=签到成功 apply_review=申请审核',
  `title` VARCHAR(255) NOT NULL COMMENT '通知标题',
  `message` TEXT NOT NULL COMMENT '通知内容',
  `related_id` BIGINT COMMENT '关联ID（如活动ID、申请ID等）',
  `is_read` TINYINT DEFAULT 0 COMMENT '是否已读 0=未读 1=已读',
  `ext_data` TEXT COMMENT '扩展数据JSON',
  `create_time` BIGINT NOT NULL COMMENT '创建时间',
  `read_time` BIGINT COMMENT '已读时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户消息通知表';
