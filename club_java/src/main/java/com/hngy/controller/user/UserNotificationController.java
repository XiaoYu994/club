package com.hngy.controller.user;

import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.po.UserNotification;
import com.hngy.service.IUserNotificationService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 用户消息通知 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-11-11
 */
@RestController
@RequestMapping("/user/notification")
@Api(tags = "用户消息通知接口")
@RequiredArgsConstructor
@Slf4j
public class UserNotificationController {

    private final IUserNotificationService userNotificationService;

    @ApiOperation("获取当前用户的消息通知列表")
    @GetMapping
    public R<PageResult<UserNotification>> getNotifications(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Long userId = BaseContext.getCurrentId();
        log.info("【通知API】获取消息通知列表，userId: {}, page: {}, size: {}", userId, page, size);

        PageResult<UserNotification> pageResult = userNotificationService.getUserNotifications(userId, page, size);
        log.info("【通知API】返回消息通知列表，total: {}, records: {}", pageResult.getTotal(), pageResult.getList().size());

        return R.success(pageResult);
    }

    @ApiOperation("获取未读消息数量")
    @GetMapping("/unread-count")
    public R<Integer> getUnreadCount() {
        Long userId = BaseContext.getCurrentId();
        log.info("【通知API】获取未读消息数量，userId: {}", userId);
        int count = userNotificationService.getUnreadCount(userId);
        log.info("【通知API】未读消息数量: {}", count);
        return R.success(count);
    }

    @ApiOperation("标记消息为已读")
    @PutMapping("/read/{id}")
    public R<String> markAsRead(@PathVariable Long id) {
        Long userId = BaseContext.getCurrentId();
        boolean success = userNotificationService.markAsRead(id, userId);
        return success ? R.success("标记成功") : R.error("标记失败");
    }

    @ApiOperation("标记所有消息为已读")
    @PutMapping("/read-all")
    public R<String> markAllAsRead() {
        Long userId = BaseContext.getCurrentId();
        int count = userNotificationService.markAllAsRead(userId);
        return R.success("已标记" + count + "条消息为已读");
    }

    @ApiOperation("删除消息通知")
    @DeleteMapping("/{id}")
    public R<String> deleteNotification(@PathVariable Long id) {
        Long userId = BaseContext.getCurrentId();
        boolean success = userNotificationService.deleteNotification(id, userId);
        return success ? R.success(MessageConstant.DELETE_SUCCESS) : R.error("删除失败");
    }
}
