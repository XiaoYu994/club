package com.hngy.controller.admin;

import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.*;
import com.hngy.entity.vo.ClubDetailVO;
import com.hngy.entity.vo.ClubInfoVO;
import com.hngy.service.IClubInfoService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/clubs")
@RequiredArgsConstructor
@Api(tags = "管理员社团接口")
public class AdminClubController {
    private final IClubInfoService clubInfoService;


    @ApiOperation("获取社团列表")
    @GetMapping
    public R<PageResult<ClubInfoVO>> getActivity(ClubDTO clubDTO) {
        return R.success(clubInfoService.getClubs(clubDTO));
    }

    @ApiOperation("获取社团详细信息")
    @GetMapping("/{id}/detail")
    public R<ClubDetailVO> getClubDetail(@PathVariable Long id) {
        return R.success(clubInfoService.getClubDetail(id));
    }

    @ApiOperation("创建社团")
    @PostMapping
    public R<String> createClub(@RequestBody ClubInfoDTO clubInfoDTO) {
        return clubInfoService.createClub(clubInfoDTO) ? R.success() : R.error();
    }

    @ApiOperation("更新社团信息")
    @PutMapping("/{id}")
    public R<String> updateClub(@PathVariable Long id, @RequestBody ClubUpdateDTO clubUpdateDTO) {
        return clubInfoService.updateClub(id, clubUpdateDTO) ? R.success() : R.error();
    }

    @ApiOperation("刪除社团")
    @DeleteMapping("/{id}")
    public R<String> deleteClub(@PathVariable Long id) {
        return clubInfoService.deleteClub(id) ? R.success() : R.error();
    }

    @ApiOperation("修改社团状态")
    @PutMapping
    public R<String> updateClubStatus(@RequestBody ClubStatusDTO updateClubStatus) {
        return clubInfoService.updateClubStatus(updateClubStatus) ? R.success() : R.error();
    }

    @ApiOperation("修改社团排序")
    @PutMapping("/order")
    public R<String> updateClubOrder(@RequestBody ClubOrderDTO clubOrderDTO) {
        return clubInfoService.updateClubOrder(clubOrderDTO) ? R.success() : R.error();
    }

}
