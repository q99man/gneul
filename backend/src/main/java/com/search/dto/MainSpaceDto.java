package com.search.dto;

import com.search.constant.SpaceCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MainSpaceDto {
    private Long id;
    private String spaceName;
    private String spaceDetail;
    private String imgUrl; // 대표 이미지 경로
    private Integer price;
    private SpaceCategory category; // 추가
    private String address;         // 추가
    private Integer maxCapacity;    // 추가

    // MyBatis 맵핑을 위한 생성자 (매퍼 쿼리의 SELECT 컬럼 순서와 맞춰야 할 수 있음)
    public MainSpaceDto(Long id, String spaceName, String spaceDetail, String imgUrl, Integer price, 
                        SpaceCategory category, String address, Integer maxCapacity) {
        this.id = id;
        this.spaceName = spaceName;
        this.spaceDetail = spaceDetail;
        this.imgUrl = imgUrl;
        this.price = price;
        this.category = category;
        this.address = address;
        this.maxCapacity = maxCapacity;
    }
}
