package com.hngy;

import org.dromara.x.file.storage.spring.EnableFileStorage;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@MapperScan("com.hngy.mapper")
@SpringBootApplication
@EnableFileStorage // 文件上传相关注解
@EnableScheduling // 启用定时任务
public class ClubJavaApplication {

    public static void main(String[] args) {

        SpringApplication.run(ClubJavaApplication.class, args);
        System.out.println("社团管理后端服务启动成功！");
        System.out.println("API文档地址: http://localhost:8081/doc.html");

    }

}
