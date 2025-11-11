//package com.hngy.config;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.RedisConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.data.redis.serializer.StringRedisSerializer;
//
//@Configuration
//@Slf4j
//public class RedisConfiguration {
//
//    @Bean
//
//    /**/
//    public RedisTemplate redisTemplate(RedisConnectionFactory redisConnectionFactory){
//        log.info("开始创建redis模板类");
//        final RedisTemplate redisTemplate = new RedisTemplate();
//        //设置key的序列化器默认为JdkSerializationRedisSerializer
//        redisTemplate.setKeySerializer(new StringRedisSerializer());
//        //设置RedisConnectionFactory为RedisTemplate的连接工厂，RedisTemplate通过这个工厂与Redis连接
//        redisTemplate.setConnectionFactory(redisConnectionFactory);
//        return redisTemplate;
//    }
//}
