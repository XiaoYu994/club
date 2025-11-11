package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
@ApiModel("社团更新 DTO，用于接收前端表单数据")
public class ClubUpdateDTO {

    @ApiModelProperty("社团名称")
    private String name;

    @ApiModelProperty("社团 Logo URL")
    private String logo;

    @ApiModelProperty("社团简介")
    private String description;

    @ApiModelProperty("社团类型 0=普通社团 1=院级社团 2=校级社团")
    private Integer type;

    @ApiModelProperty("社团地址")
    private String address;

    @ApiModelProperty("联系方式")
    private String contact;

    @ApiModelProperty("自定义表单 JSON 字符串，用于前端配置字段")
    private String forms;
} 