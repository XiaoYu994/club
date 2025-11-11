package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("添加管理员")
public class AdminDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "管理员名称")
    private String username;

    @ApiModelProperty(value = "密码")
    private String password;

    @ApiModelProperty(value = "描述")
    private String description;

    @ApiModelProperty(value = "手机号")
    private String phone;

    @ApiModelProperty(value = "类型 0=普通管理员 1=超级管理员")
    private Integer type;

}