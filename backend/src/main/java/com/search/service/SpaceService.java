package com.search.service;

import com.search.dto.MainSpaceDto;
import com.search.dto.SpaceDto;
import com.search.dto.SpaceFormDto;
import com.search.dto.SpaceImgDto;
import com.search.dto.SpaceSearchDto;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.entity.SpaceImg;
import com.search.repository.MemberRepository;
import com.search.repository.SpaceImgRepository;
import com.search.repository.SpaceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.ArrayList;

@Service
@Transactional
@RequiredArgsConstructor
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceImgRepository spaceImgRepository;
    private final SpaceImgService spaceImgService;
    private final MemberRepository memberRepository;
    private final FileService fileService;

    @Value("${itemImgLocation}")
    private String itemImgLocation;

    @Transactional
    public Long saveSpace(SpaceFormDto spaceFormDto, List<MultipartFile> spaceImgFileList, String email) throws Exception {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));

        Space space = Space.createSpace(spaceFormDto, member);
        spaceRepository.save(space);

        List<MultipartFile> validFiles = extractValidFiles(spaceImgFileList);

        if (validFiles.isEmpty()) {
            throw new IllegalArgumentException("공간 등록 시 최소 한 장 이상의 이미지가 필요합니다.");
        }

        for (int i = 0; i < validFiles.size(); i++) {
            MultipartFile multipartFile = validFiles.get(i);

            SpaceImg spaceImg = new SpaceImg();
            spaceImg.setSpace(space);
            spaceImg.setRepimgYn(i == 0 ? SpaceImg.REP_YES : SpaceImg.REP_NO);

            spaceImgService.saveSpaceImg(spaceImg, multipartFile);
        }

        return space.getId();
    }

    @Transactional(readOnly = true)
    public Page<MainSpaceDto> getAdminSpacePage(SpaceSearchDto spaceSearchDto, Pageable pageable) {
        return spaceRepository.getAdminSpacePage(spaceSearchDto, pageable);
    }

    @Transactional(readOnly = true)
    public SpaceFormDto getSpaceDetail(Long spaceId) {
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new EntityNotFoundException("공간 정보를 찾을 수 없습니다."));

        List<SpaceImg> spaceImgList = spaceImgRepository.findBySpaceIdOrderByIdAsc(spaceId);
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

    @Transactional(readOnly = true)
    public SpaceFormDto getSpaceDtl(Long spaceId) {
        return getSpaceDetail(spaceId);
    }

    @Transactional
    public Long updateSpace(SpaceFormDto spaceFormDto, List<MultipartFile> spaceImgFileList) throws Exception {
        Space space = spaceRepository.findById(spaceFormDto.getId())
                .orElseThrow(() -> new EntityNotFoundException("공간 정보를 찾을 수 없습니다."));

        // 1. 공간 기본 정보 수정
        space.updateSpace(spaceFormDto);

        // 2. 프론트에서 유지하겠다고 보낸 기존 이미지 ID 목록
        Set<Long> retainedImgIdSet = spaceFormDto.getSpaceImgIds() == null
                ? Collections.emptySet()
                : new HashSet<>(spaceFormDto.getSpaceImgIds());

        // 3. 유지 목록에 없는 기존 이미지는 삭제
        List<SpaceImg> existingImgs = spaceImgRepository.findBySpaceIdOrderByIdAsc(space.getId());
        for (SpaceImg img : existingImgs) {
            if (!retainedImgIdSet.contains(img.getId())) {
                spaceImgService.deleteSpaceImg(img.getId());
            }
        }

        // 4. 새로 업로드한 이미지는 전부 추가
        List<MultipartFile> validFiles = extractValidFiles(spaceImgFileList);
        for (MultipartFile multipartFile : validFiles) {
            SpaceImg spaceImg = new SpaceImg();
            spaceImg.setSpace(space);
            spaceImg.setRepimgYn(SpaceImg.REP_NO);
            spaceImgService.saveSpaceImg(spaceImg, multipartFile);
        }

        // 5. 최소 이미지 검증
        List<SpaceImg> finalImgs = spaceImgRepository.findBySpaceIdOrderByIdAsc(space.getId());

        if (finalImgs.isEmpty()) {
            throw new IllegalArgumentException("최소 한 장 이상의 이미지가 필요합니다.");
        }

        boolean hasRepresentative = finalImgs.stream()
                .anyMatch(img -> SpaceImg.REP_YES.equals(img.getRepimgYn()));

        if (!hasRepresentative) {
            finalImgs.get(0).setRepimgYn(SpaceImg.REP_YES);
        }

        // 6. 대표 이미지 보정
        ensureRepresentativeImage(space.getId());

        return space.getId();
    }

    private List<MultipartFile> extractValidFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return Collections.emptyList();
        }

        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();
    }

    private void ensureRepresentativeImage(Long spaceId) {
        List<SpaceImg> finalImgs = spaceImgRepository.findBySpaceIdOrderByIdAsc(spaceId);

        if (finalImgs.isEmpty()) {
            return;
        }

        boolean hasRepresentative = finalImgs.stream()
                .anyMatch(img -> SpaceImg.REP_YES.equals(img.getRepimgYn()));

        if (hasRepresentative) {
            return;
        }

        finalImgs.get(0).setRepimgYn(SpaceImg.REP_YES);
    }

    // SpaceService.java
    @Transactional(readOnly = true)
    public List<SpaceDto> getHostSpaceList(String email) {
        List<Space> spaceList = spaceRepository.findByHostEmail(email);
        List<SpaceDto> spaceDtoList = new ArrayList<>();

        for (Space space : spaceList) {
            // 1. 해당 공간의 대표 이미지를 DB에서 찾습니다.
            String repImgUrl = spaceImgRepository.findBySpaceIdAndRepimgYn(space.getId(), "Y")
                    .map(SpaceImg::getImgUrl)
                    .orElse("/images/default.png"); // 이미지가 없을 때 기본값

            // 2. 이제 엔티티와 찾은 이미지 경로를 함께 넘깁니다.
            spaceDtoList.add(SpaceDto.of(space, repImgUrl));
        }
        return spaceDtoList;
    }

    @Transactional
    public void deleteSpace(Long spaceId) throws Exception {
        // 1. 해당 공간의 모든 이미지 정보를 가져옵니다.
        List<SpaceImg> spaceImgList = spaceImgRepository.findBySpaceIdOrderByIdAsc(spaceId);

        // 2. 물리적 경로에서 파일들을 삭제합니다.
        for (SpaceImg spaceImg : spaceImgList) {
            // 파일이 존재할 때만 삭제하도록 로직을 보호하면 더 안전합니다.
            String filePath = itemImgLocation + "/" + spaceImg.getImgName();
            fileService.deleteFile(filePath);
        }

        // 3. DB에서 이미지 정보를 삭제합니다. (자식 먼저)
        spaceImgRepository.deleteAll(spaceImgList);

        // 4. 마지막으로 공간 정보를 삭제합니다. (부모 나중에)
        spaceRepository.deleteById(spaceId);
    }
}
