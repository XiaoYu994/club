package com.hngy.common.constant;

/**
 * 社团活动常量类
 * 
 * @author xhy
 * @since 2023-06-20
 */
public class ActivityConstant {
    
    /**
     * 活动状态：已取消/已禁用
     */
    public static final Integer STATUS_DISABLED = 0;
    
    /* ---------------------------------- 活动状态常量 ---------------------------------- */
    /**
     * 活动状态：未开始
     */
    public static final Integer STATUS_PENDING = 1;
    /**
     * 活动状态：进行中
     */
    public static final Integer STATUS_ACTIVE = 2;
    /**
     * 活动状态：已结束
     */
    public static final Integer STATUS_ENDED = 3;
    /**
     * 签到状态：未签到
     */
    public static final Integer CHECK_IN_STATUS_NO = 0;
    
    /* ---------------------------------- 签到状态常量 ---------------------------------- */
    /**
     * 签到状态：已签到
     */
    public static final Integer CHECK_IN_STATUS_YES = 1;
    /**
     * 活动状态描述：已取消/已禁用
     */
    public static final String STATUS_DISABLED_DESC = "已取消";
    
    /* ---------------------------------- 状态描述常量 ---------------------------------- */
    /**
     * 活动状态描述：未开始
     */
    public static final String STATUS_PENDING_DESC = "未开始";
    /**
     * 活动状态描述：进行中
     */
    public static final String STATUS_ACTIVE_DESC = "进行中";
    /**
     * 活动状态描述：已结束
     */
    public static final String STATUS_ENDED_DESC = "已结束";
    /**
     * 活动状态描述：未知
     */
    public static final String STATUS_UNKNOWN_DESC = "未知";
    /**
     * 签到状态描述：未签到
     */
    public static final String CHECK_IN_STATUS_NO_DESC = "未签到";
    /**
     * 签到状态描述：已签到
     */
    public static final String CHECK_IN_STATUS_YES_DESC = "已签到";
    /**
     * 申请状态描述：待审核
     */
    public static final String APPLY_STATUS_PENDING_DESC = "待审核";
    
    /* ---------------------------------- 申请状态描述常量 ---------------------------------- */
    /**
     * 申请状态描述：已通过
     */
    public static final String APPLY_STATUS_APPROVED_DESC = "已通过";
    /**
     * 申请状态描述：已拒绝
     */
    public static final String APPLY_STATUS_REJECTED_DESC = "已拒绝";
    /**
     * 申请状态描述：未知
     */
    public static final String APPLY_STATUS_UNKNOWN_DESC = "未知";
    /**
     * 活动ID为空
     */
    public static final String ERROR_EMPTY_ACTIVITY_ID = "活动ID不能为空";
    
    /* ---------------------------------- 错误消息常量 ---------------------------------- */
    /**
     * 活动不存在
     */
    public static final String ERROR_ACTIVITY_NOT_FOUND = "活动不存在";
    /**
     * 导出失败
     */
    public static final String ERROR_EXPORT_FAILED = "导出失败: ";
    /**
     * 参数有误
     */
    public static final String ERROR_INVALID_PARAMS = "参数有误";
    
    /**
     * 私有构造函数，防止实例化
     */
    private ActivityConstant() {
        throw new AssertionError("不能实例化常量类");
    }
} 