package com.hngy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.po.UserNotification;
import com.hngy.mapper.UserNotificationMapper;
import com.hngy.service.IUserNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * <p>
 * 用户消息通知表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-11-11
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserNotificationServiceImpl extends ServiceImpl<UserNotificationMapper, UserNotification> implements IUserNotificationService {

    private final UserNotificationMapper userNotificationMapper;

    @Override
    public boolean createNotification(Long userId, String type, String title, String message, Long relatedId) {
        return createNotification(userId, type, title, message, relatedId, null);
    }

    @Override
    public boolean createNotification(Long userId, String type, String title, String message, Long relatedId, String extData) {
        UserNotification notification = new UserNotification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0); // 默认未读
        notification.setExtData(extData);
        notification.setCreateTime(System.currentTimeMillis());

        boolean saved = save(notification);
        if (saved) {
            log.info("创建消息通知成功，用户ID: {}, 类型: {}, 标题: {}", userId, type, title);
        }
        return saved;
    }

    @Override
    public PageResult<UserNotification> getUserNotifications(Long userId, Integer page, Integer size) {
        // 构建分页对象
        Page<UserNotification> pageObj = new Page<>(page, size);

        // 构建查询条件
        LambdaQueryWrapper<UserNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserNotification::getUserId, userId);
        wrapper.orderByDesc(UserNotification::getCreateTime);

        // 执行分页查询
        Page<UserNotification> resultPage = userNotificationMapper.selectPage(pageObj, wrapper);

        // 封装返回结果
        PageResult<UserNotification> pageResult = new PageResult<>();
        pageResult.setList(resultPage.getRecords());
        pageResult.setTotal(resultPage.getTotal());
        pageResult.setPages(resultPage.getPages());

        return pageResult;
    }

    @Override
    public boolean markAsRead(Long id, Long userId) {
        // 查询消息
        UserNotification notification = userNotificationMapper.selectById(id);
        if (notification == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), "消息通知不存在");
        }

        // 校验权限
        if (!notification.getUserId().equals(userId)) {
            throw new ServiceException(HttpStatus.FORBIDDEN.value(), "无权操作此消息");
        }

        // 如果已经是已读状态，直接返回
        if (notification.getIsRead() == 1) {
            return true;
        }

        // 标记为已读
        notification.setIsRead(1);
        notification.setReadTime(System.currentTimeMillis());

        return updateById(notification);
    }

    @Override
    public int markAllAsRead(Long userId) {
        // 构建更新条件
        LambdaQueryWrapper<UserNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserNotification::getUserId, userId);
        wrapper.eq(UserNotification::getIsRead, 0);

        // 查询所有未读消息
        java.util.List<UserNotification> unreadList = userNotificationMapper.selectList(wrapper);

        if (unreadList.isEmpty()) {
            return 0;
        }

        // 批量更新为已读
        Long currentTime = System.currentTimeMillis();
        for (UserNotification notification : unreadList) {
            notification.setIsRead(1);
            notification.setReadTime(currentTime);
            updateById(notification);
        }

        log.info("用户 {} 标记了 {} 条消息为已读", userId, unreadList.size());
        return unreadList.size();
    }

    @Override
    public int getUnreadCount(Long userId) {
        return userNotificationMapper.countUnreadByUserId(userId);
    }

    @Override
    public boolean deleteNotification(Long id, Long userId) {
        // 查询消息
        UserNotification notification = userNotificationMapper.selectById(id);
        if (notification == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), "消息通知不存在");
        }

        // 校验权限
        if (!notification.getUserId().equals(userId)) {
            throw new ServiceException(HttpStatus.FORBIDDEN.value(), "无权删除此消息");
        }

        return removeById(id);
    }
}
