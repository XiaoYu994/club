package com.hngy.scheduled;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.hngy.common.constant.ActivityConstant;
import com.hngy.common.constant.NotificationConstant;
import com.hngy.common.constant.RecruitmentConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.entity.po.ClubActivity;
import com.hngy.entity.po.ClubActivityApply;
import com.hngy.entity.po.ClubRecruitment;
import com.hngy.mapper.ClubActivityApplyMapper;
import com.hngy.mapper.ClubActivityMapper;
import com.hngy.mapper.ClubRecruitmentMapper;
import com.hngy.service.IUserNotificationService;
import com.hngy.websocket.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 状态更新定时任务
 * 
 * @author xhy
 * @since 2025-01-28
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StatusUpdateScheduledTask {

    private final ClubRecruitmentMapper clubRecruitmentMapper;
    private final ClubActivityMapper clubActivityMapper;
    private final ClubActivityApplyMapper clubActivityApplyMapper;
    private final IUserNotificationService userNotificationService;
    private final ChatWebSocketHandler chatWebSocketHandler;

    /**
     * 更新社团招新活动状态定时任务
     * 如果当前时间大于社团招新活动结束时间，将状态设置为已结束
     * 每天晚上12点执行一次
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateRecruitmentStatus() {
        log.info("开始执行社团招新活动状态更新定时任务");
        
        try {
            long currentTime = System.currentTimeMillis();
            
            // 构建更新条件：当前时间大于结束时间且状态不是已结束
            LambdaUpdateWrapper<ClubRecruitment> updateWrapper = new LambdaUpdateWrapper<>();
            updateWrapper.set(ClubRecruitment::getStatus, RecruitmentConstant.STATUS_ENDED)
                        .set(ClubRecruitment::getUpdateTime, currentTime)
                        .lt(ClubRecruitment::getEndTime, currentTime)
                        .ne(ClubRecruitment::getStatus, RecruitmentConstant.STATUS_ENDED);
            
            int updateCount = clubRecruitmentMapper.update(null, updateWrapper);
            log.info("社团招新活动状态更新完成，共更新 {} 条记录", updateCount);
            
        } catch (Exception e) {
            log.error("社团招新活动状态更新定时任务执行失败", e);
        }
    }

    /**
     * 更新活动状态定时任务
     * 只将已结束的活动状态更新为"已结束"
     * 活动改为"进行中"应该由管理员审批操作完成
     * 每天晚上12点执行一次
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void updateActivityStatus() {
        log.info("开始执行活动状态更新定时任务");

        try {
            long currentTime = System.currentTimeMillis();

            // 将已结束的活动状态更新为"已结束"
            // 条件：结束时间 < 当前时间 且 状态 = 进行中(2)
            LambdaUpdateWrapper<ClubActivity> endedWrapper = new LambdaUpdateWrapper<>();
            endedWrapper.set(ClubActivity::getStatus, ActivityConstant.STATUS_ENDED)
                        .set(ClubActivity::getUpdateTime, currentTime)
                        .lt(ClubActivity::getEndTime, currentTime)    // 结束时间 < 当前时间
                        .eq(ClubActivity::getStatus, ActivityConstant.STATUS_ACTIVE);  // 状态 = 进行中(2)

            int endedCount = clubActivityMapper.update(null, endedWrapper);
            log.info("活动状态更新为已结束完成，共更新 {} 条记录", endedCount);

        } catch (Exception e) {
            log.error("活动状态更新定时任务执行失败", e);
        }
    }

    /**
     * 活动开始提醒定时任务
     * 每天早上9点执行，检查明天开始的活动，给所有报名且审核通过的用户发送提醒
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendActivityReminder() {
        log.info("开始执行活动开始提醒定时任务");

        try {
            long currentTime = System.currentTimeMillis();
            // 计算明天0点的时间戳
            long tomorrowStart = currentTime + 24 * 60 * 60 * 1000 - (currentTime % (24 * 60 * 60 * 1000));
            // 计算后天0点的时间戳
            long dayAfterTomorrowStart = tomorrowStart + 24 * 60 * 60 * 1000;

            log.info("查找明天开始的活动，时间范围：{} - {}",
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(tomorrowStart)),
                new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(dayAfterTomorrowStart)));

            // 查询明天开始的活动（状态为进行中）
            LambdaQueryWrapper<ClubActivity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.eq(ClubActivity::getStatus, ActivityConstant.STATUS_ACTIVE)
                          .ge(ClubActivity::getStartTime, tomorrowStart)
                          .lt(ClubActivity::getStartTime, dayAfterTomorrowStart);

            List<ClubActivity> upcomingActivities = clubActivityMapper.selectList(activityWrapper);
            log.info("找到 {} 个明天开始的活动", upcomingActivities.size());

            int totalNotificationsSent = 0;
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm");

            // 遍历每个活动
            for (ClubActivity activity : upcomingActivities) {
                try {
                    // 查找该活动所有审核通过的报名记录
                    LambdaQueryWrapper<ClubActivityApply> applyWrapper = new LambdaQueryWrapper<>();
                    applyWrapper.eq(ClubActivityApply::getActivityId, activity.getId())
                               .eq(ClubActivityApply::getStatus, StatusConstant.ENABLE);

                    List<ClubActivityApply> approvedApplies = clubActivityApplyMapper.selectList(applyWrapper);
                    log.info("活动 {} 共有 {} 个审核通过的报名", activity.getTitle(), approvedApplies.size());

                    String activityTime = dateFormat.format(new Date(activity.getStartTime()));

                    // 给每个报名用户发送提醒
                    for (ClubActivityApply apply : approvedApplies) {
                        try {
                            String notificationTitle = NotificationConstant.TITLE_ACTIVITY_REMINDER;
                            String notificationMessage = "您报名的活动 \"" + activity.getTitle() + "\" 即将在明天开始";

                            // 1. 保存通知到数据库
                            userNotificationService.createNotification(
                                apply.getUserId(),
                                NotificationConstant.TYPE_ACTIVITY_REMINDER,
                                notificationTitle,
                                notificationMessage,
                                activity.getId(),
                                null
                            );

                            // 2. 发送WebSocket实时通知
                            chatWebSocketHandler.sendActivityReminderNotification(
                                apply.getUserId(),
                                activity.getId(),
                                activity.getTitle(),
                                activityTime
                            );

                            totalNotificationsSent++;
                        } catch (Exception e) {
                            log.error("发送活动提醒失败，用户ID: {}, 活动ID: {}",
                                apply.getUserId(), activity.getId(), e);
                        }
                    }
                } catch (Exception e) {
                    log.error("处理活动提醒失败，活动ID: {}", activity.getId(), e);
                }
            }

            log.info("活动开始提醒定时任务执行完成，共发送 {} 条提醒通知", totalNotificationsSent);

        } catch (Exception e) {
            log.error("活动开始提醒定时任务执行失败", e);
        }
    }
} 