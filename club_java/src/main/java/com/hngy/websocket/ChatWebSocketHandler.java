package com.hngy.websocket;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.hngy.entity.po.ClubChatGroup;
import com.hngy.entity.po.ClubChatMessage;
import com.hngy.entity.po.User;
import com.hngy.mapper.UserMapper;
import com.hngy.service.IClubChatGroupService;
import com.hngy.service.IClubChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 聊天WebSocket处理器
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    /**
     * 存储WebSocket会话，key为用户ID
     */
    private static final Map<Long, WebSocketSession> USER_SESSIONS = new ConcurrentHashMap<>();
    
    private final IClubChatMessageService chatMessageService;
    private final IClubChatGroupService chatGroupService;
    private final UserMapper userMapper;

    /**
     * 连接建立后的处理
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserId(session);
        if (userId != null) {
            // 存储会话
            USER_SESSIONS.put(userId, session);
            log.info("用户{}建立WebSocket连接，当前在线用户数：{}", userId, USER_SESSIONS.size());
        }
    }

    /**
     * 处理收到的消息
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long senderId = getUserId(session);
        if (senderId == null) {
            log.error("未获取到用户ID，无法处理消息");
            session.close();
            return;
        }

        // 解析消息
        String payload = message.getPayload();
        JSONObject jsonObject = JSON.parseObject(payload);
        
        String type = jsonObject.getString("type");
        
        // 处理不同类型的消息
        if ("group_message".equals(type)) {
            // 群组消息
            handleGroupMessage(senderId, jsonObject);
        } else if ("private_message".equals(type)) {
            // 私聊消息
            handlePrivateMessage(senderId, jsonObject);
        } else if ("heartbeat".equals(type)) {
            // 心跳消息，直接响应
            session.sendMessage(new TextMessage("{\"type\":\"heartbeat_response\"}"));
        } else {
            log.warn("未知消息类型: {}", type);
        }
    }

    /**
     * 处理群组消息
     */
    private void handleGroupMessage(Long senderId, JSONObject jsonObject) {
        Integer groupId = jsonObject.getInteger("groupId");
        String content = jsonObject.getString("content");
        Integer contentType = jsonObject.getInteger("contentType");
        String mediaUrl = jsonObject.getString("mediaUrl");
        String localMsgId = jsonObject.getString("localMsgId");
        
        if (groupId == null) {
            log.error("消息缺少必要参数: groupId");
            return;
        }
        
        // 检查是否是媒体消息类型
        boolean isMediaMessage = contentType != null && (contentType == 1 || contentType == 2); // 1=图片，2=文件
        
        // 对于媒体消息，允许content为空但mediaUrl必须存在
        if (!isMediaMessage && (content == null || content.isEmpty())) {
            log.error("文本消息缺少必要参数: content");
            return;
        }
        
        if (isMediaMessage && (mediaUrl == null || mediaUrl.isEmpty())) {
            log.error("媒体消息缺少必要参数: mediaUrl");
            return;
        }
        
        // 保存消息到数据库
        ClubChatMessage chatMessage = new ClubChatMessage();
        chatMessage.setChatId(groupId);
        chatMessage.setSenderId(senderId.intValue());
        chatMessage.setContent(content != null ? content : ""); // 对于媒体消息，content可能为null
        chatMessage.setContentType(contentType != null ? contentType : 0); // 默认文本类型
        chatMessage.setMediaUrl(mediaUrl);
        chatMessage.setCreateTime(System.currentTimeMillis());
        
        // 持久化消息
        chatMessageService.save(chatMessage);
        
        // 获取群组信息
        ClubChatGroup chatGroup = chatGroupService.getById(groupId);
        if (chatGroup == null) {
            log.error("找不到群组信息，groupId: {}", groupId);
            return;
        }
        
        // 构建广播消息
        JSONObject broadcastMsg = new JSONObject();
        broadcastMsg.put("type", "group_message");
        // 服务端存储后的唯一 ID
        broadcastMsg.put("id", chatMessage.getId());
        broadcastMsg.put("messageId", chatMessage.getId());
        broadcastMsg.put("groupId", groupId);
        broadcastMsg.put("senderId", senderId);
        // 添加发送者信息
        User sender = userMapper.selectById(senderId);
        if (sender != null) {
            broadcastMsg.put("senderName", sender.getUsername());
            broadcastMsg.put("senderAvatar", sender.getAvatar());
        }
        // 将本地生成的 ID 原样返回，供前端替换本地消息
        if (localMsgId != null) {
            broadcastMsg.put("localMsgId", localMsgId);
        }
        broadcastMsg.put("content", chatMessage.getContent());
        broadcastMsg.put("contentType", chatMessage.getContentType());
        broadcastMsg.put("mediaUrl", mediaUrl);
        broadcastMsg.put("timestamp", chatMessage.getCreateTime());
        
        // 广播消息给群组成员
        broadcastGroupMessage(groupId, broadcastMsg.toJSONString());
    }
    
    /**
     * 处理私聊消息
     */
    private void handlePrivateMessage(Long senderId, JSONObject jsonObject) {
        Long receiverId = jsonObject.getLong("receiverId");
        String content = jsonObject.getString("content");
        Integer contentType = jsonObject.getInteger("contentType");
        String mediaUrl = jsonObject.getString("mediaUrl");
        
        if (receiverId == null) {
            log.error("消息缺少必要参数: receiverId");
            return;
        }
        
        // 检查是否是媒体消息类型
        boolean isMediaMessage = contentType != null && (contentType == 1 || contentType == 2); // 1=图片，2=文件
        
        // 对于媒体消息，允许content为空但mediaUrl必须存在
        if (!isMediaMessage && (content == null || content.isEmpty())) {
            log.error("文本消息缺少必要参数: content");
            return;
        }
        
        if (isMediaMessage && (mediaUrl == null || mediaUrl.isEmpty())) {
            log.error("媒体消息缺少必要参数: mediaUrl");
            return;
        }
        
        // 保存消息到数据库，私聊消息不设置群组ID
        ClubChatMessage chatMessage = new ClubChatMessage();
        chatMessage.setSenderId(senderId.intValue());
        chatMessage.setContent(content != null ? content : ""); // 对于媒体消息，content可能为null
        chatMessage.setContentType(contentType != null ? contentType : 0); // 默认文本类型
        chatMessage.setMediaUrl(mediaUrl);
        chatMessage.setCreateTime(System.currentTimeMillis());
        
        // 持久化消息
        chatMessageService.save(chatMessage);
        
        // 构建发送消息
        JSONObject msgObj = new JSONObject();
        msgObj.put("type", "private_message");
        msgObj.put("messageId", chatMessage.getId());
        msgObj.put("senderId", senderId);
        msgObj.put("content", chatMessage.getContent());
        msgObj.put("contentType", chatMessage.getContentType());
        msgObj.put("mediaUrl", mediaUrl);
        msgObj.put("timestamp", chatMessage.getCreateTime());
        
        // 发送消息给接收者
        sendMessageToUser(receiverId, msgObj.toJSONString());
    }
    
    /**
     * 广播消息给群组成员
     */
    private void broadcastGroupMessage(Integer groupId, String message) {
        // 获取群组成员 - 这里简化处理，实际应从数据库获取群组成员
        USER_SESSIONS.forEach((userId, session) -> {
            // 实际实现应检查用户是否为群组成员
            sendMessageToSession(session, message);
        });
    }
    
    /**
     * 向特定用户发送消息
     */
    public void sendMessageToUser(Long userId, String message) {
        WebSocketSession session = USER_SESSIONS.get(userId);
        if (session != null && session.isOpen()) {
            sendMessageToSession(session, message);
        }
    }

    /**
     * 发送签到通知给指定用户
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param checkInStatus 签到状态
     */
    public void sendCheckInNotification(Long userId, Long activityId, Integer checkInStatus) {
        JSONObject notification = new JSONObject();
        notification.put("type", "check_in_notification");
        notification.put("activityId", activityId);
        notification.put("checkInStatus", checkInStatus);
        notification.put("timestamp", System.currentTimeMillis());

        sendMessageToUser(userId, notification.toJSONString());
        log.info("发送签到通知给用户{}，活动ID: {}", userId, activityId);
    }

    /**
     * 发送活动取消通知给指定用户
     * @param userId 用户ID
     * @param activityId 活动ID
     * @param activityTitle 活动标题
     */
    public void sendActivityCancelNotification(Long userId, Long activityId, String activityTitle) {
        JSONObject notification = new JSONObject();
        notification.put("type", "activity_cancel_notification");
        notification.put("activityId", activityId);
        notification.put("activityTitle", activityTitle);
        notification.put("message", "您报名的活动 \"" + activityTitle + "\" 已被取消");
        notification.put("timestamp", System.currentTimeMillis());

        sendMessageToUser(userId, notification.toJSONString());
        log.info("发送活动取消通知给用户{}，活动ID: {}，活动标题: {}", userId, activityId, activityTitle);
    }

    /**
     * 向WebSocket会话发送消息
     */
    private void sendMessageToSession(WebSocketSession session, String message) {
        try {
            session.sendMessage(new TextMessage(message));
        } catch (IOException e) {
            log.error("发送消息失败: {}", e.getMessage());
        }
    }

    /**
     * 连接关闭后的处理
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserId(session);
        if (userId != null) {
            USER_SESSIONS.remove(userId);
            log.info("用户{}断开WebSocket连接，当前在线用户数：{}", userId, USER_SESSIONS.size());
        }
    }

    /**
     * 从会话中获取用户ID
     */
    private Long getUserId(WebSocketSession session) {
        return (Long) session.getAttributes().get("userId");
    }
} 