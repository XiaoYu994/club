package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubApply;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * <p>
 * 社团申请表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
public interface ClubApplyMapper extends BaseMapper<ClubApply> {

    @Update("DELETE FROM club_apply WHERE club_id = #{id}")
    void deleteApplyByClubId(Long id);

    @Delete("DELETE FROM club_apply WHERE club_apply.recruitment_id IN (#{id})")
    void deleteApplyByConfigId(List<Integer> id);
}
