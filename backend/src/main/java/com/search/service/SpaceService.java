package com.search.service;

import com.search.constant.SpaceStatus;
import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceDto;
import com.search.dto.SpaceFormDto;
import com.search.dto.SpaceImageMetaDto;
import com.search.dto.SpaceSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SpaceService {

    Long createHostSpace(
            SpaceFormDto spaceFormDto,
            List<SpaceImageMetaDto> imageMetaList,
            List<MultipartFile> imageFiles,
            String email
    ) throws Exception;

    Long updateHostSpace(
            Long spaceId,
            SpaceFormDto spaceFormDto,
            List<SpaceImageMetaDto> imageMetaList,
            List<MultipartFile> imageFiles,
            String email
    ) throws Exception;

    SpaceFormDto getSpaceDtl(Long spaceId, String email);

    /** 고객용 공간 상세 조회 (인증 불필요, 공개 정보만) */
    SpaceFormDto getSpaceDetailPublic(Long spaceId);

    List<SpaceDto> getHostSpaceList(String email);

    void deleteSpace(Long spaceId, String email) throws Exception;

    SpaceStatus toggleSpaceStatus(Long spaceId, String email);

    Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable);
}
