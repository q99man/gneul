package com.search.controller;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceFormDto;
import com.search.dto.SpaceSearchDto;
import com.search.service.SpaceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 메인 화면/사용자용 공간 목록 조회 API.
 * 관리자 검색 로직(SpaceSearchDto, MainSpaceDto)을 그대로 활용해 테스트 공간을 노출합니다.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/space")
public class MainSpaceController {

    private final SpaceService spaceService;

    /** 고객용 공간 상세 조회 (인증 불필요) */
    @GetMapping("/{spaceId}")
    public ResponseEntity<SpaceFormDto> getSpaceDetail(@PathVariable("spaceId") Long spaceId) {
        try {
            return ResponseEntity.ok(spaceService.getSpaceDetailPublic(spaceId));
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/main")
    public ResponseEntity<Page<MainSpaceDto>> getMainSpaces(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size
    ) {
        SpaceSearchDto search = new SpaceSearchDto(); // 기본 검색: 전체
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        Page<MainSpaceDto> result = spaceService.getAdminSpacePage(search, pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}

