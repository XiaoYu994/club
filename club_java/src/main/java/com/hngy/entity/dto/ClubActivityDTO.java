package com.hngy.entity.dto;

import com.hngy.common.page.PageParam;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * <p>
 * 社团活动表
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@EqualsAndHashCode(callSuper = true)
@Data
@ApiModel(value="ClubActivityDTO", description="社团活动查询参数")
public class ClubActivityDTO extends PageParam {

    @ApiModelProperty("关键词")
    private String keyword;

    @ApiModelProperty(value = "社团ID")
    private Long clubId;

    @ApiModelProperty(value = "社团类型")
    private Integer clubType;

    @ApiModelProperty(value = "状态 0=取消 1=计划中 2=进行中 3=已结束")
    private Integer status;
    @ApiModelProperty(value = "开始时间")
    private Long startTime;

    @ApiModelProperty(value = "结束时间")
    private Long endTime;
}
