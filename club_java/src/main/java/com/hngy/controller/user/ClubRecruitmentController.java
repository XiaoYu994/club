package com.hngy.controller.user;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.hngy.common.constant.RecruitmentConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.CreateRecruitmentDTO;
import com.hngy.entity.dto.UpdateStatusDTO;
import com.hngy.entity.po.ClubRecruitment;
import com.hngy.entity.po.ClubRecruitmentConfig;
import com.hngy.entity.vo.RecruitmentVO;
import com.hngy.service.IClubRecruitmentConfigService;
import com.hngy.service.IClubRecruitmentService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 社团招新管理 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@RestController
@RequestMapping("/user/club")
@RequiredArgsConstructor
@Api(tags = "社团招新管理接口")
public class ClubRecruitmentController {
    
    private final IClubRecruitmentService clubRecruitmentService;
    private final IClubRecruitmentConfigService clubRecruitmentConfigService;

    @ApiOperation("获取社团当前招新信息")
    @GetMapping("/recruitment/active/{clubId}")
    public R<RecruitmentVO> getActiveRecruitment(@PathVariable Long clubId) {
        return R.success(clubRecruitmentService.getActiveRecruitment(clubId));
    }

    @ApiOperation("获取招新详情")
    @GetMapping("/recruitment/{recruitmentId}")
    public R<RecruitmentVO> getRecruitmentDetail(@PathVariable Long recruitmentId) {
        ClubRecruitment recruitment = clubRecruitmentService.getById(recruitmentId);
        if (recruitment == null) {
            return R.error(RecruitmentConstant.ERROR_RECRUITMENT_NOT_FOUND);
        }
        return R.success(BeanUtil.copyProperties(recruitment, RecruitmentVO.class));
    }

    @ApiOperation("获取可用招新配置列表")
    @GetMapping("/recruitment/configs")
    public R<List<ClubRecruitmentConfig>> getRecruitmentConfigs() {
        List<ClubRecruitmentConfig> configs = clubRecruitmentConfigService.list(
            new LambdaQueryWrapper<ClubRecruitmentConfig>()
                .eq(ClubRecruitmentConfig::getStatus, StatusConstant.ENABLE)
        );
        return R.success(configs);
    }

    @ApiOperation("创建社团招新活动")
    @PostMapping("/recruitment")
    public R<RecruitmentVO> createRecruitment(@RequestBody CreateRecruitmentDTO dto) {
        // 验证计划招收人数是否合规
        if (dto.getPlanCount() <= 0) {
            return R.error(RecruitmentConstant.ERROR_INVALID_COUNT);
        }
        if (dto.getPlanCount() > RecruitmentConstant.MAX_RECRUITMENT_COUNT) {
            return R.error(RecruitmentConstant.ERROR_MAX_COUNT_EXCEEDED);
        }
        
        // 验证时间范围是否合规
        if (dto.getStartTime() >= dto.getEndTime()) {
            return R.error(RecruitmentConstant.ERROR_INVALID_TIME_RANGE);
        }
        
        // 计算持续天数
        long durationMillis = dto.getEndTime() - dto.getStartTime();
        long durationDays = durationMillis / (1000 * 60 * 60 * 24);
        if (durationDays > RecruitmentConstant.MAX_DURATION_DAYS) {
            return R.error(RecruitmentConstant.ERROR_MAX_DURATION_EXCEEDED);
        }
        
        ClubRecruitment recruitment = BeanUtil.copyProperties(dto, ClubRecruitment.class);
        recruitment.setStatus(RecruitmentConstant.STATUS_PENDING); // 初始状态：未开始
        clubRecruitmentService.createRecruitment(recruitment);
        RecruitmentVO recruitmentVO = BeanUtil.copyProperties(recruitment, RecruitmentVO.class);
        return R.success(recruitmentVO);
    }

    @ApiOperation("获取社团招新列表")
    @GetMapping("/recruitment/club/{clubId}")
    public R<PageResult<RecruitmentVO>> listRecruitments(@PathVariable Long clubId,
                                                         @RequestParam(defaultValue = "1") int pageNo,
                                                         @RequestParam(defaultValue = "10") int pageSize,
                                                         @RequestParam(required = false) Integer status) {
        Page<ClubRecruitment> page = new Page<>(pageNo, pageSize);
        LambdaQueryWrapper<ClubRecruitment> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubRecruitment::getClubId, clubId.intValue());
        
        // 如果提供了状态参数，添加状态筛选条件
        if (status != null) {
            wrapper.eq(ClubRecruitment::getStatus, status);
        }
        
        wrapper.orderByDesc(ClubRecruitment::getCreateTime);
        
        IPage<ClubRecruitment> pageData = clubRecruitmentService.page(page, wrapper);
        List<RecruitmentVO> list = pageData.getRecords().stream()
            .map(rec -> BeanUtil.copyProperties(rec, RecruitmentVO.class))
            .collect(Collectors.toList());
        PageResult<RecruitmentVO> result = new PageResult<>(pageData.getTotal(), pageData.getPages(), list);
        return R.success(result);
    }

    @ApiOperation("更新社团招新活动")
    @PutMapping("/recruitment/{id}")
    public R<String> updateRecruitment(@PathVariable Long id, @RequestBody CreateRecruitmentDTO dto) {
        // 验证计划招收人数是否合规
        if (dto.getPlanCount() <= 0) {
            return R.error(RecruitmentConstant.ERROR_INVALID_COUNT);
        }
        if (dto.getPlanCount() > RecruitmentConstant.MAX_RECRUITMENT_COUNT) {
            return R.error(RecruitmentConstant.ERROR_MAX_COUNT_EXCEEDED);
        }
        
        // 验证时间范围是否合规
        if (dto.getStartTime() >= dto.getEndTime()) {
            return R.error(RecruitmentConstant.ERROR_INVALID_TIME_RANGE);
        }
        
        // 计算持续天数
        long durationMillis = dto.getEndTime() - dto.getStartTime();
        long durationDays = durationMillis / (1000 * 60 * 60 * 24);
        if (durationDays > RecruitmentConstant.MAX_DURATION_DAYS) {
            return R.error(RecruitmentConstant.ERROR_MAX_DURATION_EXCEEDED);
        }
        
        ClubRecruitment recruitment = BeanUtil.copyProperties(dto, ClubRecruitment.class);
        recruitment.setId(id.intValue());
        recruitment.setUpdateTime(System.currentTimeMillis());
        return clubRecruitmentService.updateById(recruitment)
            ? R.success(RecruitmentConstant.UPDATE_SUCCESS) : R.error(RecruitmentConstant.UPDATE_FAILED);
    }

    @ApiOperation("删除社团招新活动")
    @DeleteMapping("/recruitment/{id}")
    public R<String> deleteRecruitment(@PathVariable Long id) {
        return clubRecruitmentService.removeById(id)
            ? R.success(RecruitmentConstant.DELETE_SUCCESS) : R.error(RecruitmentConstant.DELETE_FAILED);
    }
    
    @ApiOperation("更新社团招新活动状态")
    @PutMapping("/recruitment/{id}/status")
    public R<String> updateRecruitmentStatus(@PathVariable Long id, @RequestBody UpdateStatusDTO dto) {
        // 验证状态值是否有效
        Integer status = dto.getStatus();
        if (status != RecruitmentConstant.STATUS_PENDING && 
            status != RecruitmentConstant.STATUS_ACTIVE && 
            status != RecruitmentConstant.STATUS_ENDED) {
            return R.error(RecruitmentConstant.ERROR_INVALID_STATUS);
        }
        
        ClubRecruitment recruitment = new ClubRecruitment();
        recruitment.setId(id.intValue());
        recruitment.setStatus(dto.getStatus());
        recruitment.setUpdateTime(System.currentTimeMillis());
        
        return clubRecruitmentService.updateById(recruitment)
            ? R.success(RecruitmentConstant.STATUS_UPDATE_SUCCESS) : R.error(RecruitmentConstant.STATUS_UPDATE_FAILED);
    }
} 