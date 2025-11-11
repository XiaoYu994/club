package com.hngy.entity.dto;

import com.hngy.common.page.PageParam;
import lombok.Data;

@Data
public class ClubMemberDTO extends PageParam {
    // 搜索关键字
    private String keyword;
    // 成员角色
    private Integer type;
    // 成员状态过滤 0=禁用,1=正常,2=退社申请中
    private Integer status;
}
