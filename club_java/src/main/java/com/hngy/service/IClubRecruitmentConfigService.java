package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ClubRecruitmentConfigPageDTO;
import com.hngy.entity.dto.RecruitmentConfigDTO;
import com.hngy.entity.po.ClubRecruitmentConfig;
import com.hngy.entity.vo.RecruitmentConfigVO;

/**
 * <p>
 * 招新配置表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
public interface IClubRecruitmentConfigService extends IService<ClubRecruitmentConfig> {

    /**
     * @desc: 系统管理员查询招新配置列表
     * @Author:  XiaoYu
     * @date:  2025/7/25 上午10:24
    **/
    PageResult<RecruitmentConfigVO> getClubRecruitmentConfigs(ClubRecruitmentConfigPageDTO configPageDTO);

    /**
     * @desc: 创建招新配置
     * @Author:  XiaoYu
     * @date:  2025/7/25 上午10:32
    **/
    boolean create(RecruitmentConfigDTO configDTO);

    /**
     * @desc: 修改招新配置
     * @Author:  XiaoYu
     * @date:  2025/7/25 上午10:32
    **/
    boolean updateById(RecruitmentConfigDTO configDTO);

    /**
     * @desc: 删除招新配置
     * @Author:  XiaoYu
     * @date:  2025/7/25 上午10:39
    **/
    boolean delete(Integer id);
}
