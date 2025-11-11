package com.hngy.controller.user;

import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.ChatMessageDTO;
import com.hngy.entity.vo.ChatGroupVO;
import com.hngy.entity.vo.ChatMessageVO;
import com.hngy.service.IChatService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
} 