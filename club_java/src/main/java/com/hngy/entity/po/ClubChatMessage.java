package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * <p>
 * 聊天消息表
 * </p>
 *
 * @author xhy
 * @since 2025-07-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_chat_message")
@ApiModel(value="ClubChatMessage对象", description="聊天消息表")
public class ClubChatMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "聊天群ID")
    private Integer chatId;

    @ApiModelProperty(value = "发送者ID")
    private Integer senderId;

    @ApiModelProperty(value = "消息内容")
    private String content;

    @ApiModelProperty(value = "内容类型：0-文本 1-图片 2-文件 3-位置")
    private Integer contentType;

    @ApiModelProperty(value = "媒体文件URL")
    private String mediaUrl;

    @ApiModelProperty(value = "发送时间")
    private Long createTime;


}
