package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * <p>
 * 审核申请数据传输对象
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Data
@ApiModel(value="ReviewApplyDTO", description="审核申请数据")
public class ReviewApplyDTO {

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝")
    private Integer status;

    @ApiModelProperty(value = "反馈信息")
    private String feedback;
}
