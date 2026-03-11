package com.search.controller;

import com.search.dto.SpaceDto;
import com.search.service.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostController {
    private final SpaceService spaceService;

    /**
     * 호스트가 등록한 공간 목록 조회
     * GET /api/host/spaces
     */
    @GetMapping("/spaces")
    public ResponseEntity<List<SpaceDto>> getMySpaces(Principal principal) {
        List<SpaceDto> mySpaces = spaceService.getHostSpaceList(principal.getName());
        return ResponseEntity.ok(mySpaces);
    }
}
