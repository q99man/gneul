package com.search.repository;

import com.search.entity.Reservation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // 1. 로그인한 사용자의 예약 목록 조회
    @Query("select o from Reservation o " +
            "where o.member.email = :email " +
            "order by o.reservationDate desc")
    List<Reservation> findReservations(@Param("email") String email, Pageable pageable);

    // 2. 로그인한 사용자의 예약 횟수 조회 (페이징용)
    @Query("select count(o) from Reservation o " +
            "where o.member.email = :email")
    Long countReservation(@Param("email") String email);
}
