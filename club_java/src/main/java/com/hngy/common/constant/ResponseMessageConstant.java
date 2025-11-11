package com.hngy.common.constant;

/**
 * API响应消息常量类
 * 
 * @author xhy
 * @since 2023-06-19
 */
public class ResponseMessageConstant {


    /**
     * 操作成功
     */
    public static final String SUCCESS = "操作成功";
    
    /* ---------------------------------- 通用响应消息 ---------------------------------- */
    /**
     * 操作失败
     */
    public static final String FAILED = "操作失败";
    /**
     * 服务器错误
     */
    public static final String SERVER_ERROR = "服务器内部错误";
    /**
     * 参数错误
     */
    public static final String PARAMETER_ERROR = "参数错误";
    /**
     * 未授权
     */
    public static final String UNAUTHORIZED = "未授权的访问";
    /**
     * 无权限
     */
    public static final String FORBIDDEN = "无权限访问";
    /**
     * 资源不存在
     */
    public static final String NOT_FOUND = "资源不存在";
    /**
     * 登录成功
     */
    public static final String LOGIN_SUCCESS = "登录成功";
    
    /* ---------------------------------- 用户相关消息 ---------------------------------- */
    /**
     * 登录失败
     */
    public static final String LOGIN_FAILED = "登录失败";
    /**
     * 用户名或密码错误
     */
    public static final String INVALID_CREDENTIAL = "用户名或密码错误";
    /**
     * 注册成功
     */
    public static final String REGISTER_SUCCESS = "注册成功";
    /**
     * 注册失败
     */
    public static final String REGISTER_FAILED = "注册失败";
    /**
     * 用户名已存在
     */
    public static final String USERNAME_EXISTS = "用户名已存在";
    /**
     * 邮箱已存在
     */
    public static final String EMAIL_EXISTS = "邮箱已存在";
    /**
     * 文件上传成功
     */
    public static final String FILE_UPLOAD_SUCCESS = "文件上传成功";
    
    /* ---------------------------------- 文件相关消息 ---------------------------------- */
    /**
     * 文件上传失败
     */
    public static final String FILE_UPLOAD_FAILED = "文件上传失败";
    /**
     * 文件下载成功
     */
    public static final String FILE_DOWNLOAD_SUCCESS = "文件下载成功";
    /**
     * 文件下载失败
     */
    public static final String FILE_DOWNLOAD_FAILED = "文件下载失败";
    /**
     * 文件不存在
     */
    public static final String FILE_NOT_FOUND = "文件不存在";
    /**
     * 文件过大
     */
    public static final String FILE_TOO_LARGE = "文件大小超过限制";
    /**
     * 社团创建成功
     */
    public static final String CLUB_CREATE_SUCCESS = "社团创建成功";
    
    /* ---------------------------------- 社团相关消息 ---------------------------------- */
    /**
     * 社团创建失败
     */
    public static final String CLUB_CREATE_FAILED = "社团创建失败";
    /**
     * 社团更新成功
     */
    public static final String CLUB_UPDATE_SUCCESS = "社团信息更新成功";
    /**
     * 社团更新失败
     */
    public static final String CLUB_UPDATE_FAILED = "社团信息更新失败";
    /**
     * 社团删除成功
     */
    public static final String CLUB_DELETE_SUCCESS = "社团删除成功";
    /**
     * 社团删除失败
     */
    public static final String CLUB_DELETE_FAILED = "社团删除失败";
    /**
     * 社团不存在
     */
    public static final String CLUB_NOT_FOUND = "社团不存在";
    /**
     * 活动创建成功
     */
    public static final String ACTIVITY_CREATE_SUCCESS = "活动创建成功";
    
    /* ---------------------------------- 活动相关消息 ---------------------------------- */
    /**
     * 活动创建失败
     */
    public static final String ACTIVITY_CREATE_FAILED = "活动创建失败";
    /**
     * 活动更新成功
     */
    public static final String ACTIVITY_UPDATE_SUCCESS = "活动信息更新成功";
    /**
     * 活动更新失败
     */
    public static final String ACTIVITY_UPDATE_FAILED = "活动信息更新失败";
    /**
     * 活动删除成功
     */
    public static final String ACTIVITY_DELETE_SUCCESS = "活动删除成功";
    /**
     * 活动删除失败
     */
    public static final String ACTIVITY_DELETE_FAILED = "活动删除失败";
    /**
     * 活动不存在
     */
    public static final String ACTIVITY_NOT_FOUND = "活动不存在";
    /**
     * 申请提交成功
     */
    public static final String APPLY_SUBMIT_SUCCESS = "申请提交成功";
    
    /* ---------------------------------- 申请相关消息 ---------------------------------- */
    /**
     * 申请提交失败
     */
    public static final String APPLY_SUBMIT_FAILED = "申请提交失败";
    /**
     * 申请更新成功
     */
    public static final String APPLY_UPDATE_SUCCESS = "申请信息更新成功";
    /**
     * 申请更新失败
     */
    public static final String APPLY_UPDATE_FAILED = "申请信息更新失败";
    /**
     * 申请通过
     */
    public static final String APPLY_APPROVED = "申请已通过";
    /**
     * 申请拒绝
     */
    public static final String APPLY_REJECTED = "申请已拒绝";
    /**
     * 申请不存在
     */
    public static final String APPLY_NOT_FOUND = "申请不存在";
    
    /**
     * 私有构造函数，防止实例化
     */
    private ResponseMessageConstant() {
        throw new AssertionError("不能实例化常量类");
    }
} 