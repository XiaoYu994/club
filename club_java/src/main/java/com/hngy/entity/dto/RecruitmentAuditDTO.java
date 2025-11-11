package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * <p>
 * 招新审核DTO
 * </p>
 *
 * @author xhy
 * @since 2025-01-14
 */
@Data
@ApiModel(value="RecruitmentAuditDTO", description="招新审核数据传输对象")
public class RecruitmentAuditDTO {

    @ApiModelProperty(value = "招新ID", required = true)
    private Integer id;

    @ApiModelProperty(value = "审核状态 1=通过 3=驳回", required = true)
    private Integer status;

    @ApiModelProperty(value = "审核意见")
    private String reviewComment;
} 