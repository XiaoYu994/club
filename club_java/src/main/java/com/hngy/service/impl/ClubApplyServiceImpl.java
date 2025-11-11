package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.util.IdUtil;
import cn.hutool.extra.qrcode.QrCodeUtil;
import cn.hutool.extra.qrcode.QrConfig;
import cn.hutool.http.HttpStatus;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.*;
import com.hngy.entity.vo.*;
import com.hngy.mapper.*;
import com.hngy.service.IChatService;
import com.hngy.service.IClubApplyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * <p>
 * 社团申请表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClubApplyServiceImpl extends ServiceImpl<ClubApplyMapper, ClubApply> implements IClubApplyService {

    private final ClubApplyMapper clubApplyMapper;
    private final UserMapper userMapper;
    private final ClubRecruitmentMapper clubRecruitmentMapper;
    private final ClubMemberMapper clubMemberMapper;
    private final ClubInfoMapper clubInfoMapper;
    private final ClubActivityMapper clubActivityMapper;
    private final ClubActivityApplyMapper clubActivityApplyMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final IChatService chatService;
    private final ClubChatGroupMapper chatGroupMapper;

    @Override
    public String applyJoinClub(Long clubId, Map<String, Object> formData) {
        // 获取当前用户ID
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new ServiceException(HttpStatus.HTTP_UNAUTHORIZED, "用户未登录");
        }

        // 检查是否已经是社团成员
        LambdaQueryWrapper<ClubMember> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(ClubMember::getClubId, clubId.intValue())
                     .eq(ClubMember::getUserId, userId);
        if (clubMemberMapper.selectCount(memberWrapper) > 0) {
            throw new ServiceException(HttpStatus.HTTP_CONFLICT, "已经是社团成员，不能重复申请");
        }

        // 检查是否有正在进行中的申请
        LambdaQueryWrapper<ClubApply> applyWrapper = new LambdaQueryWrapper<>();
        applyWrapper.eq(ClubApply::getClubId, clubId.intValue())
                    .eq(ClubApply::getUserId, userId.intValue())
                    .in(ClubApply::getStatus, 0, 3); // 状态为待审核或已面试
        if (clubApplyMapper.selectCount(applyWrapper) > 0) {
            throw new ServiceException(HttpStatus.HTTP_CONFLICT, "已有待处理的申请，请勿重复提交");
        }

        // 获取当前有效的招新信息
        LambdaQueryWrapper<ClubRecruitment> recruitmentWrapper = new LambdaQueryWrapper<>();
        recruitmentWrapper.eq(ClubRecruitment::getClubId, clubId.intValue())
                          .eq(ClubRecruitment::getStatus, 1) // 状态为进行中
                          .le(ClubRecruitment::getStartTime, System.currentTimeMillis())
                          .ge(ClubRecruitment::getEndTime, System.currentTimeMillis())
                          .orderByDesc(ClubRecruitment::getCreateTime)
                          .last("LIMIT 1");
        ClubRecruitment recruitment = clubRecruitmentMapper.selectOne(recruitmentWrapper);
        
        if (recruitment == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "当前社团没有进行中的招新活动");
        }

        // 创建申请记录
        ClubApply apply = new ClubApply();
        apply.setUserId(userId.intValue());
        apply.setClubId(clubId.intValue());
        apply.setRecruitmentId(recruitment.getId());
        apply.setStatus(0); // 待审核
        apply.setForms(JSON.toJSONString(formData));
        apply.setCreateTime(System.currentTimeMillis());
        apply.setUpdateTime(System.currentTimeMillis());

        // 保存申请记录
        clubApplyMapper.insert(apply);

        // 更新招新申请人数
        recruitment.setJoinCount(recruitment.getJoinCount() + 1);
        clubRecruitmentMapper.updateById(recruitment);

        return "申请提交成功，请等待审核";
    }

    @Override
    @Transactional
    public boolean reviewApply(Long applyId, ReviewApplyDTO reviewApplyDTO) {
        // 获取申请记录
        ClubApply apply = clubApplyMapper.selectById(applyId);
        if (apply == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "申请记录不存在");
        }

        // 检查申请状态，只有待审核和已面试的申请才能被审核
        if (apply.getStatus() != 0 && apply.getStatus() != 3) {
            throw new ServiceException(HttpStatus.HTTP_CONFLICT, "该申请已审核，不可重复操作");
        }

        // 更新申请状态和反馈
        apply.setStatus(reviewApplyDTO.getStatus());
        apply.setFeedback(reviewApplyDTO.getFeedback());
        apply.setUpdateTime(System.currentTimeMillis());
        
        // 如果审核通过且状态为"已通过"，则添加为社团成员
        if (reviewApplyDTO.getStatus() == 1) {
            // 创建社团成员记录
            ClubMember member = new ClubMember();
            member.setUserId(Long.valueOf(apply.getUserId()));
            member.setClubId(apply.getClubId());
            member.setType(0); // 普通成员
            member.setStatus(1); // 正常状态
            member.setJoinTime(System.currentTimeMillis());
            member.setCreateTime(System.currentTimeMillis());
            member.setUpdateTime(System.currentTimeMillis());
            
            // 保存成员记录
            clubMemberMapper.insert(member);
            
            // 将申请状态更新为已入社
            apply.setStatus(4);
            
            // 更新招新通过人数
            ClubRecruitment recruitment = clubRecruitmentMapper.selectById(apply.getRecruitmentId());
            if (recruitment != null) {
                recruitment.setPassCount(recruitment.getPassCount() + 1);
                clubRecruitmentMapper.updateById(recruitment);
            }
            // 更新社团成员数
            ClubInfo clubInfo = clubInfoMapper.selectById(apply.getClubId());
            if (clubInfo != null) {
                Integer count = clubInfo.getMemberCount() == null ? 0 : clubInfo.getMemberCount();
                clubInfo.setMemberCount(count + 1);
                clubInfoMapper.updateById(clubInfo);
                
                // 检查是否已有聊天群组，如果没有则创建
                ClubChatGroup chatGroup = findOrCreateClubChatGroup(clubInfo);
                
                // 将新成员添加到聊天群组
                if (chatGroup != null) {
                    chatService.addUserToGroup(chatGroup.getId(), Long.valueOf(apply.getUserId()), false);
                }
            }
        }
        
        // 更新申请记录
        return updateById(apply);
    }
    
    /**
     * 查找或创建社团聊天群组
     * @param clubInfo 社团信息
     * @return 社团聊天群组
     */
    private ClubChatGroup findOrCreateClubChatGroup(ClubInfo clubInfo) {
        // 查询是否已有该社团的公共聊天群组
        LambdaQueryWrapper<ClubChatGroup> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubChatGroup::getClubId, clubInfo.getId().intValue())
               .eq(ClubChatGroup::getType, 0); // 公共群
        
        ClubChatGroup chatGroup = chatGroupMapper.selectOne(wrapper);
        
        // 如果不存在则创建
        if (chatGroup == null) {
            // 创建社团聊天群组
            Integer groupId = chatService.createClubChatGroup(
                    clubInfo.getId().intValue(),
                    clubInfo.getName(),
                    Long.valueOf(clubInfo.getCreateUserId())
            );
            
            if (groupId != null) {
                chatGroup = chatGroupMapper.selectById(groupId);
            }
        }
        
        return chatGroup;
    }

    @Override
    public PageResult<ClubApplyListVO> queryPage(Long clubId, ClubMemberDTO clubMemberDTO) {
        // 参数校验
        if (clubId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "缺少参数");
        }

        // 创建分页对象
        Page<ClubApply> page = clubMemberDTO.toPage();

        // 构建查询条件
        LambdaQueryWrapper<ClubApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubApply::getClubId, clubId);
        
        // 如果有状态过滤条件
        if (clubMemberDTO.getStatus() != null) {
            // 已通过包含审核通过(status=1)和已入社(status=4)
            if (clubMemberDTO.getStatus().equals(1)) {
                wrapper.in(ClubApply::getStatus, Arrays.asList(1, 4));
            } else {
                wrapper.eq(ClubApply::getStatus, clubMemberDTO.getStatus());
            }
        }

        
        // 如果有关键字搜索
        if (clubMemberDTO.getKeyword() != null && !clubMemberDTO.getKeyword().isEmpty()) {
            // 通过用户名搜索
            List<Long> userIds = userMapper.selectList(
                new LambdaQueryWrapper<User>().like(User::getUsername, clubMemberDTO.getKeyword())
            ).stream().map(User::getId).toList();
            
            if (!userIds.isEmpty()) {
                wrapper.in(ClubApply::getUserId, userIds);
            } else {
                // 没有找到匹配的用户，返回空结果
                return PageResult.empty(page);
            }
        }
        
        // 按更新时间倒序排序
        wrapper.orderByDesc(ClubApply::getUpdateTime);
        
        // 执行查询
        page = clubApplyMapper.selectPage(page, wrapper);
        
        // 构建返回结果
        return PageResult.of(page, apply -> {
            ClubApplyListVO vo = new ClubApplyListVO();
            BeanUtil.copyProperties(apply, vo);
            
            // 查询用户信息
            User user = userMapper.selectById(apply.getUserId());
            if (user != null) {
                // 设置用户信息
                UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
                vo.setUser(userVO);
            }
            
            return vo;
        });
    }

    @Override
    public Map<String, Object> countApplies(Long clubId) {
        // 参数校验
        if (clubId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "缺少参数");
        }
        
        // 查询各状态的申请数量
        Map<String, Object> counts = new HashMap<>();
        
        // 待审核的申请数量
        LambdaQueryWrapper<ClubApply> pendingWrapper = new LambdaQueryWrapper<>();
        pendingWrapper.eq(ClubApply::getClubId, clubId.intValue()).eq(ClubApply::getStatus, 0);
        counts.put("pending", clubApplyMapper.selectCount(pendingWrapper));
        
        // 已通过的申请数量
        LambdaQueryWrapper<ClubApply> approvedWrapper = new LambdaQueryWrapper<>();
        // 包含审核通过(status=1)和已入社(status=4)
        approvedWrapper.eq(ClubApply::getClubId, clubId.intValue()).in(ClubApply::getStatus, Arrays.asList(1, 4));
        counts.put("approved", clubApplyMapper.selectCount(approvedWrapper));
        
        // 已拒绝的申请数量
        LambdaQueryWrapper<ClubApply> rejectedWrapper = new LambdaQueryWrapper<>();
        rejectedWrapper.eq(ClubApply::getClubId, clubId.intValue()).eq(ClubApply::getStatus, 2);
        counts.put("rejected", clubApplyMapper.selectCount(rejectedWrapper));
        
        // 已面试的申请数量
        LambdaQueryWrapper<ClubApply> interviewedWrapper = new LambdaQueryWrapper<>();
        interviewedWrapper.eq(ClubApply::getClubId, clubId.intValue()).eq(ClubApply::getStatus, 3);
        counts.put("interviewed", clubApplyMapper.selectCount(interviewedWrapper));
        
        // 已入社的申请数量
        LambdaQueryWrapper<ClubApply> joinedWrapper = new LambdaQueryWrapper<>();
        joinedWrapper.eq(ClubApply::getClubId, clubId.intValue()).eq(ClubApply::getStatus, 4);
        counts.put("joined", clubApplyMapper.selectCount(joinedWrapper));
        
        // 总申请数量
        LambdaQueryWrapper<ClubApply> totalWrapper = new LambdaQueryWrapper<>();
        totalWrapper.eq(ClubApply::getClubId, clubId.intValue());
        counts.put("total", clubApplyMapper.selectCount(totalWrapper));
        
        return counts;
    }
    
    // ================ 活动相关方法 ================
    
    @Override
    @Transactional
    public ClubActivityApplyVO isApply(Long id) {
        if (id == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, MessageConstant.MISSING_PARAMETERS);
        }
        // 根据活动Id查询该用户是否报名
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new ServiceException(HttpStatus.HTTP_UNAUTHORIZED, MessageConstant.USER_NOT_LOGIN);
        }
        // 增加该活动的浏览量
        int count = clubActivityMapper.addViewCount(id);
        if (count == 0)
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.UPDATE_VIEW_COUNT_FAILED);
        ClubActivityApply apply;
        try {
            LambdaQueryWrapper<ClubActivityApply> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(ClubActivityApply::getActivityId, id)
                  .eq(ClubActivityApply::getUserId, userId);
            apply = clubActivityApplyMapper.selectOne(wrapper);
        } catch (Exception e) {
            // 如果报错就是不止有一个值，也就是该用户重复报名了这个活动
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, MessageConstant.ALREADY_REGISTERED);
        }
        return BeanUtil.copyProperties(apply, ClubActivityApplyVO.class);
    }

    @Override
    @Transactional
    public String applyActivity(Long activityId, Map<String, Object> formData) {
        // 判断活动是否存在
        if (clubActivityMapper.selectById(activityId) == null) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.ACTIVITY_NOT_FOUND);
        }
        Long userId = BaseContext.getCurrentId();
        if (userId == null) {
            throw new ServiceException(HttpStatus.HTTP_UNAUTHORIZED, MessageConstant.USER_NOT_LOGIN);
        }
        ClubActivityApply clubActivityApply = new ClubActivityApply();
        clubActivityApply.setActivityId(activityId);
        clubActivityApply.setUserId(userId);
        // 填写表单数据
        // 将 formData 转换为 JSON 格式
        String formDataJson = JSON.toJSONString(formData);
        clubActivityApply.setForms(formDataJson); // 存储 JSON 格式的表单数据
        // 创建时间
        clubActivityApply.setCreateTime(System.currentTimeMillis());
        // 原子操作：更新活动参与人数 (+1)
        int updateCount = clubActivityMapper.addJoinCount(activityId); // 使用Mapper自定义方法

        // 检查更新是否成功
        if (updateCount == 0) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.UPDATE_PARTICIPANT_COUNT_FAILED);
        }
        // 插入一条活动记录
        return clubActivityApplyMapper.insert(clubActivityApply) > 0 ? MessageConstant.SAVE_SUCCESS : MessageConstant.SAVE_ERROR;
    }

    @Override
    public PageResult<ClubApplyListVO> queryActivityApplies(Long activityId, ClubActivityApplyDTO activityApplyDTO) {
        // 根据创建时间排序
        Page<ClubActivityApply> page = activityApplyDTO.toPageDefaultSortByCreateTime();
        LambdaQueryWrapper<ClubActivityApply> wrapper = new LambdaQueryWrapper<>();
        if (activityApplyDTO.getStatus() != null) {
            wrapper.eq(ClubActivityApply::getStatus, activityApplyDTO.getStatus());
        }
        wrapper.eq(ClubActivityApply::getActivityId, activityId);
        // 里面有UserId
        page = clubActivityApplyMapper.selectPage(page, wrapper);
        // 通过page中的UserId查询用户信息
        // 将查询结果转换为 ClubApplyListVO 列表
        return PageResult.of(page, apply -> {
            ClubApplyListVO vo = new ClubApplyListVO();
            BeanUtil.copyProperties(apply, vo);
            // 查询用户信息并设置到 ClubApplyListVO 中
            User user = userMapper.selectById(apply.getUserId());
            if (user != null) {
                UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
                vo.setUser(userVO);
            }
            return vo;
        });
    }

    @Override
    @Transactional
    public boolean deleteActivityApply(Long applyId) {
        // 1. 获取报名记录
        ClubActivityApply apply = clubActivityApplyMapper.selectById(applyId);
        if (apply == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, MessageConstant.REGISTRATION_RECORD_NOT_FOUND);
        }

        // 2. 原子操作：减少活动参与人数
        int updateCount = clubActivityMapper.subJoinCount(apply.getActivityId());

        if (updateCount == 0) {
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, MessageConstant.UPDATE_PARTICIPANT_COUNT_FAILED);
        }

        // 3. 删除报名记录
        return clubActivityApplyMapper.deleteById(applyId) > 0;
    }

    @Override
    @Transactional
    public boolean reviewActivityApply(Long applyId, ReviewApplyDTO reviewApplyDTO) {
        // 1. 获取报名记录
        ClubActivityApply apply = clubActivityApplyMapper.selectById(applyId);
        if (apply == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, MessageConstant.REGISTRATION_RECORD_NOT_FOUND);
        }

        // 2. 检查是否重复审核
        if (apply.getStatus() != null && !apply.getStatus().equals(StatusConstant.DISABLE)) {
            throw new ServiceException(HttpStatus.HTTP_CONFLICT, MessageConstant.APPLICATION_ALREADY_REVIEWED);
        }

        apply.setStatus(reviewApplyDTO.getStatus());
        apply.setFeedback(reviewApplyDTO.getFeedback());
        apply.setUpdateTime(System.currentTimeMillis());

        // 3. 执行更新
        return clubActivityApplyMapper.updateById(apply) > 0;
    }

    @Override
    public SignCodeVO createSignCode(SingCodeDTO singCodeDTO) {
        // 参数校验
        if (singCodeDTO.getActivityId() == null || singCodeDTO.getApplyId() == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "活动ID和报名ID不能为空");
        }

        // 验证报名信息
        ClubActivityApply apply = clubActivityApplyMapper.selectById(singCodeDTO.getApplyId());
        if (apply == null || !singCodeDTO.getActivityId().equals(apply.getActivityId())) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "报名信息不存在或不匹配");
        }

        // 验证报名状态
        if (apply.getStatus() != 1) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "报名未通过审核，无法生成签到码");
        }

        // 验证活动是否已开始
        ClubActivity activity = clubActivityMapper.selectById(singCodeDTO.getActivityId());
        if (activity == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "活动不存在");
        }

        long currentTime = System.currentTimeMillis();
        if (currentTime < activity.getStartTime()) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "活动未开始，无法生成签到码");
        }

        // 生成随机签到码
        String checkInCode = IdUtil.fastSimpleUUID().substring(0, 8).toUpperCase();

        // 设置过期时间，如果前端没给过期时间就默认1分钟
        long expireMinutes = singCodeDTO.getExpireMinutes() != null ? singCodeDTO.getExpireMinutes() : 1;
        // 验证码失效时间
        long expireTime = System.currentTimeMillis() + expireMinutes * 60 * 1000;

        // 构建签到码信息
        SignCodeInfo signCodeInfo = new SignCodeInfo();
        signCodeInfo.setActivityId(singCodeDTO.getActivityId());
        signCodeInfo.setApplyId(singCodeDTO.getApplyId());
        signCodeInfo.setUserId(apply.getUserId());
        signCodeInfo.setExpireTime(expireTime);

        // 存储到Redis，设置过期时间
        String redisKey = "activity:sign_code:" + checkInCode;
        redisTemplate.opsForValue().set(redisKey, signCodeInfo, expireMinutes, TimeUnit.MINUTES);

        // 生成二维码Base64
        String qrCodeBase64;
        try {
            QrConfig config = new QrConfig(300, 300);
            qrCodeBase64 = QrCodeUtil.generateAsBase64(checkInCode, config, "png");
        } catch (Exception e) {
            log.error("生成二维码失败", e);
            throw new ServiceException(HttpStatus.HTTP_INTERNAL_ERROR, "生成二维码失败");
        }

        // 构建返回结果
        SignCodeVO result = new SignCodeVO();
        result.setCheckInCode(checkInCode);
        result.setExpireTime(expireTime);
        result.setQrCodeUrl(qrCodeBase64); // Hutool生成的Base64已经包含data:image/png;base64,前缀
        return result;
    }

    @Override
    public CheckInResultVO verifyCheckInCode(CheckInResultDTO request) {
        // 参数校验
        if (request.getActivityId() == null || StringUtils.isBlank(request.getCheckInCode())) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "活动ID和签到码不能为空");
        }
        // 从Redis获取签到码信息
        String redisKey = "activity:sign_code:" + request.getCheckInCode();
        SignCodeInfo signCodeInfo = (SignCodeInfo) redisTemplate.opsForValue().get(redisKey);
        // 验证签到码是否存在
        if (signCodeInfo == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "签到码不存在或已过期");
        }
        // 验证活动ID是否匹配
        if (!signCodeInfo.getActivityId().equals(request.getActivityId())) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "签到码与活动不匹配");
        }
        // 验证是否过期
        if (System.currentTimeMillis() > signCodeInfo.getExpireTime()) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "签到码已过期");
        }
        // 更新报名信息的签到状态
        ClubActivityApply apply = clubActivityApplyMapper.selectById(signCodeInfo.getApplyId());
        if (apply == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "报名信息不存在");
        }
        // 检查用户Id是否匹配
        if (!apply.getUserId().equals(signCodeInfo.getUserId())) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "用户Id不匹配");
        }
        // 检查是否已签到
        if (apply.getCheckInStatus() != null && apply.getCheckInStatus().equals(StatusConstant.ENABLE)) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "用户已完成签到，请勿重复操作");
        }
        // 更新签到状态
        long checkInTime = System.currentTimeMillis();
        apply.setCheckInStatus(StatusConstant.ENABLE);
        apply.setCheckInTime(checkInTime);
        clubActivityApplyMapper.updateById(apply);
        // 删除Redis中的签到码
        redisTemplate.delete(redisKey);
        // 构建返回结果
        CheckInResultVO result = new CheckInResultVO();
        result.setApplyId(signCodeInfo.getApplyId());
        result.setUserId(signCodeInfo.getUserId());
        result.setCheckInTime(checkInTime);
        return result;
    }

    @Override
    public List<ClubActivityApplyVO> getMyActivityApplies(Long userId) {
        if (userId == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "用户未登录");
        }
        LambdaQueryWrapper<ClubActivityApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubActivityApply::getUserId, userId.intValue());
        List<ClubActivityApply> applies = clubActivityApplyMapper.selectList(wrapper);
        if (applies.isEmpty()) {
            return Collections.emptyList();
        }
        return applies.stream()
            .map(apply -> BeanUtil.copyProperties(apply, ClubActivityApplyVO.class))
            .collect(Collectors.toList());
    }

    @Override
    public List<MyClubApplyVO> getMyClubApplies(Long userId) {
        // 查询用户的所有社团申请记录
        LambdaQueryWrapper<ClubApply> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubApply::getUserId, userId)
               .orderByDesc(ClubApply::getCreateTime);
        List<ClubApply> applies = this.list(wrapper);
        if (applies.isEmpty()) {
            return new ArrayList<>();
        }

        // 获取相关的社团和招新信息
        Set<Integer> clubIds = applies.stream().map(ClubApply::getClubId).collect(Collectors.toSet());
        Set<Integer> recruitmentIds = applies.stream()
            .map(ClubApply::getRecruitmentId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

        // 查询社团信息
        List<ClubInfo> clubs = new ArrayList<>();
        if (!clubIds.isEmpty()) {
            LambdaQueryWrapper<ClubInfo> clubWrapper = new LambdaQueryWrapper<>();
            clubWrapper.in(ClubInfo::getId, clubIds);
            clubs = clubInfoMapper.selectList(clubWrapper);
        }
        Map<Integer, ClubInfo> clubMap = clubs.stream()
            .collect(Collectors.toMap(club -> club.getId().intValue(), club -> club));

        // 查询招新信息
        List<ClubRecruitment> recruitments = new ArrayList<>();
        if (!recruitmentIds.isEmpty()) {
            LambdaQueryWrapper<ClubRecruitment> recruitmentWrapper = new LambdaQueryWrapper<>();
            recruitmentWrapper.in(ClubRecruitment::getId, recruitmentIds);
            recruitments = clubRecruitmentMapper.selectList(recruitmentWrapper);
        }
        Map<Integer, ClubRecruitment> recruitmentMap = recruitments.stream()
            .collect(Collectors.toMap(ClubRecruitment::getId, recruitment -> recruitment));

        // 组装返回数据
        return applies.stream().map(apply -> {
            MyClubApplyVO vo = new MyClubApplyVO();
            vo.setId(apply.getId());
            vo.setClubId(apply.getClubId());
            vo.setRecruitmentId(apply.getRecruitmentId());
            vo.setStatus(apply.getStatus());
            vo.setFeedback(apply.getFeedback());
            vo.setForms(apply.getForms());
            vo.setCreateTime(apply.getCreateTime());
            vo.setUpdateTime(apply.getUpdateTime());

            // 设置社团信息
            ClubInfo club = clubMap.get(apply.getClubId());
            if (club != null) {
                vo.setClubName(club.getName());
                vo.setClubLogo(club.getLogo());
            }

            // 设置招新信息
            if (apply.getRecruitmentId() != null) {
                ClubRecruitment recruitment = recruitmentMap.get(apply.getRecruitmentId());
                if (recruitment != null) {
                    vo.setRecruitmentTitle(recruitment.getTitle());
                }
            }

            return vo;
        }).collect(Collectors.toList());
    }

}
