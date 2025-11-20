package com.hngy.entity.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
@ApiModel("用户详情VO")
public class UserDetailVO implements Serializable {
    private static final long serialVersionUID = 1L;

    @ApiModelProperty("用户基本信息")
    private UserVO userInfo;

    @ApiModelProperty("加入的社团数量")
    private Integer clubCount;

    @ApiModelProperty("参与的活动数量")
    private Integer activityCount;

    @ApiModelProperty("社团参与记录")
    private List<ClubMemberInfo> clubs;

    @ApiModelProperty("活动参与记录")
    private List<ActivityParticipateInfo> activities;

    @Data
    @ApiModel("社团成员信息")
    public static class ClubMemberInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        @ApiModelProperty("社团ID")
        private Long clubId;

        @ApiModelProperty("社团名称")
        private String clubName;

        @ApiModelProperty("角色 0=普通成员 1=管理员 2=社长")
        private Integer role;

        @ApiModelProperty("角色名称")
        private String roleName;

        @ApiModelProperty("加入时间")
        private Long joinTime;

        @ApiModelProperty("状态 0=待审核 1=正常 2=已退出")
        private Integer status;
    }

    @Data
    @ApiModel("活动参与信息")
    public static class ActivityParticipateInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        @ApiModelProperty("活动ID")
        private Long activityId;

        @ApiModelProperty("活动名称")
        private String activityName;

        @ApiModelProperty("所属社团")
        private String clubName;

        @ApiModelProperty("报名状态 0=待审核 1=已通过 2=已拒绝")
        private Integer status;

        @ApiModelProperty("报名时间")
        private Long applyTime;

        @ApiModelProperty("签到状态 0=未签到 1=已签到")
        private Integer checkInStatus;
    }
}

