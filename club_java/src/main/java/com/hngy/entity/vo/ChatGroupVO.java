package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 聊天群组视图对象
 */
@Data
@ApiModel(value = "聊天群组VO")
public class ChatGroupVO {
    
    @ApiModelProperty(value = "群组ID")
    private Integer id;
    
    @ApiModelProperty(value = "群组名称")
    private String name;
    
    @ApiModelProperty(value = "群组头像")
    private String avatar;
    
    @ApiModelProperty(value = "关联的社团ID")
    private Integer clubId;
    
    @ApiModelProperty(value = "社团名称")
    private String clubName;
    
    @ApiModelProperty(value = "创建者ID")
    private Integer ownerId;
    
    @ApiModelProperty(value = "创建者名称")
    private String ownerName;
    
    @ApiModelProperty(value = "群组类型：0-公共群 1-部门群 2-管理员群")
    private Integer type;
    
    @ApiModelProperty(value = "成员数量")
    private Integer memberCount;

    @ApiModelProperty(value = "最后一条消息内容")
    private String lastMessage;
    
    @ApiModelProperty(value = "最后一条消息时间")
    private Long lastMessageTime;

    @ApiModelProperty(value = "群组简介")
    private String description;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;
} 