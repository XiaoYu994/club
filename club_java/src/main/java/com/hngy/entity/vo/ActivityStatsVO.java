package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * <p>
 * 活动统计信息视图对象
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Data
@ApiModel(value="ActivityStatsVO", description="活动统计信息视图对象")
public class ActivityStatsVO {

    @ApiModelProperty(value = "活动ID")
    private Long activityId;

    @ApiModelProperty(value = "报名总人数")
    private Integer totalApplies;

    @ApiModelProperty(value = "审核通过人数")
    private Integer approvedApplies;

    @ApiModelProperty(value = "拒绝人数")
    private Integer rejectedApplies;

    @ApiModelProperty(value = "待审核人数")
    private Integer pendingApplies;

    @ApiModelProperty(value = "签到人数")
    private Integer checkedInCount;

    @ApiModelProperty(value = "签到率")
    private Double checkInRate;

    @ApiModelProperty(value = "社团成员参与人数")
    private Integer memberCount;

    @ApiModelProperty(value = "非社团成员参与人数")
    private Integer nonMemberCount;
} 