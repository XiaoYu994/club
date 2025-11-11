package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * <p>
 * 创建社团招新数据传输对象
 * </p>
 */
@Data
@ApiModel(value = "CreateRecruitmentDTO", description = "创建社团招新活动所需数据")
public class CreateRecruitmentDTO {

    @ApiModelProperty(value = "社团ID", required = true)
    @NotNull(message = "社团ID不能为空")
    private Long clubId;

    @ApiModelProperty(value = "招新配置ID", required = true)
    @NotNull(message = "招新配置ID不能为空")
    private Long configId;

    @ApiModelProperty(value = "招新标题", required = true)
    @NotNull(message = "标题不能为空")
    private String title;

    @ApiModelProperty(value = "招新描述")
    private String description;

    @ApiModelProperty(value = "开始时间(ms)", required = true)
    @NotNull(message = "开始时间不能为空")
    private Long startTime;

    @ApiModelProperty(value = "结束时间(ms)", required = true)
    @NotNull(message = "结束时间不能为空")
    private Long endTime;

    @ApiModelProperty(value = "计划招收人数", required = true)
    @NotNull(message = "计划招收人数不能为空")
    private Integer planCount;

    @ApiModelProperty(value = "是否需要面试 0=不需要 1=需要", required = true)
    @NotNull(message = "是否需要面试不能为空")
    private Integer needInterview;

    @ApiModelProperty(value = "面试地点，仅当 needInterview=1 时填写")
    private String interviewPlace;
    @ApiModelProperty(value = "招新海报 URL，可由前端传入")
    private String poster;
    @ApiModelProperty(value = "表单 JSON，可由前端传入自定义申请表单数据")
    private String forms;
} 