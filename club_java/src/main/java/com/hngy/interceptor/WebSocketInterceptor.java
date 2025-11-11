package com.hngy.interceptor;

import com.hngy.common.constant.JwtClaimsConstant;
import com.hngy.common.properties.JwtProperties;
import com.hngy.common.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket连接拦截器，用于身份验证
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketInterceptor implements HandshakeInterceptor {

    private final JwtProperties jwtProperties;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            // 从URL参数中获取token
            String token = servletRequest.getServletRequest().getParameter("token");
            
            if (StringUtils.hasText(token)) {
                // 处理可能的Bearer前缀
                if (token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }
                
                try {
                    // 解析JWT Token
                    Claims claims = JwtUtil.parseJWT(jwtProperties.getUserSecretKey(), token);
                    Long userId = Long.valueOf(claims.get(JwtClaimsConstant.USER_ID).toString());
                    
                    // 将用户ID存储到WebSocketSession的attributes中
                    attributes.put("userId", userId);
                    log.info("WebSocket连接认证成功，用户ID: {}", userId);
                    return true;
                } catch (Exception e) {
                    log.error("WebSocket连接认证失败，token解析错误: {}", e.getMessage());
                    return false;
                }
            }
        }
        log.error("WebSocket连接认证失败，未提供有效token");
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, 
                              WebSocketHandler wsHandler, Exception exception) {
        // 握手完成后的处理，不需要特别操作
    }
} 