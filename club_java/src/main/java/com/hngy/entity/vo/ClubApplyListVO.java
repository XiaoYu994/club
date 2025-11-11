package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * <p>
 * 社团申请列表视图对象
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Data
@ApiModel(value="ClubApplyListVO", description="社团申请列表视图对象")
public class ClubApplyListVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "申请ID")
    private Integer id;

    @ApiModelProperty(value = "招新ID")
    private Integer recruitmentId;

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝 3=已面试 4=已入社")
    private Integer status;

    @ApiModelProperty(value = "签到状态 0=未签到 1=已签到")
    private Integer checkInStatus;

    @ApiModelProperty(value = "签到时间")
    private Long checkInTime;

    @ApiModelProperty(value = "反馈意见")
    private String feedback;

    @ApiModelProperty(value = "申请表单JSON")
    private String forms;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;
    
    @ApiModelProperty(value = "用户信息")
    private UserVO user;
}
