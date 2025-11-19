package com.hngy.controller.user;

import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.ChatMessageDTO;
import com.hngy.entity.vo.ChatGroupMemberVO;
import com.hngy.entity.vo.ChatGroupVO;
import com.hngy.entity.vo.ChatMessageVO;
import com.hngy.service.IChatService;
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
 * 聊天REST API控制器
 */
@RestController
@RequestMapping("/user/chat-api")
@Api(tags = "聊天REST API")
@RequiredArgsConstructor
@Slf4j
public class ChatRestController {

    private final IChatService chatService;
    private final ChatWebSocketHandler chatWebSocketHandler;

    @ApiOperation("获取用户的群组列表")
    @GetMapping("/groups")
    public R<List<ChatGroupVO>> getUserGroups() {
        Long userId = BaseContext.getCurrentId();
        return R.success(chatService.getUserGroups(userId));
    }

    @ApiOperation("获取群组详情")
    @GetMapping("/group/{groupId}")
    public R<ChatGroupVO> getGroupDetail(@PathVariable Integer groupId) {
        return R.success(chatService.getGroupDetail(groupId));
    }

    @ApiOperation("获取群组消息历史")
    @GetMapping("/messages/group/{groupId}")
    public R<PageResult<ChatMessageVO>> getGroupMessages(
            @PathVariable Integer groupId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        return R.success(chatService.getGroupMessages(groupId, page, pageSize));
    }

    @ApiOperation("发送群组消息（HTTP API）")
    @PostMapping("/send/group")
    public R<ChatMessageVO> sendGroupMessage(@RequestBody ChatMessageDTO messageDTO) {
        Long userId = BaseContext.getCurrentId();

        // 构造消息VO
        ChatMessageVO messageVO = new ChatMessageVO();
        messageVO.setChatId(messageDTO.getGroupId());
        messageVO.setSenderId(userId.intValue());
        messageVO.setContent(messageDTO.getContent());
        messageVO.setContentType(messageDTO.getContentType());
        messageVO.setMediaUrl(messageDTO.getMediaUrl());
        messageVO.setRefMessageId(messageDTO.getRefMessageId());
        messageVO.setCreateTime(System.currentTimeMillis());

        // 通过WebSocket广播消息给群组成员
        chatService.broadcastGroupMessage(messageDTO.getGroupId(), messageVO);

        return R.success(messageVO);
    }

    @ApiOperation("获取在线用户列表（公共接口）")
    @GetMapping("/online-users")
    public R<Map<String, Object>> getOnlineUsers() {
        Map<String, Object> result = new HashMap<>();
        result.put("onlineUserIds", chatWebSocketHandler.getOnlineUserIds());
        result.put("onlineCount", chatWebSocketHandler.getOnlineCount());
        log.info("【聊天API】用户查询在线用户列表，在线人数: {}", chatWebSocketHandler.getOnlineCount());
        return R.success(result);
    }

    @ApiOperation("更新群组信息（仅群主）")
    @PutMapping("/group/{groupId}")
    public R<String> updateGroupInfo(@PathVariable Integer groupId, @RequestBody Map<String, String> params) {
        Long currentUserId = BaseContext.getCurrentId();
        String avatar = params.get("avatar");

        log.info("【聊天API】用户{}尝试更新群组{}的信息，头像: {}", currentUserId, groupId, avatar);

        boolean success = chatService.updateGroupInfo(groupId, avatar, currentUserId);

        if (success) {
            log.info("【聊天API】群组{}信息更新成功", groupId);
            return R.success("更新成功");
        } else {
            log.error("【聊天API】群组{}信息更新失败", groupId);
            return R.error("更新失败");
        }
    }

    @ApiOperation("获取群组成员列表")
    @GetMapping("/group/{groupId}/members")
    public R<List<ChatGroupMemberVO>> getGroupMembers(@PathVariable Integer groupId) {
        log.info("【聊天API】获取群组{}的成员列表", groupId);
        List<ChatGroupMemberVO> members = chatService.getGroupMembers(groupId);
        return R.success(members);
    }
} 