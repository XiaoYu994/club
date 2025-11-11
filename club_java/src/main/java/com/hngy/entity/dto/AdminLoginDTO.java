package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("管理员登录")
public class AdminLoginDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "管理员名称")
    private String username;

    @ApiModelProperty(value = "密码")
    private String password;
}
