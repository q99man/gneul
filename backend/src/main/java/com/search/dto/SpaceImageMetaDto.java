package com.search.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceImageMetaDto {

    private String clientId;          // 프론트 전용 식별자
    private Long imageId;             // 기존 이미지면 존재, 신규면 null
    private Boolean isNew;            // 신규 여부
    private Boolean deleted;          // 삭제 여부
    private Boolean representative;   // 대표 여부
    private Integer sortOrder;        // 정렬 순서
    private String originalFileName;  // 신규 파일 원본명(선택)
}