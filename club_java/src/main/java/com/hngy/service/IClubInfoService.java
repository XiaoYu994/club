package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.vo.ClubDetailVO;
import com.hngy.entity.vo.ClubInfoVO;

import java.util.List;

/**
 * <p>
 * 社团信息表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface IClubInfoService extends IService<ClubInfo> {

    PageResult<ClubInfoVO> queryPage(ClubDTO clubDTO);
    List<ClubInfoVO> getMyClubs(Long userId);
    // 新增：获取十佳社团列表，按order_num字段排序，取前十条
    List<ClubInfoVO> getTopTenClubs();

    /**
     * @desc: 系统管理员查询社团
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午8:05
    **/
    PageResult<ClubInfoVO> getClubs(ClubDTO clubDTO);

    /**
     * @desc: 获取社团详细信息
     * @Author:  XiaoYu
     * @date:  2025/1/21 下午3:00
    **/
    ClubDetailVO getClubDetail(Long id);

    /**
     * @desc: 系统管理员创建社团
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午8:23
    **/
    boolean createClub(ClubInfoDTO clubInfoDTO);

    /**
     * @desc: 更新社团信息
     * @Author:  XiaoYu
     * @date:  2025/1/21 下午3:00
    **/
    boolean updateClub(Long id, ClubUpdateDTO clubUpdateDTO);

    /**
     * @desc: 删除社团
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午8:50
    **/
    boolean deleteClub(Long id);

    /**
     * @desc: 修改社团状态
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午9:04
    **/
    boolean updateClubStatus(ClubStatusDTO updateClubStatus);

    /**
     * @desc: 修改社团排序
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午9:04
    **/
    boolean updateClubOrder(ClubOrderDTO updateClubOrder);
}
