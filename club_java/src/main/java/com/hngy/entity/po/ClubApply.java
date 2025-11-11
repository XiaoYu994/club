package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
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
 * 社团申请表
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_apply")
@ApiModel(value="ClubApply对象", description="社团申请表")
public class ClubApply implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "申请ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "用户ID")
    @TableField("user_id")
    private Integer userId;

    @ApiModelProperty(value = "社团ID")
    @TableField("club_id")
    private Integer clubId;

    @ApiModelProperty(value = "招新ID")
    @TableField("recruitment_id")
    private Integer recruitmentId;

    @ApiModelProperty(value = "状态 0=待审核 1=已通过 2=已拒绝 3=已面试 4=已入社")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "面试时间")
    @TableField("interview_time")
    private Long interviewTime;

    @ApiModelProperty(value = "面试地点")
    @TableField("interview_place")
    private String interviewPlace;

    @ApiModelProperty(value = "申请表单数据JSON")
    @TableField("forms")
    private String forms;

    @ApiModelProperty(value = "反馈意见")
    @TableField("feedback")
    private String feedback;

    @ApiModelProperty(value = "申请扩展信息JSON")
    @TableField("ext_json")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    @TableField("update_time")
    private Long updateTime;


}
