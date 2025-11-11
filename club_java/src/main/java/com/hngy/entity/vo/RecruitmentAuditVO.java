package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * <p>
 * 招新审核列表视图对象
 * </p>
 *
 * @author xhy
 * @since 2025-01-14
 */
@Data
@ApiModel(value="RecruitmentAuditVO", description="招新审核列表视图对象")
public class RecruitmentAuditVO {

    @ApiModelProperty(value = "招新ID")
    private Integer id;

    @ApiModelProperty(value = "社团ID")
    private Integer clubId;

    @ApiModelProperty(value = "社团名称")
    private String clubName;

    @ApiModelProperty(value = "招新标题")
    private String title;

    @ApiModelProperty(value = "招新描述")
    private String description;

    @ApiModelProperty(value = "状态 0=审核中 1=进行中 2=已结束 3=已驳回")
    private Integer status;

    @ApiModelProperty(value = "开始时间")
    private Long startTime;

    @ApiModelProperty(value = "结束时间")
    private Long endTime;

    @ApiModelProperty(value = "计划招收人数")
    private Integer planCount;

    @ApiModelProperty(value = "已申请人数")
    private Integer joinCount;

    @ApiModelProperty(value = "已通过人数")
    private Integer passCount;

    @ApiModelProperty(value = "是否需要面试 0=不需要 1=需要")
    private Integer needInterview;

    @ApiModelProperty(value = "面试地点")
    private String interviewPlace;

    @ApiModelProperty(value = "招新海报")
    private String poster;

    @ApiModelProperty(value = "招新表单JSON")
    private String forms;

    @ApiModelProperty(value = "审核意见")
    private String reviewComment;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;
} 