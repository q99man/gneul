package com.search.repository;

import com.search.dto.WishlistDetailDto;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    // 특정 회원이 특정 공간을 이미 찜했는지 확인하는 쿼리 메소드
    Optional<Wishlist> findByMemberAndSpace(Member member, Space space);

    // 회원의 관심상품 목록을 효율적으로 조회 (N+1 문제 해결을 위한 JPQL 활용)
    @Query("select new com.search.dto.WishlistDetailDto(w.id, s.id, s.spaceName, s.price, si.imgUrl) " +
           "from Wishlist w " +
           "join w.space s " +
           "join SpaceImg si on si.space.id = s.id " +
           "where w.member.email = :email " +
           "and si.repimgYn = 'Y' " +
           "order by w.id desc")
    List<WishlistDetailDto> findWishlistDetailDtoList(@Param("email") String email);
}