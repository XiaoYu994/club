package com.hngy.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.hngy.common.page.PageParam;
import com.hngy.common.result.R;
import com.hngy.entity.dto.RecruitmentAuditDTO;
import com.hngy.entity.vo.RecruitmentAuditVO;
import com.hngy.service.IClubRecruitmentService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 后台管理员招新审核控制器
 * </p>
 *
 * @author xhy
 * @since 2025-01-14
 */
@Slf4j
@RestController
@RequestMapping("/admin/recruitment")
@Api(tags = "后台管理员招新审核管理")
public class AdminRecruitmentController {

    @Autowired
    private IClubRecruitmentService clubRecruitmentService;

    @ApiOperation("分页获取招新审核列表")
    @GetMapping("/audit")
    public R<IPage<RecruitmentAuditVO>> getAuditList(
            @ApiParam("页码") @RequestParam(defaultValue = "1") Integer pageNo,
            @ApiParam("每页数量") @RequestParam(defaultValue = "10") Integer pageSize,
            @ApiParam("状态筛选") @RequestParam(required = false) Integer status,
            @ApiParam("关键词，支持社团名/标题/描述模糊匹配") @RequestParam(required = false) String keyword) {
        
        PageParam pageParam = new PageParam();
        pageParam.setPageNo(pageNo == null ? 1L : pageNo.longValue());
        pageParam.setPageSize(pageSize == null ? 10L : pageSize.longValue());
        IPage<RecruitmentAuditVO> page = clubRecruitmentService.getAuditPage(pageParam, status, keyword);
        return R.success(page);
    }

    @ApiOperation("审核招新活动")
    @PutMapping("/audit")
    public R<String> auditRecruitment(@RequestBody RecruitmentAuditDTO auditDTO) {
        boolean result = clubRecruitmentService.auditRecruitment(auditDTO);
        if (result) {
            return R.success("审核成功");
        } else {
            return R.error("审核失败");
        }
    }

    @ApiOperation("获取招新详情")
    @GetMapping("/audit/{id}")
    public R<RecruitmentAuditVO> getRecruitmentDetail(@ApiParam("招新ID") @PathVariable Integer id) {
        RecruitmentAuditVO detail = clubRecruitmentService.getRecruitmentDetail(id);
        if (detail != null) {
            return R.success(detail);
        } else {
            return R.error("招新活动不存在");
        }
    }

    @ApiOperation("删除招新活动")
    @DeleteMapping("/{id}")
    public R<String> deleteRecruitment(@ApiParam("招新ID") @PathVariable Integer id) {
        boolean result = clubRecruitmentService.removeById(id);
        return result ? R.success("删除成功") : R.error("删除失败");
    }
} 