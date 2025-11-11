package com.hngy.entity.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatisticsVO {
    private Integer userCount;
    private Integer clubCount;
    private Integer activityCount;
    private Integer noticeCount;
}
