package com.search.dto;

import com.search.constant.SpaceCategory;
import com.search.constant.SpaceStatus;
import com.search.entity.Space;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SpaceDto {

    private Long id;
    private String spaceName;
    private Integer price;
    private String imgUrl; // 썸네일을 위해 추가!
    private SpaceStatus spaceStatus;
    private SpaceCategory category;
    private String address;
    private Integer maxCapacity;
    private boolean parkingAvailable;
    private boolean wifiAvailable;

    public static SpaceDto of(Space space) {
        return of(space, null);
    }

    public static SpaceDto of(Space space, String imgUrl) {
        SpaceDto dto = new SpaceDto();
        dto.setId(space.getId());
        dto.setSpaceName(space.getSpaceName());
        dto.setPrice(space.getPrice());
        dto.setImgUrl(imgUrl);
        dto.setSpaceStatus(space.getSpaceStatus());
        dto.setCategory(space.getCategory());
        dto.setAddress(space.getAddress());
        dto.setMaxCapacity(space.getMaxCapacity());
        dto.setParkingAvailable(space.isParkingAvailable());
        dto.setWifiAvailable(space.isWifiAvailable());
        return dto;
    }
}