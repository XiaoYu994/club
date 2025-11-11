package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 聊天消息数据传输对象
 */
@Data
@ApiModel(value = "聊天消息DTO")
public class ChatMessageDTO {
    
    @ApiModelProperty(value = "群组ID")
    private Integer groupId;
    
    @ApiModelProperty(value = "接收者ID(私聊时使用)")
    private Integer receiverId;
    
    @ApiModelProperty(value = "消息内容")
    private String content;
    
    @ApiModelProperty(value = "内容类型 0=文本 1=图片 2=语音 3=文件 4=位置")
    private Integer contentType;
    
    @ApiModelProperty(value = "媒体文件URL")
    private String mediaUrl;
    
    @ApiModelProperty(value = "引用消息ID")
    private Integer refMessageId;
} 