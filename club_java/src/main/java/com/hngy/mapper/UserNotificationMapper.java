package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.UserNotification;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * 用户消息通知表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-11-11
 */
public interface UserNotificationMapper extends BaseMapper<UserNotification> {

    /**
     * 获取用户未读消息数量
     */
    @Select("SELECT COUNT(*) FROM user_notification WHERE user_id = #{userId} AND is_read = 0")
    int countUnreadByUserId(Long userId);
}
