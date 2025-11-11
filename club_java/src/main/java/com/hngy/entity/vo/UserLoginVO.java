package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

import java.io.Serializable;
@Data
@Builder
@ApiModel("用户登录返回对象")
public class UserLoginVO implements Serializable {
    @ApiModelProperty(value = "id")
    private Long id;
    @ApiModelProperty(value = "openid")
    private String openid;
    @ApiModelProperty(value = "token")
    private String token;
    @ApiModelProperty(value = "用户名")
    private String username;
    @ApiModelProperty(value = "头像")
    private String avatar;

}
