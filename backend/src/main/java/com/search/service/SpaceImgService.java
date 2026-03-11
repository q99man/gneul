package com.search.service;

import com.search.entity.SpaceImg;
import com.search.repository.SpaceImgRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class SpaceImgService {

    // application.yml에 설정한 파일 저장 경로를 불러옵니다.
    @Value("${itemImgLocation}")
    private String itemImgLocation;

    private final SpaceImgRepository spaceImgRepository;
    private final FileService fileService;

    public void saveSpaceImg(SpaceImg spaceImg, MultipartFile spaceImgFile) throws Exception {
        String oriImgName = spaceImgFile.getOriginalFilename();
        String imgName = "";
        String imgUrl = "";

        // 1. 파일 업로드 (FileService 이용)
        if (!StringUtils.isEmpty(oriImgName)) {
            imgName = fileService.uploadFile(itemImgLocation, oriImgName, spaceImgFile.getBytes());
            imgUrl = "/images/" + imgName; // 로컬 환경의 정적 리소스 경로
        }

        // 2. 이미지 정보 저장 (Entity 업데이트)
        spaceImg.updateSpaceImg(oriImgName, imgName, imgUrl);
        spaceImgRepository.save(spaceImg);
    }

    public void updateSpaceImg(Long spaceImgId, MultipartFile spaceImgFile) throws Exception {
        if (!spaceImgFile.isEmpty()) { // 새로운 이미지 파일이 있을 경우에만 실행
            SpaceImg savedSpaceImg = spaceImgRepository.findById(spaceImgId)
                    .orElseThrow(EntityNotFoundException::new);

            // 1. 기존 파일 삭제
            if (!StringUtils.isEmpty(savedSpaceImg.getImgName())) {
                fileService.deleteFile(itemImgLocation + "/" + savedSpaceImg.getImgName());
            }

            // 2. 새 파일 업로드
            String oriImgName = spaceImgFile.getOriginalFilename();
            String imgName = fileService.uploadFile(itemImgLocation, oriImgName, spaceImgFile.getBytes());
            String imgUrl = "/images/" + imgName;

            // 3. 이미지 엔티티 정보 변경 (변경 감지 작동)
            savedSpaceImg.updateSpaceImg(oriImgName, imgName, imgUrl);
        }
    }

    /**
     * 공간 이미지 삭제: 실제 파일과 DB 레코드를 함께 제거합니다.
     */
    public void deleteSpaceImg(Long spaceImgId) throws Exception {
        SpaceImg savedSpaceImg = spaceImgRepository.findById(spaceImgId)
                .orElseThrow(EntityNotFoundException::new);

        if (!StringUtils.isEmpty(savedSpaceImg.getImgName())) {
            fileService.deleteFile(itemImgLocation + "/" + savedSpaceImg.getImgName());
        }

        spaceImgRepository.delete(savedSpaceImg);
    }
}
