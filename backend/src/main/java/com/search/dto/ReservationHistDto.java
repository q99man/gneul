package com.search.dto;

import com.search.constant.ReservationStatus;
import com.search.entity.Reservation;
import lombok.Getter;
import lombok.Setter;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ReservationHistDto {

    private Long reservationId; // 예약 아이디
    private String reservationDate; // 예약 날짜
    private ReservationStatus reservationStatus; // 예약 상태
    private int totalPrice; // 전체 예약 금액

    // 예약 상품 리스트
    private List<ReservationItemDto> reservationItemDtoList = new ArrayList<>();

    public void addReservationItemDto(ReservationItemDto reservationItemDto) {
        reservationItemDtoList.add(reservationItemDto);
    }

    public ReservationHistDto(Reservation reservation) {
        this.reservationId = reservation.getId();
        this.reservationDate = reservation.getReservationDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        this.reservationStatus = reservation.getReservationStatus();
        this.totalPrice = reservation.getTotalPrice();
    }
}
