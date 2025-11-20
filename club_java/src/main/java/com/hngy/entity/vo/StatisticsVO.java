package com.hngy.entity.vo;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class StatisticsVO {
    private Integer userCount;
    private Integer clubCount;
    private Integer activityCount;
    private Integer noticeCount;
    private Integer pendingActivityCount; // 待审核活动数
    private Integer pendingClubApplyCount; // 待审核申请数
    private Map<String, Integer> clubCategoryDistribution; // 社团类别分布
    private Map<String, Integer> activityStatusDistribution; // 活动状态分布
    private Map<String, Integer> userStatusDistribution; // 用户状态分布
    private Integer totalActivityApplies; // 活动报名总数
    private Integer totalCheckedIn; // 总签到人数
    private Double averageCheckInRate; // 平均签到率
    private Double averageActivityParticipation; // 平均活动参与率（每个活动的平均报名数）
    private List<ClubStatItem> topClubs; // 热门社团
    
    @Data
    @Builder
    public static class ClubStatItem {
        private Integer clubId;
        private String clubName;
        private Integer memberCount;
    }
}
