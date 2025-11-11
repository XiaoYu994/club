package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@ApiModel("系统管理员视图实体")
public class AdminLoginVO {
    @ApiModelProperty("id")
    private Long id;
    @ApiModelProperty("用户名")
    private String username;
    @ApiModelProperty("状态 0=禁用 1=正常")
    private Integer status;
    @ApiModelProperty("类型")
    private Integer type;
    @ApiModelProperty("令牌")
    private String token;

}
