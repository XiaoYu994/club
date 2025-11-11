package com.hngy.common.exception;

import lombok.Getter;

/**
 * @Description: 业务异常类
 * @Author:  XiaoYu
 * @date:  2025/5/14 下午12:35
**/
@Getter
public class ServiceException extends RuntimeException{

    private final Integer code;
    public ServiceException() {
        super();
        this.code = 500;
    }
    public ServiceException(String msg) {
        super(msg);
        this.code = 500;
    }
    public ServiceException(Integer code,String msg){
        super(msg);
        this.code = code;
    }

    public ServiceException(Throwable cause, Integer code){
        super(cause);
        this.code = code;
    }

    public ServiceException(Throwable cause, Integer code,String msg){
        super(msg,cause);
        this.code = code;
    }

}
