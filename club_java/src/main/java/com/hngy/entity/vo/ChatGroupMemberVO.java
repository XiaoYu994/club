package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 聊天群组成员视图对象
 */
@Data
@ApiModel("聊天群组成员视图对象")
public class ChatGroupMemberVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "成员ID")
    private Integer id;

    @ApiModelProperty(value = "群组ID")
    private Integer groupId;

    @ApiModelProperty(value = "用户ID")
    private Integer userId;

    @ApiModelProperty(value = "用户名称")
    private String username;

    @ApiModelProperty(value = "昵称")
    private String nickname;

    @ApiModelProperty(value = "头像")
    private String avatar;

    @ApiModelProperty(value = "学号")
    private String studentId;

    @ApiModelProperty(value = "角色 0=普通成员 1=管理员 2=群主")
    private Integer role;

    @ApiModelProperty(value = "加入时间")
    private Long joinTime;

    @ApiModelProperty(value = "是否在线")
    private Boolean isOnline;
}
