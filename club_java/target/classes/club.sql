SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for club_info (社团信息表)
-- ----------------------------
DROP TABLE IF EXISTS `club_info`;
CREATE TABLE `club_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '社团ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '社团名称',
  `logo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '社团logo',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '社团简介',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `order_num` int NOT NULL DEFAULT 9999 COMMENT '排序号',
  `type` int NOT NULL DEFAULT 0 COMMENT '社团类型 0=普通社团 1=院级社团 2=校级社团',
  `member_count` int NOT NULL DEFAULT 0 COMMENT '社团成员数',
  `join_count` int NOT NULL DEFAULT 0 COMMENT '申请加入数',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '浏览量',
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '社团地址',
  `contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '联系方式',
  `create_user_id` int NOT NULL DEFAULT 0 COMMENT '创建人ID(系统管理员)',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '社团自定义表单',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '社团扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_name` (`name`) COMMENT '社团名称唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_member (社团成员表)
-- ----------------------------
DROP TABLE IF EXISTS `club_member`;
CREATE TABLE `club_member` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '成员ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `type` int NOT NULL DEFAULT 0 COMMENT '成员类型 0=普通成员 1=干部 2=社长 3=指导老师',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常 2=退社申请中',
  `join_time` bigint NOT NULL DEFAULT 0 COMMENT '加入时间',
  `quit_time` bigint NOT NULL DEFAULT 0 COMMENT '退出时间',
  `position` varchar(50) COMMENT '职位名称',
  `department` varchar(50) COMMENT '部门',
  `intro` text COMMENT '个人简介',
  `ext_json` longtext COMMENT '成员扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_club`(`user_id`, `club_id`)
) COMMENT = '社团成员表';

-- ----------------------------
-- Table structure for club_recruitment_config (招新配置表)
-- ----------------------------
DROP TABLE IF EXISTS `club_recruitment_config`;
CREATE TABLE `club_recruitment_config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '配置名称',
  `semester` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '学期(如2023-2024-1)',
  `global_start_time` bigint NOT NULL DEFAULT 0 COMMENT '全局招新开始时间',
  `global_end_time` bigint NOT NULL DEFAULT 0 COMMENT '全局招新结束时间',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=启用',
  `type_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '社团类型配置JSON',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '配置说明',
  `create_user_id` int NOT NULL DEFAULT 0 COMMENT '创建人ID',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_semester`(`semester`) COMMENT '学期唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '招新配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_recruitment (社团招新表)
-- ----------------------------
DROP TABLE IF EXISTS `club_recruitment`;
CREATE TABLE `club_recruitment` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '招新ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `config_id` int DEFAULT NULL COMMENT '招新配置ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '招新标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '招新描述',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=审核中 1=进行中 2=已结束 3=已驳回',
  `start_time` bigint NOT NULL DEFAULT 0 COMMENT '开始时间',
  `end_time` bigint NOT NULL DEFAULT 0 COMMENT '结束时间',
  `plan_count` int NOT NULL DEFAULT 0 COMMENT '计划招收人数',
  `join_count` int NOT NULL DEFAULT 0 COMMENT '已申请人数',
  `pass_count` int NOT NULL DEFAULT 0 COMMENT '已通过人数',
  `need_interview` int NOT NULL DEFAULT 0 COMMENT '是否需要面试 0=不需要 1=需要',
  `poster` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '招新海报',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '招新表单JSON',
  `review_comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '审核意见',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '招新扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE,
  INDEX `idx_config_id`(`config_id`) USING BTREE,
  UNIQUE INDEX `idx_club_recruitment_title`(`club_id`, `title`) COMMENT '同一社团下招新标题唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团招新表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_apply (社团申请表)
-- ----------------------------
DROP TABLE IF EXISTS `club_apply`;
CREATE TABLE `club_apply` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '申请ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `recruitment_id` int NOT NULL COMMENT '招新ID',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=待审核 1=已通过 2=已拒绝 3=已面试 4=已入社',
  `interview_time` bigint NOT NULL DEFAULT 0 COMMENT '面试时间',
  `interview_place` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '面试地点',
  `interview_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '面试备注',
  `interview_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '面试结果',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '申请表单数据JSON',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '反馈意见',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '申请扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_recruit`(`user_id`, `recruitment_id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团申请表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_activity (社团活动表)
-- ----------------------------
DROP TABLE IF EXISTS `club_activity`;
CREATE TABLE `club_activity` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '活动ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '活动标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '活动描述',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=取消 1=计划中 2=进行中 3=已结束',
  `start_time` bigint NOT NULL DEFAULT 0 COMMENT '开始时间',
  `end_time` bigint NOT NULL DEFAULT 0 COMMENT '结束时间',
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '活动地点',
  `join_count` int NOT NULL DEFAULT 0 COMMENT '参与人数',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '浏览量',
  `poster` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '活动海报',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '活动表单JSON',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '活动扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团活动表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_quit (社团退出申请表)
-- ----------------------------
DROP TABLE IF EXISTS `club_quit`;
CREATE TABLE `club_quit` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '退出申请ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `member_id` int NOT NULL COMMENT '成员ID',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '退出原因',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=待审核 1=已通过 2=已拒绝',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '反馈意见',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '退出扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_club`(`user_id`, `club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团退出申请表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_message (社团消息表)
-- ----------------------------
DROP TABLE IF EXISTS `club_message`;
CREATE TABLE `club_message` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `user_id` int NOT NULL COMMENT '发送用户ID',
  `type` int NOT NULL DEFAULT 0 COMMENT '消息类型 0=普通消息 1=通知公告 2=活动通知',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `attachments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '附件JSON',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '消息扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团消息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_message_read (消息阅读表)
-- ----------------------------
DROP TABLE IF EXISTS `club_message_read`;
CREATE TABLE `club_message_read` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '阅读ID',
  `message_id` int NOT NULL COMMENT '消息ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=未读 1=已读',
  `read_time` bigint NOT NULL DEFAULT 0 COMMENT '阅读时间',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_message_user`(`message_id`, `user_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '消息阅读表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_admin (管理员表)
-- ----------------------------
DROP TABLE IF EXISTS `club_admin`;
CREATE TABLE `club_admin` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '管理员名称',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '描述',
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '手机号',
  `login_count` int NOT NULL DEFAULT 0 COMMENT '登录次数',
  `type` int NOT NULL DEFAULT 0 COMMENT '类型 0=普通管理员 1=超级管理员',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `last_login_time` bigint NOT NULL DEFAULT 0 COMMENT '最后登录时间',
  `permissions` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '系统权限(逗号分隔)',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '管理员扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_username`(`username`) COMMENT '管理员用户名唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '管理员表' ROW_FORMAT = DYNAMIC;

-- 初始管理员账号 用户名:admin 密码:123456
INSERT INTO `club_admin` VALUES (1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', '超级管理员', NULL, 0, 1, 1, 0, 'sys_manage,club_create,admin_assign', NULL, UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

-- ----------------------------
-- ----------------------------
-- Table structure for club_user (用户表)
-- ----------------------------
DROP TABLE IF EXISTS `club_user`;
CREATE TABLE `club_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名称',
  `account` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '账号',
  `password` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '头像',
  `gender` int NOT NULL DEFAULT 0 COMMENT '性别 0=未知 1=男 2=女',
  `mobile` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '邮箱',
  `openid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '微信OpenID',
  `unionid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '微信UnionID',
  `last_login_time` bigint NOT NULL DEFAULT 0 COMMENT '最后登录时间',
  `login_count` int NOT NULL DEFAULT 0 COMMENT '登录次数',
  `student_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '学号',
  `college` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '学院',
  `major` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '专业',
  `class_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '班级',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '用户表单数据JSON',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '用户扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_account`(`account`) USING BTREE,
  UNIQUE INDEX `idx_student_id`(`student_id`) COMMENT '学号唯一索引',
  UNIQUE INDEX `idx_openid`(`openid`) USING BTREE COMMENT '微信OpenID唯一索引',
  UNIQUE INDEX `idx_unionid`(`unionid`) COMMENT '微信UnionID唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_department (社团部门表)
-- ----------------------------
DROP TABLE IF EXISTS `club_department`;
CREATE TABLE `club_department` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '部门ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '部门名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '部门描述',
  `order_num` int NOT NULL DEFAULT 9999 COMMENT '排序号',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `member_count` int NOT NULL DEFAULT 0 COMMENT '成员数量',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '部门扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE,
  UNIQUE INDEX `idx_club_dept_name`(`club_id`, `name`) COMMENT '同一社团下部门名称唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团部门表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_notice (社团通知公告表)
-- ----------------------------
DROP TABLE IF EXISTS `club_notice`;
CREATE TABLE `club_notice` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '通知ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '通知内容',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `type` int NOT NULL DEFAULT 0 COMMENT '类型 0=普通通知 1=重要通知',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '浏览量',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '通知扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE,
  UNIQUE INDEX `idx_club_notice_title`(`club_id`, `title`) COMMENT '同一社团下通知标题唯一索引'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团通知公告表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_setup (系统设置表)
-- ----------------------------
DROP TABLE IF EXISTS `club_setup`;
CREATE TABLE `club_setup` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '设置类型',
  `key_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '设置键',
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '设置值',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_type_key`(`type`, `key_name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统设置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- ----------------------------
-- Table structure for club_chat_group (社团聊天群组表)
-- ----------------------------
DROP TABLE IF EXISTS `club_chat_group`;
CREATE TABLE `club_chat_group` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '群组ID',
  `club_id` int NOT NULL COMMENT '社团ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '群组名称',
  `type` int NOT NULL DEFAULT 0 COMMENT '群组类型 0=公共群 1=部门群 2=管理员群',
  `creator_id` int NOT NULL COMMENT '创建者ID',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '群头像',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '群组描述',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `member_count` int NOT NULL DEFAULT 0 COMMENT '成员数量',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_club_id`(`club_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '社团聊天群组表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_chat_message (聊天消息表)
-- ----------------------------
DROP TABLE IF EXISTS `club_chat_message`;
CREATE TABLE `club_chat_message` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `group_id` int DEFAULT NULL COMMENT '群组ID(为空表示私聊)',
  `sender_id` int NOT NULL COMMENT '发送者ID',
  `receiver_id` int DEFAULT NULL COMMENT '接收者ID(私聊时有值)',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `content_type` int NOT NULL DEFAULT 0 COMMENT '内容类型 0=文本 1=图片 2=语音 3=文件 4=位置',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=已删除 1=正常 2=已撤回',
  `ref_message_id` int DEFAULT NULL COMMENT '引用消息ID(回复某条消息)',
  `media_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '媒体文件URL',
  `media_size` int DEFAULT NULL COMMENT '媒体文件大小(KB)',
  `read_count` int NOT NULL DEFAULT 0 COMMENT '已读数量',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_group`(`group_id`) USING BTREE,
  INDEX `idx_private`(`sender_id`, `receiver_id`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '聊天消息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_chat_user_relation (用户-群组关系表)
-- ----------------------------
DROP TABLE IF EXISTS `club_chat_user_relation`;
CREATE TABLE `club_chat_user_relation` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '关系ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `group_id` int NOT NULL COMMENT '群组ID',
  `nickname` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '群内昵称',
  `role` int NOT NULL DEFAULT 0 COMMENT '角色 0=普通成员 1=管理员 2=群主',
  `mute` int NOT NULL DEFAULT 0 COMMENT '是否禁言 0=否 1=是',
  `join_time` bigint NOT NULL DEFAULT 0 COMMENT '加入时间',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_group`(`user_id`, `group_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户-群组关系表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_chat_read_status (消息阅读状态表)
-- ----------------------------
DROP TABLE IF EXISTS `club_chat_read_status`;
CREATE TABLE `club_chat_read_status` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `message_id` int NOT NULL COMMENT '消息ID',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=未读 1=已读',
  `read_time` bigint NOT NULL DEFAULT 0 COMMENT '阅读时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `idx_user_message`(`user_id`, `message_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '消息阅读状态表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for club_activity_apply (活动报名表)
-- ----------------------------
DROP TABLE IF EXISTS `club_activity_apply`;
CREATE TABLE `club_activity_apply` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '报名ID',
  `activity_id` int NOT NULL COMMENT '活动ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=待审核 1=已通过 2=已拒绝',
  `is_member` int NOT NULL DEFAULT 0 COMMENT '是否为社团成员 0=否 1=是',
  `forms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '报名表单数据JSON',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '反馈信息',
  `check_in_status` int NOT NULL DEFAULT 0 COMMENT '签到状态 0=未签到 1=已签到',
  `check_in_time` bigint NOT NULL DEFAULT 0 COMMENT '签到时间',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_activity_user`(`activity_id`, `user_id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_activity_id`(`activity_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '活动报名表' ROW_FORMAT = DYNAMIC;
-- ----------------------------
-- Table structure for system_announcement (系统公告表)
-- ----------------------------
DROP TABLE IF EXISTS `system_announcement`;
CREATE TABLE `system_announcement` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '公告ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '公告标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '公告内容',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态 0=禁用 1=正常',
  `type` int NOT NULL DEFAULT 0 COMMENT '类型 0=普通公告 1=重要公告 2=紧急公告',
  `publish_time` bigint NOT NULL DEFAULT 0 COMMENT '发布时间',
  `end_time` bigint NOT NULL DEFAULT 0 COMMENT '结束时间',
  `view_count` int NOT NULL DEFAULT 0 COMMENT '浏览量',
  `publisher_id` int NOT NULL COMMENT '发布者ID(管理员ID)',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '封面图片',
  `is_top` int NOT NULL DEFAULT 0 COMMENT '是否置顶 0=否 1=是',
  `target_type` int NOT NULL DEFAULT 0 COMMENT '目标类型 0=所有用户 1=特定用户组',
  `target_users` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '目标用户JSON(当target_type=1时有效)',
  `ext_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '公告扩展信息JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_status_type`(`status`, `type`) USING BTREE,
  INDEX `idx_publish_time`(`publish_time`) USING BTREE,
  INDEX `idx_is_top`(`is_top`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统公告表' ROW_FORMAT = DYNAMIC;
-- ----------------------------
-- Table structure for user_feedback (用户反馈表)
-- ----------------------------
DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '反馈内容',
  `type` int NOT NULL DEFAULT 0 COMMENT '类型 0=问题反馈 1=功能建议 2=其他',
  `status` int NOT NULL DEFAULT 0 COMMENT '状态 0=未处理 1=处理中 2=已处理',
  `reply` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '回复内容',
  `contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '联系方式',
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '图片JSON',
  `create_time` bigint NOT NULL DEFAULT 0 COMMENT '创建时间',
  `update_time` bigint NOT NULL DEFAULT 0 COMMENT '修改时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户反馈表' ROW_FORMAT = DYNAMIC;
-- 更新注释，说明管理员权限体系
-- ----------------------------
-- 系统设置示例：管理员权限配置
-- ----------------------------
-- 系统管理员权限配置
-- INSERT INTO `club_setup` VALUES (1, 'sys_permission', 'sys_admin_permission', '[{"code":"sys_manage","name":"系统管理"},{"code":"club_create","name":"社团创建"},{"code":"admin_assign","name":"管理员指派"},{"code":"user_manage","name":"用户管理"}]', UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

-- 社团管理员权限配置
-- INSERT INTO `club_setup` VALUES (2, 'club_permission', 'club_admin_permission', '[{"code":"club_manage","name":"社团管理"},{"code":"member_manage","name":"成员管理"},{"code":"recruitment_manage","name":"招新管理"},{"code":"activity_manage","name":"活动管理"},{"code":"message_manage","name":"消息管理"},{"code":"department_manage","name":"部门管理"}]', UNIX_TIMESTAMP()*1000, UNIX_TIMESTAMP()*1000);

SET FOREIGN_KEY_CHECKS = 1;