package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * <p>
 * 招新配置DTO
 * </p>
 *
 * @since 2024-07-24
 */
@Data
@ApiModel(value = "RecruitmentConfigDTO", description = "招新配置DTO")
public class RecruitmentConfigDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "配置ID")
    private Integer id;

    @ApiModelProperty(value = "配置名称")
    private String name;

    @ApiModelProperty(value = "学期(如2023-2024-1)")
    private String semester;

    @ApiModelProperty(value = "全局招新开始时间")
    private Long globalStartTime;

    @ApiModelProperty(value = "全局招新结束时间")
    private Long globalEndTime;

    @ApiModelProperty(value = "状态 0=禁用 1=启用")
    private Integer status;

    @ApiModelProperty(value = "配置说明")
    private String description;

    @ApiModelProperty(value = "创建人ID")
    private Integer createUserId;
} 