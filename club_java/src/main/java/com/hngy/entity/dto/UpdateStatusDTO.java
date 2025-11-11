package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 更新状态DTO
 */
@Data
@ApiModel(value = "状态更新数据传输对象")
public class UpdateStatusDTO {
    
    @ApiModelProperty(value = "状态值", required = true, example = "1")
    private Integer status;
} 