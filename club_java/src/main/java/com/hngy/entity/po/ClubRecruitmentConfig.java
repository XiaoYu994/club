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
 * 招新配置表
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_recruitment_config")
@ApiModel(value="ClubRecruitmentConfig对象", description="招新配置表")
public class ClubRecruitmentConfig implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "配置ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    @ApiModelProperty(value = "配置名称")
    @TableField("name")
    private String name;

    @ApiModelProperty(value = "学期(如2023-2024-1)")
    @TableField("semester")
    private String semester;

    @ApiModelProperty(value = "全局招新开始时间")
    @TableField("global_start_time")
    private Long globalStartTime;

    @ApiModelProperty(value = "全局招新结束时间")
    @TableField("global_end_time")
    private Long globalEndTime;

    @ApiModelProperty(value = "状态 0=禁用 1=启用")
    @TableField("status")
    private Integer status;

    @ApiModelProperty(value = "配置说明")
    @TableField("description")
    private String description;

    @ApiModelProperty(value = "创建人ID")
    @TableField("create_user_id")
    private Integer createUserId;

    @ApiModelProperty(value = "创建时间")
    @TableField("create_time")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    @TableField("update_time")
    private Long updateTime;


}
