package com.search.mapper;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceSearchDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SpaceMapper {
    // 검색 조건에 맞는 공간 리스트 조회
    List<MainSpaceDto> getSpaceList(@Param("searchDto") SpaceSearchDto searchDto,
                                    @Param("offset") int offset,
                                    @Param("limit") int limit);

    // 검색 조건에 맞는 전체 데이터 개수 (페이징용)
    Long getSpaceCount(@Param("searchDto") SpaceSearchDto searchDto);
}
