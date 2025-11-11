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
 * 系统公告表
 * </p>
 *
 * @author xhy
 * @since 2025-07-20
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("system_announcement")
@ApiModel(value="SystemAnnouncement对象", description="系统公告表")
public class SystemAnnouncement implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "公告ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "公告标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "公告内容")
    @TableField("content")
    private String content;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "类型 0=普通公告 1=重要公告 2=紧急公告")
    @TableField("type")
    private Integer type;

    @ApiModelProperty(value = "浏览量")
    @TableField("view_count")
    private Integer viewCount;

    @ApiModelProperty(value = "发布者ID(管理员ID)")
    @TableField("publisher_id")
    private Integer publisherId;

    @ApiModelProperty(value = "封面图片")
    @TableField("cover_image")
    private String coverImage;

    @ApiModelProperty(value = "是否置顶 0=否 1=是")
    @TableField("is_top")
    private Integer isTop;

    @ApiModelProperty(value = "公告扩展信息JSON")
    @TableField("ext_json")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    @TableField("update_time")
    private Long updateTime;


}
