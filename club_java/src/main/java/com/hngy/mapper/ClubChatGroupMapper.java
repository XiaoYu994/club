package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubChatGroup;
import org.apache.ibatis.annotations.Update;

/**
 * <p>
 * 聊天群组表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-07-19
 */
public interface ClubChatGroupMapper extends BaseMapper<ClubChatGroup> {

    @Update("DELETE FROM club_chat_group WHERE club_id = #{id}")
    void deleteByClubId(Long id);
}
