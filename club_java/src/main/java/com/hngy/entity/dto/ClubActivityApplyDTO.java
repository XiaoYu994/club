package com.hngy.entity.dto;

import com.hngy.common.page.PageParam;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("活动报名参数查询")
public class ClubActivityApplyDTO extends PageParam {

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝")
    private Integer status;
}
