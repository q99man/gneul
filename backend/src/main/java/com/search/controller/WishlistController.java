package com.search.controller;

import com.search.dto.WishlistDetailDto;
import com.search.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    // 1. 관심상품 토글 (담기/해제)
    @PostMapping("/toggle/{spaceId}")
    public ResponseEntity<Boolean> toggleWishlist(@PathVariable("spaceId") Long spaceId, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        // 토글 결과(true: 담김, false: 해제됨)를 반환합니다.
        boolean isWished = wishlistService.toggleWishlist(principal.getName(), spaceId);
        return ResponseEntity.ok(isWished);
    }

    // 2. 나의 관심상품 목록 조회
    @GetMapping("/list")
    public ResponseEntity<List<WishlistDetailDto>> getWishlistList(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        List<WishlistDetailDto> wishlistDetailDtoList = wishlistService.getWishlistList(principal.getName());
        return ResponseEntity.ok(wishlistDetailDtoList);
    }

    // 상세 페이지 진입 시 해당 상품의 찜 여부 확인
    @GetMapping("/status/{spaceId}")
    public ResponseEntity<Boolean> getWishStatus(@PathVariable("spaceId") Long spaceId, Principal principal) {
        if (principal == null) return ResponseEntity.ok(false); // 비로그인 시 무조건 false

        boolean status = wishlistService.isWished(principal.getName(), spaceId);
        return ResponseEntity.ok(status);
    }
}
