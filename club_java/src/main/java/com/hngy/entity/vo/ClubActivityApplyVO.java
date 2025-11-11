package com.hngy.entity.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * <p>
 * 活动报名表
 * </p>
 *
 * @author xhy
 * @since 2025-06-20
 */
@Data
@ApiModel("活动报名表视图")
public class ClubActivityApplyVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "报名ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "活动ID")
    private Integer activityId;

    @ApiModelProperty(value = "用户ID")
    private Integer userId;

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝")
    private Integer status;


    @ApiModelProperty(value = "报名表单数据JSON")
    private String forms;

    @ApiModelProperty(value = "反馈信息")
    private String feedback;

    @ApiModelProperty(value = "签到状态 0=未签到 1=已签到")
    private Integer checkInStatus;

    @ApiModelProperty(value = "签到时间")
    private Long checkInTime;

    @ApiModelProperty(value = "扩展信息JSON")
    private String extJson;

}
