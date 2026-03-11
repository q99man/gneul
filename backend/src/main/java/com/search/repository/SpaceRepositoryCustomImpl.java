package com.search.repository;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceSearchDto;
import com.search.mapper.SpaceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RequiredArgsConstructor
public class SpaceRepositoryCustomImpl implements SpaceRepositoryCustom {

    private final SpaceMapper spaceMapper; // MyBatis 매퍼 주입

    @Override
    public Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable) {
        // 1. 데이터 조회
        List<MainSpaceDto> content = spaceMapper.getSpaceList(
                spaceSearchDto,
                (int) pageable.getOffset(),
                pageable.getPageSize()
        );

        // 2. 전체 개수 조회
        Long total = spaceMapper.getSpaceCount(spaceSearchDto);

        // 3. Page 객체로 반환
        return new PageImpl<>(content, pageable, total);
    }
}
