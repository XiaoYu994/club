package com.hngy.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hngy.common.constant.RecruitmentConstant;
import com.hngy.common.exception.ServiceException;
import com.hngy.common.result.PageResult;
import com.hngy.entity.dto.ClubRecruitmentConfigPageDTO;
import com.hngy.entity.dto.RecruitmentConfigDTO;
import com.hngy.entity.po.ClubRecruitmentConfig;
import com.hngy.entity.vo.RecruitmentConfigVO;
import com.hngy.mapper.ClubApplyMapper;
import com.hngy.mapper.ClubRecruitmentConfigMapper;
import com.hngy.mapper.ClubRecruitmentMapper;
import com.hngy.service.IClubRecruitmentConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * <p>
 * 招新配置表 服务实现类
 * </p>
 *
 * @author xhy
 * @since 2025-07-12
 */
@Service
@RequiredArgsConstructor
public class ClubRecruitmentConfigServiceImpl extends ServiceImpl<ClubRecruitmentConfigMapper, ClubRecruitmentConfig> implements IClubRecruitmentConfigService {
    private final ClubRecruitmentConfigMapper clubRecruitmentConfigMapper;
    private final ClubRecruitmentMapper clubRecruitmentMapper;
    private final ClubApplyMapper clubApplyMapper;
    @Override
    public PageResult<RecruitmentConfigVO> getClubRecruitmentConfigs(ClubRecruitmentConfigPageDTO configPageDTO) {
        Page<ClubRecruitmentConfig> page = configPageDTO.toPageDefaultSortByUpdateTime();
        LambdaQueryWrapper<ClubRecruitmentConfig> wrapper = new LambdaQueryWrapper<>();
        // 根据配置的名称或学期进行模糊查询
        if (configPageDTO.getKeyword() != null){
            wrapper.and(w -> w.like(ClubRecruitmentConfig::getName, configPageDTO.getKeyword()).or().
                               like(ClubRecruitmentConfig::getSemester, configPageDTO.getKeyword()));
        }
        page = clubRecruitmentConfigMapper.selectPage(page, wrapper);
        return PageResult.of(page, RecruitmentConfigVO.class);
    }

    @Override
    public boolean create(RecruitmentConfigDTO configDTO) {
        ClubRecruitmentConfig config = new ClubRecruitmentConfig();
        BeanUtil.copyProperties(configDTO, config);
        config.setCreateTime(System.currentTimeMillis());
        config.setUpdateTime(System.currentTimeMillis());
        return clubRecruitmentConfigMapper.insert(config) > 0;
    }

    @Override
    public boolean updateById(RecruitmentConfigDTO configDTO) {
        ClubRecruitmentConfig config = clubRecruitmentConfigMapper.selectById(configDTO.getId());
        if (config == null) {
            throw new ServiceException(HttpStatus.BAD_REQUEST.value(), RecruitmentConstant.ERROR_CONFIG_NOT_FOUND);
        }

        BeanUtil.copyProperties(configDTO, config);
        config.setUpdateTime(System.currentTimeMillis());
        return clubRecruitmentConfigMapper.updateById(config) > 0;
    }

    @Override
    @Transactional
    public boolean delete(Integer id) {
        // 查询该社团招新表中该配置下的招新
        List<Integer> recruitments = clubRecruitmentMapper.getRecruitmentIdsByConfigId(id);
        // 删除社团招新表中该配置下的招新
        clubRecruitmentMapper.deleteByConfigId(id);
        // 删除社团申请表中该配置下的申请
        if(recruitments != null && !recruitments.isEmpty()){
            clubApplyMapper.deleteApplyByConfigId(recruitments);
        }
        // 删除该社团招新配置
        return clubRecruitmentConfigMapper.deleteById(id) > 0;
    }
}
