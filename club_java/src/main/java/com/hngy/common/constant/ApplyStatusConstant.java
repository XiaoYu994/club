package com.hngy.common.constant;

/**
 * 申请状态常量
 */
public class ApplyStatusConstant {
    // 活动申请状态
    public static final Integer PENDING = 0;    // 待审核
    public static final Integer APPROVED = 1;   // 已通过
    public static final Integer REJECTED = 2;   // 已拒绝
    
    // 签到状态
    public static final Integer NOT_CHECKED_IN = 0;  // 未签到
    public static final Integer CHECKED_IN = 1;      // 已签到
    
    // 成员状态
    public static final Integer NOT_MEMBER = 0;     // 非成员
    public static final Integer IS_MEMBER = 1;      // 是成员
} 