package com.hngy.common.constant;

/**
 * 社团信息常量类
 * 
 * @author xhy
 * @since 2023-06-20
 */
public class ClubInfoConstant {
    
    /**
     * 社团类型：学术科技类
     */
    public static final Integer TYPE_ACADEMIC = 1;
    
    /* ---------------------------------- 社团类型常量 ---------------------------------- */
    /**
     * 社团类型：文化艺术类
     */
    public static final Integer TYPE_CULTURAL = 2;
    /**
     * 社团类型：体育运动类
     */
    public static final Integer TYPE_SPORTS = 3;
    /**
     * 社团类型：志愿公益类
     */
    public static final Integer TYPE_VOLUNTEER = 4;
    /**
     * 社团类型：职业发展类
     */
    public static final Integer TYPE_CAREER = 5;
    /**
     * 社团类型：兴趣爱好类
     */
    public static final Integer TYPE_INTEREST = 6;
    /**
     * 社团类型：其他类
     */
    public static final Integer TYPE_OTHER = 0;
    /**
     * 聊天群组类型：公共群
     */
    public static final Integer GROUP_TYPE_PUBLIC = 0;
    
    /* ---------------------------------- 聊天群组类型常量 ---------------------------------- */
    /**
     * 聊天群组类型：管理员群
     */
    public static final Integer GROUP_TYPE_ADMIN = 1;
    /**
     * 聊天群组类型：临时群
     */
    public static final Integer GROUP_TYPE_TEMPORARY = 2;
    /**
     * 成员状态：正常
     */
    public static final Integer MEMBER_STATUS_NORMAL = 1;
    
    /* ---------------------------------- 成员角色常量 ---------------------------------- */
    /**
     * 无效的社团ID
     */
    public static final String ERROR_INVALID_CLUB_ID = "无效的社团ID";
    
    /* ---------------------------------- 错误消息常量 ---------------------------------- */
    /**
     * 无效的社团名称
     */
    public static final String ERROR_INVALID_CLUB_NAME = "无效的社团名称";
    /**
     * 社团名称已存在
     */
    public static final String ERROR_CLUB_NAME_EXISTS = "社团名称已存在";
    /**
     * 社团创建成功
     */
    public static final String SUCCESS_CLUB_CREATED = "社团创建成功";
    /**
     * 社团创建失败
     */
    public static final String ERROR_CLUB_CREATE_FAILED = "社团创建失败";
    /**
     * 社团更新成功
     */
    public static final String SUCCESS_CLUB_UPDATED = "社团信息更新成功";
    /**
     * 社团更新失败
     */
    public static final String ERROR_CLUB_UPDATE_FAILED = "社团信息更新失败";
    /**
     * 社团删除成功
     */
    public static final String SUCCESS_CLUB_DELETED = "社团删除成功";
    /**
     * 社团删除失败
     */
    public static final String ERROR_CLUB_DELETE_FAILED = "社团删除失败";
    
    /**
     * 私有构造函数，防止实例化
     */
    private ClubInfoConstant() {
        throw new AssertionError("不能实例化常量类");
    }
} 