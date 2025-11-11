package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubRecruitment;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * <p>
 * 社团招新表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
public interface ClubRecruitmentMapper extends BaseMapper<ClubRecruitment> {

    @Update("DELETE FROM club_recruitment WHERE club_id = #{id}")
    void deleteByClubId(Long id);

    @Update("DELETE FROM club_recruitment WHERE config_id = #{id}")
    void deleteByConfigId(Integer id);

    @Select("SELECT id FROM club_recruitment WHERE config_id = #{id}")
    List<Integer> getRecruitmentIdsByConfigId(Integer id);
}
