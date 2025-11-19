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
 * 聊天群组表
 * </p>
 *
 * @author xhy
 * @since 2025-07-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_chat_group")
@ApiModel(value="ClubChatGroup对象", description="聊天群组表")
public class ClubChatGroup implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "群组名称")
    private String name;

    @ApiModelProperty(value = "群组头像")
    private String avatar;

    @ApiModelProperty(value = "创建者ID")
    private Integer ownerId;

    @ApiModelProperty(value = "关联的社团ID")
    private Integer clubId;

    @ApiModelProperty(value = "群组类型：0-公共群 1-部门群 2-管理员群")
    private Integer type;

    @ApiModelProperty(value = "群组简介")
    @TableField(exist = false)
    private String description;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;


}
