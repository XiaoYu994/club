package com.hngy.entity.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class ClubOrderDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer clubId;
    private Integer orderNum;
} 