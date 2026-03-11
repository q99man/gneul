package com.search.repository;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceSearchDto;
import com.search.entity.Space;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpaceRepository extends JpaRepository<Space, Long>, SpaceRepositoryCustom {
    // 기본 CRUD는 JpaRepository가 제공하며, 복잡한 쿼리는 Custom 인터페이스를 통해 확장합니다.
    @Override
    Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable);

    // 호스트가 등록한 공간 목록을 조회합니다.
    java.util.List<com.search.entity.Space> findByHostEmail(String email);
}
