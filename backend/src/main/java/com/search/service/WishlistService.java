package com.search.service;

import com.search.dto.WishlistDetailDto;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.entity.Wishlist;
import com.search.repository.MemberRepository;
import com.search.repository.SpaceRepository;
import com.search.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final MemberRepository memberRepository;
    private final SpaceRepository spaceRepository;

    public boolean toggleWishlist(String email, Long spaceId) {
        Member member = memberRepository.findByEmail(email).orElseThrow();
        Space space = spaceRepository.findById(spaceId).orElseThrow();

        // 1. 이미 관심상품에 있는지 확인
        Optional<Wishlist> wish = wishlistRepository.findByMemberAndSpace(member, space);

        if (wish.isPresent()) {
            // 2. 이미 있다면 삭제 (해제)
            wishlistRepository.delete(wish.get());
            return false; // 리액트에 "해제됨"을 알림
        } else {
            // 3. 없다면 새로 저장 (담기)
            Wishlist newWish = new Wishlist();
            newWish.setMember(member);
            newWish.setSpace(space);
            wishlistRepository.save(newWish);
            return true; // 리액트에 "담김"을 알림
        }
    }

    @Transactional(readOnly = true)
    public List<WishlistDetailDto> getWishlistList(String email) {
        // 사용자의 이메일로 관심상품 리스트를 조회하고 DTO로 변환하여 반환합니다.
        // QueryDSL이나 JPQL을 사용하여 공간 정보와 이미지를 한꺼번에 가져오는 것이 효율적입니다.
        return wishlistRepository.findWishlistDetailDtoList(email);
    }

    @Transactional(readOnly = true)
    public boolean isWished(String email, Long spaceId) {
        Member member = memberRepository.findByEmail(email).orElseThrow();
        Space space = spaceRepository.findById(spaceId).orElseThrow();

        // 이미 관심상품에 존재하는지 여부만 반환
        return wishlistRepository.findByMemberAndSpace(member, space).isPresent();
    }
}