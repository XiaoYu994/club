package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.http.HttpStatus;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.HttpsConstant;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.properties.WeChatProperties;
import com.hngy.common.result.PageResult;
import com.hngy.common.utils.HttpClientUtil;
import com.hngy.entity.dto.UserDTO;
import com.hngy.entity.dto.UserPageDTO;
import com.hngy.entity.dto.UserStatusDTO;
import com.hngy.entity.dto.userLoginDTO;
import com.hngy.entity.po.User;
import com.hngy.entity.po.WxSession;
import com.hngy.entity.po.ClubActivity;
import com.hngy.entity.po.ClubActivityApply;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.po.ClubMember;
import com.hngy.entity.vo.UserDetailVO;
import com.hngy.entity.vo.UserVO;
import com.hngy.mapper.*;
import com.hngy.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.dromara.x.file.storage.core.FileInfo;
import org.dromara.x.file.storage.core.FileStorageService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * <p>
 * 用户表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-17
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final WeChatProperties weChatProperties;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;
    private final ClubMemberMapper clubMemberMapper;
    private final ClubActivityApplyMapper clubActivityApplyMapper;
    private final ClubInfoMapper clubInfoMapper;
    private final ClubActivityMapper clubActivityMapper;
    @Override
    public User login(userLoginDTO userLoginDTO) {
        // 测试号 TODO 如果点击的是手机号登录
        if (userLoginDTO.getCode().equals("phoneLogin")) {
            return userMapper.selectById(2);
        }
        final WxSession wx = getOpenid(userLoginDTO);
        if(wx.getOpenid() == null){
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.GET_OPENID_ERROR);
        }

        // 判断用户是否为新用户
        User user = userMapper.selectByOnpenId(wx.getOpenid() );
        if(user == null){
            // 创建用户
            user = User.builder()
                    .openid(wx.getOpenid() )
                    .unionid(wx.getUnionid())
                    .createTime(System.currentTimeMillis())
                    .username("wx"+ System.currentTimeMillis())
                    .build();
            userMapper.insert(user);
        }else{
            // 判断该用户是否被禁用
            if(user.getStatus() == 0){
                throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_DISABLED);
            }
        }
        return user;
    }

    // 更新用户信息
    @Override
    public boolean updateById(UserDTO userDTO) {
        Long userId = BaseContext.getCurrentId();
        if(userId == null){
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        // 查询用户
        User user = getUser(userId.intValue());
        // 使用 UpdateWrapper 实现动态更新（只更新非空字段）
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, userId);
        
        // 只更新非空字段
        if (userDTO.getUsername() != null && !userDTO.getUsername().isEmpty()) {
            updateWrapper.set(User::getUsername, userDTO.getUsername());
        }
        if (userDTO.getAvatar() != null && !userDTO.getAvatar().isEmpty()) {
            updateWrapper.set(User::getAvatar, userDTO.getAvatar());
        }
        if (userDTO.getGender() != null) {
            updateWrapper.set(User::getGender, userDTO.getGender());
        }
        if (userDTO.getMobile() != null && !userDTO.getMobile().isEmpty()) {
            updateWrapper.set(User::getMobile, userDTO.getMobile());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            updateWrapper.set(User::getEmail, userDTO.getEmail());
        }
        if (userDTO.getStudentId() != null && !userDTO.getStudentId().isEmpty()) {
            updateWrapper.set(User::getStudentId, userDTO.getStudentId());
        }
        if (userDTO.getCollege() != null && !userDTO.getCollege().isEmpty()) {
            updateWrapper.set(User::getCollege, userDTO.getCollege());
        }
        if (userDTO.getMajor() != null && !userDTO.getMajor().isEmpty()) {
            updateWrapper.set(User::getMajor, userDTO.getMajor());
        }
        if (userDTO.getClassName() != null && !userDTO.getClassName().isEmpty()) {
            updateWrapper.set(User::getClassName, userDTO.getClassName());
        }
        
        // 更新最后操作时间
        updateWrapper.set(User::getUpdateTime, System.currentTimeMillis());
        
        return userMapper.update(null, updateWrapper) > 0;
    }

    @Override
    public PageResult<UserVO> getUsers(UserPageDTO userPageDTO) {
        Page<User> page = userPageDTO.toPageDefaultSortByUpdateTime();
        // 构造查询参数
        LambdaQueryWrapper<User> Wrapper = new LambdaQueryWrapper<>();
        // 根据用户名称 或者手机号查询
        if(userPageDTO.getKeyword() != null) {
            Wrapper.and(wrapper -> wrapper.like(User::getUsername, userPageDTO.getKeyword())
                    .or().like(User::getMobile, userPageDTO.getKeyword()));
        }
        // 根据用户状态查询
        if(userPageDTO.getStatus() != null) {
            Wrapper.eq(User::getStatus, userPageDTO.getStatus());
        }
        page = userMapper.selectPage(page, Wrapper);
        // 构建返回结果
        return PageResult.of(page, UserVO.class);
    }

    @Override
    public Boolean updateUser(Integer id, UserDTO userDTO) {
        // 查询用户是否存在
        getUser(id);
        // 使用 UpdateWrapper 实现动态更新（只更新非空字段）
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, id);
        
        // 只更新非空字段
        if (userDTO.getUsername() != null && !userDTO.getUsername().isEmpty()) {
            updateWrapper.set(User::getUsername, userDTO.getUsername());
        }
        if (userDTO.getAvatar() != null && !userDTO.getAvatar().isEmpty()) {
            updateWrapper.set(User::getAvatar, userDTO.getAvatar());
        }
        if (userDTO.getGender() != null) {
            updateWrapper.set(User::getGender, userDTO.getGender());
        }
        if (userDTO.getMobile() != null && !userDTO.getMobile().isEmpty()) {
            updateWrapper.set(User::getMobile, userDTO.getMobile());
        }
        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()) {
            updateWrapper.set(User::getEmail, userDTO.getEmail());
        }
        if (userDTO.getStudentId() != null && !userDTO.getStudentId().isEmpty()) {
            updateWrapper.set(User::getStudentId, userDTO.getStudentId());
        }
        if (userDTO.getCollege() != null && !userDTO.getCollege().isEmpty()) {
            updateWrapper.set(User::getCollege, userDTO.getCollege());
        }
        if (userDTO.getMajor() != null && !userDTO.getMajor().isEmpty()) {
            updateWrapper.set(User::getMajor, userDTO.getMajor());
        }
        if (userDTO.getClassName() != null && !userDTO.getClassName().isEmpty()) {
            updateWrapper.set(User::getClassName, userDTO.getClassName());
        }
        
        // 更新最后操作时间
        updateWrapper.set(User::getUpdateTime, System.currentTimeMillis());
        
        return userMapper.update(null, updateWrapper) > 0;
    }

    @Override
    public Boolean updateUserStatus(Integer id, UserStatusDTO statusDTO) {
        // 使用更新包装器，仅修改状态字段，避免空字段映射错误
        LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(User::getId, id)
                     .set(User::getStatus, statusDTO.getStatus());
        return userMapper.update(null, updateWrapper) > 0;
    }

    @Override
    public byte[] exportUsers(UserPageDTO userPageDTO) {
        // 构造查询条件
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (userPageDTO.getKeyword() != null) {
            wrapper.and(w -> w.like(User::getUsername, userPageDTO.getKeyword())
                    .or().like(User::getMobile, userPageDTO.getKeyword()));
        }
        if (userPageDTO.getStatus() != null) {
            wrapper.eq(User::getStatus, userPageDTO.getStatus());
        }
        // 查询所有用户
        List<User> users = userMapper.selectList(wrapper);
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("用户列表");
            // 标题行
            Row header = sheet.createRow(0);
            String[] titles = {"序号","用户ID","用户名","手机号","学号","班级","专业","状态","注册时间"};
            for (int i = 0; i < titles.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(titles[i]);
                sheet.setColumnWidth(i, 4000);
            }
            // 数据行
            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(u.getId());
                row.createCell(2).setCellValue(u.getUsername());
                row.createCell(3).setCellValue(u.getMobile() == null ? "" : u.getMobile());
                // 学号
                row.createCell(4).setCellValue(u.getStudentId() == null ? "" : u.getStudentId());
                // 班级
                row.createCell(5).setCellValue(u.getClassName() == null ? "" : u.getClassName());
                // 专业
                row.createCell(6).setCellValue(u.getMajor() == null ? "" : u.getMajor());
                // 状态
                String statusText = (u.getStatus() != null && u.getStatus() == 1) ? "正常" : "已禁用";
                row.createCell(7).setCellValue(statusText);
                // 注册时间
                row.createCell(8).setCellValue(u.getCreateTime());
            }
            // 写入字节流
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] bytes = outputStream.toByteArray();
            workbook.close();
            // 直接返回字节数组，供前端下载
            return bytes;
        } catch (IOException e) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, "导出失败: " + e.getMessage());
        }
    }


    private WxSession getOpenid(userLoginDTO userLoginDTO) {
        //通过临时登录凭证 code 调用接口
        Map<String,String> param = new HashMap<>();
        param.put("appid",weChatProperties.getAppid());
        param.put("secret",weChatProperties.getSecret());
        param.put("js_code", userLoginDTO.getCode());
        param.put("grant_type","authorization_code");

        final String json = HttpClientUtil.doGet(HttpsConstant.WEIXI_LOGIN, param);
        return JSONObject.parseObject(json,WxSession.class);
    }

    /**
     * @desc: 判断用户是否存在
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午11:27
    **/
    private User getUser(Integer id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.USER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public UserDetailVO getUserDetail(Integer id) {
        User user = getUser(id);
        UserDetailVO detailVO = new UserDetailVO();
        
        // 设置用户基本信息
        UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
        detailVO.setUserInfo(userVO);
        
        // 查询用户加入的社团
        LambdaQueryWrapper<ClubMember> clubWrapper = new LambdaQueryWrapper<>();
        clubWrapper.eq(ClubMember::getUserId, id.longValue())
                  .eq(ClubMember::getStatus, 1); // 只查询正常状态的成员
        List<ClubMember> clubMembers = clubMemberMapper.selectList(clubWrapper);
        
        List<UserDetailVO.ClubMemberInfo> clubs = clubMembers.stream().map(member -> {
            UserDetailVO.ClubMemberInfo info = new UserDetailVO.ClubMemberInfo();
            info.setClubId(member.getClubId().longValue());
            ClubInfo clubInfo = clubInfoMapper.selectById(member.getClubId());
            if (clubInfo != null) {
                info.setClubName(clubInfo.getName());
            }
            info.setRole(member.getType());
            // 设置角色名称
            switch (member.getType()) {
                case 0:
                    info.setRoleName("普通成员");
                    break;
                case 1:
                    info.setRoleName("管理员");
                    break;
                case 2:
                    info.setRoleName("社长");
                    break;
                default:
                    info.setRoleName("未知");
            }
            info.setJoinTime(member.getCreateTime());
            info.setStatus(member.getStatus());
            return info;
        }).toList();
        
        detailVO.setClubs(clubs);
        detailVO.setClubCount(clubs.size());
        
        // 查询用户参与的活动
        LambdaQueryWrapper<ClubActivityApply> activityWrapper = new LambdaQueryWrapper<>();
        activityWrapper.eq(ClubActivityApply::getUserId, id.longValue())
                     .orderByDesc(ClubActivityApply::getCreateTime);
        List<ClubActivityApply> activityApplies = clubActivityApplyMapper.selectList(activityWrapper);
        
        List<UserDetailVO.ActivityParticipateInfo> activities = activityApplies.stream().map(apply -> {
            UserDetailVO.ActivityParticipateInfo info = new UserDetailVO.ActivityParticipateInfo();
            info.setActivityId(apply.getActivityId());
            ClubActivity activity = clubActivityMapper.selectById(apply.getActivityId());
            if (activity != null) {
                info.setActivityName(activity.getTitle());
                ClubInfo clubInfo = clubInfoMapper.selectById(activity.getClubId());
                if (clubInfo != null) {
                    info.setClubName(clubInfo.getName());
                }
            }
            info.setStatus(apply.getStatus());
            info.setApplyTime(apply.getCreateTime());
            info.setCheckInStatus(apply.getCheckInStatus());
            return info;
        }).toList();
        
        detailVO.setActivities(activities);
        detailVO.setActivityCount(activities.size());
        
        return detailVO;
    }
}
