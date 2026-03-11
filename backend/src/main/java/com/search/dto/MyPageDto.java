package com.search.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MyPageDto {
  private String name;
  private String email;
  private String phoneNumber;
  private String address;
  private String role;
  // 최근 예약 내역 5건 정도만 먼저 보여주기 위해 리스트 포함
  private List<ReservationHistDto> recentReservations;
}
