package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("管理员DTO")
public class AdminDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty("管理员ID")
    private Long id;

    @ApiModelProperty("用户名")
    private String username;

    @ApiModelProperty("密码")
    private String password;

    @ApiModelProperty("描述")
    private String description;

    @ApiModelProperty("手机号")
    private String phone;

    @ApiModelProperty("类型 0=普通管理员 1=超级管理员")
    private Integer type;

    @ApiModelProperty("状态 0=禁用 1=正常")
    private Integer status;
}