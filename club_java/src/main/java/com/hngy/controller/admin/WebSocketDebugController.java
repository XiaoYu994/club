package com.hngy.controller.admin;

import com.hngy.common.constant.NotificationConstant;
import com.hngy.common.result.R;
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
        result.put("onlineUserIds", chatWebSocketHandler.getOnlineUserIds());
        result.put("onlineCount", chatWebSocketHandler.getOnlineCount());
        log.info("【WebSocket调试】查询在线用户，数量: {}", chatWebSocketHandler.getOnlineCount());
        return R.success(result);
    }

    @ApiOperation("测试发送通知给指定用户")
    @PostMapping("/test-notification")
    public R<String> testNotification(@RequestParam Long userId,
                                      @RequestParam(defaultValue = "admin_notification") String type,
                                      @RequestParam(defaultValue = "测试通知") String title,
                                      @RequestParam(defaultValue = "这是一条测试消息") String message) {
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
            // 构建测试通知消息（统一格式）
            String testMessage = String.format(
                "{\"type\":\"%s_notification\",\"title\":\"%s\",\"message\":\"%s\",\"extraInfo\":null,\"activityId\":999,\"activityTitle\":\"%s\",\"timestamp\":%d}",
                type, title, message, title, System.currentTimeMillis()
            );

            try {
                chatWebSocketHandler.sendMessageToUser(userId, testMessage);
                return R.success("通知已保存到数据库，并通过WebSocket实时推送给在线用户 " + userId);
            } catch (Exception e) {
                log.error("【WebSocket调试】发送实时通知失败: {}", e.getMessage());
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
    public R<Map<String, Object>> broadcastNotification(
            @RequestParam(defaultValue = "system_broadcast") String type,
            @RequestParam(defaultValue = "系统广播通知") String title,
            @RequestParam(defaultValue = "这是一条系统广播消息") String message) {
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

        // 构建广播通知消息（统一格式）
        String broadcastMessage = String.format(
            "{\"type\":\"%s_notification\",\"title\":\"%s\",\"message\":\"%s\",\"extraInfo\":null,\"activityId\":999,\"activityTitle\":\"%s\",\"timestamp\":%d}",
            type, title, message, title, System.currentTimeMillis()
        );

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
                log.error("【WebSocket调试】向用户 {} 发送广播消息失败: {}", userId, e.getMessage());
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
