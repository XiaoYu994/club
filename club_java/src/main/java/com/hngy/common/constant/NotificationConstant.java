package com.hngy.common.constant;

/**
 * 用户通知类型常量
 *
 * @author xhy
 * @since 2025-01-28
 */
public class NotificationConstant {

    /**
     * 通知类型
     */
    // 活动相关通知
    public static final String TYPE_ACTIVITY_CANCEL = "activity_cancel";           // 活动取消
    public static final String TYPE_ACTIVITY_REMINDER = "activity_reminder";       // 活动开始提醒

    // 活动报名审核通知
    public static final String TYPE_APPLY_APPROVED = "apply_approved";             // 活动报名审核通过
    public static final String TYPE_APPLY_REJECTED = "apply_rejected";             // 活动报名审核拒绝

    // 社团申请审核通知
    public static final String TYPE_CLUB_APPLY_APPROVED = "club_apply_approved";   // 社团申请审核通过
    public static final String TYPE_CLUB_APPLY_REJECTED = "club_apply_rejected";   // 社团申请审核拒绝

    // 签到相关通知
    public static final String TYPE_CHECK_IN = "check_in";                         // 签到成功

    /**
     * 通知标题
     */
    public static final String TITLE_ACTIVITY_CANCEL = "活动取消通知";
    public static final String TITLE_ACTIVITY_REMINDER = "活动提醒";
    public static final String TITLE_APPLY_APPROVED = "报名审核通过";
    public static final String TITLE_APPLY_REJECTED = "报名审核未通过";
    public static final String TITLE_CLUB_APPLY_APPROVED = "社团申请通过";
    public static final String TITLE_CLUB_APPLY_REJECTED = "社团申请未通过";
    public static final String TITLE_CHECK_IN = "签到成功";

    /**
     * 阅读状态
     */
    public static final Integer IS_READ_NO = 0;  // 未读
    public static final Integer IS_READ_YES = 1; // 已读
}
