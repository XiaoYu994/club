package com.hngy.common.constant;

/**
 * 社团成员常量类
 * 
 * @author xhy
 * @since 2023-06-19
 */
public class    ClubMemberConstant {
    
    /**
     * 成员角色：普通成员
     */
    public static final Integer ROLE_NORMAL = 0;
    
    /* ---------------------------------- 成员角色常量 ---------------------------------- */
    /**
     * 成员角色：管理员
     */
    public static final Integer ROLE_ADMIN = 1;
    /**
     * 成员角色：社长
     */
    public static final Integer ROLE_PRESIDENT = 2;
    /**
     * 成员角色：副社长
     */
    public static final Integer ROLE_VICE_PRESIDENT = 3;
    /**
     * 成员角色描述：普通成员
     */
    public static final String ROLE_NORMAL_DESC = "普通成员";
    /**
     * 成员角色描述：管理员
     */
    public static final String ROLE_ADMIN_DESC = "管理员";
    /**
     * 成员角色描述：社长
     */
    public static final String ROLE_PRESIDENT_DESC = "社长";
    /**
     * 成员角色描述：副社长
     */
    public static final String ROLE_VICE_PRESIDENT_DESC = "副社长";
    /**
     * 成员角色描述：未知
     */
    public static final String ROLE_UNKNOWN_DESC = "未知";
    /**
     * 成员状态：禁用
     */
    public static final Integer STATUS_DISABLED = 0;
    
    /* ---------------------------------- 成员状态常量 ---------------------------------- */
    /**
     * 成员状态：正常
     */
    public static final Integer STATUS_NORMAL = 1;
    /**
     * 成员状态：退社申请中
     */
    public static final Integer STATUS_QUIT_PENDING = 2;
    /**
     * 成员状态描述：禁用
     */
    public static final String STATUS_DISABLED_DESC = "已禁用";
    /**
     * 成员状态描述：正常
     */
    public static final String STATUS_NORMAL_DESC = "正常";
    /**
     * 成员状态描述：退社申请中
     */
    public static final String STATUS_QUIT_PENDING_DESC = "申请退出";
    /**
     * 成员状态描述：未知
     */
    public static final String STATUS_UNKNOWN_DESC = "未知";
    /**
     * 非社团成员
     */
    public static final String ERROR_NOT_MEMBER = "您不是该社团成员";
    
    /* ---------------------------------- 错误消息常量 ---------------------------------- */
    /**
     * 社长不能退出
     */
    public static final String ERROR_PRESIDENT_QUIT = "社长不能直接退出社团，请先转让社长职位";
    /**
     * 无效的角色类型
     */
    public static final String ERROR_INVALID_ROLE = "无效的角色类型";
    /**
     * 用户不是社团成员
     */
    public static final String ERROR_USER_NOT_MEMBER = "该用户不是社团成员";
    /**
     * 社团已有社长
     */
    public static final String ERROR_PRESIDENT_EXISTS = "社团已有社长，请先移除现有社长";
    /**
     * 不能移除社长
     */
    public static final String ERROR_REMOVE_PRESIDENT = "不能移除社长，请先转让社长职位";
    /**
     * 无效的状态值
     */
    public static final String ERROR_INVALID_STATUS = "无效的状态值";
    /**
     * 社团ID为空
     */
    public static final String ERROR_EMPTY_CLUB_ID = "社团ID不能为空";
    /**
     * 社团不存在
     */
    public static final String ERROR_CLUB_NOT_FOUND = "社团不存在";
    /**
     * 无权限
     */
    public static final String ERROR_NO_PERMISSION = "您没有权限执行此操作";
    /**
     * 导出失败
     */
    public static final String ERROR_EXPORT_FAILED = "导出失败: ";
    
    /**
     * 私有构造函数，防止实例化
     */
    private ClubMemberConstant() {
        throw new AssertionError("不能实例化常量类");
    }
} 