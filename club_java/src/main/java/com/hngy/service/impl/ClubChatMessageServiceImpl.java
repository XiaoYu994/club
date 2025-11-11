package com.hngy.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.entity.po.ClubChatMessage;
import com.hngy.mapper.ClubChatMessageMapper;
import com.hngy.service.IClubChatMessageService;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 聊天消息表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-07-19
 */
@Service
public class ClubChatMessageServiceImpl extends ServiceImpl<ClubChatMessageMapper, ClubChatMessage> implements IClubChatMessageService {

}
