package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

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
@ApiModel(value="NoticeVO视图对象", description="系统公告表")
public class NoticeVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "公告ID")
    private Integer id;

    @ApiModelProperty(value = "公告标题")
    private String title;

    @ApiModelProperty(value = "公告内容")
    private String content;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "类型 0=普通公告 1=重要公告 2=紧急公告")
    private Integer type;

    @ApiModelProperty(value = "浏览量")
    private Integer viewCount;

    @ApiModelProperty(value = "发布者ID(管理员ID)")
    private Integer publisherId;

    @ApiModelProperty("发布者名称")
    private String publisherName;

    @ApiModelProperty(value = "封面图片")
    private String coverImage;

    @ApiModelProperty(value = "是否置顶 0=否 1=是")
    private Integer isTop;


    @ApiModelProperty(value = "公告扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
