package com.hngy.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.hngy.entity.po.User;
import org.apache.ibatis.annotations.Select;

/**
 * <p>
 * 用户表 Mapper 接口
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
public interface UserMapper extends BaseMapper<User> {

    @Select("select * from club_user where openid = #{openid}")
    User selectByOnpenId(String openid);

    @Select("select count(*) from club_user")
    int count();
}
