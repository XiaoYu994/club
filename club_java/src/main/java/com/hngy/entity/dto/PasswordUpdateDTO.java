package com.hngy.entity.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 密码更新DTO
 */
@Data
public class PasswordUpdateDTO {
    /**
     * 旧密码
     */
    @NotBlank(message = "旧密码不能为空")
    private String oldPassword;

    /**
     * 新密码
     */
    @NotBlank(message = "新密码不能为空")
    private String newPassword;
} 