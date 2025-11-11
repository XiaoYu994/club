package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

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
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_activity_apply")
@ApiModel(value="ClubActivityApply对象", description="活动报名表")
public class ClubActivityApply implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "报名ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "活动ID")
    private Long activityId;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

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

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
