package com.hngy.common.result;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@ApiModel(description = "分页结果")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResult<T> {
    @ApiModelProperty("总条数")
    private Long total;
    @ApiModelProperty("总页数")
    private Long pages;
    @ApiModelProperty("数据")
    private List<T> list;


    //返回空分页结果
    public static <V,P> PageResult<V> empty(Page<P> p){
        return new PageResult<>(p.getTotal(),p.getPages(), Collections.emptyList());
    }

    // 将mybatisPlus分页结果转换为Vo分页结果
    public static <V,P> PageResult<V> of(Page<P> p, Class<V> voClass){
       // 1. 非空校验
        final List<P> records = p.getRecords();
        if(CollUtil.isEmpty(records)){
            return empty(p);
        }
        // 2.数据类型装换
        List<V> list = BeanUtil.copyToList(records, voClass);
        return new PageResult<>(p.getTotal(),p.getPages(),list);
    }

    // 将mybatisPlus分页结果转换为Vo分页结果 允许用户自定义po->vo的转换方式
    public static <V,P> PageResult<V> of(Page<P> p, Function<P,V> convertor){
        // 1. 非空校验
        final List<P> records = p.getRecords();
        if(CollUtil.isEmpty(records)){
            return empty(p);
        }
        // 2.数据类型装换
        List<V> list = records.stream().map(convertor).collect(Collectors.toList());
        return new PageResult<>(p.getTotal(),p.getPages(),list);
    }

}
