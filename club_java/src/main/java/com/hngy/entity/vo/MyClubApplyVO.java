package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * <p>
 * 我的社团申请视图对象
 * </p>
 *
 * @author xhy
 * @since 2025-01-14
 */
@Data
@ApiModel(value="MyClubApplyVO", description="我的社团申请视图对象")
public class MyClubApplyVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "申请ID")
    private Integer id;

    @ApiModelProperty(value = "社团ID")
    private Integer clubId;

    @ApiModelProperty(value = "社团名称")
    private String clubName;

    @ApiModelProperty(value = "社团LOGO")
    private String clubLogo;

    @ApiModelProperty(value = "招新ID")
    private Integer recruitmentId;

    @ApiModelProperty(value = "招新标题")
    private String recruitmentTitle;

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝 3=已面试 4=已入社")
    private Integer status;

    @ApiModelProperty(value = "反馈意见")
    private String feedback;

    @ApiModelProperty(value = "申请表单JSON")
    private String forms;

    @ApiModelProperty(value = "申请时间")
    private Long createTime;

    @ApiModelProperty(value = "更新时间")
    private Long updateTime;
} 