package com.hngy.common.constant;

/**
 * 公告相关常量
 */
public class NoticeConstant {
    
    // 公告状态
    public static final Integer STATUS_DISABLED = 0; // 禁用
    public static final Integer STATUS_NORMAL = 1;   // 正常
    
    // 公告类型
    public static final Integer TYPE_NORMAL = 0;     // 普通公告
    public static final Integer TYPE_IMPORTANT = 1;  // 重要公告  
    public static final Integer TYPE_URGENT = 2;     // 紧急公告
    
    // 置顶状态
    public static final Integer TOP_NO = 0;          // 不置顶
    public static final Integer TOP_YES = 1;         // 置顶
    
    // 成功消息
    public static final String CREATE_SUCCESS = "公告创建成功";
    public static final String UPDATE_SUCCESS = "公告更新成功";
    public static final String DELETE_SUCCESS = "公告删除成功";
    public static final String TOP_SUCCESS = "公告置顶成功";
    public static final String UNTOP_SUCCESS = "公告取消置顶成功";
    
    // 错误消息
    public static final String ERROR_NOT_FOUND = "公告不存在";
    public static final String ERROR_CREATE_FAILED = "公告创建失败";
    public static final String ERROR_UPDATE_FAILED = "公告更新失败";
    public static final String ERROR_DELETE_FAILED = "公告删除失败";
    public static final String ERROR_TOP_FAILED = "公告置顶失败";
    public static final String ERROR_UNTOP_FAILED = "公告取消置顶失败";
    public static final String ERROR_UNAUTHORIZED = "权限不足";
    public static final String ERROR_INVALID_PARAMS = "参数错误";
} 