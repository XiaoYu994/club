package com.hngy.controller.admin;

import com.hngy.common.constant.MessageConstant;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.ActivityStatusDTO;
import com.hngy.entity.dto.ClubActivityDTO;
import com.hngy.entity.vo.ActivityDetailVO;
import com.hngy.entity.vo.ClubActivityVO;
import com.hngy.service.IClubActivityService;
import com.hngy.service.IClubApplyService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * <p>
 * 社团活动表 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@RestController
@RequestMapping("/admin/activities")
@Api(tags = "管理员活动接口")
@RequiredArgsConstructor
@Slf4j
public class AdminActivityController {
    private final IClubActivityService clubActivityService;
    private final IClubApplyService clubApplyService;

    @ApiOperation("获取活动列表")
    @GetMapping
    public R<PageResult<ClubActivityVO>> list(ClubActivityDTO clubActivityDTO) {
        return R.success(clubActivityService.getActivity(clubActivityDTO));
    }

    @ApiOperation("获取活动详细信息")
    @GetMapping("/{id}/detail")
    public R<ActivityDetailVO> getActivityDetail(@PathVariable Long id) {
        return R.success(clubActivityService.getActivityDetail(id));
    }

    @ApiOperation("导出活动报名名单")
    @GetMapping("/export/{activityId}")
    public R<Map<String, Object>> exportApplyList(@PathVariable Long activityId) {
        return R.success(clubActivityService.exportApplyList(activityId));
    }

    @ApiOperation("修改活动状态")
    @PutMapping
    public R<String> updateActivityStatus(@RequestBody ActivityStatusDTO activityStatusDTO) {
        return clubActivityService.updateActivityStatus(activityStatusDTO) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }
    @ApiOperation("删除活动")
    @DeleteMapping("/{id}")
    public R<String> deleteActivity(@PathVariable Long id) {
        return clubActivityService.removeById(id) ? R.success(MessageConstant.DELETE_SUCCESS) : R.error();
    }
}
