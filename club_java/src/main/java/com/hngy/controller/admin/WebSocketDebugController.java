package com.hngy.controller.admin;

import com.hngy.common.result.R;
import com.hngy.websocket.ChatWebSocketHandler;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket 调试控制器
 * 用于测试和调试 WebSocket 连接状态
 *
 * @author xhy
 * @since 2025-01-28
 */
@RestController
@RequestMapping("/admin/websocket")
@Api(tags = "WebSocket调试接口（管理员）")
@RequiredArgsConstructor
@Slf4j
public class WebSocketDebugController {

    private final ChatWebSocketHandler chatWebSocketHandler;

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
                                      @RequestParam(defaultValue = "activity_cancel") String type,
                                      @RequestParam(defaultValue = "测试通知") String title,
                                      @RequestParam(defaultValue = "这是一条测试消息") String message) {
        log.info("【WebSocket调试】测试发送通知给用户 {}，类型: {}", userId, type);

        boolean isOnline = chatWebSocketHandler.isUserOnline(userId);
        if (!isOnline) {
            return R.error("用户 " + userId + " 不在线，无法发送测试通知");
        }

        // 构建测试通知消息（统一格式）
        String testMessage = String.format(
            "{\"type\":\"%s_notification\",\"title\":\"%s\",\"message\":\"%s\",\"extraInfo\":null,\"activityId\":999,\"activityTitle\":\"%s\",\"timestamp\":%d}",
            type, title, message, title, System.currentTimeMillis()
        );

        chatWebSocketHandler.sendMessageToUser(userId, testMessage);
        return R.success("测试通知已发送给用户 " + userId);
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
            @RequestParam(defaultValue = "activity_cancel") String type,
            @RequestParam(defaultValue = "系统广播通知") String title,
            @RequestParam(defaultValue = "这是一条系统广播消息") String message) {
        log.info("【WebSocket调试】开始向所有在线用户广播通知，类型: {}", type);

        // 获取所有在线用户
        java.util.Set<Long> onlineUserIds = chatWebSocketHandler.getOnlineUserIds();
        int totalUsers = onlineUserIds.size();

        if (totalUsers == 0) {
            return R.error("当前没有在线用户");
        }

        // 构建广播通知消息（统一格式）
        String broadcastMessage = String.format(
            "{\"type\":\"%s_notification\",\"title\":\"%s\",\"message\":\"%s\",\"extraInfo\":null,\"activityId\":999,\"activityTitle\":\"%s\",\"timestamp\":%d}",
            type, title, message, title, System.currentTimeMillis()
        );

        // 向所有在线用户发送消息
        int successCount = 0;
        int failCount = 0;

        for (Long userId : onlineUserIds) {
            try {
                chatWebSocketHandler.sendMessageToUser(userId, broadcastMessage);
                successCount++;
                log.debug("【WebSocket调试】成功向用户 {} 发送广播消息", userId);
            } catch (Exception e) {
                failCount++;
                log.error("【WebSocket调试】向用户 {} 发送广播消息失败: {}", userId, e.getMessage());
            }
        }

        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("totalOnlineUsers", totalUsers);
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("onlineUserIds", onlineUserIds);
        result.put("broadcastMessage", message);

        log.info("【WebSocket调试】广播完成，总在线用户: {}，成功: {}，失败: {}", totalUsers, successCount, failCount);

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
