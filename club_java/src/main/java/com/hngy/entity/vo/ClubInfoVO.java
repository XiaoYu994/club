package com.hngy.entity.vo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel("社团信息视图")
public class ClubInfoVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "社团ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "社团名称")
    private String name;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "社团logo")
    private String logo;

    @ApiModelProperty(value = "社团简介")
    private String description;
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

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "社团自定义表单 JSON 字符串")
    private String forms;

    @ApiModelProperty(value = "社团扩展信息JSON")
    private String extJson;
}
