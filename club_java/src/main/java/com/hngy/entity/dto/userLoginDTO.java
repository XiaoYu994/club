package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("用户登录")
public class userLoginDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    @ApiModelProperty("用户id")
    private Long id;
    @ApiModelProperty("前端返回的微信openid")
    private String code;
}
