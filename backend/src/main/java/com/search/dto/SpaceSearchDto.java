package com.search.dto;

import com.search.constant.SpaceCategory;
import com.search.constant.SpaceStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceSearchDto {
    private String searchDateType;         // 조회 날짜 기준 (all, 1d, 1w, 1m, 6m)
    private SpaceStatus searchSpaceStatus;    // 공간 상태 (AVAILABLE, UNAVAILABLE)
    private SpaceCategory searchCategory;     // 공간 카테고리 (추가)
    private Integer searchMaxCapacity;        // 최소 수용 인원 (추가)
    private String searchAddress;            // 지역/주소 검색 (추가)
    private String searchBy;               // 검색 기준 (spaceName, createdBy)
    private String searchQuery = "";       // 검색어
}
