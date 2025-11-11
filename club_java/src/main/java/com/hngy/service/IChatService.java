package com.hngy.service;

import com.hngy.common.result.PageResult;
import com.hngy.entity.vo.ChatGroupVO;
import com.hngy.entity.vo.ChatMessageVO;

import java.util.List;

/**
 * 聊天服务接口
 */
public interface IChatService {

    /**
     * 获取用户所在的聊天群组列表
     * @param userId 用户ID
     * @return 聊天群组列表
     */
    List<ChatGroupVO> getUserGroups(Long userId);

    /**
     * 获取群组详情
     * @param groupId 群组ID
     * @return 群组详情
     */
    ChatGroupVO getGroupDetail(Integer groupId);

    /**
     * 获取群组历史消息
     * @param groupId 群组ID
     * @param page 页码
     * @param pageSize 每页大小
     * @return 分页消息列表
     */
    PageResult<ChatMessageVO> getGroupMessages(Integer groupId, Integer page, Integer pageSize);

    /**
     * 通过WebSocket广播消息给群组成员
     * @param groupId 群组ID
     * @param message 消息对象
     */
    void broadcastGroupMessage(Integer groupId, ChatMessageVO message);
    
    /**
     * 创建社团聊天群组
     * @param clubId 社团ID
     * @param clubName 社团名称
     * @param creatorId 创建者ID
     * @return 创建的群组ID
     */
    Integer createClubChatGroup(Integer clubId, String clubName, Long creatorId);
    
    /**
     * 添加用户到聊天群组
     * @param groupId 群组ID
     * @param userId 用户ID
     * @param isAdmin 是否为管理员
     * @return 是否添加成功
     */
    boolean addUserToGroup(Integer groupId, Long userId, boolean isAdmin);
    
    /**
     * 从聊天群组中移除用户
     * @param groupId 群组ID
     * @param userId 用户ID
     * @return 是否移除成功
     */
    boolean removeUserFromGroup(Integer groupId, Long userId);
} 