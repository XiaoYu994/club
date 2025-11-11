package com.hngy.entity.dto;

import lombok.Data;

/**
 * @desc: 更新社团成员角色
 * @Author:  XiaoYu
 * @date:  2025/7/13 上午9:16
**/
@Data
public class  UpdateRoleDTO {
    private Long clubId;
    private Long userId;
    private Integer type;
}
