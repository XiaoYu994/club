package com.hngy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.ActivityConstant;
import com.hngy.common.constant.ApplyStatusConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ActivityStatusDTO;
import com.hngy.entity.dto.ClubActivityDTO;
import com.hngy.entity.po.*;
import com.hngy.entity.vo.ActivityDetailVO;
import com.hngy.entity.vo.ActivityStatsVO;
import com.hngy.entity.vo.ClubActivityVO;
import com.hngy.mapper.*;
import com.hngy.service.IClubActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.dromara.x.file.storage.core.FileInfo;
import org.dromara.x.file.storage.core.FileStorageService;
import org.springframework.beans.BeanUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.hngy.common.constant.ActivityConstant.*;

/**
 * <p>
 * 社团活动表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClubActivityServiceImpl extends ServiceImpl<ClubActivityMapper, ClubActivity> implements IClubActivityService {
    private final ClubActivityMapper clubActivityMapper;
    private final ClubActivityApplyMapper clubActivityApplyMapper;
    private final ClubMemberMapper clubMemberMapper;
    private final ClubInfoMapper clubInfoMapper;
    private final FileStorageService fileStorageService;
    private final UserMapper userMapper;

    @Override
    public PageResult<ClubActivityVO> queryPage(ClubActivityDTO clubActivityDTO) {
        // 查询启用的社团ID列表
        List<Long> enabledClubIds = clubActivityMapper.selectEnabledClubActivityIds();

        Page<ClubActivity> page = null;
        if (clubActivityDTO.getOrderBy() != null) {
            page = clubActivityDTO.toPage();
        }else{
            page = clubActivityDTO.toPageDefaultSortByCreateTime();
        }
        // 使用LambdaQueryWrapper代替QueryWrapper，这样可以使用方法引用
        LambdaQueryWrapper<ClubActivity> wrapper = new LambdaQueryWrapper<>();

        // 只查询status=2(进行中)和status=3(已结束)的活动
        // 排除status=0(已取消)和status=1(计划中)的活动
        wrapper.in(ClubActivity::getStatus, Arrays.asList(STATUS_ACTIVE, STATUS_ENDED));

        // 1. 分组关键词搜索（标题、描述、地点），确保与其他条件正确组合
        if (StringUtils.hasText(clubActivityDTO.getKeyword())) {
            wrapper.and(w -> w.like(ClubActivity::getTitle, clubActivityDTO.getKeyword())
                    .or()
                    .like(ClubActivity::getDescription, clubActivityDTO.getKeyword())
                    .or()
                               .like(ClubActivity::getAddress, clubActivityDTO.getKeyword()));
        }

        // 2. 状态筛选
        if (clubActivityDTO.getStatus() != null) {
            wrapper.eq(ClubActivity::getStatus, clubActivityDTO.getStatus());
        }
        // 3. 时间范围筛选
        if (clubActivityDTO.getStartTime() != null) {
            wrapper.ge(ClubActivity::getStartTime, clubActivityDTO.getStartTime());
        }

        if (clubActivityDTO.getEndTime() != null) {
            wrapper.le(ClubActivity::getEndTime, clubActivityDTO.getEndTime());
        }

        // 3. 社团ID筛选
        if (clubActivityDTO.getClubId() != null) {
            wrapper.eq(ClubActivity::getClubId, clubActivityDTO.getClubId());
        }

        // 4. 社团类型筛选
        // 根据社团类型筛选活动：需要从club_info表查询对应类型的社团ID，然后筛选活动
        if (clubActivityDTO.getClubType() != null && clubActivityDTO.getClubType() != -1) {
            // 查询指定类型的社团ID列表
            LambdaQueryWrapper<ClubInfo> clubWrapper = new LambdaQueryWrapper<>();
            clubWrapper.eq(ClubInfo::getType, clubActivityDTO.getClubType())
                       .eq(ClubInfo::getStatus, StatusConstant.ENABLE); // 只查询启用的社团
            List<ClubInfo> clubs = clubInfoMapper.selectList(clubWrapper);

            if (!clubs.isEmpty()) {
                // 获取社团ID列表
                List<Long> clubIdsByType = clubs.stream()
                    .map(ClubInfo::getId)
                    .collect(java.util.stream.Collectors.toList());

                // 与启用的社团ID取交集
                List<Long> finalClubIds = enabledClubIds.stream()
                    .filter(clubIdsByType::contains)
                    .collect(java.util.stream.Collectors.toList());

                if (!finalClubIds.isEmpty()) {
                    // 更新enabledClubIds为过滤后的结果
                    enabledClubIds = finalClubIds;
                } else {
                    // 如果交集为空，说明没有符合条件的活动
                    wrapper.eq(ClubActivity::getId, -1L);
                    page = clubActivityMapper.selectPage(page, wrapper);
                    return PageResult.of(page, ClubActivityVO.class);
                }
            } else {
                // 如果没有找到对应类型的社团，返回空结果
                wrapper.eq(ClubActivity::getId, -1L);
                page = clubActivityMapper.selectPage(page, wrapper);
                return PageResult.of(page, ClubActivityVO.class);
            }
        }


        // 筛选启用的社团活动
        if (!enabledClubIds.isEmpty()) {
            wrapper.in(ClubActivity::getClubId, enabledClubIds);
        } else {
            // 如果没有启用的活动，返回空结果
            wrapper.eq(ClubActivity::getId, -1L);
        }
        // 执行分页查询
        page = clubActivityMapper.selectPage(page, wrapper);

        // 转换结果并返回
        return PageResult.of(page, ClubActivityVO.class);
    }

    @Override
    public ActivityStatsVO getActivityStats(Long activityId) {
        if (activityId == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ActivityConstant.ERROR_EMPTY_ACTIVITY_ID);
        }

        // 查询活动是否存在
        ClubActivity activity = clubActivityMapper.selectById(activityId);
        if (activity == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ActivityConstant.ERROR_ACTIVITY_NOT_FOUND);
        }

        ActivityStatsVO statsVO = new ActivityStatsVO();
        statsVO.setActivityId(activityId);

        // 查询报名总人数
        LambdaQueryWrapper<ClubActivityApply> totalWrapper = new LambdaQueryWrapper<>();
        totalWrapper.eq(ClubActivityApply::getActivityId, activityId);
        long totalApplies = clubActivityApplyMapper.selectCount(totalWrapper);
        statsVO.setTotalApplies((int)totalApplies);

        // 查询审核通过人数
        LambdaQueryWrapper<ClubActivityApply> approvedWrapper = new LambdaQueryWrapper<>();
        approvedWrapper.eq(ClubActivityApply::getActivityId, activityId)
                      .eq(ClubActivityApply::getStatus, ApplyStatusConstant.APPROVED);
        long approvedApplies = clubActivityApplyMapper.selectCount(approvedWrapper);
        statsVO.setApprovedApplies((int)approvedApplies);

        // 查询拒绝人数
        LambdaQueryWrapper<ClubActivityApply> rejectedWrapper = new LambdaQueryWrapper<>();
        rejectedWrapper.eq(ClubActivityApply::getActivityId, activityId)
                      .eq(ClubActivityApply::getStatus, ApplyStatusConstant.REJECTED);
        long rejectedApplies = clubActivityApplyMapper.selectCount(rejectedWrapper);
        statsVO.setRejectedApplies((int)rejectedApplies);

        // 查询待审核人数
        LambdaQueryWrapper<ClubActivityApply> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(ClubActivityApply::getActivityId, activityId)
                     .eq(ClubActivityApply::getStatus, ApplyStatusConstant.PENDING);
        long pendingApplies = clubActivityApplyMapper.selectCount(pendingWrapper);
        statsVO.setPendingApplies((int)pendingApplies);

        // 查询签到人数
        LambdaQueryWrapper<ClubActivityApply> checkedInWrapper = new LambdaQueryWrapper<>();
        checkedInWrapper.eq(ClubActivityApply::getActivityId, activityId)
                       .eq(ClubActivityApply::getCheckInStatus, ApplyStatusConstant.CHECKED_IN);
        long checkedInCount = clubActivityApplyMapper.selectCount(checkedInWrapper);
        statsVO.setCheckedInCount((int)checkedInCount);

        // 计算签到率
        if (approvedApplies > 0) {
            double checkInRate = (double) checkedInCount / approvedApplies * 100;
            statsVO.setCheckInRate(Math.round(checkInRate * 100) / 100.0); // 保留两位小数
        } else {
            statsVO.setCheckInRate(0.0);
        }

        // 查询社团成员参与人数
        List<ClubActivityApply> applies = clubActivityApplyMapper.selectList(totalWrapper);
        int memberCount = 0;
        int nonMemberCount = 0;

        if (applies != null && !applies.isEmpty()) {
            Integer clubId = activity.getClubId();
            for (ClubActivityApply apply : applies) {
                // 查询是否为社团成员
                LambdaQueryWrapper<ClubMember> memberWrapper = new LambdaQueryWrapper<>();
                memberWrapper.eq(ClubMember::getClubId, clubId)
                            .eq(ClubMember::getUserId, apply.getUserId());
                if (clubMemberMapper.selectCount(memberWrapper) > 0) {
                    memberCount++;
                } else {
                    nonMemberCount++;
                }
            }
        }

        statsVO.setMemberCount(memberCount);
        statsVO.setNonMemberCount(nonMemberCount);

        return statsVO;
    }

    @Override
    public ActivityDetailVO getActivityDetail(Long activityId) {
        if (activityId == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ActivityConstant.ERROR_EMPTY_ACTIVITY_ID);
        }

        // 查询活动基本信息
        ClubActivity activity = clubActivityMapper.selectById(activityId);
        if (activity == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), ActivityConstant.ERROR_ACTIVITY_NOT_FOUND);
        }

        ActivityDetailVO detailVO = new ActivityDetailVO();
        BeanUtils.copyProperties(activity, detailVO);

        // 设置活动状态名称
        String statusName = switch (activity.getStatus()) {
            case 0 -> "取消";
            case 1 -> "计划中";
            case 2 -> "进行中";
            case 3 -> "已结束";
            default -> "未知状态";
        };
        detailVO.setStatusName(statusName);

        // 查询社团信息
        if (activity.getClubId() != null) {
            ClubInfo clubInfo = clubInfoMapper.selectById(activity.getClubId());
            if (clubInfo != null) {
                detailVO.setClubName(clubInfo.getName());
            }
        }



        // 统计报名数据
        LambdaQueryWrapper<ClubActivityApply> applyWrapper = new LambdaQueryWrapper<>();
        applyWrapper.eq(ClubActivityApply::getActivityId, activityId);
        List<ClubActivityApply> allApplies = clubActivityApplyMapper.selectList(applyWrapper);
        
        detailVO.setTotalApplies(allApplies.size());

        // 统计不同状态的报名
        int pendingApplies = 0;
        int approvedApplies = 0;
        int rejectedApplies = 0;
        int checkedInCount = 0;

        for (ClubActivityApply apply : allApplies) {
            if (ApplyStatusConstant.PENDING.equals(apply.getStatus())) {
                pendingApplies++;
            } else if (ApplyStatusConstant.APPROVED.equals(apply.getStatus())) {
                approvedApplies++;
            } else if (ApplyStatusConstant.REJECTED.equals(apply.getStatus())) {
                rejectedApplies++;
            }

            if (ApplyStatusConstant.CHECKED_IN.equals(apply.getCheckInStatus())) {
                checkedInCount++;
            }
        }

        detailVO.setPendingApplies(pendingApplies);
        detailVO.setApprovedApplies(approvedApplies);
        detailVO.setRejectedApplies(rejectedApplies);
        detailVO.setCheckedInCount(checkedInCount);

        // 计算签到率
        if (approvedApplies > 0) {
            double checkInRate = (double) checkedInCount / approvedApplies * 100;
            detailVO.setCheckInRate(Math.round(checkInRate * 100) / 100.0);
        } else {
            detailVO.setCheckInRate(0.0);
        }

        // 统计社团成员参与情况
        int memberCount = 0;
        int nonMemberCount = 0;

        if (!allApplies.isEmpty() && activity.getClubId() != null) {
            for (ClubActivityApply apply : allApplies) {
                // 查询是否为社团成员
                LambdaQueryWrapper<ClubMember> memberWrapper = new LambdaQueryWrapper<>();
                memberWrapper.eq(ClubMember::getClubId, activity.getClubId())
                           .eq(ClubMember::getUserId, apply.getUserId());
                if (clubMemberMapper.selectCount(memberWrapper) > 0) {
                    memberCount++;
                } else {
                    nonMemberCount++;
                }
            }
        }

        detailVO.setMemberCount(memberCount);
        detailVO.setNonMemberCount(nonMemberCount);

        return detailVO;
    }

    @Override
    public Map<String, Object> exportApplyList(Long activityId) {
        if (activityId == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ActivityConstant.ERROR_EMPTY_ACTIVITY_ID);
        }

        // 查询活动信息
        ClubActivity activity = clubActivityMapper.selectById(activityId);
        if (activity == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), ActivityConstant.ERROR_ACTIVITY_NOT_FOUND);
        }

        // 查询报名记录
        LambdaQueryWrapper<ClubActivityApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubActivityApply::getActivityId, activityId)
              .orderByDesc(ClubActivityApply::getCreateTime);
        List<ClubActivityApply> applies = clubActivityApplyMapper.selectList(wrapper);

        try {
            // 创建工作簿和工作表
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("报名名单");

            // 添加标题行显示活动名称
            Row titleRow = sheet.createRow(0);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("活动名称：" + activity.getTitle());
            // 合并标题行单元格（0列到8列）
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

            // 创建标题行样式
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 创建标题行
            Row headerRow = sheet.createRow(1);
            String[] headers = {"序号", "用户ID", "姓名", "学号", "学院", "专业", "状态", "是否签到", "报名时间"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 4000);
            }

            // 填充数据行
            if (applies != null && !applies.isEmpty()) {
                for (int i = 0; i < applies.size(); i++) {
                    ClubActivityApply apply = applies.get(i);
                    Row row = sheet.createRow(i + 2);

                    row.createCell(0).setCellValue(i + 1); // 序号
                    row.createCell(1).setCellValue(apply.getUserId()); // 用户ID

                    // 查询用户信息
                    User user = userMapper.selectById(apply.getUserId());
                    String username = (user != null && user.getUsername() != null) ? user.getUsername() : "未知";
                    String studentId = (user != null && user.getStudentId() != null) ? user.getStudentId() : "";
                    String college = (user != null && user.getCollege() != null) ? user.getCollege() : "";
                    String major = (user != null && user.getMajor() != null) ? user.getMajor() : "";

                    row.createCell(2).setCellValue(username); // 姓名
                    row.createCell(3).setCellValue(studentId); // 学号
                    row.createCell(4).setCellValue(college); // 学院
                    row.createCell(5).setCellValue(major); // 专业

                    // 状态
                    String status;
                    Integer applyStatus = apply.getStatus();
                    if (ApplyStatusConstant.PENDING.equals(applyStatus)) {
                        status = ActivityConstant.APPLY_STATUS_PENDING_DESC;
                    } else if (ApplyStatusConstant.APPROVED.equals(applyStatus)) {
                        status = ActivityConstant.APPLY_STATUS_APPROVED_DESC;
                    } else if (ApplyStatusConstant.REJECTED.equals(applyStatus)) {
                        status = ActivityConstant.APPLY_STATUS_REJECTED_DESC;
                    } else {
                        status = ActivityConstant.APPLY_STATUS_UNKNOWN_DESC;
                    }
                    row.createCell(6).setCellValue(status);

                    // 是否签到
                    row.createCell(7).setCellValue(apply.getCheckInStatus().equals(ApplyStatusConstant.CHECKED_IN) ? 
                        ActivityConstant.CHECK_IN_STATUS_YES_DESC : ActivityConstant.CHECK_IN_STATUS_NO_DESC);

                    // 报名时间
                    row.createCell(8).setCellValue(apply.getCreateTime());
                }
            }

            // 将工作簿写入字节数组
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            byte[] bytes = outputStream.toByteArray();
            workbook.close();

            // 上传到文件存储服务
            String objectName = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")) + "/";
            String fileName = activity.getTitle() + "报名名单" + "_" + System.currentTimeMillis() + ".xlsx";

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
            log.error("导出活动报名名单失败", e);
            throw new ServiceException(HttpStatus.INTERNAL_SERVER_ERROR.value(), ActivityConstant.ERROR_EXPORT_FAILED + e.getMessage());
        }
    }

    @Override
    public PageResult<ClubActivityVO> getActivity(ClubActivityDTO clubActivityDTO) {
        // 根据创建时间排序 降序
        Page<ClubActivity> page = clubActivityDTO.toPageDefaultSortByCreateTime();

        // 使用LambdaQueryWrapper代替QueryWrapper，这样可以使用方法引用
        LambdaQueryWrapper<ClubActivity> wrapper = new LambdaQueryWrapper<>();

        // 1. 分组关键词搜索（标题、描述、地点），确保与其他条件正确组合
        if (StringUtils.hasText(clubActivityDTO.getKeyword())) {
            wrapper.and(w -> w.like(ClubActivity::getTitle, clubActivityDTO.getKeyword())
                    .or()
                    .like(ClubActivity::getDescription, clubActivityDTO.getKeyword())
                    .or()
                    .like(ClubActivity::getAddress, clubActivityDTO.getKeyword()));
        }
        // 执行分页查询
        page = clubActivityMapper.selectPage(page, wrapper);

        // 转换结果并返回 填充社团名称
        return PageResult.of(page, activity -> {
            ClubActivityVO vo = new ClubActivityVO();
            BeanUtils.copyProperties(activity, vo);
            vo.setClubName(getClubName(activity.getClubId()));
            return vo;
        }
        );
    }

    @Override
    public boolean updateActivityStatus(ActivityStatusDTO activityStatusDTO) {
        final ClubActivity clubActivity = clubActivityMapper.selectById(activityStatusDTO.getActivityId());
        if (clubActivity == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), ActivityConstant.ERROR_ACTIVITY_NOT_FOUND);
        }
        if (activityStatusDTO.getStatus() == null || activityStatusDTO.getStatus() > 3 || activityStatusDTO.getStatus()<0) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), ActivityConstant.ERROR_INVALID_PARAMS);
        }
        clubActivity.setStatus(activityStatusDTO.getStatus());
        return clubActivityMapper.updateById(clubActivity) > 0;
    }

    @Override
    public boolean updateById(ClubActivity activity) {
        // 获取当前时间的毫秒数
        Long currentTime = System.currentTimeMillis();

        // 当社团管理员修改活动后，将状态重置为"计划中"，需要管理员重新审批
        // status = 1 (计划中)
        activity.setStatus(STATUS_PENDING);

        // 设置更新时间
        activity.setUpdateTime(currentTime);

        // 返回更新是否成功
        return clubActivityMapper.updateById(activity) > 0;
    }

    private String getClubName(Integer clubId) {
        ClubInfo clubInfo = clubInfoMapper.selectById(clubId);
        if (clubInfo == null) {
            throw new ServiceException(HttpStatus.NOT_FOUND.value(), ActivityConstant.ERROR_ACTIVITY_NOT_FOUND);
        }
        return clubInfo.getName();
    }
}