package com.hngy.controller.admin;


import cn.hutool.core.bean.BeanUtil;
import cn.hutool.crypto.digest.DigestUtil;
import com.hngy.common.constant .MessageConstant;
import com.hngy.common.properties.JwtProperties;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.common.utils.JwtUtil;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.Admin;
import com.hngy.entity.vo.AdminLoginVO;
import com.hngy.entity.vo.AdminVO;
import com.hngy.entity.vo.StatisticsVO;
import com.hngy.entity.vo.TrendDataVO;
import com.hngy.service.IAdminService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * <p>
 * 管理员表 前端控制器
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
@RestController
@RequestMapping("/admin")
@Api("系统管理员接口")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;
    private final JwtProperties jwtProperties;


    @GetMapping
    @ApiOperation("获取管理员列表")
    public R<PageResult<AdminVO>> getAdmins(AdminPageDTO adminPageDTO) {
        return R.success(adminService.getAdminList(adminPageDTO));
    }

    @GetMapping("/info")
    @ApiOperation("获取当前管理员信息")
    public R<AdminVO> getAdminInfo() {
        Long adminId = com.hngy.common.context.BaseContext.getCurrentId();
        if (adminId == null) {
            return R.error("未登录");
        }
        Admin admin = adminService.getById(adminId);
        if (admin == null) {
            return R.error("管理员不存在");
        }
        AdminVO adminVO = BeanUtil.copyProperties(admin, AdminVO.class);
        return R.success(adminVO);
    }

    @PostMapping
    @ApiOperation("添加管理员")
    public R<String> addAdmin(@RequestBody AdminDTO adminDTO) {
        return adminService.createAdmin(adminDTO) ? R.success() : R.error();
    }
    
    @PutMapping
    @ApiOperation("更新管理员")
    public R<String> updateAdmin(@RequestBody AdminDTO adminDTO) {
        return adminService.updateAdmin(adminDTO) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }
    @PutMapping("/status")
    @ApiOperation("更新管理员状态")
    public R<String> updateStatus(@RequestBody AdminStatusDTO adminStatusDTO) {
        return adminService.updateAdminStatus(adminStatusDTO) ? R.success(MessageConstant.SAVE_SUCCESS) : R.error();
    }
    @PutMapping("/{adminId}/reset")
    @ApiOperation("管理员重置密码")
    public R<String> resetPassword(@PathVariable Long adminId) {
        return adminService.resetPassword(adminId) ? R.success(MessageConstant.RESET_SUCCESS) : R.error();
    }
    @PostMapping("/login")
    @ApiOperation("系统管理员登录")
    public R<AdminLoginVO> login(@RequestBody AdminLoginDTO adminLoginDTO) {
        // 加密密码 MD5
        adminLoginDTO.setPassword(DigestUtil.md5Hex(adminLoginDTO.getPassword()));
        final Admin admin = adminService.login(adminLoginDTO);
        // 生成token
        // 生成jwt令牌
        Map<String,Object> claims = new HashMap<>();
        claims.put("adminId",admin.getId());
        String token = JwtUtil.createJWT(jwtProperties.getAdminSecretKey(), jwtProperties.getAdminTtl(), claims);
        AdminLoginVO adminLoginVO = BeanUtil.copyProperties(admin, AdminLoginVO.class);
        adminLoginVO.setToken(token);

        // 设置角色列表：将type转换为角色字符串
        java.util.List<String> roles = new java.util.ArrayList<>();
        if (admin.getType() != null) {
            if (admin.getType() == 1) {
                // 超级管理员
                roles.add("SUPER");
            } else {
                // 普通管理员
                roles.add("ADMIN");
            }
        }
        adminLoginVO.setRoles(roles);

        return R.success(adminLoginVO, MessageConstant.LOGIN_SUCCESS);
    }

    @PostMapping("/logout")
    @ApiOperation("管理员退出登录")
    public R<String> logout() {
        return R.success(MessageConstant.LOGOUT_SUCCESS);
    }

    @PutMapping("/password")
    @ApiOperation("修改管理员密码")
    public R updatePassword(@RequestBody @Valid PasswordUpdateDTO passwordDTO) {
        return adminService.updatePassword(passwordDTO);
    }

    @GetMapping("/statistics")
    @ApiOperation("获取统计数据")
    public R<StatisticsVO> getStatistics() {
        return R.success(adminService.getStatistics());
    }

    @GetMapping("/trend")
    @ApiOperation("获取趋势数据")
    public R<TrendDataVO> getTrendData(@RequestParam(defaultValue = "7") Integer days) {
        return R.success(adminService.getTrendData(days));
    }

    @DeleteMapping("/{adminId}")
    @ApiOperation("删除普通管理员")
    public R<String> delete(@PathVariable Long adminId) {
        return adminService.removeById(adminId) ? R.success(MessageConstant.DELETE_SUCCESS) : R.error();
    }

}
