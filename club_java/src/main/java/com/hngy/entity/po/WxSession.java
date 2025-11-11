package com.hngy.entity.po;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

@Data
@Builder
@ApiModel("微信返回的对象")
@NoArgsConstructor
@AllArgsConstructor
public class WxSession implements Serializable {

    private static final long serialVersionUID = 1L;
    @ApiModelProperty("微信openid")
    private String openid;
    @ApiModelProperty("微信session_key")
    private String session_key;
    @ApiModelProperty("微信unionid")
    private String unionid;
    @ApiModelProperty("微信错误码")
    private String errcode;
    @ApiModelProperty("微信错误信息")
    private String errmsg;
}
