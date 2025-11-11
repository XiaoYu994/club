package com.hngy.entity.vo;

import com.baomidou.mybatisplus.annotation.TableField;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

@Data
public class RecruitmentConfigVO {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "配置ID")
    private Integer id;

    @ApiModelProperty(value = "配置名称")
    private String name;

    @ApiModelProperty(value = "学期(如2023-2024-1)")
    private String semester;

    @ApiModelProperty(value = "全局招新开始时间")
    private Long globalStartTime;

    @ApiModelProperty(value = "全局招新结束时间")
    private Long globalEndTime;

    @ApiModelProperty(value = "状态 0=禁用 1=启用")
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
