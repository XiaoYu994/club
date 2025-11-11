package com.hngy.controller.user;

import cn.hutool.core.bean.BeanUtil;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.ClubActivity;
import com.hngy.entity.vo.*;
import com.hngy.service.IClubActivityService;
import com.hngy.service.IClubApplyService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
@RequestMapping("/user/activity")
@Api(tags = "活动接口")
@RequiredArgsConstructor
@Slf4j
public class ClubActivityController {
    private final IClubActivityService clubActivityService;
    private final IClubApplyService clubApplyService;

    @ApiOperation("分页查询活动列表")
    @GetMapping
    public R<PageResult<ClubActivityVO>> list(ClubActivityDTO clubActivityDTO) {
        return R.success(clubActivityService.queryPage(clubActivityDTO));
    }
    @ApiOperation("根据社团ID分页查询活动列表")
    @GetMapping("/club/{clubId}")
    public R<PageResult<ClubActivityVO>> getActivitiesByClub(@PathVariable Long clubId, ClubActivityDTO clubActivityDTO) {
        // 将路径变量 clubId 设置到查询 DTO
        clubActivityDTO.setClubId(clubId);
        return R.success(clubActivityService.queryPage(clubActivityDTO));
    }

    @ApiOperation("根据ID查询活动详情")
    @GetMapping("/{id}")
    public R<ClubActivityVO> getById(@PathVariable Long id) {
        ClubActivity activity = clubActivityService.getById(id);
        if (activity == null) {
            return R.error("活动不存在");
        }
        ClubActivityVO vo = BeanUtil.copyProperties(activity, ClubActivityVO.class);
        return R.success(vo);
    }

    @ApiOperation("创建活动")
    @PostMapping
    public R<String> save(@RequestBody ClubActivity activity) {
        return clubActivityService.save(activity) ? R.success(MessageConstant.CREATE_SUCCESS) : R.error();
    }

    @ApiOperation("修改活动")
    @PutMapping
    public R<String> update(@RequestBody ClubActivity activity) {
        return clubActivityService.updateById(activity) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }

    @ApiOperation("检查用户是否报名活动")
    @GetMapping("/is-apply/{id}")
    public R<ClubActivityApplyVO> isApply(@PathVariable Long id) {

        return R.success(clubApplyService.isApply(id));
    }

    @ApiOperation("报名活动")
    @PostMapping("/apply/{activityId}")
    public R<String> apply(@PathVariable Long activityId, @RequestBody Map<String, Object> formData) {
        return R.success(clubApplyService.applyActivity(activityId, formData));
    }

    @ApiOperation("查询活动报名列表")
    @GetMapping("/applies/{activityId}")
    public R<PageResult<ClubApplyListVO>> applies(@PathVariable Long activityId,  ClubActivityApplyDTO activityApplyDTO) {
        return R.success(clubApplyService.queryActivityApplies(activityId, activityApplyDTO));
    }

    @ApiOperation("取消报名")
    @DeleteMapping("/apply/{id}")
    public R<Boolean> cancelApply(@PathVariable Long id) {
        return R.success(clubApplyService.deleteActivityApply(id), MessageConstant.DELETE_SUCCESS);
    }

    @ApiOperation("审核报名")
    @PutMapping("/apply/review/{id}")
    public R<Boolean> reviewApply(@PathVariable Long id, @RequestBody ReviewApplyDTO reviewApplyDTO) {
        return R.success(clubApplyService.reviewActivityApply(id, reviewApplyDTO), MessageConstant.REVIEW_SUCCESS);
    }

    @ApiOperation("生成签到码")
    @PostMapping("/signCode")
    public R<SignCodeVO> createSignCode(@RequestBody SingCodeDTO singCodeDTO) {
        SignCodeVO signCodeVO = clubApplyService.createSignCode(singCodeDTO);
        return R.success(signCodeVO);
    }

    @ApiOperation("验证签到码")
    @PostMapping("/check-in")
    public R<CheckInResultVO> verifyCheckInCode(@RequestBody CheckInResultDTO request) {
        log.info("验证签到码请求: {}", request);
        CheckInResultVO result = clubApplyService.verifyCheckInCode(request);
        return R.success(result, "签到成功");
    }

    @ApiOperation("获取活动统计信息")
    @GetMapping("/stats/{activityId}")
    public R<ActivityStatsVO> getActivityStats(@PathVariable Long activityId) {
        return R.success(clubActivityService.getActivityStats(activityId));
    }

    @ApiOperation("导出活动报名名单")
    @GetMapping("/export/{activityId}")
    public R<Map<String, Object>> exportApplyList(@PathVariable Long activityId) {
        return R.success(clubActivityService.exportApplyList(activityId));
    }

    @ApiOperation("获取当前用户报名的活动列表")
    @GetMapping("/my")
    public R<List<ClubActivityApplyVO>> getMyActivities() {
        Long userId = BaseContext.getCurrentId();
        return R.success(clubApplyService.getMyActivityApplies(userId));
    }


    @ApiOperation("删除活动")
    @DeleteMapping("/{id}")
    public R<String> deleteActivity(@PathVariable Long id) {
        return clubActivityService.removeById(id) ? R.success(MessageConstant.DELETE_SUCCESS) : R.error();
    }

    @ApiOperation("取消活动")
    @PutMapping("/cancel/{id}")
    public R<String> cancelActivity(@PathVariable Long id) {
        return clubActivityService.cancelActivity(id) ? R.success("活动已取消") : R.error();
    }
}
