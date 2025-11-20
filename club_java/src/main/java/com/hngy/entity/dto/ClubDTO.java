package com.hngy.entity.dto;

import com.hngy.common.page.PageParam;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("社团分页参数")
public class ClubDTO extends PageParam {
    @ApiModelProperty("关键词")
    private String keyword;

    @ApiModelProperty("社团名称")
    private String name;

    @ApiModelProperty(value = "社团类型 0=普通社团 1=院级社团 2=校级社团")
    private Integer type;

    @ApiModelProperty("是否招新中")
    private Boolean isRecruiting;

    @ApiModelProperty("状态 0=禁用 1=正常")
    private Integer status;
}
