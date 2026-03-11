package com.search.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id")
    private Space space; // 예약된 공간

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    private int reservationPrice; // 예약 시점의 시간당/일당 단가

    private LocalDateTime checkInTime;  // 예약 시작 시간
    private LocalDateTime checkOutTime; // 예약 종료 시간

    private int occupants; // 예약 인원수

    private int totalPrice; // (단가 * 이용시간/일수) 계산 결과

    public static ReservationItem createReservationItem(Space space, LocalDateTime checkIn, LocalDateTime checkOut, int occupants) {
        ReservationItem reservationItem = new ReservationItem();
        reservationItem.setSpace(space);
        reservationItem.setCheckInTime(checkIn);
        reservationItem.setCheckOutTime(checkOut);
        reservationItem.setOccupants(occupants);
        reservationItem.setReservationPrice(space.getPrice());

        // 이용 시간(시간 단위) 계산 후 총액 설정
        long hours = Duration.between(checkIn, checkOut).toHours();
        if (hours <= 0) hours = 1; // 최소 1시간 요금 적용
        
        reservationItem.setTotalPrice((int) (space.getPrice() * hours));

        return reservationItem;
    }
}
