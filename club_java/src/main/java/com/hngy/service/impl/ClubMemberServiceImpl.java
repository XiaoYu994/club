package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.ClubMemberConstant;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ClubMemberDTO;
import com.hngy.entity.dto.UpdateRoleDTO;
import com.hngy.entity.po.ClubChatGroup;
import com.hngy.entity.po.ClubInfo;
import com.hngy.entity.po.ClubMember;
import com.hngy.entity.po.User;
import com.hngy.entity.vo.ClubMemberVO;
import com.hngy.entity.vo.UserVO;
import com.hngy.mapper.*;
import com.hngy.service.IChatService;
import com.hngy.service.IClubMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.dromara.x.file.storage.core.FileInfo;
import org.dromara.x.file.storage.core.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * <p>
 * 社团成员表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-20
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClubMemberServiceImpl extends ServiceImpl<ClubMemberMapper, ClubMember> implements IClubMemberService {
    private final ClubMemberMapper clubMemberMapper;
    private final UserMapper userMapper;
    private final ClubInfoMapper clubInfoMapper;
    private final ClubChatGroupMapper chatGroupMapper;
    private final ClubChatGroupMemberMapper chatGroupMemberMapper;
    private final IChatService chatService;
    private final FileStorageService fileStorageService;
    
    @Override
    public ClubMemberVO isMember(Long clubId) {
        if(clubId == null){
            // 缺少参数
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);
        }
        Long userId = BaseContext.getCurrentId();
        if(userId == null){
            // 返回401错误
            throw new ServiceException(HttpStatus.UNAUTHORIZED.value(), MessageConstant.USER_NOT_FOUND);
        }
        final ClubMember clubMember = lambdaQuery().eq(ClubMember::getUserId, userId)
                .eq(ClubMember::getClubId, clubId.intValue())
                .one();
        return BeanUtil.copyProperties(clubMember, ClubMemberVO.class);
    }

    /**
     * @desc: 分页查询社团成员，根据社团ID和关键字
     * @Author:  XiaoYu
     * @date:  2025/7/12 上午11:39
    **/
    @Override
    public PageResult<ClubMemberVO> queryPage(Long clubId, ClubMemberDTO clubMemberDTO) {
        if (clubId == null) throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);

        // 1. 获取分页参数
        Page<ClubMember> page = clubMemberDTO.toPage();

        // 2. 创建查询条件
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getClubId, clubId.intValue());
        if (clubMemberDTO.getKeyword() != null) {
            // 查询用户表，获取匹配的 userId 列表
            List<Long> userIds = userMapper.selectList(
                    new LambdaQueryWrapper<User>().like(User::getUsername, clubMemberDTO.getKeyword())
            ).stream().map(User::getId).collect(Collectors.toList());

            // 如果没有匹配的用户，直接返回空结果
            if (userIds.isEmpty()) {
                return PageResult.empty(page);
            }

            // 在 ClubMember 查询中使用 userIds
            wrapper.in(ClubMember::getUserId, userIds);
        }
        // 根据角色  0 是普通用户 非0是管理员
        if(clubMemberDTO.getType() != null ){
            if(clubMemberDTO.getType() == ClubMemberConstant.ROLE_NORMAL) {
                // 普通用户
                wrapper.eq(ClubMember::getType, ClubMemberConstant.ROLE_NORMAL);
            }else{
                // 管理员
                wrapper.ne(ClubMember::getType, ClubMemberConstant.ROLE_NORMAL);
            }
        }
        // 根据成员状态过滤 0=禁用,1=正常,2=退社申请中
        if (clubMemberDTO.getStatus() != null) {
            wrapper.eq(ClubMember::getStatus, clubMemberDTO.getStatus());
        }

        // 3. 查询 ClubMember 数据
        page = clubMemberMapper.selectPage(page, wrapper);

        // 4. 构建返回结果
        return PageResult.of(page, clubMember ->{
            ClubMemberVO vo = new ClubMemberVO();
            BeanUtil.copyProperties(clubMember, vo);
            // 查询用户信息并设置到 VO 中
            UserVO userInfo = getUserInfo(clubMember.getUserId());
            vo.setUser(userInfo);
            return vo;
        });
    }


    @Override
    @Transactional
    public boolean quitClub(Long clubId) {
        if (clubId == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);
        }
        
        // 获取当前用户ID
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new ServiceException(HttpStatus.UNAUTHORIZED.value(), MessageConstant.USER_NOT_LOGIN);
        }
        
        // 查询会员记录
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getClubId, clubId)
               .eq(ClubMember::getUserId, userId);
        ClubMember member = clubMemberMapper.selectOne(wrapper);
        
        if (member == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_NOT_MEMBER);
        }
        
        // 检查是否为社长，社长不能直接退出
        if (member.getType() == ClubMemberConstant.ROLE_PRESIDENT) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_PRESIDENT_QUIT);
        }
        
        // 更新退出时间
        member.setQuitTime(System.currentTimeMillis());
        member.setUpdateTime(System.currentTimeMillis());
        
        // 删除成员记录
        boolean result = clubMemberMapper.deleteById(member.getId()) > 0;
        
        // 更新社团成员数
        if (result) {
            ClubInfo clubInfo = clubInfoMapper.selectById(clubId);
            if (clubInfo != null && clubInfo.getMemberCount() > 0) {
                clubInfo.setMemberCount(clubInfo.getMemberCount() - 1);
                clubInfoMapper.updateById(clubInfo);
                
                // 从聊天群组中移除用户
                removeUserFromClubChatGroups(clubId.intValue(), userId);
            }
        }
        
        return result;
    }

    @Override
    @Transactional
    public boolean updateRole(UpdateRoleDTO data) {
        // 校验参数
        if (data == null || data.getClubId() == null || data.getUserId() == null || data.getType() == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);
        }

        // 验证角色类型
        if (data.getType() < 0 || data.getType() > 3) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_INVALID_ROLE);
        }
        
        // 查询成员记录
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getClubId, data.getClubId())
               .eq(ClubMember::getUserId, data.getUserId());
        ClubMember member = clubMemberMapper.selectOne(wrapper);
        
        if (member == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_USER_NOT_MEMBER);
        }
        
        // 如果是设置社长，需要检查是否已有社长
        if (data.getType() == ClubMemberConstant.ROLE_PRESIDENT) {
            LambdaQueryWrapper<ClubMember> presidentWrapper = new LambdaQueryWrapper<>();
            presidentWrapper.eq(ClubMember::getClubId, data.getClubId())
                           .eq(ClubMember::getType, data.getType())
                           .ne(ClubMember::getUserId, data.getUserId());
            if (clubMemberMapper.selectCount(presidentWrapper) > 0) {
                throw new ServiceException(HttpStatus.CONFLICT.value(), ClubMemberConstant.ERROR_PRESIDENT_EXISTS);
            }
        }
        
        // 更新角色
        member.setType(data.getType());
        member.setUpdateTime(System.currentTimeMillis());

        
        return clubMemberMapper.updateById(member) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean removeMember(Map<String, Object> data) {
        // 校验参数
        if (data == null || !data.containsKey("clubId") || !data.containsKey("userId")) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);
        }
        
        // 获取参数
        Integer clubId = Integer.valueOf(data.get("clubId").toString());
        Long userId = Long.valueOf(data.get("userId").toString());
        
        // 查询成员记录
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getClubId, clubId)
               .eq(ClubMember::getUserId, userId);
        ClubMember member = clubMemberMapper.selectOne(wrapper);
        
        if (member == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_USER_NOT_MEMBER);
        }
        
        // 不能移除社长
        if (member.getType() == ClubMemberConstant.ROLE_PRESIDENT) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_REMOVE_PRESIDENT);
        }
        
        // 更新退出时间
        member.setQuitTime(System.currentTimeMillis());
        member.setUpdateTime(System.currentTimeMillis());
        
        // 删除成员记录
        boolean result = clubMemberMapper.deleteById(member.getId()) > 0;
        
        // 更新社团成员数
        if (result) {
            ClubInfo clubInfo = clubInfoMapper.selectById(clubId);
            if (clubInfo != null && clubInfo.getMemberCount() > 0) {
                clubInfo.setMemberCount(clubInfo.getMemberCount() - 1);
                clubInfoMapper.updateById(clubInfo);
                
                // 从聊天群组中移除用户
                removeUserFromClubChatGroups(clubId, userId);
            }
        }
        
        return result;
    }

    @Override
    @Transactional
    public boolean updateStatus(Map<String, Object> data) {
        // 校验参数
        if (data == null || data.get("clubId") == null || data.get("userId") == null || data.get("status") == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.MISSING_PARAMETERS);
        }
        
        Integer clubId = Integer.parseInt(data.get("clubId").toString());
        Long userId = Long.parseLong(data.get("userId").toString());
        Integer status = Integer.parseInt(data.get("status").toString());
        
        // 验证状态值
        if (status < 0 || status > 2) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_INVALID_STATUS);
        }
        
        // 查询成员记录
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getClubId, clubId)
               .eq(ClubMember::getUserId, userId);
        ClubMember member = clubMemberMapper.selectOne(wrapper);
        
        if (member == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_USER_NOT_MEMBER);
        }
        
        // 更新状态
        member.setStatus(status);
        return clubMemberMapper.updateById(member) > 0;
    }
    
    @Override
    public Map<String, Object> exportClubMembers(Long clubId) {
        if (clubId == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ClubMemberConstant.ERROR_EMPTY_CLUB_ID);
        }
        
        // 查询社团信息
        ClubInfo clubInfo = clubInfoMapper.selectById(clubId);
        if (clubInfo == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), ClubMemberConstant.ERROR_CLUB_NOT_FOUND);
        }
        
        // 验证当前用户是否有权限（只有社团管理员才能导出）
        Long currentUserId = BaseContext.getCurrentId();
        if (currentUserId == null) {
            throw new ServiceException(HttpStatus.UNAUTHORIZED.value(), MessageConstant.USER_NOT_LOGIN);
        }
        
        // 查询当前用户在社团中的角色
        ClubMember currentMember = lambdaQuery()
                .eq(ClubMember::getClubId, clubId.intValue())
                .eq(ClubMember::getUserId, currentUserId)
                .one();
        
        if (currentMember == null || currentMember.getType() < ClubMemberConstant.ROLE_ADMIN) {
            throw new ServiceException(HttpStatus.FORBIDDEN.value(), ClubMemberConstant.ERROR_NO_PERMISSION);
        }
        
        // 获取所有成员
        List<ClubMember> members = lambdaQuery()
                .eq(ClubMember::getClubId, clubId.intValue())
                .orderByDesc(ClubMember::getType)
                .orderByAsc(ClubMember::getJoinTime)
                .list();
        
        try {
            // 创建工作簿和工作表
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("社团成员名单");
            
            // 添加标题行显示社团名称
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("社团名称：" + clubInfo.getName());
            // 合并标题行单元格（0列到7列）
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));
            
            // 创建标题行样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            // 创建标题行
            Row headerRow = sheet.createRow(1);
            String[] headers = {"序号", "用户ID", "姓名", "学号", "学院", "角色", "状态", "加入时间"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }
            
            // 填充数据行
            if (members != null && !members.isEmpty()) {
                for (int i = 0; i < members.size(); i++) {
                    ClubMember member = members.get(i);
                    Row row = sheet.createRow(i + 2);
                    
                    row.createCell(0).setCellValue(i + 1); // 序号
                    row.createCell(1).setCellValue(member.getUserId()); // 用户ID
                    
                    // 查询用户信息
                    User user = userMapper.selectById(member.getUserId());
                    String username = (user != null && user.getUsername() != null) ? user.getUsername() : "未知";
                    String studentId = (user != null && user.getStudentId() != null) ? user.getStudentId() : "";
                    String college = (user != null && user.getCollege() != null) ? user.getCollege() : "";
                    
                    row.createCell(2).setCellValue(username); // 姓名
                    row.createCell(3).setCellValue(studentId); // 学号
                    row.createCell(4).setCellValue(college); // 学院
                    
                    // 角色
                    String role;
                    switch (member.getType()) {
                        case 0: role = ClubMemberConstant.ROLE_NORMAL_DESC; break;
                        case 1: role = ClubMemberConstant.ROLE_ADMIN_DESC; break;
                        case 2: role = ClubMemberConstant.ROLE_PRESIDENT_DESC; break;
                        case 3: role = ClubMemberConstant.ROLE_VICE_PRESIDENT_DESC; break;
                        default: role = ClubMemberConstant.ROLE_UNKNOWN_DESC; break;
                    }
                    row.createCell(5).setCellValue(role);
                    
                    // 状态
                    String status;
                    switch (member.getStatus()) {
                        case 0: status = ClubMemberConstant.STATUS_DISABLED_DESC; break;
                        case 1: status = ClubMemberConstant.STATUS_NORMAL_DESC; break;
                        case 2: status = ClubMemberConstant.STATUS_QUIT_PENDING_DESC; break;
                        default: status = ClubMemberConstant.STATUS_UNKNOWN_DESC; break;
                    }
                    row.createCell(6).setCellValue(status);
                    
                    // 加入时间
                    row.createCell(7).setCellValue(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date(member.getJoinTime())));
                }
            }
            
            // 将工作簿写入字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] bytes = outputStream.toByteArray();
            workbook.close();
            
            // 上传到文件存储服务
            String objectName = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")) + "/";
            String fileName = clubInfo.getName() + "成员名单" + "_" + System.currentTimeMillis() + ".xlsx";
            
            FileInfo fileInfo = fileStorageService.of(bytes)
                    .setOriginalFilename(fileName)
                    .setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .setPath(objectName)
                    .upload();
            
            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("url", fileInfo.getUrl());
            result.put("fileName", fileName);
            return result;
            
        } catch (IOException e) {
            log.error("导出社团成员名单失败", e);
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR.value(), ClubMemberConstant.ERROR_EXPORT_FAILED + e.getMessage());
        }
    }

    private UserVO getUserInfo(Long userId) {
        User user = userMapper.selectById(userId);
        return user != null ? BeanUtil.copyProperties(user, UserVO.class) : new UserVO();
    }

    /**
     * 将用户从社团所有聊天群组中移除
     * @param clubId 社团ID
     * @param userId 用户ID
     */
    private void removeUserFromClubChatGroups(Integer clubId, Long userId) {
        // 查询社团的所有聊天群组
        LambdaQueryWrapper<ClubChatGroup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatGroup::getClubId, clubId);
        List<ClubChatGroup> chatGroups = chatGroupMapper.selectList(wrapper);
        
        if (chatGroups.isEmpty()) {
            return;
        }
        
        // 从每个群组中移除用户
        for (ClubChatGroup chatGroup : chatGroups) {
            chatService.removeUserFromGroup(chatGroup.getId(), userId);
        }
    }
}
