package com.hngy.common.exception;

import com.hngy.common.constant.MessageConstant;
import com.hngy.common.result.R;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.net.ConnectException;
import java.sql.SQLIntegrityConstraintViolationException;

/**
 * @Description: 全局异常处理器
 * @Author:  XiaoYu
 * @date:  2025/5/14 上午11:36
**/
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 业务异常
    @ExceptionHandler
    public R<Object> exceptionHandler(ServiceException ex){
        log.error("异常信息：{},状态码：{}",ex.getMessage(),ex.getCode());
        return R.error(ex.getCode(),ex.getMessage());
    }

    /**
     * 捕获 Redis 连接被拒绝
     */
    @ExceptionHandler({RedisConnectionFailureException.class, ConnectException.class})
    public R<String> handleRedisConnect(Exception e) {
        log.error("Redis 无法连接: {}", e.getMessage(), e);
        return R.error(503, "Redis 服务暂时不可用，请稍后再试");
    }

    /*
    * 处理SQL异常
    * */
    @ExceptionHandler
    public R<Object> exceptionHandler(SQLIntegrityConstraintViolationException ex){
        final String message = ex.getMessage();
        if(message.contains("Duplicate entry")){
            final String[] s = message.split(" ");
            final String username = s[2];
            String msg = username + MessageConstant.ALREADY_EXITS;
            return R.error(msg);
        }else{
            return R.error(MessageConstant.UNKNOWN_ERROR);
        }
    }

    /*
    * 文件大小超出限制
    * */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public R<Object> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e) {
        return R.error(400,"文件上传大小超出限制");
    }

}
