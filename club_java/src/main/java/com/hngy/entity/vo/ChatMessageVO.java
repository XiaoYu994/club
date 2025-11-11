package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 聊天消息视图对象
 */
@Data
@ApiModel(value = "聊天消息VO")
public class ChatMessageVO {
    
    @ApiModelProperty(value = "消息ID")
    private Integer id;
    
    @ApiModelProperty(value = "群组ID")
    private Integer chatId;
    
    @ApiModelProperty(value = "发送者ID")
    private Integer senderId;
    
    @ApiModelProperty(value = "发送者名称")
    private String senderName;
    
    @ApiModelProperty(value = "发送者头像")
    private String senderAvatar;
    
    @ApiModelProperty(value = "接收者ID(私聊时使用)")
    private Integer receiverId;
    
    @ApiModelProperty(value = "接收者名称(私聊时使用)")
    private String receiverName;
    
    @ApiModelProperty(value = "消息内容")
    private String content;
    
    @ApiModelProperty(value = "内容类型 0=文本 1=图片 2=语音 3=文件 4=位置")
    private Integer contentType;
    
    @ApiModelProperty(value = "引用消息ID")
    private Integer refMessageId;
    
    @ApiModelProperty(value = "引用消息内容")
    private String refMessageContent;
    
    @ApiModelProperty(value = "媒体文件URL")
    private String mediaUrl;
    
    @ApiModelProperty(value = "是否已读")
    private Boolean isRead;
    
    @ApiModelProperty(value = "发送时间")
    private Long createTime;
} 