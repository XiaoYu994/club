package com.hngy.entity.dto;

import com.hngy.common.page.PageParam;
import lombok.Data;

@Data
public class AdminPageDTO extends PageParam {
    private String keyword;
    private Integer status;
}
