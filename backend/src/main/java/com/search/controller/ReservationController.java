package com.search.controller;

import com.search.dto.ReservationDto;
import com.search.dto.ReservationHistDto;
import com.search.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservation")
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity reserve(@RequestBody @Valid ReservationDto reservationDto,
                                  BindingResult bindingResult, Principal principal) {
        // 1. 데이터 검증
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>("잘못된 예약 요청입니다.", HttpStatus.BAD_REQUEST);
        }

        // 2. 현재 사용자 정보 확인 (테스트 시에는 하드코딩 가능)
        String email = principal.getName();
        Long reservationId;

        try {
            reservationId = reservationService.reserve(reservationDto, email);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(reservationId, HttpStatus.OK);
    }

    // 예약 이력 조회
    @GetMapping({"/hist", "/hist/{page}"})
    public ResponseEntity getReservationHist(@PathVariable("page") Optional<Integer> page, Principal principal) {
        Pageable pageable = PageRequest.of(page.isPresent() ? page.get() : 0, 4);
        Page<ReservationHistDto> reservationHistDtoList = reservationService.getReservationList(principal.getName(), pageable);
        return new ResponseEntity<>(reservationHistDtoList, HttpStatus.OK);
    }

    // 예약 취소
    @PostMapping("/{reservationId}/cancel")
    public ResponseEntity cancelReservation(@PathVariable("reservationId") Long reservationId, Principal principal) {
        // 본인 확인 로직 필요 (생략 가능하나 보안상 중요)
        reservationService.cancelReservation(reservationId);
        return new ResponseEntity<>(reservationId, HttpStatus.OK);
    }
}
