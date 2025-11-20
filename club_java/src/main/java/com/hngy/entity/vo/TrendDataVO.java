package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 趋势数据VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ApiModel("趋势数据视图对象")
public class TrendDataVO {

    @ApiModelProperty("日期列表（格式：MM-DD）")
    private List<String> dates;

    @ApiModelProperty("用户新增趋势")
    private List<Integer> userTrend;

    @ApiModelProperty("社团新增趋势")
    private List<Integer> clubTrend;

    @ApiModelProperty("活动新增趋势")
    private List<Integer> activityTrend;

    @ApiModelProperty("活动报名趋势")
    private List<Integer> activityApplyTrend;

    @ApiModelProperty("社团招新申请趋势")
    private List<Integer> clubApplyTrend;
}
