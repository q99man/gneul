package com.search.service;

import com.search.constant.SpaceStatus;
import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceDto;
import com.search.dto.SpaceFormDto;
import com.search.dto.SpaceImgDto;
import com.search.dto.SpaceImageMetaDto;
import com.search.dto.SpaceSearchDto;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.entity.SpaceImg;
import com.search.repository.MemberRepository;
import com.search.repository.SpaceImgRepository;
import com.search.repository.SpaceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class SpaceServiceImpl implements SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceImgRepository spaceImgRepository;
    private final SpaceImgService spaceImgService;
    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public Long createHostSpace(SpaceFormDto spaceFormDto,
                                List<SpaceImageMetaDto> imageMetaList,
                                List<MultipartFile> imageFiles,
                                String email) throws Exception {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));

        List<MultipartFile> validFiles = extractValidFiles(imageFiles);
        List<SpaceImageMetaDto> normalizedMetaList = normalizeImageMetaList(imageMetaList, validFiles.size());
        validateVisibleImages(normalizedMetaList);

        Space space = Space.createSpace(spaceFormDto, member);
        spaceRepository.save(space);

        persistNewImages(space, normalizedMetaList, validFiles);
        ensureRepresentativeImage(space.getId());
        return space.getId();
    }

    @Override
    @Transactional
    public Long updateHostSpace(Long spaceId,
                                SpaceFormDto spaceFormDto,
                                List<SpaceImageMetaDto> imageMetaList,
                                List<MultipartFile> imageFiles,
                                String email) throws Exception {
        Space space = getOwnedSpace(spaceId, email);
        space.updateSpace(spaceFormDto);

        List<MultipartFile> validFiles = extractValidFiles(imageFiles);
        List<SpaceImageMetaDto> normalizedMetaList = normalizeImageMetaList(imageMetaList, validFiles.size());
        validateVisibleImages(normalizedMetaList);

        Map<Long, SpaceImg> existingImageMap = new HashMap<>();
        for (SpaceImg img : spaceImgRepository.findBySpaceIdOrderBySortOrderAscIdAsc(spaceId)) {
            existingImageMap.put(img.getId(), img);
        }

        for (SpaceImageMetaDto meta : normalizedMetaList) {
            if (Boolean.TRUE.equals(meta.getIsNew())) {
                continue;
            }

            if (meta.getImageId() == null) {
                continue;
            }

            SpaceImg existingImg = existingImageMap.remove(meta.getImageId());
            if (existingImg == null) {
                continue;
            }

            if (Boolean.TRUE.equals(meta.getDeleted())) {
                spaceImgService.deleteSpaceImg(existingImg.getId());
                continue;
            }

            existingImg.updateMeta(Boolean.TRUE.equals(meta.getRepresentative()), meta.getSortOrder());
        }

        for (SpaceImg leftoverImg : existingImageMap.values()) {
            spaceImgService.deleteSpaceImg(leftoverImg.getId());
        }

        persistNewImages(space, normalizedMetaList, validFiles);
        ensureRepresentativeImage(space.getId());
        return space.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public SpaceFormDto getSpaceDtl(Long spaceId, String email) {
        Space space = getOwnedSpace(spaceId, email);

        List<SpaceImg> spaceImgList = spaceImgRepository.findBySpaceIdOrderBySortOrderAscIdAsc(spaceId);
        List<SpaceImgDto> spaceImgDtoList = new ArrayList<>();
        List<Long> spaceImgIds = new ArrayList<>();

        for (SpaceImg spaceImg : spaceImgList) {
            spaceImgDtoList.add(SpaceImgDto.of(spaceImg));
            spaceImgIds.add(spaceImg.getId());
        }

        SpaceFormDto spaceFormDto = SpaceFormDto.of(space);
        spaceFormDto.setSpaceImgDtoList(spaceImgDtoList);
        spaceFormDto.setSpaceImgIds(spaceImgIds);
        return spaceFormDto;
    }

    @Override
    @Transactional(readOnly = true)
    public SpaceFormDto getSpaceDetailPublic(Long spaceId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new EntityNotFoundException("공간 정보를 찾을 수 없습니다."));

        List<SpaceImg> spaceImgList = spaceImgRepository.findBySpaceIdOrderBySortOrderAscIdAsc(spaceId);
        List<SpaceImgDto> spaceImgDtoList = new ArrayList<>();
        List<Long> spaceImgIds = new ArrayList<>();

        for (SpaceImg spaceImg : spaceImgList) {
            spaceImgDtoList.add(SpaceImgDto.of(spaceImg));
            spaceImgIds.add(spaceImg.getId());
        }

        SpaceFormDto dto = SpaceFormDto.of(space);
        dto.setSpaceImgDtoList(spaceImgDtoList);
        dto.setSpaceImgIds(spaceImgIds);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpaceDto> getHostSpaceList(String email) {
        List<Space> spaceList = spaceRepository.findByHostEmail(email);
        List<SpaceDto> spaceDtoList = new ArrayList<>();

        for (Space space : spaceList) {
            String repImgUrl = spaceImgRepository.findBySpaceIdAndRepimgYn(space.getId(), SpaceImg.REP_YES)
                    .map(SpaceImg::getImgUrl)
                    .orElse("/images/default.png");
            spaceDtoList.add(SpaceDto.of(space, repImgUrl));
        }

        return spaceDtoList;
    }

    @Override
    @Transactional
    public void deleteSpace(Long spaceId, String email) throws Exception {
        Space space = getOwnedSpace(spaceId, email);

        List<SpaceImg> spaceImgs = spaceImgRepository.findBySpaceIdOrderBySortOrderAscIdAsc(spaceId);
        for (SpaceImg spaceImg : spaceImgs) {
            spaceImgService.deleteSpaceImg(spaceImg.getId());
        }

        spaceRepository.delete(space);
    }

    @Override
    @Transactional
    public SpaceStatus toggleSpaceStatus(Long spaceId, String email) {
        Space space = getOwnedSpace(spaceId, email);
        space.changeStatus(
                space.getSpaceStatus() == SpaceStatus.AVAILABLE
                        ? SpaceStatus.UNAVAILABLE
                        : SpaceStatus.AVAILABLE
        );
        return space.getSpaceStatus();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable) {
        return spaceRepository.getAdminSpacePage(spaceSearchDto, pageable);
    }

    private void persistNewImages(Space space,
                                  List<SpaceImageMetaDto> normalizedMetaList,
                                  List<MultipartFile> validFiles) throws Exception {
        List<SpaceImageMetaDto> newVisibleMetaList = normalizedMetaList.stream()
                .filter(meta -> Boolean.TRUE.equals(meta.getIsNew()) && !Boolean.TRUE.equals(meta.getDeleted()))
                .sorted(Comparator.comparingInt(SpaceImageMetaDto::getSortOrder))
                .toList();

        if (newVisibleMetaList.size() != validFiles.size()) {
            throw new IllegalArgumentException("신규 이미지 메타 정보와 업로드 파일 수가 일치하지 않습니다.");
        }

        for (int i = 0; i < newVisibleMetaList.size(); i++) {
            SpaceImageMetaDto meta = newVisibleMetaList.get(i);
            MultipartFile file = validFiles.get(i);

            SpaceImg newImg = new SpaceImg();
            newImg.setSpace(space);
            newImg.setRepimgYn(Boolean.TRUE.equals(meta.getRepresentative()) ? SpaceImg.REP_YES : SpaceImg.REP_NO);
            newImg.setSortOrder(meta.getSortOrder());
            spaceImgService.saveSpaceImg(newImg, file);
        }
    }

    private List<MultipartFile> extractValidFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();
    }

    private List<SpaceImageMetaDto> normalizeImageMetaList(List<SpaceImageMetaDto> imageMetaList, int validFileCount) {
        if (imageMetaList == null || imageMetaList.isEmpty()) {
            List<SpaceImageMetaDto> fallbackMetaList = new ArrayList<>();
            for (int i = 0; i < validFileCount; i++) {
                SpaceImageMetaDto meta = new SpaceImageMetaDto();
                meta.setClientId("new-" + i);
                meta.setImageId(null);
                meta.setIsNew(true);
                meta.setDeleted(false);
                meta.setRepresentative(i == 0);
                meta.setSortOrder(i);
                fallbackMetaList.add(meta);
            }
            return fallbackMetaList;
        }

        List<SpaceImageMetaDto> sortedMetaList = new ArrayList<>(imageMetaList);
        sortedMetaList.sort(Comparator.comparingInt(meta ->
                meta.getSortOrder() == null ? Integer.MAX_VALUE : meta.getSortOrder()));

        boolean representativeAssigned = false;
        for (int i = 0; i < sortedMetaList.size(); i++) {
            SpaceImageMetaDto meta = sortedMetaList.get(i);
            meta.setSortOrder(i);
            meta.setDeleted(Boolean.TRUE.equals(meta.getDeleted()));
            meta.setIsNew(Boolean.TRUE.equals(meta.getIsNew()));

            boolean shouldBeRepresentative =
                    !meta.getDeleted() && Boolean.TRUE.equals(meta.getRepresentative()) && !representativeAssigned;
            meta.setRepresentative(shouldBeRepresentative);
            representativeAssigned = representativeAssigned || shouldBeRepresentative;
        }

        if (!representativeAssigned) {
            for (SpaceImageMetaDto meta : sortedMetaList) {
                if (!Boolean.TRUE.equals(meta.getDeleted())) {
                    meta.setRepresentative(true);
                    break;
                }
            }
        }

        return sortedMetaList;
    }

    private void validateVisibleImages(List<SpaceImageMetaDto> imageMetaList) {
        boolean hasVisibleImage = imageMetaList.stream()
                .anyMatch(meta -> !Boolean.TRUE.equals(meta.getDeleted()));
        if (!hasVisibleImage) {
            throw new IllegalArgumentException("최소 1장 이상의 이미지를 유지해야 합니다.");
        }
    }

    private void ensureRepresentativeImage(Long spaceId) {
        List<SpaceImg> finalImgs = spaceImgRepository.findBySpaceIdOrderBySortOrderAscIdAsc(spaceId);
        if (finalImgs.isEmpty()) {
            return;
        }

        SpaceImg selectedRepresentative = null;
        for (SpaceImg img : finalImgs) {
            if (selectedRepresentative == null && SpaceImg.REP_YES.equals(img.getRepimgYn())) {
                selectedRepresentative = img;
            } else {
                img.setRepimgYn(SpaceImg.REP_NO);
            }
        }

        if (selectedRepresentative == null) {
            selectedRepresentative = finalImgs.get(0);
            selectedRepresentative.setRepimgYn(SpaceImg.REP_YES);
        }
    }

    private Space getOwnedSpace(Long spaceId, String email) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));

        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new EntityNotFoundException("공간 정보를 찾을 수 없습니다."));

        if (!space.getHost().getId().equals(member.getId())) {
            throw new IllegalStateException("본인 공간만 접근할 수 있습니다.");
        }

        return space;
    }
}
