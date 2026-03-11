package com.search.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationDto {
    @NotNull(message = "공간 아이디는 필수 입력 값입니다.")
    private Long spaceId;

    @NotNull(message = "예약 시작 시간은 필수입니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime checkInTime;

    @NotNull(message = "예약 종료 시간은 필수입니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime checkOutTime;

    @Min(value = 1, message = "최소 1명 이상이어야 합니다.")
    private int occupants; // 예약 인원수
}
