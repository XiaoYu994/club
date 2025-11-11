package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubMember;
import org.apache.ibatis.annotations.Update;

/**
 * <p>
 * 社团成员表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-06-20
 */
public interface ClubMemberMapper extends BaseMapper<ClubMember> {

    @Update("DELETE FROM club_member WHERE club_id = #{id}")
    void deleteByClubId(Long id);
}
