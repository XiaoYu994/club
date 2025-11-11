package com.hngy.entity.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class SingCodeDTO implements Serializable {
    // 活动Id
    private Long activityId;
    // 活动报名Id
    private Long applyId;
    // 过期时间
    private Long expireMinutes;
}
