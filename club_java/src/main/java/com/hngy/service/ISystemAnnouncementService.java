package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.NoticeDTO;
import com.hngy.entity.dto.NoticePageDTO;
import com.hngy.entity.po.SystemAnnouncement;
import com.hngy.entity.vo.NoticeVO;

import java.util.List;

/**
 * <p>
 * 系统公告表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-07-20
 */
public interface ISystemAnnouncementService extends IService<SystemAnnouncement> {

    /**
     * @desc: 分页查询系统公告
     * @Author:  XiaoYu
     * @date:  2025/7/21 上午11:06
    **/
    PageResult<NoticeVO> getNotices(NoticePageDTO noticePageDTO);

    /**
     * @desc: 获取最近系统公告
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午10:11
    **/
    List<NoticeVO> getRecentNotices();

    /**
     * @desc: 获取系统公告详情
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午10:11
    **/
    NoticeVO getNoticeDetail(Integer id);

    /**
     * @desc: 创建系统公告
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午10:51
    **/
    Boolean createNotice(NoticeDTO noticeDTO);

    /**
     * @desc: 修改系统公告
     * @Author:  XiaoYu
     * @date:  2025/7/24 上午10:51
    **/
    Boolean updateNotice(Integer id, NoticeDTO noticeDTO);

    /**
     * @desc: 设置公告置顶状态
     * @Author:  XiaoYu
     * @date:  2025/7/25 上午10:00
    **/
    Boolean updateTopStatus(Integer id, Integer isTop);
}
