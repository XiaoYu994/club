package com.hngy.common.constant;

/**
 * 招新常量类
 * 
 * @author xhy
 * @since 2023-06-19
 */
public class RecruitmentConstant {
    
    /**
     * 招新状态：未开始
     */
    public static final Integer STATUS_PENDING = 0;
    
    /* ---------------------------------- 招新状态常量 ---------------------------------- */
    /**
     * 招新状态：进行中
     */
    public static final Integer STATUS_ACTIVE = 1;
    /**
     * 招新状态：已结束
     */
    public static final Integer STATUS_ENDED = 2;
    /**
     * 招新状态：已驳回
     */
    public static final Integer STATUS_REJECTED = 3;
    /**
     * 创建招新成功
     */
    public static final String CREATE_SUCCESS = "创建招新活动成功";
    
    /* ---------------------------------- 操作结果消息常量 ---------------------------------- */
    /**
     * 创建招新失败
     */
    public static final String CREATE_FAILED = "创建招新活动失败";
    /**
     * 更新招新成功
     */
    public static final String UPDATE_SUCCESS = "更新招新活动成功";
    /**
     * 更新招新失败
     */
    public static final String UPDATE_FAILED = "更新招新活动失败";
    /**
     * 删除招新成功
     */
    public static final String DELETE_SUCCESS = "删除招新活动成功";
    /**
     * 删除招新失败
     */
    public static final String DELETE_FAILED = "删除招新活动失败";
    /**
     * 状态更新成功
     */
    public static final String STATUS_UPDATE_SUCCESS = "招新状态更新成功";
    /**
     * 状态更新失败
     */
    public static final String STATUS_UPDATE_FAILED = "招新状态更新失败";
    /**
     * 最大招新人数限制
     */
    public static final Integer MAX_RECRUITMENT_COUNT = 1000;
    
    /* ---------------------------------- 业务限制常量 ---------------------------------- */
    /**
     * 招新最大持续天数
     */
    public static final Integer MAX_DURATION_DAYS = 60;
    /**
     * 最小招新人数
     */
    public static final Integer MIN_RECRUITMENT_COUNT = 1;
    /**
     * 招新人数超出限制
     */
    public static final String ERROR_MAX_COUNT_EXCEEDED = "招新人数不能超过" + MAX_RECRUITMENT_COUNT + "人";
    
    /* ---------------------------------- 错误消息常量 ---------------------------------- */
    /**
     * 招新时长超出限制
     */
    public static final String ERROR_MAX_DURATION_EXCEEDED = "招新持续时间不能超过" + MAX_DURATION_DAYS + "天";
    /**
     * 招新开始时间必须早于结束时间
     */
    public static final String ERROR_INVALID_TIME_RANGE = "招新开始时间必须早于结束时间";
    /**
     * 招新配置不存在
     */
    public static final String ERROR_CONFIG_NOT_FOUND = "招新配置不存在";
    /**
     * 招新活动不存在
     */
    public static final String ERROR_RECRUITMENT_NOT_FOUND = "招新活动不存在";
    /**
     * 无权操作该招新活动
     */
    public static final String ERROR_UNAUTHORIZED = "无权操作该招新活动";
    /**
     * 当前非招新期间
     */
    public static final String ERROR_NOT_IN_RECRUITMENT_PERIOD = "当前非招新期间";
    /**
     * 招新人数必须大于0
     */
    public static final String ERROR_INVALID_COUNT = "招新人数必须大于0";
    /**
     * 参数无效
     */
    public static final String ERROR_INVALID_PARAMS = "社团ID或配置ID不能为空";
    /**
     * 招新配置已禁用
     */
    public static final String ERROR_CONFIG_DISABLED = "该招新配置已禁用";
    /**
     * 招新活动重复
     */
    public static final String ERROR_DUPLICATE_RECRUITMENT = "该配置下已存在招新活动";
    /**
     * 无效的状态值
     */
    public static final String ERROR_INVALID_STATUS = "无效的状态值";
    /**
     * 招新活动非待审核状态
     */
    public static final String ERROR_RECRUITMENT_NOT_PENDING = "该招新活动不是待审核状态";
    /**
     * 审核成功
     */
    public static final String AUDIT_SUCCESS = "审核成功";
    /**
     * 审核失败
     */
    public static final String AUDIT_FAILED = "审核失败";
    
    /**
     * 私有构造函数，防止实例化
     */
    private RecruitmentConstant() {
        throw new AssertionError("不能实例化常量类");
    }
} 