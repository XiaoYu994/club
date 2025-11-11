package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubActivity;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * <p>
 * 社团活动表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface ClubActivityMapper extends BaseMapper<ClubActivity> {
    /**
     * 查询启用的社团活动id
     * @return
     */
    @Select("SELECT id FROM club_activity WHERE club_id IN (SELECT id FROM club_info WHERE status = 1)")
    List<Long> selectEnabledClubActivityIds();

    // 更新报名人数
    @Update("UPDATE club_activity SET join_count = join_count + 1 WHERE id = #{activityId}")
    int addJoinCount(@Param("activityId") Long activityId);
    // 减少报名人数
    @Update("UPDATE club_activity SET join_count = join_count - 1 WHERE id = #{activityId}")
    int subJoinCount(@Param("activityId") Long activityId);
    // 增加浏览量
    @Update("UPDATE club_activity SET view_count = view_count + 1 WHERE id = #{activityId}")
    int addViewCount(@Param("activityId") Long activityId);

    @Select("SELECT COUNT(*) FROM club_activity")
    int count();



    @Update("DELETE FROM club_activity WHERE club_id = #{id}")
    int deleteByClubId(Long id);

}
