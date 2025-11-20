package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.Admin;
import com.hngy.entity.vo.AdminVO;
import com.hngy.entity.vo.StatisticsVO;
import com.hngy.entity.vo.TrendDataVO;

/**
 * <p>
 * 管理员表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
public interface IAdminService extends IService<Admin> {

    // 系统管理员登录
    Admin login(AdminLoginDTO adminLoginDTO);

    /**
     * @desc: 修改管理员密码
     * @Author:  XiaoYu
     * @date:  2025/7/21 上午10:20
    **/
    R updatePassword(PasswordUpdateDTO passwordDTO);

    /**
     * @desc: 获取系统统计数据
     * @Author:  XiaoYu
     * @date:  2025/7/21 上午10:20
    **/
    StatisticsVO getStatistics();

    /**
     * @desc: 获取管理员列表
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午5:19
    **/
    PageResult<AdminVO> getAdminList(AdminPageDTO adminPageDTO);

    /**
     * @desc: 创建管理员
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午5:29
    **/
    boolean createAdmin(AdminDTO adminDTO);

    /**
     * @desc: 更新管理员信息
     * @Author:  XiaoYu
     * @date:  2025/11/20
    **/
    boolean updateAdmin(AdminDTO adminDTO);

    /**
     * @desc: 更新管理员状态
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午5:29
    **/
    boolean updateAdminStatus(AdminStatusDTO adminStatusDTO);

    /**
     * @desc: 重置管理员密码
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午5:29
    **/
    boolean resetPassword(Long adminId);

    /**
     * @desc: 获取趋势数据
     * @param days 天数（7或30）
     * @return 趋势数据
     * @Author:  XiaoYu
     * @date:  2025/11/19
    **/
    TrendDataVO getTrendData(Integer days);
}
