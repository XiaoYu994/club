package com.hngy.entity.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
public class ClubInfoDTO {

    @ApiModelProperty(value = "社团名称")
    private String name;

    @ApiModelProperty(value = "社团logo")
    private String logo;

    @ApiModelProperty(value = "社团简介")
    private String description;

    @ApiModelProperty(value = "排序号")
    private Integer orderNum;

    @ApiModelProperty(value = "社团类型 0=普通社团 1=院级社团 2=校级社团")
    private Integer type;

    @ApiModelProperty(value = "社团地址")
    private String address;

    @ApiModelProperty(value = "联系方式")
    private String contact;

    @ApiModelProperty(value = "谁要创建的社团")
    private Long createUserId;


}
