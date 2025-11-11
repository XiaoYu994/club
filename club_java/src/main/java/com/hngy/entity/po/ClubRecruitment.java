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
 * 社团招新表
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_recruitment")
@ApiModel(value="ClubRecruitment对象", description="社团招新表")
public class ClubRecruitment implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "招新ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "社团ID")
    @TableField("club_id")
    private Integer clubId;

    @ApiModelProperty(value = "招新配置ID")
    @TableField("config_id")
    private Integer configId;

    @ApiModelProperty(value = "招新标题")
    @TableField("title")
    private String title;

    @ApiModelProperty(value = "招新描述")
    @TableField("description")
    private String description;

    @ApiModelProperty(value = "状态 0=审核中 1=进行中 2=已结束 3=已驳回")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "开始时间")
    @TableField("start_time")
    private Long startTime;

    @ApiModelProperty(value = "结束时间")
    @TableField("end_time")
    private Long endTime;

    @ApiModelProperty(value = "计划招收人数")
    @TableField("plan_count")
    private Integer planCount;

    @ApiModelProperty(value = "已申请人数")
    @TableField("join_count")
    private Integer joinCount;

    @ApiModelProperty(value = "已通过人数")
    @TableField("pass_count")
    private Integer passCount;

    @ApiModelProperty(value = "是否需要面试 0=不需要 1=需要")
    @TableField("need_interview")
    private Integer needInterview;

    @ApiModelProperty(value = "面试地点")
    @TableField("interview_place")
    private  String interviewPlace;

    @ApiModelProperty(value = "招新海报")
    @TableField("poster")
    private String poster;

    @ApiModelProperty(value = "招新表单JSON")
    @TableField("forms")
    private String forms;

    @ApiModelProperty(value = "审核意见")
    @TableField("review_comment")
    private String reviewComment;

    @ApiModelProperty(value = "招新扩展信息JSON")
    @TableField("ext_json")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    @TableField("update_time")
    private Long updateTime;


}
