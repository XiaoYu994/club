package com.hngy.interceptor;

import cn.hutool.http.HttpStatus;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.properties.JwtProperties;
import com.hngy.common.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtTokenAdminInterceptor implements HandlerInterceptor {

    private final JwtProperties jwtProperties;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //判断当前拦截到的是Controller的方法还是其他资源
        if (!(handler instanceof HandlerMethod)) {
            //当前拦截到的不是动态方法，直接放行
            return true;
        }
        // 从请求头中获取令牌
        String token = request.getHeader(jwtProperties.getAdminTokenName());
        // 如果token为空，返回错误信息
        if (!StringUtils.hasText(token)) {
            throw new ServiceException(401,"未登录");
        }

        // 如果token以Bearer开头，去掉Bearer
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // 2.校验令牌
        try{
            log.info("jwt校验:{}",token);
            final Claims claims = JwtUtil.parseJWT(jwtProperties.getAdminSecretKey(), token);
            Long adminId = Long.valueOf(claims.get("adminId").toString());
            log.info("当前用户id:{}",adminId);
            //利用线程空间存值
            BaseContext.setCurrentId(adminId);
            return true;
        }catch (Exception ex){
            response.setStatus(HttpStatus.HTTP_UNAUTHORIZED);
            return false;
        }


    }
}
