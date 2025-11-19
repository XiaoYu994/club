package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.http.HttpStatus;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.Admin;
import com.hngy.entity.vo.AdminVO;
import com.hngy.entity.vo.StatisticsVO;
import com.hngy.mapper.*;
import com.hngy.service.IAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

/**
 * <p>
 * 管理员表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminServiceImpl extends ServiceImpl<AdminMapper, Admin> implements IAdminService {

    private final AdminMapper adminMapper;
    private final UserMapper userMapper;
    private final ClubInfoMapper clubMapper;
    private final SystemAnnouncementMapper noticeMapper;
    private final ClubActivityMapper activityMapper;
    @Override
    public Admin login(AdminLoginDTO adminLoginDTO) {
        if(StrUtil.isEmpty(adminLoginDTO.getPassword()) || StrUtil.isEmpty(adminLoginDTO.getUsername())){
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, MessageConstant.USERNAME_OR_PASSWORD_EMPTY);
        }
        Admin admin = new Admin();
        try {
            admin = lambdaQuery().eq(Admin::getUsername, adminLoginDTO.getUsername())
                    .eq(Admin::getPassword, adminLoginDTO.getPassword())
                    .one();
        }catch (Exception e){
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, MessageConstant.USER_NOT_FOUND);
        }
        if(admin == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "用户不存在或密码错误");
        }
        if (admin.getStatus() == 0) {
            throw new ServiceException(HttpStatus.HTTP_FORBIDDEN, MessageConstant.ACCOUNT_LOCKED);
        }
        // 最后登录时间
        admin.setLastLoginTime(System.currentTimeMillis());
        // 登录次数+1（首次登录场景 loginCount 可能为空）
        Integer loginCount = admin.getLoginCount() == null ? 0 : admin.getLoginCount();
        admin.setLoginCount(loginCount + 1);
        // 更新数据库
        adminMapper.updateById(admin);
        return admin;
    }

    @Override
    public R updatePassword(PasswordUpdateDTO passwordDTO) {
        // 从请求中获取管理员ID
        Long adminId = BaseContext.getCurrentId();
        log.info("当前管理员ID：{}",adminId);
        if (adminId == null) {
            // 401 未授权
            return R.unauthorized();
        }

        // 查询管理员信息
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }

        // 验证旧密码
        String encryptedOldPassword = DigestUtils.md5DigestAsHex(passwordDTO.getOldPassword().getBytes());
        if (!encryptedOldPassword.equals(admin.getPassword())) {
            return R.error("旧密码错误");
        }

        // 更新密码  mds加密
        String encryptedNewPassword = DigestUtils.md5DigestAsHex(passwordDTO.getNewPassword().getBytes());
        admin.setPassword(encryptedNewPassword);
        adminMapper.updateById(admin);
        return R.success("密码修改成功");
    }

    @Override
    public StatisticsVO getStatistics() {
        // 获取用户总数
        int userCount = userMapper.count();

        // 获取社团总数
        int clubCount = clubMapper.count();

        // 获取活动总数
        int activityCount = activityMapper.count();

        // 获取公告总数
        int noticeCount = noticeMapper.count();
        return StatisticsVO.builder()
                .activityCount(activityCount).clubCount(clubCount)
                .noticeCount(noticeCount).userCount(userCount)
                .build();
    }

    @Override
    public PageResult<AdminVO> getAdminList(AdminPageDTO adminPageDTO) {
        Page<Admin> page = adminPageDTO.toPageDefaultSortByCreateTime();
        LambdaQueryWrapper<Admin> wrapper = new LambdaQueryWrapper<>();
        // 根据管理员账号或者手机号查询
        if (adminPageDTO.getKeyword() != null) {
            wrapper.and(w -> w.like(Admin::getUsername, adminPageDTO.getKeyword()).or()
                    .like(Admin::getPhone, adminPageDTO.getKeyword()));
        }
        // 根据状态查询
        if (adminPageDTO.getStatus() != null) {
            wrapper.eq(Admin::getStatus, adminPageDTO.getStatus());
        }
        page = adminMapper.selectPage(page, wrapper);
        return PageResult.of(page, AdminVO.class);
    }

    @Override
    public boolean createAdmin(AdminDTO adminDTO) {
        // md5加密
        adminDTO.setPassword(DigestUtil.md5Hex(adminDTO.getPassword()));
        Admin admin = new Admin();
        BeanUtil.copyProperties(adminDTO, admin);
        // 创建时间
        admin.setCreateTime(System.currentTimeMillis());

        return adminMapper.insert(admin) > 0;
    }

    @Override
    public boolean updateAdminStatus(AdminStatusDTO adminStatusDTO) {
        Admin admin = adminMapper.selectById(adminStatusDTO.getAdminId());
        if(admin == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        admin.setStatus(adminStatusDTO.getStatus());
        admin.setUpdateTime(System.currentTimeMillis());
        return adminMapper.updateById(admin) > 0;
    }

    @Override
    public boolean resetPassword(Long adminId) {
        Admin admin = adminMapper.selectById(adminId);
        if(admin == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        // 重置密码为123456
        admin.setPassword(DigestUtil.md5Hex("123456"));
        admin.setUpdateTime(System.currentTimeMillis());
        return adminMapper.updateById(admin) > 0;
    }
}
