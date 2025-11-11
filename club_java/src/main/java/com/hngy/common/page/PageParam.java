package com.hngy.common.page;

import com.baomidou.mybatisplus.core.metadata.OrderItem;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@ApiModel(description = "分页查询实体")
@Data
@NoArgsConstructor
public class PageParam {
    @ApiModelProperty("分页页码")
    private Long pageNo = 1L;
    @ApiModelProperty("分页大小")
    private Long pageSize = 10L;
    @ApiModelProperty("排序字段")
    private String orderBy;
    @ApiModelProperty("排序方式")
    private Boolean isAsc = true;
    /** 请求参数 */
    @ApiModelProperty("扩展接收参数")
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private Map<String, Object> params;

    public Map<String, Object> getParams()
    {
        if (params == null)
        {
            params = new HashMap<>();
        }
        return params;
    }
    public <T> Page<T> toPage(OrderItem... orders) {
        // 1. 分页条件
        Page<T> page = Page.of(pageNo, pageSize);
        // 2. 排序字段
        if (orderBy != null) {
            if (isAsc) {
                page.addOrder(OrderItem.asc(orderBy));
            } else {
                page.addOrder(OrderItem.desc(orderBy));
            }
        } else {
            // 默认按照更新时间排序
            page.addOrder(orders);
        }
        return page;
    }

    // 传递排序字段和排序方式
    public <T> Page<T> toPage(String defaultSortBy, boolean isAsc) {
        return this.toPage(isAsc ? OrderItem.asc(defaultSortBy) : OrderItem.desc(defaultSortBy));
    }

    // 根据创建时间排序
    public <T> Page<T> toPageDefaultSortByCreateTime() {
        return this.toPage("create_time", false);
    }

    // 根据更新时间排序
    public <T> Page<T> toPageDefaultSortByUpdateTime() {
        return this.toPage("update_time", false);
    }
}