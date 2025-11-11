package com.hngy.entity.po;

import lombok.Data;

import java.io.Serializable;

@Data
public class SignCodeInfo implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 活动ID
     */
    private Long activityId;

    /**
     * 报名ID
     */
    private Long applyId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 过期时间
     */
    private Long expireTime;
}
