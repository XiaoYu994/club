package com.hngy.config;

import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigInteger;

/**
 * @desc: spring所有组件配置
 * @Author:  XiaoYu
 * @date:  2025/5/14 下午1:12
**/
@Configuration
public class JsonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return  jacksonObjectMapperBuilder -> {
            // long -> string
            jacksonObjectMapperBuilder.serializerByType(Long.class, ToStringSerializer.instance);
            jacksonObjectMapperBuilder.serializerByType(Long.TYPE, ToStringSerializer.instance);
            jacksonObjectMapperBuilder.serializerByType(BigInteger.class,ToStringSerializer.instance);
//
//            // 日期格式
//            jacksonObjectMapperBuilder.simpleDateFormat("yyyy-MM-dd HH:mm:ss");
//            jacksonObjectMapperBuilder.timeZone(TimeZone.getTimeZone("GMT+8"));
        };
    }
}
