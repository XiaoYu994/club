package com.hngy.controller.user;


import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.ClubApply;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.vo.ClubApplyListVO;
import com.hngy.entity.vo.ClubInfoVO;
import com.hngy.entity.vo.ClubMemberVO;
import com.hngy.entity.vo.MyClubApplyVO;
import com.hngy.service.IClubApplyService;
import com.hngy.service.IClubInfoService;
import com.hngy.service.IClubMemberService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 社团信息表 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@RestController
@RequestMapping("/user/club")
@RequiredArgsConstructor
@Api(tags = "社团信息管理接口")
public class ClubInfoController {
    private final IClubInfoService clubInfoService;
    private final IClubMemberService clubMemberService;
    private final IClubApplyService clubApplyService;

    @ApiOperation("根据id查")
    @GetMapping("/{id}")
    public R<ClubInfoVO> getClubInfo(@PathVariable Long id){
      ClubInfo clubInfo = clubInfoService.getById(id);
      final ClubInfoVO clubInfoVO = BeanUtil.copyProperties(clubInfo, ClubInfoVO.class);
        return R.success(clubInfoVO);
    }

    @ApiOperation("查询社团")
    @GetMapping
    public R<PageResult<ClubInfoVO>> getActivity(ClubDTO clubDTO) {
        return R.success(clubInfoService.queryPage(clubDTO));
    }
    @ApiOperation("用户在社团中的角色")
    @GetMapping("/role/{clubId}")
    public R<ClubMemberVO> getUserRole(@PathVariable Long clubId) {
        return R.success(clubMemberService.isMember(clubId));
    }

    @ApiOperation("检查用户加入社团的申请状态")
    @GetMapping("/apply/status/{clubId}")
    public R<ClubMemberVO> checkApplyStatus(@PathVariable Long clubId) {
        return R.success(clubMemberService.isMember(clubId));
    }

    @ApiOperation("获取社团成员列表")
    @GetMapping("/members/{clubId}")
    public R<PageResult<ClubMemberVO>> getMembers(@PathVariable Long clubId, ClubMemberDTO clubMemberDTO) {
        return R.success(clubMemberService.queryPage(clubId,clubMemberDTO));
    }

    @ApiOperation("申请加入社团")
    @PostMapping("/apply/{clubId}")
    public R<String> applyJoinClub(@PathVariable Long clubId, @RequestBody Map<String, Object> formData) {
        return R.success(clubApplyService.applyJoinClub(clubId, formData));
    }

    @ApiOperation("取消加入社团申请")
    @DeleteMapping("/apply/{applyId}")
    public R<String> cancelApply(@PathVariable Long applyId) {
        return clubApplyService.removeById(applyId) ? R.success(MessageConstant.ALREADY_CANCEL) : R.error();
    }

    @ApiOperation("退出社团")
    @DeleteMapping("/quit/{clubId}")
    public R<String> quitClub(@PathVariable Long clubId) {
        return clubMemberService.quitClub(clubId) ? R.success(MessageConstant.QUIT_SUCCESS) : R.error();
    }

    @ApiOperation("审核社团加入申请")
    @PutMapping("/apply/review/{applyId}")
    public R<String> reviewApply(@PathVariable Long applyId, @RequestBody ReviewApplyDTO reviewApplyDTO) {
        return clubApplyService.reviewApply(applyId, reviewApplyDTO) ? R.success(MessageConstant.REVIEW_SUCCESS) : R.error();
    }

    @ApiOperation("获取社团申请列表")
    @GetMapping("/applies/{clubId}")
    public R<PageResult<ClubApplyListVO>> getApplyList(@PathVariable Long clubId, ClubMemberDTO clubMemberDTO) {
        return R.success(clubApplyService.queryPage(clubId, clubMemberDTO));
    }

    @ApiOperation("获取社团申请计数")
    @GetMapping("/applies/counts/{clubId}")
    public R<Map<String, Object>> getApplyCounts(@PathVariable Long clubId) {
        return R.success(clubApplyService.countApplies(clubId));
    }

    @ApiOperation("更新成员角色")
    @PutMapping("/member/role")
    public R<String> updateMemberRole(@RequestBody UpdateRoleDTO data) {
        return clubMemberService.updateRole(data) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }

    @ApiOperation("禁用或启用社团成员")
    @PutMapping("/member/status")
    public R<String> updateMemberStatus(@RequestBody Map<String, Object> data) {
        return clubMemberService.updateStatus(data) ? R.success("操作成功") : R.error("操作失败");
    }

    @ApiOperation("移除社团成员（社长使用）")
    @DeleteMapping("/member")
    public R<String> removeMember(@RequestBody Map<String, Object> data) {
        return clubMemberService.removeMember(data) ? R.success("移除成功") : R.error("移除失败");
    }

    @ApiOperation("导出社团成员数据")
    @GetMapping("/members/{clubId}/export-excel")
    public R<Map<String, Object>> exportClubMembers(@PathVariable Long clubId) {
        return R.success(clubMemberService.exportClubMembers(clubId));
    }

    @ApiOperation("获取我的社团申请记录")
    @GetMapping("/my-applies")
    public R<List<MyClubApplyVO>> getMyClubApplies() {
        Long userId = BaseContext.getCurrentId();
        List<MyClubApplyVO> result = clubApplyService.getMyClubApplies(userId);
        return R.success(result);
    }

    @ApiOperation("测试获取申请数据")
    @GetMapping("/my-applies-test")
    public R<Object> getMyClubAppliesTest() {
        Long userId = BaseContext.getCurrentId();
        
        // 直接查询原始数据用于调试
        LambdaQueryWrapper<ClubApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubApply::getUserId, userId)
               .orderByDesc(ClubApply::getCreateTime);
        
        List<ClubApply> applies = clubApplyService.list(wrapper);
        
        Map<String, Object> debugInfo = new HashMap<>();
        debugInfo.put("userId", userId);
        debugInfo.put("appliesCount", applies.size());
        debugInfo.put("applies", applies);
        
        return R.success(debugInfo);
    }

    @ApiOperation("更新社团信息")
    @PutMapping("/{id}")
    public R<String> updateClub(@PathVariable Long id, @RequestBody ClubUpdateDTO clubUpdateDTO) {
        // 使用更新 DTO 填充实体
        ClubInfo clubInfo = BeanUtil.copyProperties(clubUpdateDTO, ClubInfo.class);
        clubInfo.setId(id);
        return clubInfoService.updateById(clubInfo) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }

    @ApiOperation("获取当前用户已加入的社团列表")
    @GetMapping("/my")
    public R<List<ClubInfoVO>> getMyClubs() {
        Long userId = BaseContext.getCurrentId();
        return R.success(clubInfoService.getMyClubs(userId));
    }
    @ApiOperation("获取十佳社团列表")
    @GetMapping("/topTen")
    public R<List<ClubInfoVO>> getTopTenClubs() {
        return R.success(clubInfoService.getTopTenClubs());
    }
}
