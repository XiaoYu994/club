package com.hngy.scheduled;

import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.hngy.common.constant.ActivityConstant;
import com.hngy.common.constant.RecruitmentConstant;
import com.hngy.entity.po.ClubActivity;
import com.hngy.entity.po.ClubRecruitment;
import com.hngy.mapper.ClubActivityMapper;
import com.hngy.mapper.ClubRecruitmentMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

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
} 