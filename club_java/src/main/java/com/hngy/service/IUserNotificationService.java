package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.po.UserNotification;

/**
 * <p>
 * 用户消息通知表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-11-11
 */
public interface IUserNotificationService extends IService<UserNotification> {

    /**
     * 创建消息通知
     * @param userId 用户ID
     * @param type 通知类型
     * @param title 通知标题
     * @param message 通知内容
     * @param relatedId 关联ID
     * @return 是否成功
     */
    boolean createNotification(Long userId, String type, String title, String message, Long relatedId);

    /**
     * 创建消息通知（带扩展数据）
     * @param userId 用户ID
     * @param type 通知类型
     * @param title 通知标题
     * @param message 通知内容
     * @param relatedId 关联ID
     * @param extData 扩展数据JSON
     * @return 是否成功
     */
    boolean createNotification(Long userId, String type, String title, String message, Long relatedId, String extData);

    /**
     * 获取用户的消息通知列表（分页）
     * @param userId 用户ID
     * @param page 页码
     * @param size 每页大小
     * @return 消息通知列表
     */
    PageResult<UserNotification> getUserNotifications(Long userId, Integer page, Integer size);

    /**
     * 标记消息为已读
     * @param id 消息ID
     * @param userId 用户ID（校验权限）
     * @return 是否成功
     */
    boolean markAsRead(Long id, Long userId);

    /**
     * 批量标记消息为已读
     * @param userId 用户ID
     * @return 标记数量
     */
    int markAllAsRead(Long userId);

    /**
     * 获取用户未读消息数量
     * @param userId 用户ID
     * @return 未读消息数量
     */
    int getUnreadCount(Long userId);

    /**
     * 删除消息通知
     * @param id 消息ID
     * @param userId 用户ID（校验权限）
     * @return 是否成功
     */
    boolean deleteNotification(Long id, Long userId);
}
