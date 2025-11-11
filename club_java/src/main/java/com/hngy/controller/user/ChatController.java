package com.hngy.controller.user;

import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.ChatMessageDTO;
import com.hngy.entity.po.ClubChatMessage;
import com.hngy.entity.vo.ChatGroupVO;
import com.hngy.entity.vo.ChatMessageVO;
import com.hngy.service.IChatService;
import com.hngy.service.IClubChatGroupService;
import com.hngy.service.IClubChatMessageService;
import com.hngy.websocket.ChatWebSocketHandler;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 聊天相关接口
 */
@RestController
@RequestMapping("/user/chat")
@Api(tags = "聊天接口")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final IClubChatGroupService chatGroupService;
    private final IClubChatMessageService chatMessageService;
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

    @ApiOperation("发送群组消息（非WebSocket方式）")
    @PostMapping("/send/group")
    public R<ChatMessageVO> sendGroupMessage(@RequestBody ChatMessageDTO messageDTO) {
        Long userId = BaseContext.getCurrentId();
        
        ClubChatMessage message = new ClubChatMessage();
        message.setChatId(messageDTO.getGroupId());
        message.setSenderId(userId.intValue());
        message.setContent(messageDTO.getContent());
        message.setContentType(messageDTO.getContentType());
        message.setCreateTime(System.currentTimeMillis());
        
        chatMessageService.save(message);
        
        // 构造消息发送数据
        ChatMessageVO messageVO = new ChatMessageVO();
        messageVO.setId(message.getId());
        messageVO.setChatId(message.getChatId());
        messageVO.setSenderId(message.getSenderId());
        messageVO.setContent(message.getContent());
        messageVO.setContentType(message.getContentType());
        messageVO.setCreateTime(message.getCreateTime());
        
        // 通过WebSocket广播消息给群组成员
        chatService.broadcastGroupMessage(message.getChatId(), messageVO);
        
        return R.success(messageVO);
    }
} 