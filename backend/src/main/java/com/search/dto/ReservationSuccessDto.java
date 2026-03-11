package com.search.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationSuccessDto {
  private Long reservationId;
  private String spaceName; // 대표 공간명 (외 n건)
  private int totalPrice;   // 총 결제 예정 금액
  private String reservationDate;
}
