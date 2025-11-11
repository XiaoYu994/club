package com.hngy.controller.admin;

import cn.hutool.core.bean.BeanUtil;
import com.hngy.common.result.PageResult;
import com.hngy.common.result.R;
import com.hngy.entity.dto.ClubRecruitmentConfigPageDTO;
import com.hngy.entity.dto.RecruitmentConfigDTO;
import com.hngy.entity.po.ClubRecruitmentConfig;
import com.hngy.entity.vo.RecruitmentConfigVO;
import com.hngy.service.IClubRecruitmentConfigService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * <p>
 * 招新配置管理控制器
 * </p>
 *
 * @since 2024-07-24
 */
@Slf4j
@RestController
@RequestMapping("/admin/recruitment/configs")
@Api(tags = "管理员-招新配置管理")
public class AdminRecruitmentConfigController {

    @Autowired
    private IClubRecruitmentConfigService clubRecruitmentConfigService;


    @ApiOperation("分页获取招新配置")
    @GetMapping("/page")
    public R<PageResult<RecruitmentConfigVO>> page(ClubRecruitmentConfigPageDTO configPageDTO) {
        return R.success(clubRecruitmentConfigService.getClubRecruitmentConfigs(configPageDTO));
    }

    @ApiOperation("获取招新配置详情")
    @GetMapping("/{id}")
    public R<RecruitmentConfigVO> getById(@PathVariable Integer id) {
        RecruitmentConfigVO vo = new RecruitmentConfigVO();
        BeanUtil.copyProperties(clubRecruitmentConfigService.getById(id), vo);
        return R.success(vo);
    }

    @ApiOperation("添加招新配置")
    @PostMapping
    public R<ClubRecruitmentConfig> save(@RequestBody RecruitmentConfigDTO configDTO) {
        return clubRecruitmentConfigService.create(configDTO) ? R.success() : R.error();
    }

    @ApiOperation("修改招新配置")
    @PutMapping
    public R<String> update(@RequestBody RecruitmentConfigDTO configDTO) {
        return clubRecruitmentConfigService.updateById(configDTO) ? R.success() : R.error();
    }

    @ApiOperation("删除招新配置")
    @DeleteMapping("/{id}")
    public R<String> delete(@PathVariable Integer id) {
        return clubRecruitmentConfigService.delete(id) ? R.success() : R.error();
    }
} 