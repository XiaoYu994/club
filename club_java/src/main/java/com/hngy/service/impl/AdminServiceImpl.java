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
import com.hngy.entity.vo.TrendDataVO;
import com.hngy.mapper.*;
import com.hngy.service.IAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

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
    private final ClubActivityApplyMapper activityApplyMapper;
    private final ClubApplyMapper clubApplyMapper;
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
        
        // 获取待审核活动数 (status = 0)
        LambdaQueryWrapper<com.hngy.entity.po.ClubActivity> pendingActivityWrapper = new LambdaQueryWrapper<>();
        pendingActivityWrapper.eq(com.hngy.entity.po.ClubActivity::getStatus, 0);
        int pendingActivityCount = Math.toIntExact(activityMapper.selectCount(pendingActivityWrapper));
        
        // 获取待审核申请数 (status = 0)
        LambdaQueryWrapper<com.hngy.entity.po.ClubApply> pendingClubApplyWrapper = new LambdaQueryWrapper<>();
        pendingClubApplyWrapper.eq(com.hngy.entity.po.ClubApply::getStatus, 0);
        int pendingClubApplyCount = Math.toIntExact(clubApplyMapper.selectCount(pendingClubApplyWrapper));
        
        // 社团类别分布
        java.util.Map<String, Integer> categoryDistribution = new java.util.HashMap<>();
        try {
            List<com.hngy.entity.po.ClubInfo> allClubs = clubMapper.selectList(null);
            if (allClubs != null && !allClubs.isEmpty()) {
                for (com.hngy.entity.po.ClubInfo club : allClubs) {
                    // 使用type字段作为类别: 0=普通社团 1=院级社团 2=校级社团
                    String category;
                    if (club.getType() != null) {
                        switch (club.getType()) {
                            case 0:
                                category = "普通社团";
                                break;
                            case 1:
                                category = "院级社团";
                                break;
                            case 2:
                                category = "校级社团";
                                break;
                            default:
                                category = "其他";
                        }
                    } else {
                        category = "其他";
                    }
                    categoryDistribution.put(category, categoryDistribution.getOrDefault(category, 0) + 1);
                }
            }
        } catch (Exception e) {
            log.error("获取社团类别分布失败", e);
            categoryDistribution.put("其他", clubCount > 0 ? clubCount : 0);
        }
        
        // 热门社团 Top 5 (按成员数)
        List<StatisticsVO.ClubStatItem> topClubs = new java.util.ArrayList<>();
        try {
            topClubs = clubMapper.selectTopClubsByMemberCount(5);
            if (topClubs == null) {
                topClubs = new java.util.ArrayList<>();
            }
        } catch (Exception e) {
            log.error("获取热门社团失败", e);
        }
        
        // 活动状态分布
        java.util.Map<String, Integer> activityStatusDistribution = new java.util.HashMap<>();
        try {
            List<com.hngy.entity.po.ClubActivity> allActivities = activityMapper.selectList(null);
            if (allActivities != null && !allActivities.isEmpty()) {
                for (com.hngy.entity.po.ClubActivity activity : allActivities) {
                    String statusName;
                    if (activity.getStatus() != null) {
                        switch (activity.getStatus()) {
                            case 0:
                                statusName = "已取消";
                                break;
                            case 1:
                                statusName = "待审核";
                                break;
                            case 2:
                                statusName = "进行中";
                                break;
                            case 3:
                                statusName = "已结束";
                                break;
                            default:
                                statusName = "未知";
                        }
                    } else {
                        statusName = "未知";
                    }
                    activityStatusDistribution.put(statusName, 
                        activityStatusDistribution.getOrDefault(statusName, 0) + 1);
                }
            }
        } catch (Exception e) {
            log.error("获取活动状态分布失败", e);
        }
        
        // 用户状态分布
        java.util.Map<String, Integer> userStatusDistribution = new java.util.HashMap<>();
        try {
            List<com.hngy.entity.po.User> allUsers = userMapper.selectList(null);
            if (allUsers != null && !allUsers.isEmpty()) {
                for (com.hngy.entity.po.User user : allUsers) {
                    String statusName = (user.getStatus() != null && user.getStatus() == 1) ? "正常" : "已禁用";
                    userStatusDistribution.put(statusName, 
                        userStatusDistribution.getOrDefault(statusName, 0) + 1);
                }
            }
        } catch (Exception e) {
            log.error("获取用户状态分布失败", e);
        }
        
        // 活动报名总数
        int totalActivityApplies = Math.toIntExact(activityApplyMapper.selectCount(null));
        
        // 总签到人数
        LambdaQueryWrapper<com.hngy.entity.po.ClubActivityApply> checkedInWrapper = new LambdaQueryWrapper<>();
        checkedInWrapper.eq(com.hngy.entity.po.ClubActivityApply::getCheckInStatus, 1);
        int totalCheckedIn = Math.toIntExact(activityApplyMapper.selectCount(checkedInWrapper));
        
        // 计算平均签到率（已结束活动的平均签到率）
        double averageCheckInRate = 0.0;
        try {
            LambdaQueryWrapper<com.hngy.entity.po.ClubActivity> endedActivityWrapper = new LambdaQueryWrapper<>();
            endedActivityWrapper.eq(com.hngy.entity.po.ClubActivity::getStatus, 3); // 已结束
            List<com.hngy.entity.po.ClubActivity> endedActivities = activityMapper.selectList(endedActivityWrapper);
            
            if (endedActivities != null && !endedActivities.isEmpty()) {
                double totalRate = 0.0;
                int validCount = 0;
                for (com.hngy.entity.po.ClubActivity activity : endedActivities) {
                    LambdaQueryWrapper<com.hngy.entity.po.ClubActivityApply> approvedWrapper = new LambdaQueryWrapper<>();
                    approvedWrapper.eq(com.hngy.entity.po.ClubActivityApply::getActivityId, activity.getId())
                                   .eq(com.hngy.entity.po.ClubActivityApply::getStatus, 1); // 审核通过
                    long approvedCount = activityApplyMapper.selectCount(approvedWrapper);
                    
                    if (approvedCount > 0) {
                        LambdaQueryWrapper<com.hngy.entity.po.ClubActivityApply> checkedInWrapper2 = new LambdaQueryWrapper<>();
                        checkedInWrapper2.eq(com.hngy.entity.po.ClubActivityApply::getActivityId, activity.getId())
                                        .eq(com.hngy.entity.po.ClubActivityApply::getCheckInStatus, 1);
                        long checkedInCount = activityApplyMapper.selectCount(checkedInWrapper2);
                        double rate = (double) checkedInCount / approvedCount * 100;
                        totalRate += rate;
                        validCount++;
                    }
                }
                if (validCount > 0) {
                    averageCheckInRate = totalRate / validCount;
                }
            }
        } catch (Exception e) {
            log.error("计算平均签到率失败", e);
        }
        
        // 计算平均活动参与率（每个活动的平均报名数）
        double averageActivityParticipation = 0.0;
        if (activityCount > 0) {
            averageActivityParticipation = (double) totalActivityApplies / activityCount;
        }
        
        log.info("【统计数据】用户:{}, 社团:{}, 活动:{}, 公告:{}, 待审活动:{}, 待审申请:{}, 社团类别:{}, 热门社团:{}", 
                 userCount, clubCount, activityCount, noticeCount, pendingActivityCount, pendingClubApplyCount,
                 categoryDistribution.size(), topClubs.size());
        
        return StatisticsVO.builder()
                .userCount(userCount)
                .clubCount(clubCount)
                .activityCount(activityCount)
                .noticeCount(noticeCount)
                .pendingActivityCount(pendingActivityCount)
                .pendingClubApplyCount(pendingClubApplyCount)
                .clubCategoryDistribution(categoryDistribution)
                .activityStatusDistribution(activityStatusDistribution)
                .userStatusDistribution(userStatusDistribution)
                .totalActivityApplies(totalActivityApplies)
                .totalCheckedIn(totalCheckedIn)
                .averageCheckInRate(Math.round(averageCheckInRate * 100) / 100.0)
                .averageActivityParticipation(Math.round(averageActivityParticipation * 100) / 100.0)
                .topClubs(topClubs)
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
    public boolean updateAdmin(AdminDTO adminDTO) {
        Admin admin = adminMapper.selectById(adminDTO.getId());
        if(admin == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        // 更新基本信息
        if (adminDTO.getUsername() != null) {
            admin.setUsername(adminDTO.getUsername());
        }
        if (adminDTO.getPhone() != null) {
            admin.setPhone(adminDTO.getPhone());
        }
        if (adminDTO.getDescription() != null) {
            admin.setDescription(adminDTO.getDescription());
        }
        if (adminDTO.getType() != null) {
            admin.setType(adminDTO.getType());
        }
        if (adminDTO.getStatus() != null) {
            admin.setStatus(adminDTO.getStatus());
        }
        
        // 如果有新密码，进行MD5加密后更新
        if (adminDTO.getPassword() != null && !adminDTO.getPassword().isEmpty()) {
            admin.setPassword(DigestUtil.md5Hex(adminDTO.getPassword()));
        }
        
        admin.setUpdateTime(System.currentTimeMillis());
        return adminMapper.updateById(admin) > 0;
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

    @Override
    public TrendDataVO getTrendData(Integer days) {
        if (days == null || (days != 7 && days != 30)) {
            days = 7; // 默认7天
        }

        SimpleDateFormat dateFormat = new SimpleDateFormat("MM-dd");
        List<String> dates = new ArrayList<>();
        List<Integer> userTrend = new ArrayList<>();
        List<Integer> clubTrend = new ArrayList<>();
        List<Integer> activityTrend = new ArrayList<>();
        List<Integer> activityApplyTrend = new ArrayList<>();
        List<Integer> clubApplyTrend = new ArrayList<>();

        Calendar calendar = Calendar.getInstance();
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        // 从days天前开始统计到今天
        for (int i = days - 1; i >= 0; i--) {
            Calendar currentDay = (Calendar) calendar.clone();
            currentDay.add(Calendar.DAY_OF_MONTH, -i);

            long dayStart = currentDay.getTimeInMillis();
            currentDay.add(Calendar.DAY_OF_MONTH, 1);
            long dayEnd = currentDay.getTimeInMillis();

            // 日期格式化
            dates.add(dateFormat.format(new Date(dayStart)));

            // 统计当天新增用户数
            LambdaQueryWrapper<com.hngy.entity.po.User> userWrapper = new LambdaQueryWrapper<>();
            userWrapper.ge(com.hngy.entity.po.User::getCreateTime, dayStart)
                      .lt(com.hngy.entity.po.User::getCreateTime, dayEnd);
            int userCount = Math.toIntExact(userMapper.selectCount(userWrapper));
            userTrend.add(userCount);

            // 统计当天新增社团数
            LambdaQueryWrapper<com.hngy.entity.po.ClubInfo> clubWrapper = new LambdaQueryWrapper<>();
            clubWrapper.ge(com.hngy.entity.po.ClubInfo::getCreateTime, dayStart)
                      .lt(com.hngy.entity.po.ClubInfo::getCreateTime, dayEnd);
            int clubCount = Math.toIntExact(clubMapper.selectCount(clubWrapper));
            clubTrend.add(clubCount);

            // 统计当天新增活动数
            LambdaQueryWrapper<com.hngy.entity.po.ClubActivity> activityWrapper = new LambdaQueryWrapper<>();
            activityWrapper.ge(com.hngy.entity.po.ClubActivity::getCreateTime, dayStart)
                          .lt(com.hngy.entity.po.ClubActivity::getCreateTime, dayEnd);
            int activityCount = Math.toIntExact(activityMapper.selectCount(activityWrapper));
            activityTrend.add(activityCount);

            // 统计当天活动报名数
            LambdaQueryWrapper<com.hngy.entity.po.ClubActivityApply> activityApplyWrapper = new LambdaQueryWrapper<>();
            activityApplyWrapper.ge(com.hngy.entity.po.ClubActivityApply::getCreateTime, dayStart)
                               .lt(com.hngy.entity.po.ClubActivityApply::getCreateTime, dayEnd);
            int activityApplyCount = Math.toIntExact(activityApplyMapper.selectCount(activityApplyWrapper));
            activityApplyTrend.add(activityApplyCount);

            // 统计当天社团招新申请数
            LambdaQueryWrapper<com.hngy.entity.po.ClubApply> clubApplyWrapper = new LambdaQueryWrapper<>();
            clubApplyWrapper.ge(com.hngy.entity.po.ClubApply::getCreateTime, dayStart)
                           .lt(com.hngy.entity.po.ClubApply::getCreateTime, dayEnd);
            int clubApplyCount = Math.toIntExact(clubApplyMapper.selectCount(clubApplyWrapper));
            clubApplyTrend.add(clubApplyCount);
        }

        return TrendDataVO.builder()
                .dates(dates)
                .userTrend(userTrend)
                .clubTrend(clubTrend)
                .activityTrend(activityTrend)
                .activityApplyTrend(activityApplyTrend)
                .clubApplyTrend(clubApplyTrend)
                .build();
    }
}
