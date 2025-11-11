package com.hngy.entity.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class ClubStatusDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Long clubId;
    private Integer status;
}
