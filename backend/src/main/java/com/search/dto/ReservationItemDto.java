package com.search.dto;

import com.search.entity.ReservationItem;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationItemDto {

    private String spaceName; // 공간명
    private int count; // 예약 수량(인원수 등)
    private int reservationPrice; // 예약 금액
    private String imgUrl; // 공간 이미지 경로
    
    private String checkInTime; // 예약 시작 시간
    private String checkOutTime; // 예약 종료 시간
    private int totalPrice; // 항목별 총액

    public ReservationItemDto(ReservationItem reservationItem, String imgUrl) {
        this.spaceName = reservationItem.getSpace().getSpaceName();
        this.count = reservationItem.getOccupants();
        this.reservationPrice = reservationItem.getReservationPrice();
        this.imgUrl = imgUrl;
        this.checkInTime = reservationItem.getCheckInTime().toString();
        this.checkOutTime = reservationItem.getCheckOutTime().toString();
        this.totalPrice = reservationItem.getTotalPrice();
    }
}
