package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * <p>
 * 社团活动表
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_activity")
@ApiModel(value="ClubActivity对象", description="社团活动表")
@NoArgsConstructor
@AllArgsConstructor
public class ClubActivity implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "活动ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "社团ID")
    private Integer clubId;

    @ApiModelProperty(value = "活动标题")
    private String title;

    @ApiModelProperty(value = "活动描述")
    private String description;

    @ApiModelProperty(value = "状态 0=取消 1=计划中 2=进行中 3=已结束")
    private Integer status;

    @ApiModelProperty(value = "开始时间")
    private Long startTime;

    @ApiModelProperty(value = "结束时间")
    private Long endTime;

    @ApiModelProperty(value = "活动地点")
    private String address;

    @ApiModelProperty(value = "参与人数")
    private Integer joinCount;

    @ApiModelProperty(value = "浏览量")
    private Integer viewCount;

    @ApiModelProperty(value = "活动海报")
    private String poster;

    @ApiModelProperty(value = "活动表单JSON")
    private String forms;

    @ApiModelProperty(value = "活动扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
