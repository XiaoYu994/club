package com.hngy.common.result;

import com.baomidou.mybatisplus.annotation.EnumValue;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "成功"),
    FAIL(400, "用户名或密码错误"),
    UNAUTHORIZED(401, "未认证"),
    FORBIDDEN(403, "无权访问"),
    NOT_FOUND(404, "接口不存在"),
    INTERNAL_SERVER_ERROR(500, "服务器内部错误"),
    ;

    @EnumValue
    private final int code;
    @JsonValue
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
