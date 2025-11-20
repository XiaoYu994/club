package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.ClubInfoConstant;
import com.hngy.common.constant.ClubMemberConstant;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.constant.StatusConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.*;
import com.hngy.entity.vo.ClubDetailVO;
import com.hngy.entity.vo.ClubInfoVO;
import com.hngy.entity.vo.UserVO;
import com.hngy.mapper.*;
import com.hngy.service.IClubInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * <p>
 * 社团信息表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClubInfoServiceImpl extends ServiceImpl<ClubInfoMapper, ClubInfo> implements IClubInfoService {
    private final ClubInfoMapper clubInfoMapper;
    private final ClubMemberMapper clubMemberMapper;
    private final ClubChatGroupMapper clubChatGroupMapper;
    private final UserMapper userMapper;
    private final ClubActivityMapper clubActivityMapper;
    private final ClubApplyMapper clubApplyMapper;
    private final ClubRecruitmentMapper clubRecruitmentMapper;
    private final ClubActivityApplyMapper clubActivityApplyMapper;
    private final ClubChatGroupMemberMapper clubChatGroupMemberMapper;

    @Override
    public PageResult<ClubInfoVO> queryPage(ClubDTO clubDTO) {

        // 根据排序号排序 当前面的字段都没有才会根据排序号排序
        Page<ClubInfo> page = clubDTO.toPage();

        // 使用LambdaQueryWrapper代替QueryWrapper，这样可以使用方法引用
        LambdaQueryWrapper<ClubInfo> wrapper = new LambdaQueryWrapper<>();

        // 1.  关键词搜索（社团名称、描述、地点）
        if (StringUtils.hasText(clubDTO.getKeyword())) {
            // 在and 方法中凭借 or 在mybatisPlus中where 后面的条件是直接在()里面的 只要有一个or为true 后面的and条件就没有用了
            wrapper.and(w -> w.like(ClubInfo::getName, clubDTO.getKeyword())
                    .or()
                    .like(ClubInfo::getDescription, clubDTO.getKeyword())
                    .or()
                    .like(ClubInfo::getAddress, clubDTO.getKeyword()));
        }
        // 2.状态筛选，被禁用的社团不显示
        wrapper.eq(ClubInfo::getStatus, StatusConstant.ENABLE);
        //WHERE ((name LIKE ? OR description LIKE ? OR address LIKE ?) AND status = ?)

        // 3.根据社团类型筛选
        if (clubDTO.getType() != null) {
            wrapper.eq(ClubInfo::getType, clubDTO.getType());
        }

        // 4. 根据招新状态筛选：isRecruiting=true 时只显示当前招新中的社团
        if (clubDTO.getIsRecruiting() != null) {
            long now = System.currentTimeMillis();
            // 从 Mapper 获取当前招新中的社团ID列表
            List<Long> recruitingClubIds = clubInfoMapper.selectRecruitingClubIds(now);
            if (clubDTO.getIsRecruiting()) {
                // 只包含正在招新的社团，若列表为空则使用不可能匹配的ID防止SQL IN ()错误
                if (recruitingClubIds.isEmpty()) {
                    wrapper.eq(ClubInfo::getId, -1L);
                } else {
                    wrapper.in(ClubInfo::getId, recruitingClubIds);
                }
            } else {
                // 排除正在招新的社团
                if (!recruitingClubIds.isEmpty()) {
                    wrapper.notIn(ClubInfo::getId, recruitingClubIds);
                }
            }
        }
        // 执行分页查询
        page = clubInfoMapper.selectPage(page, wrapper);

        // 转换结果并返回
        return PageResult.of(page, ClubInfoVO.class);
    }

    @Override
    public List<ClubInfoVO> getMyClubs(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<ClubMember> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubMember::getUserId, userId.intValue())
               .eq(ClubMember::getStatus, ClubInfoConstant.MEMBER_STATUS_NORMAL);
        List<ClubMember> members = clubMemberMapper.selectList(wrapper);
        if (members.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> clubIds = members.stream()
            .map(ClubMember::getClubId)
            .map(Long::valueOf)
            .toList();
        List<ClubInfo> infos = clubInfoMapper.selectBatchIds(clubIds);
        return infos.stream()
            .map(info -> BeanUtil.copyProperties(info, ClubInfoVO.class))
            .toList();
    }

    @Override
    public List<ClubInfoVO> getTopTenClubs() {
        // 查询启用的社团并按order_num升序，取前十条
        LambdaQueryWrapper<ClubInfo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ClubInfo::getStatus, StatusConstant.ENABLE)
               .orderByAsc(ClubInfo::getOrderNum)
               .last("LIMIT 10");
        List<ClubInfo> list = clubInfoMapper.selectList(wrapper);
        return list.stream()
                   .map(info -> BeanUtil.copyProperties(info, ClubInfoVO.class))
                   .collect(Collectors.toList());
    }

    @Override
    public PageResult<ClubInfoVO> getClubs(ClubDTO clubDTO) {

        // 根据排序字段排序
        Page<ClubInfo> page = clubDTO.toPage("order_num", true);

        // 使用LambdaQueryWrapper代替QueryWrapper，这样可以使用方法引用
        LambdaQueryWrapper<ClubInfo> wrapper = new LambdaQueryWrapper<>();

        // 1. 社团名称搜索
        if (StringUtils.hasText(clubDTO.getName())) {
            wrapper.like(ClubInfo::getName, clubDTO.getName());
        }

        // 2. 关键词搜索（社团名称、描述、地点）
        if (StringUtils.hasText(clubDTO.getKeyword())) {
            wrapper.and(w -> w.like(ClubInfo::getName, clubDTO.getKeyword())
                    .or()
                    .like(ClubInfo::getDescription, clubDTO.getKeyword())
                    .or()
                    .like(ClubInfo::getAddress, clubDTO.getKeyword()));
        }

        // 3. 状态筛选
        if (clubDTO.getStatus() != null) {
            wrapper.eq(ClubInfo::getStatus, clubDTO.getStatus());
        }

        // 4. 社团类型筛选
        if (clubDTO.getType() != null) {
            wrapper.eq(ClubInfo::getType, clubDTO.getType());
        }

        // 5. 招新状态筛选
        if (clubDTO.getIsRecruiting() != null) {
            long now = System.currentTimeMillis();
            List<Long> recruitingClubIds = clubInfoMapper.selectRecruitingClubIds(now);
            if (clubDTO.getIsRecruiting()) {
                if (recruitingClubIds.isEmpty()) {
                    wrapper.eq(ClubInfo::getId, -1L);
                } else {
                    wrapper.in(ClubInfo::getId, recruitingClubIds);
                }
            } else {
                if (!recruitingClubIds.isEmpty()) {
                    wrapper.notIn(ClubInfo::getId, recruitingClubIds);
                }
            }
        }

        // 执行分页查询
        page = clubInfoMapper.selectPage(page, wrapper);
        // 转换结果并返回
        return PageResult.of(page, ClubInfoVO.class);
    }

    @Override
    public ClubDetailVO getClubDetail(Long id) {
        // 查询社团基本信息
        ClubInfo clubInfo = clubInfoMapper.selectById(id);
        if (clubInfo == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.CLUB_NOT_FOUND);
        }

        ClubDetailVO detailVO = BeanUtil.copyProperties(clubInfo, ClubDetailVO.class);
        
        // 设置社团类型名称
        switch (clubInfo.getType()) {
            case 0:
                detailVO.setTypeName("普通社团");
                break;
            case 1:
                detailVO.setTypeName("院级社团");
                break;
            case 2:
                detailVO.setTypeName("校级社团");
                break;
            default:
                detailVO.setTypeName("未知类型");
        }

        // 查询社长信息
        LambdaQueryWrapper<ClubMember> presidentWrapper = new LambdaQueryWrapper<>();
        presidentWrapper.eq(ClubMember::getClubId, clubInfo.getId().intValue())
                       .eq(ClubMember::getType, ClubMemberConstant.ROLE_PRESIDENT)
                       .eq(ClubMember::getStatus, ClubInfoConstant.MEMBER_STATUS_NORMAL);
        ClubMember president = clubMemberMapper.selectOne(presidentWrapper);
        
        if (president != null) {
            User presidentUser = userMapper.selectById(president.getUserId());
            if (presidentUser != null) {
                UserVO presidentVO = BeanUtil.copyProperties(presidentUser, UserVO.class);
                detailVO.setPresident(presidentVO);
            }
        }

        // 统计成员数据
        LambdaQueryWrapper<ClubMember> memberWrapper = new LambdaQueryWrapper<>();
        memberWrapper.eq(ClubMember::getClubId, clubInfo.getId().intValue())
                    .eq(ClubMember::getStatus, ClubInfoConstant.MEMBER_STATUS_NORMAL);
        List<ClubMember> members = clubMemberMapper.selectList(memberWrapper);
        
        detailVO.setTotalMembers(members.size());
        
        // 统计不同类型的成员
        int normalMembers = 0;
        int officers = 0;
        int presidents = 0;
        
        for (ClubMember member : members) {
            Integer memberType = member.getType();
            if (ClubMemberConstant.ROLE_NORMAL.equals(memberType)) {
                normalMembers++;
            } else if (ClubMemberConstant.ROLE_ADMIN.equals(memberType) || 
                       ClubMemberConstant.ROLE_VICE_PRESIDENT.equals(memberType)) {
                officers++;  // 管理员和副社长都算作干部
            } else if (ClubMemberConstant.ROLE_PRESIDENT.equals(memberType)) {
                presidents++;  // 社长单独统计
            } else {
                normalMembers++;  // 未知类型默认为普通成员
            }
        }
        
        detailVO.setNormalMembers(normalMembers);
        detailVO.setOfficers(officers);
        detailVO.setTeachers(presidents);  // 暂时用teachers字段存储社长数量，或者考虑修改VO字段名

        // 统计活动数量
        LambdaQueryWrapper<ClubActivity> activityWrapper = new LambdaQueryWrapper<>();
        activityWrapper.eq(ClubActivity::getClubId, clubInfo.getId());
        Long activityCount = clubActivityMapper.selectCount(activityWrapper);
        detailVO.setActivityCount(activityCount.intValue());

        // 统计招新数量
        LambdaQueryWrapper<ClubRecruitment> recruitmentWrapper = new LambdaQueryWrapper<>();
        recruitmentWrapper.eq(ClubRecruitment::getClubId, clubInfo.getId());
        Long recruitmentCount = clubRecruitmentMapper.selectCount(recruitmentWrapper);
        detailVO.setRecruitmentCount(recruitmentCount.intValue());

        // 统计申请人数
        LambdaQueryWrapper<ClubApply> applyWrapper = new LambdaQueryWrapper<>();
        applyWrapper.eq(ClubApply::getClubId, clubInfo.getId());
        Long applicationCount = clubApplyMapper.selectCount(applyWrapper);
        detailVO.setApplicationCount(applicationCount.intValue());

        return detailVO;
    }

    @Override
    @Transactional
    public boolean updateClub(Long id, ClubUpdateDTO clubUpdateDTO) {
        ClubInfo club = clubInfoMapper.selectById(id);
        if (club == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.CLUB_NOT_FOUND);
        }

        // 更新社团信息
        if (StringUtils.hasText(clubUpdateDTO.getName())) {
            club.setName(clubUpdateDTO.getName());
        }
        if (StringUtils.hasText(clubUpdateDTO.getDescription())) {
            club.setDescription(clubUpdateDTO.getDescription());
        }
        if (StringUtils.hasText(clubUpdateDTO.getLogo())) {
            club.setLogo(clubUpdateDTO.getLogo());
        }
        if (clubUpdateDTO.getType() != null) {
            club.setType(clubUpdateDTO.getType());
        }
        if (clubUpdateDTO.getOrderNum() != null) {
            club.setOrderNum(clubUpdateDTO.getOrderNum());
        }
        if (StringUtils.hasText(clubUpdateDTO.getAddress())) {
            club.setAddress(clubUpdateDTO.getAddress());
        }
        if (StringUtils.hasText(clubUpdateDTO.getContact())) {
            club.setContact(clubUpdateDTO.getContact());
        }
        if (StringUtils.hasText(clubUpdateDTO.getForms())) {
            club.setForms(clubUpdateDTO.getForms());
        }

        club.setUpdateTime(System.currentTimeMillis());
        return clubInfoMapper.updateById(club) > 0;
    }

    @Override
    @Transactional
    public boolean createClub(ClubInfoDTO clubInfoDTO) {
        ClubInfo club = new ClubInfo();
        BeanUtil.copyProperties(clubInfoDTO, club);
        club.setCreateTime(System.currentTimeMillis()); // 创建时间
        club.setStatus(StatusConstant.ENABLE); // 默认启用社团

        Long creatorId = clubInfoDTO.getCreateUserId();
        if (creatorId == null) {
            creatorId = BaseContext.getCurrentId();
        }
        if (creatorId == null) {
            throw new ServiceException(HttpStatus.UNAUTHORIZED.value(), MessageConstant.USER_NOT_FOUND);
        }
        club.setCreateUserId(creatorId.intValue()); // 系统创建人ID
        clubInfoMapper.insert(club);
        // 创建一个社团后自己生成一个该社团下的聊天群组
        ClubChatGroup chatGroup = new ClubChatGroup();
        chatGroup.setClubId(club.getId().intValue());
        chatGroup.setName(club.getName());
        chatGroup.setAvatar(club.getLogo());
        chatGroup.setOwnerId(creatorId.intValue());
        chatGroup.setCreateTime(System.currentTimeMillis());
        chatGroup.setType(ClubInfoConstant.GROUP_TYPE_PUBLIC); // 设置为公共群类型
        clubChatGroupMapper.insert(chatGroup);
        // 该成员自动加入该社团
        User creator = userMapper.selectById(creatorId.intValue());
        if (creator == null) {
            log.warn("Creator user {} not found in user table, skip auto member binding", creatorId);
            return true;
        }
        ClubMember member = new ClubMember();
        member.setClubId(club.getId().intValue());
        member.setUserId(creatorId);
        member.setType(ClubMemberConstant.ROLE_PRESIDENT); // 直接是社长
        member.setStatus(ClubInfoConstant.MEMBER_STATUS_NORMAL);
        member.setJoinTime(System.currentTimeMillis());
        member.setCreateTime(System.currentTimeMillis());
        clubMemberMapper.insert(member);
        // 该成员自动加入聊天群组
        ClubChatGroupMember clubChatGroupMember = new ClubChatGroupMember();
        clubChatGroupMember.setGroupId(chatGroup.getId()); // 使用正确的群组ID
        clubChatGroupMember.setUserId(creatorId.intValue()); // 用户Id
        return clubChatGroupMemberMapper.insert(clubChatGroupMember)>0;
    }

    @Override
    @Transactional
    public boolean deleteClub(Long id) {
        // 查询该社团下的所有活动
        List<ClubActivity> activities = clubActivityMapper.selectList(new LambdaQueryWrapper<ClubActivity>().eq(ClubActivity::getClubId, id));
        // 删除该社团下的所有活动
        clubActivityMapper.deleteByClubId(id);
        // 删除该社团下所有活动的报名记录
        if(activities != null && !activities.isEmpty()) {
            clubActivityApplyMapper.deleteBatchIds(activities);
        }
        // 删除该社团下的招新
        clubRecruitmentMapper.deleteByClubId(id);
        // 删除该社团下的所有招新报名数据
        clubApplyMapper.deleteApplyByClubId(id);
        // 删除该社团下的所有成员
        clubMemberMapper.deleteByClubId(id);
        // 删除该社团下的所有聊天群组
        clubChatGroupMapper.deleteByClubId(id);
        // 删除该社团
        return clubInfoMapper.deleteById(id)>0;
    }

    @Override
    public boolean updateClubStatus(ClubStatusDTO updateClubStatus) {
        ClubInfo club = clubInfoMapper.selectById(updateClubStatus.getClubId());
        if (club == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.CLUB_NOT_FOUND);
        }
        club.setStatus(updateClubStatus.getStatus());
        club.setUpdateTime(System.currentTimeMillis());
        return clubInfoMapper.updateById(club) > 0;
    }
    
    @Override
    public boolean updateClubOrder(ClubOrderDTO updateClubOrder) {
        ClubInfo club = clubInfoMapper.selectById(updateClubOrder.getClubId());
        if (club == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), MessageConstant.CLUB_NOT_FOUND);
        }
        club.setOrderNum(updateClubOrder.getOrderNum());
        club.setUpdateTime(System.currentTimeMillis());
        return clubInfoMapper.updateById(club) > 0;
    }
}
