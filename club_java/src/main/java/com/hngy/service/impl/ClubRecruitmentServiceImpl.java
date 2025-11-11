package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.RecruitmentConstant;
import com.hngy.common.constant.ResponseMessageConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.page.PageParam;
import com.hngy.entity.dto.RecruitmentAuditDTO;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.po.ClubRecruitment;
import com.hngy.entity.po.ClubRecruitmentConfig;
import com.hngy.entity.vo.RecruitmentAuditVO;
import com.hngy.entity.vo.RecruitmentVO;
import com.hngy.mapper.ClubInfoMapper;
import com.hngy.mapper.ClubRecruitmentConfigMapper;
import com.hngy.mapper.ClubRecruitmentMapper;
import com.hngy.service.IClubRecruitmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 社团招新表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Service
@RequiredArgsConstructor
public class ClubRecruitmentServiceImpl extends ServiceImpl<ClubRecruitmentMapper, ClubRecruitment> implements IClubRecruitmentService {
    private final ClubRecruitmentMapper clubRecruitmentMapper;
    private final ClubRecruitmentConfigMapper clubRecruitmentConfigMapper;
    private final ClubInfoMapper clubInfoMapper;

    @Override
    public RecruitmentVO getActiveRecruitment(Long clubId) {
        // 查询状态为进行中的招新信息，按创建时间倒序排列，取最新一条
        LambdaQueryWrapper<ClubRecruitment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubRecruitment::getClubId, clubId)
               .eq(ClubRecruitment::getStatus, RecruitmentConstant.STATUS_ACTIVE)  // 状态为进行中
               .le(ClubRecruitment::getStartTime, System.currentTimeMillis())  // 开始时间小于等于当前时间
               .ge(ClubRecruitment::getEndTime, System.currentTimeMillis())    // 结束时间大于等于当前时间
               .orderByDesc(ClubRecruitment::getCreateTime)
               .last("LIMIT 1");  // 只取一条记录

        ClubRecruitment recruitment = clubRecruitmentMapper.selectOne(wrapper);
        // 如果没有找到，返回null
        if (recruitment == null) {
            return null;
        }
        // 如果对应的配置已禁用，也不展示
        ClubRecruitmentConfig config = clubRecruitmentConfigMapper.selectById(recruitment.getConfigId());
        if (config == null || config.getStatus().equals(StatusConstant.DISABLE)) {
            return null;
        }

        // 转换为VO对象并返回
        return BeanUtil.copyProperties(recruitment, RecruitmentVO.class);
    }

    @Override
    public boolean createRecruitment(ClubRecruitment recruitment) {
        if (recruitment.getClubId() == null || recruitment.getConfigId() == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_INVALID_PARAMS);
        }
        // 检查配置是否启用
        ClubRecruitmentConfig config = clubRecruitmentConfigMapper.selectById(recruitment.getConfigId());
        if (config == null || config.getStatus().equals(StatusConstant.DISABLE)) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_CONFIG_DISABLED);
        }
        // 检查是否已存在相同配置的招新活动
        LambdaQueryWrapper<ClubRecruitment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubRecruitment::getClubId, recruitment.getClubId())
               .eq(ClubRecruitment::getConfigId, recruitment.getConfigId());
        if (clubRecruitmentMapper.selectCount(wrapper) > 0) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_DUPLICATE_RECRUITMENT);
        }
        // 保存
        recruitment.setCreateTime(System.currentTimeMillis());
        recruitment.setUpdateTime(System.currentTimeMillis());
        return this.save(recruitment);
    }

    @Override
    public IPage<RecruitmentAuditVO> getAuditPage(PageParam pageParam, Integer status, String keyword) {
        // 创建分页对象
        Page<ClubRecruitment> page = pageParam.toPageDefaultSortByCreateTime();
        
        // 构建查询条件
        LambdaQueryWrapper<ClubRecruitment> wrapper = new LambdaQueryWrapper<>();
        
        // 状态筛选
        if (status != null) {
            wrapper.eq(ClubRecruitment::getStatus, status);
        }

        // 关键词搜索：标题、描述、社团名
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            // 先通过社团名模糊匹配找到 clubId 集合
            List<ClubInfo> matchedClubs = clubInfoMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<ClubInfo>()
                    .like(ClubInfo::getName, kw)
            );
            List<Integer> matchedClubIds = matchedClubs.stream()
                    .map(c -> c.getId().intValue())
                    .collect(java.util.stream.Collectors.toList());

            wrapper.and(w -> {
                w.like(ClubRecruitment::getTitle, kw)
                 .or()
                 .like(ClubRecruitment::getDescription, kw);
                if (!matchedClubIds.isEmpty()) {
                    w.or().in(ClubRecruitment::getClubId, matchedClubIds);
                }
            });
        }
        
        // 按创建时间倒序
        wrapper.orderByDesc(ClubRecruitment::getCreateTime);
        
        // 分页查询
        IPage<ClubRecruitment> recruitmentPage = clubRecruitmentMapper.selectPage(page, wrapper);
        
        // 转换为VO
        List<RecruitmentAuditVO> voList = recruitmentPage.getRecords().stream().map(recruitment -> {
            RecruitmentAuditVO vo = BeanUtil.copyProperties(recruitment, RecruitmentAuditVO.class);
            
            // 获取社团信息
            ClubInfo clubInfo = clubInfoMapper.selectById(recruitment.getClubId());
            if (clubInfo != null) {
                vo.setClubName(clubInfo.getName());
            }
            
            return vo;
        }).collect(Collectors.toList());
        
        // 创建分页结果
        IPage<RecruitmentAuditVO> result = new Page<>(page.getCurrent(), page.getSize(), recruitmentPage.getTotal());
        result.setRecords(voList);
        
        return result;
    }

    @Override
    public boolean auditRecruitment(RecruitmentAuditDTO auditDTO) {
        if (auditDTO.getId() == null || auditDTO.getStatus() == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ResponseMessageConstant.PARAMETER_ERROR);
        }
        
        // 验证状态值
        if (!RecruitmentConstant.STATUS_ACTIVE.equals(auditDTO.getStatus()) && 
            !RecruitmentConstant.STATUS_REJECTED.equals(auditDTO.getStatus())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_INVALID_STATUS);
        }
        
        // 查询招新记录
        ClubRecruitment recruitment = clubRecruitmentMapper.selectById(auditDTO.getId());
        if (recruitment == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), RecruitmentConstant.ERROR_RECRUITMENT_NOT_FOUND);
        }
        
        // 只有审核中的记录才能被审核
        if (!RecruitmentConstant.STATUS_PENDING.equals(recruitment.getStatus())) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_RECRUITMENT_NOT_PENDING);
        }
        
        // 更新状态和审核意见
        ClubRecruitment updateRecruitment = new ClubRecruitment();
        updateRecruitment.setId(auditDTO.getId());
        updateRecruitment.setStatus(auditDTO.getStatus());
        updateRecruitment.setReviewComment(auditDTO.getReviewComment());
        updateRecruitment.setUpdateTime(System.currentTimeMillis());
        
        return clubRecruitmentMapper.updateById(updateRecruitment) > 0;
    }

    @Override
    public RecruitmentAuditVO getRecruitmentDetail(Integer id) {
        if (id == null) {
            return null;
        }
        
        // 查询招新记录
        ClubRecruitment recruitment = clubRecruitmentMapper.selectById(id);
        if (recruitment == null) {
            return null;
        }
        
        // 转换为VO
        RecruitmentAuditVO vo = BeanUtil.copyProperties(recruitment, RecruitmentAuditVO.class);
        
        // 获取社团信息
        ClubInfo clubInfo = clubInfoMapper.selectById(recruitment.getClubId());
        if (clubInfo != null) {
            vo.setClubName(clubInfo.getName());
        }
        
        return vo;
    }
}
