package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.http.HttpStatus;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.MessageConstant;
import com.hngy.common.context.BaseContext;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.NoticeDTO;
import com.hngy.entity.dto.NoticePageDTO;
import com.hngy.entity.po.Admin;
import com.hngy.entity.po.SystemAnnouncement;
import com.hngy.entity.vo.NoticeVO;
import com.hngy.mapper.AdminMapper;
import com.hngy.mapper.SystemAnnouncementMapper;
import com.hngy.service.ISystemAnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * <p>
 * 系统公告表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-07-20
 */
@Service
@RequiredArgsConstructor
public class SystemAnnouncementServiceImpl extends ServiceImpl<SystemAnnouncementMapper, SystemAnnouncement> implements ISystemAnnouncementService {
    private final SystemAnnouncementMapper systemAnnouncementMapper;
    private final AdminMapper adminMapper;
    @Override
    public PageResult<NoticeVO> getNotices(NoticePageDTO noticePageDTO) {
        Page<SystemAnnouncement> page = noticePageDTO.toPage();
        // 使用LambdaQueryWrapper代替QueryWrapper，这样可以使用方法引用
        LambdaQueryWrapper<SystemAnnouncement> wrapper = new LambdaQueryWrapper<>();

        // 1.  关键词搜索（公告标题、内容）
        if (StringUtils.hasText(noticePageDTO.getKeyword())) {
            // 在and 方法中凭借 or 在mybatisPlus中where 后面的条件是直接在()里面的 只要有一个or为true 后面的and条件就没有用了
            // SELECT * FROM SystemAnnouncement WHERE (title LIKE '%关键字%' OR content LIKE '%关键字%')


            wrapper.and(w -> w.like(SystemAnnouncement::getTitle, noticePageDTO.getKeyword())
                    .or()
                    .like(SystemAnnouncement::getContent, noticePageDTO.getKeyword()));
        }

        // 类型筛选
        if (noticePageDTO.getType() != null) {
            wrapper.eq(SystemAnnouncement::getType, noticePageDTO.getType());
        }
        
        // 2. 排序逻辑：如果前端没有指定排序字段，默认按置顶+创建时间排序
        if (noticePageDTO.getOrderBy() == null || noticePageDTO.getOrderBy().isEmpty()) {
            wrapper.orderByDesc(SystemAnnouncement::getIsTop)
                   .orderByDesc(SystemAnnouncement::getCreateTime);
        } else {
            // 如果指定了orderBy但不是is_top，添加二级排序
            if (!"is_top".equals(noticePageDTO.getOrderBy())) {
                wrapper.orderByDesc(SystemAnnouncement::getCreateTime);
            }
        }
        
        page = systemAnnouncementMapper.selectPage(page, wrapper);
        return PageResult.of(page, notice -> {
            NoticeVO vo = new NoticeVO();
            BeanUtils.copyProperties(notice, vo);
            // 获取公告发布者名称
            final Admin admin = adminMapper.selectById(notice.getPublisherId());
            vo.setPublisherName(admin.getUsername());
            return vo;
        });
    }

    @Override
    public List<NoticeVO> getRecentNotices() {
        // 获取最近5条公告
        return systemAnnouncementMapper.selectRecent(5);
    }

    @Override
    public NoticeVO getNoticeDetail(Integer id) {
        // 查询公告
        SystemAnnouncement notice = systemAnnouncementMapper.selectById(id);
        if (notice == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND,"公告不存在");
        }

        // 增加浏览次数
        systemAnnouncementMapper.increaseViewCount(id);

        return BeanUtil.copyProperties(notice, NoticeVO.class);
    }

    @Override
    @Transactional
    public Boolean createNotice(NoticeDTO noticeDTO) {
        // 获取当前管理员ID
        Long adminId = BaseContext.getCurrentId();
        if (adminId == null) {
            throw new ServiceException(HttpStatus.HTTP_UNAUTHORIZED, MessageConstant.USER_NOT_LOGIN);
        }

        // 获取管理员信息
        Admin admin = adminMapper.selectById(adminId);
        if (admin == null) {
            throw new ServiceException(HttpStatus.HTTP_UNAUTHORIZED, MessageConstant.USER_NOT_LOGIN);
        }

        // 创建公告对象
        SystemAnnouncement notice = new SystemAnnouncement();
        BeanUtil.copyProperties(noticeDTO, notice);
        notice.setPublisherId(adminId.intValue());
        notice.setViewCount(0);
        notice.setCreateTime(System.currentTimeMillis());
        notice.setStatus(1); // 正常状态
        
        // 设置默认值（如果DTO中没有设置的话）
        if (notice.getType() == null) {
            notice.setType(0); // 默认为普通公告
        }
        if (notice.getIsTop() == null) {
            notice.setIsTop(0); // 默认不置顶
        }

        // 插入公告
        int count = systemAnnouncementMapper.insert(notice);

        return count >0 ;
    }

    @Override
    @Transactional
    public Boolean updateNotice(Integer id, NoticeDTO noticeDTO) {
        // 查询公告
        SystemAnnouncement notice = systemAnnouncementMapper.selectById(id);
        if (notice == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND,"公告不存在");
        }

        // 更新公告信息
        notice.setTitle(noticeDTO.getTitle());
        notice.setContent(noticeDTO.getContent());
        notice.setCoverImage(noticeDTO.getCoverImage());
        notice.setUpdateTime(System.currentTimeMillis());
        
        // 如果DTO中有类型和置顶状态，也一并更新
        if (noticeDTO.getType() != null) {
            notice.setType(noticeDTO.getType());
        }
        if (noticeDTO.getIsTop() != null) {
            notice.setIsTop(noticeDTO.getIsTop());
        }

        // 更新公告
       int count =  systemAnnouncementMapper.updateById(notice);

        return count > 0;
    }

    @Override
    @Transactional
    public Boolean updateTopStatus(Integer id, Integer isTop) {
        // 检查参数
        if (id == null || isTop == null) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "参数错误");
        }
        
        // 验证置顶状态值
        if (isTop != 0 && isTop != 1) {
            throw new ServiceException(HttpStatus.HTTP_BAD_REQUEST, "置顶状态值错误");
        }
        
        // 查询公告
        SystemAnnouncement notice = systemAnnouncementMapper.selectById(id);
        if (notice == null) {
            throw new ServiceException(HttpStatus.HTTP_NOT_FOUND, "公告不存在");
        }
        
        // 更新置顶状态
        notice.setIsTop(isTop);
        notice.setUpdateTime(System.currentTimeMillis());
        
        int count = systemAnnouncementMapper.updateById(notice);

        return count > 0;
    }

}
