package com.search.entity;

import com.search.constant.SpaceCategory;
import com.search.constant.SpaceStatus;
import com.search.dto.SpaceFormDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "space")
@Getter
@Setter
@ToString(exclude = "host")
@NoArgsConstructor
@AllArgsConstructor
public class Space extends BaseTimeEntity {

    @Id
    @Column(name = "space_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String spaceName;

    @Column(nullable = false)
    private int price;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String spaceDetail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpaceStatus spaceStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpaceCategory category;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(length = 200)
    private String detailAddress;

    @Column(nullable = false)
    private Integer maxCapacity;

    @Column(length = 20)
    private String contactPhone;

    @Column(nullable = false)
    private LocalTime openTime;

    @Column(nullable = false)
    private LocalTime closeTime;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String notice;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String refundPolicy;

    @Column(nullable = false)
    private boolean parkingAvailable;

    @Column(nullable = false)
    private boolean wifiAvailable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member host;

    public void updateSpace(SpaceFormDto dto) {
        this.spaceName = dto.getSpaceName();
        this.price = dto.getPrice();
        this.spaceDetail = dto.getSpaceDetail();
        this.spaceStatus = dto.getSpaceStatus();
        this.category = dto.getCategory();
        this.address = dto.getAddress();
        this.detailAddress = dto.getDetailAddress();
        this.maxCapacity = dto.getMaxCapacity();
        this.contactPhone = dto.getContactPhone();
        this.openTime = dto.getOpenTime();
        this.closeTime = dto.getCloseTime();
        this.notice = dto.getNotice();
        this.refundPolicy = dto.getRefundPolicy();
        this.parkingAvailable = dto.isParkingAvailable();
        this.wifiAvailable = dto.isWifiAvailable();
    }

    public void changeStatus(SpaceStatus status) {
        this.spaceStatus = status;
    }

    public static Space createSpace(SpaceFormDto dto, Member host) {
        Space space = new Space();
        space.setSpaceName(dto.getSpaceName());
        space.setPrice(dto.getPrice());
        space.setSpaceDetail(dto.getSpaceDetail());
        space.setSpaceStatus(dto.getSpaceStatus());
        space.setCategory(dto.getCategory());
        space.setAddress(dto.getAddress());
        space.setDetailAddress(dto.getDetailAddress());
        space.setMaxCapacity(dto.getMaxCapacity());
        space.setContactPhone(dto.getContactPhone());
        space.setOpenTime(dto.getOpenTime());
        space.setCloseTime(dto.getCloseTime());
        space.setNotice(dto.getNotice());
        space.setRefundPolicy(dto.getRefundPolicy());
        space.setParkingAvailable(dto.isParkingAvailable());
        space.setWifiAvailable(dto.isWifiAvailable());
        space.setHost(host);
        return space;
    }
}
