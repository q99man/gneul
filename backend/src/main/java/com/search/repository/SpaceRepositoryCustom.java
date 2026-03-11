package com.search.repository;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SpaceRepositoryCustom {
    Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable);
    // 나중에 Querydsl이나 MyBatis를 연동하여 복잡한 검색 쿼리를 구현할 곳입니다.
    // Page<Space> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable);
}
