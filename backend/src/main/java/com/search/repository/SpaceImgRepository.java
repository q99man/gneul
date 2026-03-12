package com.search.repository;

import com.search.entity.SpaceImg;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpaceImgRepository extends JpaRepository<SpaceImg, Long> {
    List<SpaceImg> findBySpaceIdOrderBySortOrderAscIdAsc(Long spaceId);

    List<SpaceImg> findBySpaceIdOrderBySortOrderAsc(Long spaceId);

    // SpaceId는 Space 엔티티의 id 필드를 찾아가며, repimgYn은 대표 이미지 여부를 확인합니다.
    Optional<SpaceImg> findBySpaceIdAndRepimgYn(Long spaceId, String repimgYn);

    // 여러 공간의 대표 이미지를 한 번에 조회하여 N+1 문제 해결
    List<SpaceImg> findBySpaceIdInAndRepimgYn(List<Long> spaceIds, String repimgYn);
}
