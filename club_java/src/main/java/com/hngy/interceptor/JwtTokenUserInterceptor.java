package com.hngy.interceptor;

import cn.hutool.http.HttpStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.properties.JwtProperties;
import com.hngy.common.result.R;
import com.hngy.common.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtTokenUserInterceptor implements HandlerInterceptor {

    private final JwtProperties jwtProperties;
    private final ObjectMapper objectMapper;
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        //判断当前拦截到的是Controller的方法还是其他资源
        if (!(handler instanceof HandlerMethod)) {
            //当前拦截到的不是动态方法，直接放行
            return true;
        }
        // 从请求头中获取令牌
        String token = request.getHeader(jwtProperties.getUserTokenName());
        // 如果token为空，返回错误信息
        if (!StringUtils.hasText(token)) {
//            throw new ServiceException(401,"未登录");
            handleError(response, "未登录");
            return false;
        }

        // 如果token以Bearer开头，去掉Bearer
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        // 2.校验令牌
        try{
            log.info("jwt校验:{}",token);
            final Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
            Long userId = Long.valueOf(claims.get("userId").toString());
            log.info("当前用户id:{}",userId);
            //利用线程空间存值
            BaseContext.setCurrentId(userId);
            return true;
        }catch (Exception ex){
            handleError(response, "登录已过期，请重新登录");
            return false;
        }


    }

    /**
     * 处理错误信息
     * @param response 响应
     * @param message 错误信息
     */
    private void handleError(HttpServletResponse response, String message) throws IOException {
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write(objectMapper.writeValueAsString(R.error(401, message)));
    }
}
