package com.hngy.controller;


import com.hngy.common.result.R;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.dromara.x.file.storage.core.FileInfo;
import org.dromara.x.file.storage.core.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@RestController
@Api("文件上传接口")
@RequestMapping("/common")
public class CommonController {
    @Autowired
    private FileStorageService fileStorageService;
    /**
     * 通用上传请求（单个）
     */
    @ApiOperation("单个文件上传")
    @PostMapping("/upload")
    public R uploadFile(MultipartFile file) throws Exception
    {
        try
        {
            //oss保存文件路径
            String objectName = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd")) + "/";
            // 上传图片 返回文件信息
            FileInfo fileInfo = fileStorageService.of(file).setPath(objectName).upload();
            Map<String, Object> map = new HashMap<>();
            map.put("url", fileInfo.getUrl());
            map.put("newFileName", getName(fileInfo.getUrl()));
            map.put("originalFilename", file.getOriginalFilename());
            return R.success(map);
        }
        catch (Exception e)
        {
            return R.error(e.getMessage());
        }
    }

    private String getName(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return "";
        }
        // 从URL中提取文件名
        int lastSlashIndex = fileUrl.lastIndexOf("/");
        if (lastSlashIndex >= 0 && lastSlashIndex < fileUrl.length() - 1) {
            return fileUrl.substring(lastSlashIndex + 1);
        }
        return fileUrl;
    }
}
