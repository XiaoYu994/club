package com.hngy.entity.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 公告DTO
 */
@Data
public class NoticeDTO {
    /**
     * 公告标题
     */
    @NotBlank(message = "公告标题不能为空")
    private String title;

    /**
     * 公告内容
     */
    @NotBlank(message = "公告内容不能为空")
    private String content;

    /**
     * 封面图片URL
     */
    private String coverImage;

    /**
     * 公告类型 0=普通公告 1=重要公告 2=紧急公告
     */
    private Integer type;

    /**
     * 是否置顶 0=否 1=是
     */
    private Integer isTop;
} 