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
 * 社团成员表
 * </p>
 *
 * @author xhy
 * @since 2025-06-20
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_member")
@ApiModel(value="ClubMember对象", description="社团成员表")
public class ClubMember implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "成员ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户ID")
    private Long userId;

    @ApiModelProperty(value = "社团ID")
    private Integer clubId;

    @ApiModelProperty(value = "成员类型 0=普通成员 1=干部 2=社长 3=指导老师")
    private Integer type;

    @ApiModelProperty(value = "状态 0=禁用 1=正常 2=退社申请中")
    private Integer status;

    @ApiModelProperty(value = "加入时间")
    private Long joinTime;

    @ApiModelProperty(value = "退出时间")
    private Long quitTime;

    @ApiModelProperty(value = "成员扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
