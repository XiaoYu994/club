package com.hngy.common.utils;


import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    public static String createJWT(String secretKey, long ttlMillis, Map<String,Object> claims){
        // 指定签名的时候使用的签名算法，也就是header那部分
        final SignatureAlgorithm hs256 = SignatureAlgorithm.HS256;
        // 生成jwt的时间
        long expMillis = System.currentTimeMillis() + ttlMillis;
         Date exp = new Date(expMillis);

         // 设置jwt
        JwtBuilder builder = Jwts.builder()
                .setClaims(claims)
                .setExpiration(exp)
                .signWith(hs256, secretKey.getBytes(StandardCharsets.UTF_8));

        return builder.compact();

    }

    /**
     * @desc: token解密
     * @Author:  XiaoYu
     * @date:  2025/5/14 下午3:57
    **/
    public static Claims parseJWT(String secretKey, String token){
        return Jwts.parser()
                .setSigningKey(secretKey.getBytes(StandardCharsets.UTF_8))
                .parseClaimsJws(token)
                .getBody();
    }
}
