package com.hngy.entity.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
public class AdminVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "管理员ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "管理员名称")
    private String username;

    @ApiModelProperty(value = "描述")
    private String description;

    @ApiModelProperty(value = "手机号")
    private String phone;

    @ApiModelProperty(value = "登录次数")
    private Integer loginCount;

    @ApiModelProperty(value = "类型 0=普通管理员 1=超级管理员")
    private Integer type;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "最后登录时间")
    private Long lastLoginTime;

    @ApiModelProperty(value = "管理员扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;
}
