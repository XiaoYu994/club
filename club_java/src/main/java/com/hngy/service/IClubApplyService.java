package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.*;
import com.hngy.entity.po.ClubApply;
import com.hngy.entity.vo.*;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 社团申请表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface IClubApplyService extends IService<ClubApply> {

    /**
     * 申请加入社团
     * @param clubId 社团ID
     * @param formData 申请表单数据
     * @return 操作结果
     */
    String applyJoinClub(Long clubId, Map<String, Object> formData);

    /**
     * 审核社团加入申请
     * @param applyId 申请ID
     * @param reviewApplyDTO 审核数据
     * @return 操作结果
     */
    boolean reviewApply(Long applyId, ReviewApplyDTO reviewApplyDTO);

    /**
     * 分页查询社团申请列表
     * @param clubId 社团ID
     * @param clubMemberDTO 查询条件
     * @return 申请列表
     */
    PageResult<ClubApplyListVO> queryPage(Long clubId, ClubMemberDTO clubMemberDTO);

    /**
     * 统计社团申请数量
     * @param clubId 社团ID
     * @return 各状态申请计数
     */
    Map<String, Object> countApplies(Long clubId);
    
    /**
     * 查询当前用户是否报名该活动
     * @param id 活动ID
     * @return 报名信息
     */
    ClubActivityApplyVO isApply(Long id);
    
    /**
     * 报名活动
     * @param activityId 活动ID
     * @param formData 表单数据
     * @return 操作结果
     */
    String applyActivity(Long activityId, Map<String, Object> formData);
    
    /**
     * 查询活动报名人员
     * @param activityId 活动ID
     * @param activityApplyDTO 查询条件
     * @return 报名列表
     */
    PageResult<ClubApplyListVO> queryActivityApplies(Long activityId, ClubActivityApplyDTO activityApplyDTO);
    
    /**
     * 取消报名活动
     * @param applyId 报名ID
     * @return 操作结果
     */
    boolean deleteActivityApply(Long applyId);
    
    /**
     * 审核活动报名
     * @param applyId 报名ID
     * @param reviewApplyDTO 审核数据
     * @return 操作结果
     */
    boolean reviewActivityApply(Long applyId, ReviewApplyDTO reviewApplyDTO);
    
    /**
     * 生成活动签到码
     * @param singCodeDTO 签到码参数
     * @return 签到码信息
     */
    SignCodeVO createSignCode(SingCodeDTO singCodeDTO);
    
    /**
     * 验证签到码
     * @param request 验证请求
     * @return 签到结果
     */
    CheckInResultVO verifyCheckInCode(CheckInResultDTO request);

    /**
     * 获取当前用户报名的活动列表
     * @param userId 用户ID
     * @return 报名记录列表
     */
    List<ClubActivityApplyVO> getMyActivityApplies(Long userId);

    /**
     * 获取当前用户的社团申请记录
     * @param userId 用户ID
     * @return 社团申请记录列表
     */
    List<MyClubApplyVO> getMyClubApplies(Long userId);
}
