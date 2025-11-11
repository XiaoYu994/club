package com.hngy.entity.vo;

import lombok.Data;

@Data
public class SignCodeVO {
    /**
     * 签到码
     */
    private String checkInCode;

    /**
     * 二维码URL (Base64)
     */
    private String qrCodeUrl;

    /**
     * 过期时间
     */
    private Long expireTime;
}

