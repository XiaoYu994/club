package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
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
 * 用户消息通知表
 * </p>
 *
 * @author xhy
 * @since 2025-11-11
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("user_notification")
@ApiModel(value="UserNotification对象", description="用户消息通知表")
public class UserNotification implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "通知ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Long userId;

    @ApiModelProperty(value = "通知类型 activity_cancel=活动取消 check_in=签到成功 apply_review=申请审核")
    @TableField("type")
    private String type;

    @ApiModelProperty(value = "通知标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "通知内容")
    @TableField("message")
    private String message;

    @ApiModelProperty(value = "关联ID（如活动ID、申请ID等）")
    @TableField("related_id")
    private Long relatedId;

    @ApiModelProperty(value = "是否已读 0=未读 1=已读")
    @TableField("is_read")
    private Integer isRead;

    @ApiModelProperty(value = "扩展数据JSON")
    @TableField("ext_data")
    private String extData;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private Long createTime;

    @ApiModelProperty(value = "已读时间")
    @TableField("read_time")
    private Long readTime;
}
