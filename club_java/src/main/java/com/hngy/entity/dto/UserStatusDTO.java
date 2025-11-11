package com.hngy.entity.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 用户状态DTO
 */
@Data
public class UserStatusDTO {
    /**
     * 状态（1-正常，0-禁用）
     */
    @NotNull(message = "状态不能为空")
    private Integer status;
} 