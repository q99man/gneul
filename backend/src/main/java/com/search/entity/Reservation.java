package com.search.entity;

import com.search.constant.ReservationStatus;
import com.search.constant.SpaceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member; // 예약자

    private LocalDateTime reservationDate; // 예약 신청 시간

    @Enumerated(EnumType.STRING)
    private ReservationStatus reservationStatus; // 예약 상태

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReservationItem> reservationItems = new ArrayList<>();

    // 예약 총 결제 금액
    private int totalPrice;

    // 예약 생성 편의 메서드
    public void addReservationItem(ReservationItem reservationItem) {
        reservationItems.add(reservationItem);
        reservationItem.setReservation(this);
    }

    public static Reservation createReservation(Member member, List<ReservationItem> reservationItemList) {
        Reservation reservation = new Reservation();
        reservation.setMember(member);
        
        int total = 0;
        for (ReservationItem reservationItem : reservationItemList) {
            reservation.addReservationItem(reservationItem);
            total += reservationItem.getTotalPrice(); // 각 아이템별 합산
        }
        
        reservation.setTotalPrice(total);
        reservation.setReservationStatus(ReservationStatus.RESERVED);
        reservation.setReservationDate(LocalDateTime.now());
        return reservation;
    }

    public void cancelReservation() {
        this.reservationStatus = ReservationStatus.CANCELLED;
        for (ReservationItem reservationItem : reservationItems) {
            // 예약되었던 공간들을 다시 대여 가능 상태로 변경 (또는 타임 슬롯 해제 로직 가능)
            reservationItem.getSpace().changeStatus(SpaceStatus.AVAILABLE);
        }
    }
}
