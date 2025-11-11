package com.hngy.common.result;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @Description:统一返回结果类
 * @Author:  XiaoYu
 * @date:  2025/5/14 上午10:52
**/
@Data
@NoArgsConstructor
public  class R<T> implements Serializable {

    private static final int SUCCESS_CODE = 200;
    private static final int ERROR_CODE = 500;
    private static final String SUCCESS_MSG = "操作成功";
    private static final String ERROR_MSG = "操作失败";
    private static final long serialVersionUID = 1L;
    private Integer code;
    private String message;
    private T data;
    // 时间戳
    private Long timestamp = System.currentTimeMillis();

    private R(Integer code, String message){
        this.code = code;
        this.message = message;
    }

    private R(Integer code, String message, T data){
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public static <T> R<T> success(){
        return new R<>(SUCCESS_CODE,SUCCESS_MSG);
    }

    public static <T> R<T> success(T data){
        return new R<>(SUCCESS_CODE,SUCCESS_MSG,data);
    }
    public static <T> R<T> success(String message){
        return new R<>(SUCCESS_CODE,message);
    }
    public static <T> R<T> success(T data,String message){
        return new R<>(SUCCESS_CODE,message,data);
    }
    public static <T> R<T> error(){
        return new R<>(ERROR_CODE,ERROR_MSG);
    }
    public static <T> R<T> error(T data){
        return new R<>(ERROR_CODE,ERROR_MSG,data);
    }
    public static <T> R<T> error(T data,String message){
        return new R<>(ERROR_CODE,message,data);
    }
    public static <T> R<T> error(Integer code,String message){
        return new R<>(ERROR_CODE,message);
    }
    public static <T> R<T> error(String message){
        return new R<>(ERROR_CODE,message);
    }

    public static <T> R<T> error(ResultCode resultCode){
        return new R<>(resultCode.getCode(),resultCode.getMessage());
    }

    /**
     * 参数错误响应
     */
    public static R paramError() {
        return error(400, "参数错误");
    }

    /**
     * 参数错误响应（自定义消息）
     */
    public static R paramError(String msg) {
        return error(400, msg);
    }

    /**
     * 未授权响应
     */
    public static R unauthorized() {
        return error(401, "未授权");
    }

    /**
     * 无权限响应
     */
    public static R forbidden() {
        return error(403, "无权限");
    }

    /**
     * 资源不存在响应
     */
    public static R notFound() {
        return error(404, "资源不存在");
    }

}
