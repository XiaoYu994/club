package com.hngy.controller.admin;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.NoticeDTO;
import com.hngy.entity.dto.NoticePageDTO;
import com.hngy.entity.vo.NoticeVO;
import com.hngy.service.ISystemAnnouncementService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 管理员公告管理相关接口
 */
@RestController
@RequestMapping("/admin/notices")
@Api(tags = "管理员公告管理接口")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final ISystemAnnouncementService adminNoticeService;

    /**
     * 获取公告列表
     */
    @GetMapping
    @ApiOperation("获取公告列表")
    public R<PageResult<NoticeVO>> getNotices(NoticePageDTO NoticePageDTO) {
            return R.success(adminNoticeService.getNotices(NoticePageDTO));
    }
    
    /**
     * 获取最近公告
     */
    @GetMapping("/recent")
    @ApiOperation("获取最近公告")
    public R<List<NoticeVO>> getRecentNotices() {
        return R.success(adminNoticeService.getRecentNotices());
    }

    /**
     * 获取公告详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取公告详情")
    public R<NoticeVO> getNoticeDetail(@PathVariable Integer id) {
        return R.success(adminNoticeService.getNoticeDetail(id));
    }

    /**
     * 创建公告
     */
    @PostMapping
    @ApiOperation("创建公告")
    public R<String> createNotice(@RequestBody @Valid NoticeDTO noticeDTO) {
        return adminNoticeService.createNotice(noticeDTO) ? R.success() : R.error();
    }

    /**
     * 更新公告
     */
    @PutMapping("/{id}")
    @ApiOperation("更新公告")
    public R<String> updateNotice(@PathVariable Integer id, @RequestBody @Valid NoticeDTO noticeDTO) {
        return adminNoticeService.updateNotice(id, noticeDTO) ? R.success() : R.error();
    }

    /**
     * 删除公告
     */
    @DeleteMapping("/{id}")
    @ApiOperation("删除公告")
    public R<String> deleteNotice(@PathVariable Integer id) {
        return adminNoticeService.removeById(id) ? R.success() : R.error();
    }

    /**
     * 设置公告置顶状态
     */
    @PutMapping("/{id}/top")
    @ApiOperation("设置公告置顶状态")
    public R<String> updateTopStatus(@PathVariable Integer id, @RequestParam Integer isTop) {
        return adminNoticeService.updateTopStatus(id, isTop) ? R.success() : R.error();
    }
} 