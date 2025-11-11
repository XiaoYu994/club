package com.hngy.controller.user;


import cn.hutool.core.bean.BeanUtil;
import cn.hutool.http.HttpStatus;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.properties.JwtProperties;
import com.hngy.common.result.R;
import com.hngy.common.utils.JwtUtil;
import com.hngy.entity.dto.UserDTO;
import com.hngy.entity.dto.userLoginDTO;
import com.hngy.entity.po.User;
import com.hngy.entity.vo.UserLoginVO;
import com.hngy.entity.vo.UserVO;
import com.hngy.service.IUserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * <p>
 * 用户表 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
@RestController
@RequestMapping("/user")
@Api("用户接口")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final IUserService userService;
    private final JwtProperties jwtProperties;
    @PostMapping("/wx-login")
    @ApiOperation("微信用户登录")
    public R< UserLoginVO> login(@RequestBody userLoginDTO userLoginDTO){
        final User user = userService.login(userLoginDTO);
        log.info("用户登录成功：{}",user);
        //登录成功后，获取JWT令牌
        Map<String,Object> claims =new HashMap<>();
        claims.put("userId",user.getId());
        String token =  JwtUtil.createJWT(jwtProperties.getUserSecretKey(),jwtProperties.getUserTtl(),claims);
        UserLoginVO userLoginVO = BeanUtil.copyProperties(user, UserLoginVO.class);
        userLoginVO.setToken(token);
        return  R.success(userLoginVO);
    }

    @PutMapping
    @ApiOperation("更新用户信息")
    public R<String> update(@RequestBody UserDTO userDTO){
        boolean update = userService.updateById(userDTO);
        return update?R.success(MessageConstant.SAVE_SUCCESS):R.error(MessageConstant.SAVE_ERROR);
    }

    @GetMapping("/info")
    @ApiOperation("获取用户信息")
    public R<UserVO> info(){
        Long userId = BaseContext.getCurrentId();
        log.info("当前用户ID：{}",userId);
        User user = userService.getById(userId);
        if(user == null){
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        // 只在前端显示我们需要的
        UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
        return R.success(userVO);
    }

    @PostMapping("/logout")
    @ApiOperation("用户注销登录")
    public R<String> logout(){
        // 前端会自行清除token，后端只需返回成功即可
        return R.success(MessageConstant.LOGOUT_SUCCESS);
    }

}
