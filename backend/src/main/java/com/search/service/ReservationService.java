package com.search.service;

import com.search.dto.*;
import com.search.entity.*;
import com.search.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ReservationService {
    private final SpaceRepository spaceRepository;
    private final MemberRepository memberRepository;
    private final ReservationRepository reservationRepository;
    private final SpaceImgRepository spaceImgRepository;

    /**
     * 개별 예약 처리 (고도화: 시간 기반)
     */
    public Long reserve(ReservationDto reservationDto, String email) {
        // 1. 예약할 공간 조회
        Space space = spaceRepository.findById(reservationDto.getSpaceId())
                .orElseThrow(EntityNotFoundException::new);

        // 2. 예약자(회원) 조회
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(EntityNotFoundException::new);

        // 3. 예약 항목 생성 (체크인/체크아웃 시간 반영)
        List<ReservationItem> reservationItemList = new ArrayList<>();
        ReservationItem reservationItem = ReservationItem.createReservationItem(
                space, 
                reservationDto.getCheckInTime(), 
                reservationDto.getCheckOutTime(), 
                reservationDto.getOccupants()
        );
        reservationItemList.add(reservationItem);

        // 4. 예약 엔티티 생성 및 저장
        Reservation reservation = Reservation.createReservation(member, reservationItemList);
        reservationRepository.save(reservation);

        return reservation.getId();
    }

    /**
     * 예약 목록 조회 (N+1 문제 최적화)
     */
    @Transactional(readOnly = true)
    public Page<ReservationHistDto> getReservationList(String email, Pageable pageable) {
        List<Reservation> reservations = reservationRepository.findReservations(email, pageable);
        Long totalCount = reservationRepository.countReservation(email);

        List<Long> spaceIds = reservations.stream()
                .flatMap(r -> r.getReservationItems().stream())
                .map(ri -> ri.getSpace().getId())
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> imgMap = spaceImgRepository.findBySpaceIdInAndRepimgYn(spaceIds, "Y")
                .stream()
                .collect(Collectors.toMap(
                    img -> img.getSpace().getId(), 
                    SpaceImg::getImgUrl, 
                    (existing, replacement) -> existing
                ));

        List<ReservationHistDto> reservationHistDtos = new ArrayList<>();

        for (Reservation reservation : reservations) {
            ReservationHistDto reservationHistDto = new ReservationHistDto(reservation);
            for (ReservationItem reservationItem : reservation.getReservationItems()) {
                String imgUrl = imgMap.getOrDefault(reservationItem.getSpace().getId(), "");
                ReservationItemDto reservationItemDto = new ReservationItemDto(reservationItem, imgUrl);
                reservationHistDto.addReservationItemDto(reservationItemDto);
            }
            reservationHistDtos.add(reservationHistDto);
        }
        return new PageImpl<>(reservationHistDtos, pageable, totalCount);
    }

    /**
     * 예약 취소
     */
    public void cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(EntityNotFoundException::new);
        reservation.cancelReservation();
    }

    /**
     * 예약 성공 후 정보 조회
     */
    @Transactional(readOnly = true)
    public ReservationSuccessDto getSuccessInfo(Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId)
                .orElseThrow(EntityNotFoundException::new);

        ReservationSuccessDto dto = new ReservationSuccessDto();
        dto.setReservationId(res.getId());
        dto.setReservationDate(res.getReservationDate().toString());

        String mainName = res.getReservationItems().get(0).getSpace().getSpaceName();
        int size = res.getReservationItems().size();
        dto.setSpaceName(size > 1 ? mainName + " 외 " + (size - 1) + "건" : mainName);
        dto.setTotalPrice(res.getTotalPrice());

        return dto;
    }
}
