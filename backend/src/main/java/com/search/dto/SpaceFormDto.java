package com.search.dto;

import com.search.constant.SpaceCategory;
import com.search.constant.SpaceStatus;
import com.search.entity.Space;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class SpaceFormDto {

    private Long id;

    @NotBlank(message = "공간명을 입력해주세요.")
    @Size(max = 100, message = "공간명은 100자 이하로 입력해주세요.")
    private String spaceName;

    @NotNull(message = "가격을 입력해주세요.")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    private Integer price;

    @NotBlank(message = "공간 상세 설명을 입력해주세요.")
    private String spaceDetail;

    @NotNull(message = "공간 상태를 선택해주세요.")
    private SpaceStatus spaceStatus;

    @NotNull(message = "공간 카테고리를 선택해주세요.")
    private SpaceCategory category;

    @NotBlank(message = "주소를 입력해주세요.")
    private String address;

    private String detailAddress;

    @NotNull(message = "최대 수용 인원을 입력해주세요.")
    @Min(value = 1, message = "최대 수용 인원은 1명 이상이어야 합니다.")
    private Integer maxCapacity;

    @NotBlank(message = "문의 연락처를 입력해주세요.")
    private String contactPhone;

    @NotNull(message = "오픈 시간을 입력해주세요.")
    @DateTimeFormat(pattern = "HH:mm")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime openTime;

    @NotNull(message = "마감 시간을 입력해주세요.")
    @DateTimeFormat(pattern = "HH:mm")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime closeTime;

    private String notice;
    private String refundPolicy;

    private boolean parkingAvailable;
    private boolean wifiAvailable;

    private List<SpaceImgDto> spaceImgDtoList = new ArrayList<>();
    private List<Long> spaceImgIds = new ArrayList<>();


    public static SpaceFormDto of(Space space) {
        SpaceFormDto dto = new SpaceFormDto();
        dto.setId(space.getId());
        dto.setSpaceName(space.getSpaceName());
        dto.setPrice(space.getPrice());
        dto.setSpaceDetail(space.getSpaceDetail());
        dto.setSpaceStatus(space.getSpaceStatus());
        dto.setCategory(space.getCategory());
        dto.setAddress(space.getAddress());
        dto.setDetailAddress(space.getDetailAddress());
        dto.setMaxCapacity(space.getMaxCapacity());
        dto.setContactPhone(space.getContactPhone());
        dto.setOpenTime(space.getOpenTime());
        dto.setCloseTime(space.getCloseTime());
        dto.setNotice(space.getNotice());
        dto.setRefundPolicy(space.getRefundPolicy());
        dto.setParkingAvailable(space.isParkingAvailable());
        dto.setWifiAvailable(space.isWifiAvailable());
        return dto;
    }
}
