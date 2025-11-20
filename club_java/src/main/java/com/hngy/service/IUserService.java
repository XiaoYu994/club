package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.UserDTO;
import com.hngy.entity.dto.UserPageDTO;
import com.hngy.entity.dto.UserStatusDTO;
import com.hngy.entity.dto.userLoginDTO;
import com.hngy.entity.po.User;
import com.hngy.entity.vo.UserVO;

import java.util.Map;

/**
 * <p>
 * 用户表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
public interface IUserService extends IService<User> {

    User login(userLoginDTO userDTO);
    boolean updateById(UserDTO userDTO);

    /**
     * @desc: 管理员查询用户
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午11:02
    **/
    PageResult<UserVO> getUsers(UserPageDTO userPageDTO);

    /**
     * @desc: 管理员修改用户信息
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午11:02
    **/
    Boolean updateUser(Integer id, UserDTO userDTO);

    /**
     * @desc: 管理员更新用户状态
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午11:24
    **/
    Boolean updateUserStatus(Integer id, UserStatusDTO statusDTO);

    /**
     * 导出用户列表
     * @param userPageDTO - 查询参数，包含分页和筛选条件
     * @return 返回Excel文件的字节数组
     */
    byte[] exportUsers(UserPageDTO userPageDTO);

    /**
     * 获取用户详情（包括社团参与记录和活动参与记录）
     * @param id 用户ID
     * @return 用户详情
     */
    com.hngy.entity.vo.UserDetailVO getUserDetail(Integer id);
}
