package com.hngy.controller.user;

import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.NoticePageDTO;
import com.hngy.entity.vo.NoticeVO;
import com.hngy.service.ISystemAnnouncementService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/user/notice")
@Api(tags = "用户端-公告管理")
@RequiredArgsConstructor
public class NoticeController {
    private final ISystemAnnouncementService systemAnnouncementService;

    @ApiOperation("分页获取公告列表")
    @GetMapping
    public R<PageResult<NoticeVO>> getNoticeList(NoticePageDTO noticePageDTO) {
        return R.success(systemAnnouncementService.getNotices(noticePageDTO));
    }

    @ApiOperation("获取公告详情")
    @GetMapping("/{id}")
    public R<NoticeVO> getNoticeDetail(@PathVariable Integer id) {
        return R.success(systemAnnouncementService.getNoticeDetail(id));
    }

    @ApiOperation("获取最近公告（前5条）")
    @GetMapping("/recent")
    public R<List<NoticeVO>> getRecentNotices() {
        return R.success(systemAnnouncementService.getRecentNotices());
    }
} 