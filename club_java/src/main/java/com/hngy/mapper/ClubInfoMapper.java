package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.vo.StatisticsVO;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * <p>
 * 社团信息表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface ClubInfoMapper extends BaseMapper<ClubInfo> {

    /**
     * 查询当前正在招新的社团ID列表
     * @param now 当前时间戳
     * @return 社团ID列表
     */
    @Select("SELECT r.club_id FROM club_recruitment r " +
            "JOIN club_recruitment_config c ON r.config_id = c.id AND c.status = 1 " +
            "WHERE r.status = 1 AND r.start_time <= #{now} AND r.end_time >= #{now}")
    List<Long> selectRecruitingClubIds(@Param("now") long now);

    @Select("SELECT COUNT(*) FROM club_info")
    int count();
    
    /**
     * 查询热门社团（按成员数排序）
     * @param limit 限制数量
     * @return 热门社团列表
     */
    @Select("SELECT ci.id as club_id, ci.name as club_name, " +
            "COALESCE(COUNT(cm.id), 0) as member_count " +
            "FROM club_info ci " +
            "LEFT JOIN club_member cm ON ci.id = cm.club_id " +
            "GROUP BY ci.id, ci.name " +
            "ORDER BY member_count DESC " +
            "LIMIT #{limit}")
    @Results({
        @Result(property = "clubId", column = "club_id"),
        @Result(property = "clubName", column = "club_name"),
        @Result(property = "memberCount", column = "member_count")
    })
    List<StatisticsVO.ClubStatItem> selectTopClubsByMemberCount(@Param("limit") int limit);
}
