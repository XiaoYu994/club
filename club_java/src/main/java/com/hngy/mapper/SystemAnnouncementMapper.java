package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.SystemAnnouncement;
import com.hngy.entity.vo.NoticeVO;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

/**
 * <p>
 * 系统公告表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-07-20
 */
public interface SystemAnnouncementMapper extends BaseMapper<SystemAnnouncement> {

    @Select("SELECT COUNT(*) FROM system_announcement")
    int count();

    /**
     * 获取最近的公告（置顶的在前面）
     */
    @Select("SELECT * FROM system_announcement WHERE status = 1 ORDER BY is_top DESC, create_time DESC LIMIT #{limit}")
    List<NoticeVO> selectRecent(int limit);

    /**
     * 增加公告浏览次数
     */
    @Update("UPDATE system_announcement SET view_count = view_count + 1 WHERE id = #{id}")
    int increaseViewCount(Integer id);
}
