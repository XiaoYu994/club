package com.hngy.controller.admin;

import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.UserDTO;
import com.hngy.entity.dto.UserPageDTO;
import com.hngy.entity.dto.UserStatusDTO;
import com.hngy.entity.po.User;
import com.hngy.entity.vo.UserVO;
import com.hngy.service.IUserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Map;

/**
 * 管理员用户管理相关接口
 */
@RestController
@RequestMapping("/admin/users")
@Api(tags = "管理员用户管理接口")
@RequiredArgsConstructor
public class AdminUserController {


    private final IUserService userService;

    /**
     * 获取用户列表
     */
    @GetMapping
    @ApiOperation("获取用户列表")
    public R<PageResult<UserVO>> getUsers(UserPageDTO userPageDTO) {
        return R.success(userService.getUsers(userPageDTO));
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    @ApiOperation("获取用户详情")
    public R<User> getUserDetail(@PathVariable Integer id) {
        return R.success(userService.getById(id));
    }

    /**
     * 修改用户信息
     */
    @PutMapping("/{id}")
    @ApiOperation("修改用户信息")
    public R<String> updateUser(@PathVariable Integer id, @RequestBody @Valid UserDTO userDTO) {
        return userService.updateUser(id, userDTO)?R.success() : R.error();
    }

    /**
     * 修改用户状态（禁用/启用）
     */
    @PutMapping("/{id}/status")
    @ApiOperation("修改用户状态")
    public R<String> updateUserStatus(@PathVariable Integer id, @RequestBody @Valid UserStatusDTO statusDTO) {
        return userService.updateUserStatus(id, statusDTO) ? R.success() : R.error();
    }

    /**
     * 导出用户列表
     */
    @ApiOperation("导出用户列表")
    @GetMapping("/export")
    public R<Map<String, Object>> exportUsers(UserPageDTO userPageDTO) {
        return R.success(userService.exportUsers(userPageDTO));
    }
} 