package com.hngy.controller.admin;

import com.alibaba.fastjson.JSONObject;
import com.hngy.common.constant.NotificationConstant;
import com.hngy.common.result.R;
import com.hngy.entity.dto.BroadcastNotificationDTO;
import com.hngy.entity.dto.TestNotificationDTO;
import com.hngy.entity.po.User;
import com.hngy.mapper.UserMapper;
import com.hngy.service.IUserNotificationService;
import com.hngy.websocket.ChatWebSocketHandler;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WebSocket 调试控制器
 * 用于测试和调试 WebSocket 连接状态
 *
 * @author xhy
 * @since 2025-10-28
 */
@RestController
@RequestMapping("/admin/websocket")
@Api(tags = "WebSocket调试接口（管理员）")
@RequiredArgsConstructor
@Slf4j
public class WebSocketDebugController {

    private final ChatWebSocketHandler chatWebSocketHandler;
    private final IUserNotificationService userNotificationService;
    private final UserMapper userMapper;

    @ApiOperation("获取在线用户列表")
    @GetMapping("/online-users")
    public R<Map<String, Object>> getOnlineUsers() {
        Map<String, Object> result = new HashMap<>();
        java.util.Set<Long> onlineUserIds = chatWebSocketHandler.getOnlineUserIds();
        
        // 获取在线用户的详细信息
        java.util.List<Map<String, Object>> onlineUserDetails = new java.util.ArrayList<>();
        for (Long userId : onlineUserIds) {
            User user = userMapper.selectById(userId);
            if (user != null) {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("userId", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("avatar", user.getAvatar());
                userInfo.put("realName", user.getUsername()); // User实体没有realName字段,使用username
                userInfo.put("studentId", user.getStudentId());
                onlineUserDetails.add(userInfo);
            }
        }
        
        // 获取总用户数
        long totalUserCount = userMapper.selectCount(null);
        
        result.put("onlineUsers", onlineUserDetails);
        result.put("onlineCount", onlineUserIds.size());
        result.put("totalUserCount", totalUserCount);
        log.info("【WebSocket调试】查询在线用户，数量: {}，总用户数: {}", onlineUserIds.size(), totalUserCount);
        return R.success(result);
    }

    @ApiOperation("测试发送通知给指定用户")
    @PostMapping("/test-notification")
    public R<String> testNotification(@RequestBody TestNotificationDTO dto) {
        Long userId = dto.getUserId();
        String type = dto.getType() != null ? dto.getType() : "admin_notification";
        String title = dto.getTitle() != null ? dto.getTitle() : "测试通知";
        String message = dto.getMessage() != null ? dto.getMessage() : "这是一条测试消息";
        log.info("【WebSocket调试】测试发送通知给用户 {}，类型: {}", userId, type);

        // 1. 先保存通知到数据库（不管用户是否在线）
        try {
            userNotificationService.createNotification(
                userId,
                NotificationConstant.TYPE_ADMIN_NOTIFICATION,
                title,
                message,
                null,  // 测试通知没有关联ID
                null   // 没有扩展数据
            );
            log.info("【管理员通知】成功保存通知到用户 {} 的消息表", userId);
        } catch (Exception e) {
            log.error("【管理员通知】保存通知到用户 {} 的消息表失败: {}", userId, e.getMessage());
            return R.error("保存通知到数据库失败: " + e.getMessage());
        }

        // 2. 检查用户是否在线，如果在线则发送WebSocket实时通知
        boolean isOnline = chatWebSocketHandler.isUserOnline(userId);

        if (isOnline) {
            // 构建测试通知消息（统一格式，确保类型正确）
            // 特殊处理：admin_notification 需要转换为 admin_notification_notification
            String notificationType;
            if ("admin_notification".equals(type)) {
                notificationType = "admin_notification_notification";
            } else if (type.endsWith("_notification")) {
                notificationType = type;
            } else {
                notificationType = type + "_notification";
            }
            JSONObject notification = new JSONObject();
            notification.put("type", notificationType);
            notification.put("title", title);
            notification.put("message", message);
            notification.put("extraInfo", null);
            notification.put("activityId", null);
            notification.put("activityTitle", null);
            notification.put("timestamp", System.currentTimeMillis());

            try {
                chatWebSocketHandler.sendMessageToUser(userId, notification.toJSONString());
                log.info("【WebSocket调试】成功发送通知给用户 {}，类型: {}", userId, notificationType);
                return R.success("通知已保存到数据库，并通过WebSocket实时推送给在线用户 " + userId);
            } catch (Exception e) {
                log.error("【WebSocket调试】发送实时通知失败: {}", e.getMessage(), e);
                return R.success("通知已保存到数据库，但WebSocket推送失败（用户可在消息列表中查看）");
            }
        } else {
            return R.success("通知已保存到数据库，用户 " + userId + " 当前不在线（用户上线后可在消息列表中查看）");
        }
    }

    @ApiOperation("检查指定用户是否在线")
    @GetMapping("/check-online/{userId}")
    public R<Map<String, Object>> checkUserOnline(@PathVariable Long userId) {
        boolean isOnline = chatWebSocketHandler.isUserOnline(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("isOnline", isOnline);
        log.info("【WebSocket调试】检查用户 {} 在线状态: {}", userId, isOnline);
        return R.success(result);
    }

    @ApiOperation("向所有在线用户广播通知")
    @PostMapping("/broadcast-notification")
    public R<Map<String, Object>> broadcastNotification(@RequestBody BroadcastNotificationDTO dto) {
        String type = dto.getType() != null ? dto.getType() : "system_broadcast";
        String title = dto.getTitle() != null ? dto.getTitle() : "系统广播通知";
        String message = dto.getMessage() != null ? dto.getMessage() : "这是一条系统广播消息";
        log.info("【WebSocket调试】开始向所有用户广播通知，类型: {}", type);

        // 1. 查询所有用户（不仅仅是在线用户）
        List<User> allUsers = userMapper.selectList(null);
        int totalUsers = allUsers.size();

        if (totalUsers == 0) {
            return R.error("系统中没有用户");
        }

        // 2. 保存通知到所有用户的消息表
        int savedCount = 0;
        for (User user : allUsers) {
            try {
                userNotificationService.createNotification(
                    user.getId(),
                    NotificationConstant.TYPE_SYSTEM_BROADCAST,
                    title,
                    message,
                    null,  // 系统广播没有关联ID
                    null   // 没有扩展数据
                );
                savedCount++;
            } catch (Exception e) {
                log.error("【广播通知】保存通知到用户 {} 的消息表失败: {}", user.getId(), e.getMessage());
            }
        }

        // 3. 获取所有在线用户并发送WebSocket实时通知
        java.util.Set<Long> onlineUserIds = chatWebSocketHandler.getOnlineUserIds();
        int onlineCount = onlineUserIds.size();

        // 构建广播通知消息（统一格式，确保类型正确）
        // 特殊处理：system_broadcast 需要转换为 system_broadcast_notification
        String broadcastNotificationType;
        if ("system_broadcast".equals(type)) {
            broadcastNotificationType = "system_broadcast_notification";
        } else if (type.endsWith("_notification")) {
            broadcastNotificationType = type;
        } else {
            broadcastNotificationType = type + "_notification";
        }
        JSONObject broadcastNotification = new JSONObject();
        broadcastNotification.put("type", broadcastNotificationType);
        broadcastNotification.put("title", title);
        broadcastNotification.put("message", message);
        broadcastNotification.put("extraInfo", null);
        broadcastNotification.put("activityId", null);
        broadcastNotification.put("activityTitle", null);
        broadcastNotification.put("timestamp", System.currentTimeMillis());
        String broadcastMessage = broadcastNotification.toJSONString();

        // 向所有在线用户发送WebSocket消息
        int pushSuccessCount = 0;
        int pushFailCount = 0;

        for (Long userId : onlineUserIds) {
            try {
                chatWebSocketHandler.sendMessageToUser(userId, broadcastMessage);
                pushSuccessCount++;
                log.debug("【WebSocket调试】成功向在线用户 {} 发送广播消息", userId);
            } catch (Exception e) {
                pushFailCount++;
                log.error("【WebSocket调试】向用户 {} 发送广播消息失败: {}", userId, e.getMessage(), e);
            }
        }

        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("totalUsers", totalUsers);                   // 总用户数
        result.put("savedToDbCount", savedCount);               // 保存到数据库的数量
        result.put("onlineUsers", onlineCount);                 // 在线用户数
        result.put("pushSuccessCount", pushSuccessCount);       // WebSocket推送成功数
        result.put("pushFailCount", pushFailCount);             // WebSocket推送失败数
        result.put("onlineUserIds", onlineUserIds);
        result.put("broadcastMessage", message);

        log.info("【WebSocket调试】广播完成 - 总用户: {}, 数据库保存: {}, 在线用户: {}, WebSocket推送成功: {}, 失败: {}",
                 totalUsers, savedCount, onlineCount, pushSuccessCount, pushFailCount);

        return R.success(result);
    }

    @ApiOperation("发送简单测试消息给指定用户（用于快速诊断）")
    @PostMapping("/test-push/{userId}")
    public R<Map<String, Object>> testPush(@PathVariable Long userId) {
        log.info("【WebSocket调试】发送测试消息给用户 {}", userId);

        // 检查用户是否在线
        boolean isOnline = chatWebSocketHandler.isUserOnline(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("isOnline", isOnline);

        if (!isOnline) {
            result.put("success", false);
            result.put("message", "用户不在线");
            return R.error("用户 " + userId + " 不在线");
        }

        // 构建简单测试消息
        String testMessage = String.format(
            "{\"type\":\"test_message\",\"content\":\"这是一条测试消息，时间戳: %d\",\"timestamp\":%d}",
            System.currentTimeMillis(),
            System.currentTimeMillis()
        );

        try {
            chatWebSocketHandler.sendMessageToUser(userId, testMessage);
            result.put("success", true);
            result.put("message", "测试消息已发送");
            result.put("sentMessage", testMessage);
            log.info("【WebSocket调试】测试消息已发送给用户 {}", userId);
            return R.success(result);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "发送失败: " + e.getMessage());
            log.error("【WebSocket调试】发送测试消息失败", e);
            return R.error("发送失败: " + e.getMessage());
        }
    }
}
