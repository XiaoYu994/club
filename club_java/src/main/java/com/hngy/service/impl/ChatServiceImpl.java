package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.http.HttpStatus;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.po.*;
import com.hngy.entity.vo.ChatGroupVO;
import com.hngy.entity.vo.ChatMessageVO;
import com.hngy.mapper.*;
import com.hngy.service.IChatService;
import com.hngy.websocket.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements IChatService {

    private final ClubChatGroupMapper chatGroupMapper;
    private final ClubChatGroupMemberMapper chatGroupMemberMapper;
    private final ClubChatMessageMapper chatMessageMapper;
    private final UserMapper userMapper;
    private final ClubInfoMapper clubInfoMapper;
    private final ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public List<ChatGroupVO> getUserGroups(Long userId) {
        if (userId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "用户ID不能为空");
        }
        
        // 查询用户所在的聊天群组关系
        LambdaQueryWrapper<ClubChatGroupMember> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(ClubChatGroupMember::getUserId, userId.intValue());
        List<ClubChatGroupMember> groupMembers = chatGroupMemberMapper.selectList(memberWrapper);
        
        if (groupMembers.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 提取群组IDs
        List<Integer> groupIds = groupMembers.stream()
                .map(ClubChatGroupMember::getGroupId)
                .collect(Collectors.toList());
        
        // 查询群组信息
        LambdaQueryWrapper<ClubChatGroup> groupWrapper = new LambdaQueryWrapper<>();
        groupWrapper.in(ClubChatGroup::getId, groupIds);
        List<ClubChatGroup> groups = chatGroupMapper.selectList(groupWrapper);
        
        // 转换为VO
        return groups.stream().map(group -> {
            ChatGroupVO vo = BeanUtil.copyProperties(group, ChatGroupVO.class);
            
            // 查询社团信息
            if (group.getClubId() != null) {
                ClubInfo clubInfo = clubInfoMapper.selectById(group.getClubId());
                if (clubInfo != null) {
                    vo.setClubName(clubInfo.getName());
                }
            }
            
            // 查询创建者信息
            if (group.getOwnerId() != null) {
                User owner = userMapper.selectById(group.getOwnerId());
                if (owner != null) {
                    vo.setOwnerName(owner.getUsername());
                }
            }
            
            // 获取最后一条消息
            LambdaQueryWrapper<ClubChatMessage> messageWrapper = new LambdaQueryWrapper<>();
            messageWrapper.eq(ClubChatMessage::getChatId, group.getId())
                    .orderByDesc(ClubChatMessage::getCreateTime)
                    .last("LIMIT 1");
            ClubChatMessage lastMessage = chatMessageMapper.selectOne(messageWrapper);
            
            if (lastMessage != null) {
                // 根据消息类型设置预览文本
                Integer type = lastMessage.getContentType();
                switch (type) {
                    case 0:
                        vo.setLastMessage(lastMessage.getContent());
                        break;
                    case 1:
                        vo.setLastMessage("[图片]");
                        break;
                    case 2:
                        vo.setLastMessage("[文件]");
                        break;
                    case 3:
                        vo.setLastMessage("[位置]");
                        break;
                    default:
                        vo.setLastMessage("[消息]");
                        break;
                }
                // 设置最后消息时间
                vo.setLastMessageTime(lastMessage.getCreateTime());
            }
            
            // 查询未读消息数
            ClubChatGroupMember member = groupMembers.stream()
                    .filter(m -> m.getGroupId().equals(group.getId()))
                    .findFirst()
                    .orElse(null);

            return vo;
        }).collect(Collectors.toList());
    }

    @Override
    public ChatGroupVO getGroupDetail(Integer groupId) {
        if (groupId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "群组ID不能为空");
        }
        
        // 查询群组信息
        ClubChatGroup group = chatGroupMapper.selectById(groupId);
        if (group == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "群组不存在");
        }
        
        ChatGroupVO vo = BeanUtil.copyProperties(group, ChatGroupVO.class);
        
        // 查询社团信息
        if (group.getClubId() != null) {
            ClubInfo clubInfo = clubInfoMapper.selectById(group.getClubId());
            if (clubInfo != null) {
                vo.setClubName(clubInfo.getName());
            }
        }
        
        // 查询创建者信息
        if (group.getOwnerId() != null) {
            User owner = userMapper.selectById(group.getOwnerId());
            if (owner != null) {
                vo.setOwnerName(owner.getUsername());
            }
        }
        
        // 查询成员数量
        LambdaQueryWrapper<ClubChatGroupMember> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(ClubChatGroupMember::getGroupId, groupId);
        Long memberCount = chatGroupMemberMapper.selectCount(memberWrapper);
        vo.setMemberCount(memberCount.intValue());
        
        return vo;
    }

    @Override
    public PageResult<ChatMessageVO> getGroupMessages(Integer groupId, Integer page, Integer pageSize) {
        if (groupId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "群组ID不能为空");
        }
        
        // 检查群组是否存在
        ClubChatGroup group = chatGroupMapper.selectById(groupId);
        if (group == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "群组不存在");
        }
        
        // 分页查询群组消息
        Page<ClubChatMessage> messagePage = new Page<>(page, pageSize);
        LambdaQueryWrapper<ClubChatMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatMessage::getChatId, groupId)
                .orderByDesc(ClubChatMessage::getCreateTime);
        
        Page<ClubChatMessage> resultPage = chatMessageMapper.selectPage(messagePage, wrapper);
        
        // 查询发送者信息
        List<Integer> senderIds = resultPage.getRecords().stream()
                .map(ClubChatMessage::getSenderId)
                .distinct()
                .collect(Collectors.toList());
        
        // 如果没有发送者ID，创建空的用户映射，否则查询用户信息
        final Map<Integer, User> userMap = senderIds.isEmpty() ? 
            new HashMap<>() : 
            userMapper.selectList(new LambdaQueryWrapper<User>()
                .in(User::getId, senderIds))
                .stream()
                .collect(Collectors.toMap(user -> user.getId().intValue(), user -> user));
        
        // 转换为VO
        return PageResult.of(resultPage, message -> {
            ChatMessageVO vo = BeanUtil.copyProperties(message, ChatMessageVO.class);
            
            // 设置发送者信息
            User sender = userMap.get(message.getSenderId());
            if (sender != null) {
                vo.setSenderName(sender.getUsername());
                vo.setSenderAvatar(sender.getAvatar());
            }
            
            // 如果是回复消息，查询引用的消息
            if (message.getContentType() != null && message.getContentType() == 3) {
                try {
                    Map<String, Object> contentMap = JSON.parseObject(message.getContent(), Map.class);
                    if (contentMap.containsKey("refMessageId")) {
                        Integer refId = Integer.parseInt(contentMap.get("refMessageId").toString());
                        ClubChatMessage refMessage = chatMessageMapper.selectById(refId);
                        if (refMessage != null) {
                            vo.setRefMessageId(refId);
                            vo.setRefMessageContent(refMessage.getContent());
                        }
                    }
                } catch (Exception e) {
                    log.error("解析引用消息失败", e);
                }
            }
            
            return vo;
        });
    }

    @Override
    public void broadcastGroupMessage(Integer groupId, ChatMessageVO message) {
        if (groupId == null || message == null) {
            return;
        }
        
        // 查询群组成员
        LambdaQueryWrapper<ClubChatGroupMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatGroupMember::getGroupId, groupId);

        List<ClubChatGroupMember> members = chatGroupMemberMapper.selectList(wrapper);
        
        // 发送消息给群组成员
        for (ClubChatGroupMember member : members) {
            // 不给自己发送消息
            if (member.getUserId().equals(message.getSenderId())) {
                continue;
            }
            
            // 发送WebSocket消息
            String messageJson = JSON.toJSONString(message);
            chatWebSocketHandler.sendMessageToUser(member.getUserId().longValue(), messageJson);
        }
    }

    @Override
    @Transactional
    public Integer createClubChatGroup(Integer clubId, String clubName, Long creatorId) {
        if (clubId == null || clubName == null || creatorId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "参数不能为空");
        }
        
        // 检查社团是否存在
        ClubInfo clubInfo = clubInfoMapper.selectById(clubId);
        if (clubInfo == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "社团不存在");
        }
        if (!clubInfo.getStatus().equals(1)) {
            throw new ServiceException(HttpStatus.HTTP_FORBIDDEN, "社团已禁用");
        }
        
        // 创建群组
        ClubChatGroup group = new ClubChatGroup();
        group.setName(clubName + "群");
        group.setAvatar(clubInfo.getLogo()); // 使用社团logo作为群头像
        group.setClubId(clubId);
        group.setOwnerId(creatorId.intValue());
        group.setType(0); // 公共群
        group.setCreateTime(System.currentTimeMillis());
        
        chatGroupMapper.insert(group);
        
        // 添加创建者为群成员
        ClubChatGroupMember member = new ClubChatGroupMember();
        member.setGroupId(group.getId());
        member.setUserId(creatorId.intValue());

        chatGroupMemberMapper.insert(member);
        
        return group.getId();
    }

    @Override
    public boolean addUserToGroup(Integer groupId, Long userId, boolean isAdmin) {
        if (groupId == null || userId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "参数不能为空");
        }
        
        // 检查群组是否存在
        ClubChatGroup group = chatGroupMapper.selectById(groupId);
        if (group == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "群组不存在");
        }
        
        // 检查用户是否已经在群组中
        LambdaQueryWrapper<ClubChatGroupMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatGroupMember::getGroupId, groupId)
                .eq(ClubChatGroupMember::getUserId, userId.intValue());
        

        // 添加用户到群组
        ClubChatGroupMember member = new ClubChatGroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId.intValue());

        return chatGroupMemberMapper.insert(member) > 0;
    }

    @Override
    public boolean removeUserFromGroup(Integer groupId, Long userId) {
        if (groupId == null || userId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "参数不能为空");
        }
        
        // 检查群组是否存在
        ClubChatGroup group = chatGroupMapper.selectById(groupId);
        if (group == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "群组不存在");
        }
        
        // 查询成员记录
        LambdaQueryWrapper<ClubChatGroupMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatGroupMember::getGroupId, groupId)
                .eq(ClubChatGroupMember::getUserId, userId.intValue());
        
        ClubChatGroupMember member = chatGroupMemberMapper.selectOne(wrapper);
        
        if (member == null) {
            // 用户不在群组中，视为操作成功
            return true;
        }
        
        // 如果是创建者，不能退出
        if (group.getOwnerId().equals(userId.intValue())) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "群主不能退出群组");
        }
        
        return chatGroupMemberMapper.updateById(member) > 0;
    }
} 