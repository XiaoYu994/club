package com.hngy.config;


import com.hngy.interceptor.JwtTokenAdminInterceptor;
import com.hngy.interceptor.JwtTokenUserInterceptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/**
 * @Description: WebMvC配置类
 * @Author:  XiaoYu
 * @date:  2025/5/14 下午12:56
**/
@Configuration
@RequiredArgsConstructor
@Slf4j
public class WebMvcConfig implements WebMvcConfigurer {

    private final JwtTokenAdminInterceptor adminInterceptor;

    private final JwtTokenUserInterceptor userInterceptor;
/**
 * @desc: 跨域配置
 * @Author:  XiaoYu
 * @date:  2025/5/14 下午1:00
**/
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true)
                .maxAge(3600)
                .allowedHeaders("*"); // 允许的请求头字段
    }

    /**
     * @desc: 添加拦截器
     * @Author:  XiaoYu
     * @date:  2025/5/14 下午2:43
    **/
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("开始注册自定义拦截器...");
        registry.addInterceptor(adminInterceptor)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/login");

        registry.addInterceptor(userInterceptor)
                .addPathPatterns("/user/**")
                .excludePathPatterns("/user/wx-login");
    }
}
