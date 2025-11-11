package com.hngy.entity.po;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.io.Serializable;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

/**
 * <p>
 * 用户表
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
@Data
@Builder
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("club_user")
@ApiModel(value="ClubUser对象", description="用户表")
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(value = "用户ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @ApiModelProperty(value = "用户名称")
    private String username;

    @ApiModelProperty(value = "状态 0=禁用 1=正常")
    private Integer status;

    @ApiModelProperty(value = "头像")
    private String avatar;

    @ApiModelProperty(value = "性别 0=未知 1=男 2=女")
    private Integer gender;

    @ApiModelProperty(value = "手机号")
    private String mobile;

    @ApiModelProperty(value = "邮箱")
    private String email;

    @ApiModelProperty(value = "微信OpenID")
    private String openid;

    @ApiModelProperty(value = "微信UnionID")
    private String unionid;

    @ApiModelProperty(value = "学号")
    private String studentId;

    @ApiModelProperty(value = "学院")
    private String college;

    @ApiModelProperty(value = "专业")
    private String major;

    @ApiModelProperty(value = "班级")
    private String className;

    @ApiModelProperty(value = "用户表单数据JSON")
    private String forms;

    @ApiModelProperty(value = "用户扩展信息JSON")
    private String extJson;

    @ApiModelProperty(value = "创建时间")
    private Long createTime;

    @ApiModelProperty(value = "修改时间")
    private Long updateTime;


}
