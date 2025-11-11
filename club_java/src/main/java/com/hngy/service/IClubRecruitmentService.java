package com.hngy.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.page.PageParam;
import com.hngy.entity.dto.RecruitmentAuditDTO;
import com.hngy.entity.po.ClubRecruitment;
import com.hngy.entity.vo.RecruitmentAuditVO;
import com.hngy.entity.vo.RecruitmentVO;

/**
 * <p>
 * 社团招新表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface IClubRecruitmentService extends IService<ClubRecruitment> {
    
    /**
     * 获取社团当前有效的招新信息
     * @param clubId 社团ID
     * @return 招新信息
     */
    RecruitmentVO getActiveRecruitment(Long clubId);

    /**
     * 创建招新活动，若同一社团同一配置已有活动则抛出异常
     */
    boolean createRecruitment(ClubRecruitment recruitment);

    /**
     * 分页获取招新审核列表
     * @param pageParam 分页参数
     * @param status 状态筛选，null表示不筛选
     * @return 分页数据
     */
    IPage<RecruitmentAuditVO> getAuditPage(PageParam pageParam, Integer status, String keyword);

    /**
     * 审核招新活动
     * @param auditDTO 审核数据
     * @return 是否成功
     */
    boolean auditRecruitment(RecruitmentAuditDTO auditDTO);

    /**
     * 获取招新详情
     * @param id 招新ID
     * @return 详情信息
     */
    RecruitmentAuditVO getRecruitmentDetail(Integer id);
}
