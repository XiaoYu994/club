package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 活動詳細信息視圖對象
 */
@Data
@ApiModel("活動詳細信息視圖對象")
public class ActivityDetailVO implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "活動ID")
    private Long id;

    @ApiModelProperty(value = "活動標題")
    private String title;

    @ApiModelProperty(value = "活動描述")
    private String description;

    @ApiModelProperty(value = "活動海報")
    private String poster;

    @ApiModelProperty(value = "活動地點")
    private String address;

    @ApiModelProperty(value = "開始時間")
    private Long startTime;

    @ApiModelProperty(value = "結束時間")
    private Long endTime;



    @ApiModelProperty(value = "活動狀態 0=取消 1=計劃中 2=進行中 3=已結束")
    private Integer status;

    @ApiModelProperty(value = "活動狀態名稱")
    private String statusName;

    @ApiModelProperty(value = "所屬社團ID")
    private Integer clubId;

    @ApiModelProperty(value = "所屬社團名稱")
    private String clubName;

    @ApiModelProperty(value = "創建時間")
    private Long createTime;



    @ApiModelProperty(value = "計劃參與人數")
    private Integer planCount;

    @ApiModelProperty(value = "總報名人數")
    private Integer totalApplies;

    @ApiModelProperty(value = "待審核報名數")
    private Integer pendingApplies;

    @ApiModelProperty(value = "已通過報名數")
    private Integer approvedApplies;

    @ApiModelProperty(value = "已拒絕報名數")
    private Integer rejectedApplies;

    @ApiModelProperty(value = "簽到人數")
    private Integer checkedInCount;

    @ApiModelProperty(value = "簽到率")
    private Double checkInRate;

    @ApiModelProperty(value = "社團成員參與人數")
    private Integer memberCount;

    @ApiModelProperty(value = "非社團成員參與人數")
    private Integer nonMemberCount;

    @ApiModelProperty(value = "活動自定義表單 JSON 字符串")
    private String forms;

    @ApiModelProperty(value = "活動擴展信息JSON")
    private String extJson;
} 