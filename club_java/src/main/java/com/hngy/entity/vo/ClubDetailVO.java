package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 社團詳細信息視圖對象
 */
@Data
@ApiModel("社團詳細信息視圖對象")
public class ClubDetailVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "社團ID")
    private Long id;

    @ApiModelProperty(value = "社團名稱")
    private String name;

    @ApiModelProperty(value = "社團logo")
    private String logo;

    @ApiModelProperty(value = "社團簡介")
    private String description;

    @ApiModelProperty(value = "社團類型 0=普通社團 1=院級社團 2=校級社團")
    private Integer type;

    @ApiModelProperty(value = "社團類型名稱")
    private String typeName;

    @ApiModelProperty(value = "狀態 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "排序號")
    private Integer orderNum;

    @ApiModelProperty(value = "社團地址")
    private String address;

    @ApiModelProperty(value = "聯繫方式")
    private String contact;

    @ApiModelProperty(value = "瀏覽量")
    private Integer viewCount;

    @ApiModelProperty(value = "創建時間")
    private Long createTime;

    @ApiModelProperty(value = "社長信息")
    private UserVO president;

    @ApiModelProperty(value = "總成員數")
    private Integer totalMembers;

    @ApiModelProperty(value = "普通成員數")
    private Integer normalMembers;

    @ApiModelProperty(value = "幹部數")
    private Integer officers;

    @ApiModelProperty(value = "指導老師數")
    private Integer teachers;

    @ApiModelProperty(value = "活動數量")
    private Integer activityCount;

    @ApiModelProperty(value = "招新數量")
    private Integer recruitmentCount;

    @ApiModelProperty(value = "申請人數")
    private Integer applicationCount;

    @ApiModelProperty(value = "社團自定義表單 JSON 字符串")
    private String forms;

    @ApiModelProperty(value = "社團擴展信息JSON")
    private String extJson;
} 