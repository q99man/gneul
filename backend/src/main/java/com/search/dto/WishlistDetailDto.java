package com.search.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WishlistDetailDto {
    private Long wishlistId;   // 관심상품 고유 ID
    private Long spaceId;       // 공간 ID (상세페이지 이동용)
    private String spaceName;   // 공간 이름
    private int price;          // 가격
    private String imgUrl;      // 대표 이미지

    public WishlistDetailDto(Long wishlistId, Long spaceId, String spaceName, int price, String imgUrl) {
        this.wishlistId = wishlistId;
        this.spaceId = spaceId;
        this.spaceName = spaceName;
        this.price = price;
        this.imgUrl = imgUrl;
    }
}
