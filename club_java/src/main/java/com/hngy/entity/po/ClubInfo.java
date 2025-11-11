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
 * 社团信息表
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_info")
@ApiModel(value="ClubInfo对象", description="社团信息表")

public class ClubInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "社团ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "社团名称")
    private String name;

    @ApiModelProperty(value = "社团logo")
    private String logo;

    @ApiModelProperty(value = "社团简介")
    private String description;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "排序号")
    private Integer orderNum;

    @ApiModelProperty(value = "社团类型 0=普通社团 1=院级社团 2=校级社团")
    private Integer type;

    @ApiModelProperty(value = "社团成员数")
    private Integer memberCount;

    @ApiModelProperty(value = "浏览量")
    private Integer viewCount;

    @ApiModelProperty(value = "社团地址")
    private String address;

    @ApiModelProperty(value = "联系方式")
    private String contact;

    @ApiModelProperty(value = "创建人ID(系统管理员)")
    private Integer createUserId;

    @ApiModelProperty(value = "社团自定义表单")
    private String forms;

    @ApiModelProperty(value = "社团扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
