package com.search.dto;

import com.search.entity.SpaceImg;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceImgDto {
    private Long id;
    private String imgName;
    private String oriImgName;
    private String imgUrl;
    private String repImgYn;

    // Entity -> DTO 변환 (ModelMapper를 써도 되지만, 수동 메서드 방식입니다)
    public static SpaceImgDto of(SpaceImg spaceImg) {
        SpaceImgDto spaceImgDto = new SpaceImgDto();
        spaceImgDto.setId(spaceImg.getId());
        spaceImgDto.setImgName(spaceImg.getImgName());
        spaceImgDto.setOriImgName(spaceImg.getOriImgName());
        spaceImgDto.setImgUrl(spaceImg.getImgUrl());
        spaceImgDto.setRepImgYn(spaceImg.getRepimgYn());
        return spaceImgDto;
    }
}
