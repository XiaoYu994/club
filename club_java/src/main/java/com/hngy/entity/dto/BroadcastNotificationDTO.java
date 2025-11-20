package com.hngy.entity.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("广播通知DTO")
public class BroadcastNotificationDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty("通知类型")
    private String type;

    @ApiModelProperty("通知标题")
    private String title;

    @ApiModelProperty("通知内容")
    private String message;
}

