package com.hngy.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ClubMemberDTO;
import com.hngy.entity.dto.UpdateRoleDTO;
import com.hngy.entity.po.ClubMember;
import com.hngy.entity.vo.ClubMemberVO;

import java.util.Map;

/**
 * <p>
 * 社团成员表 服务类
 * </p>
 *
 * @author xhy
 * @since 2025-06-19
 */
public interface IClubMemberService extends IService<ClubMember> {

    /**
     * 检查用户在社团中的角色
     * @param clubId 社团ID
     * @return 用户角色信息
     */
    ClubMemberVO isMember(Long clubId);

    /**
     * 分页查询社团成员
     * @param clubId 社团ID
     * @param clubMemberDTO 查询条件
     * @return 社团成员列表
     */
    PageResult<ClubMemberVO> queryPage(Long clubId, ClubMemberDTO clubMemberDTO);

    /**
     * 导出社团成员数据
     * @param clubId 社团ID
     * @return 包含下载链接和文件名的Map
     */
    Map<String, Object> exportClubMembers(Long clubId);

    /**
     * 退出社团
     * @param clubId 社团ID
     * @return 操作结果
     */
    boolean quitClub(Long clubId);

    /**
     * 更新成员角色
     * @param data 包含社团ID、用户ID和角色类型的数据
     * @return 操作结果
     */
    boolean updateRole(UpdateRoleDTO  data);

    /**
     * 移除社团成员
     * @param data 包含社团ID和用户ID的数据
     * @return 操作结果
     */
    boolean removeMember(Map<String, Object> data);

    /**
     * 更新成员状态（禁用/启用）
     * @param data 包含社团ID、用户ID和状态的数据
     * @return 操作结果
     */
    boolean updateStatus(Map<String, Object> data);
}
