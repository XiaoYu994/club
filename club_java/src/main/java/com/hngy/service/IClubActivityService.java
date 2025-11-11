package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ActivityStatusDTO;
import com.hngy.entity.dto.ClubActivityDTO;
import com.hngy.entity.po.ClubActivity;
import com.hngy.entity.vo.ActivityDetailVO;
import com.hngy.entity.vo.ActivityStatsVO;
import com.hngy.entity.vo.ClubActivityVO;

import java.util.Map;

/**
 * <p>
 * 社团活动表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface IClubActivityService extends IService<ClubActivity> {

    /**
     * 分页查询活动列表
     * @param clubActivityDTO 查询条件
     * @return 活动列表
     */
    PageResult<ClubActivityVO> queryPage(ClubActivityDTO clubActivityDTO);

    /**
     * 获取活动统计信息
     * @param activityId 活动ID
     * @return 统计信息
     */
    ActivityStatsVO getActivityStats(Long activityId);

    /**
     * 获取活动详细信息
     * @param activityId 活动ID
     * @return 活动详细信息
     */
    ActivityDetailVO getActivityDetail(Long activityId);

    /**
     * 导出活动报名名单
     * @param activityId 活动ID
     * @return 导出文件信息
     */
    Map<String, Object> exportApplyList(Long activityId);

    /**
     * @desc: 系统管理员分页查询
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午2:44
    **/
    PageResult<ClubActivityVO> getActivity(ClubActivityDTO clubActivityDTO);

    /**
     * @desc: 系统管理员修改活动状态
     * @Author:  XiaoYu
     * @date:  2025/7/24 下午3:09
    **/
    boolean updateActivityStatus(ActivityStatusDTO activityStatusDTO);

    /**
     * @desc: 修改活动
     * @Author:  XiaoYu
     * @date:  2025/11/10 20:06
    */
    boolean updateById(ClubActivity activity);
}
