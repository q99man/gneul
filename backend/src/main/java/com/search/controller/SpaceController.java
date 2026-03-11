package com.search.controller;

import com.search.dto.SpaceFormDto;
import com.search.service.SpaceService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/host/space")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @PostMapping("/new")
    public ResponseEntity<String> spaceNew(@Valid @RequestPart("space") SpaceFormDto spaceFormDto,
                                           BindingResult bindingResult,
                                           @RequestPart("spaceImgFile") List<MultipartFile> spaceImgFileList,
                                           Principal principal) {

        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(
                    bindingResult.getFieldError() != null
                            ? bindingResult.getFieldError().getDefaultMessage()
                            : "데이터 검증 실패",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (spaceImgFileList == null || spaceImgFileList.isEmpty() || spaceImgFileList.get(0).isEmpty()) {
            return new ResponseEntity<>("첫 번째 이미지는 필수입니다.", HttpStatus.BAD_REQUEST);
        }

        if (principal == null) {
            return new ResponseEntity<>("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            spaceService.saveSpace(spaceFormDto, spaceImgFileList, principal.getName());
            return new ResponseEntity<>("공간 등록이 완료되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("공간 등록 중 에러가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{spaceId}")
    public ResponseEntity<SpaceFormDto> getSpaceDtl(@PathVariable("spaceId") Long spaceId) {
        try {
            SpaceFormDto spaceFormDto = spaceService.getSpaceDtl(spaceId);
            return new ResponseEntity<>(spaceFormDto, HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{spaceId}")
    public ResponseEntity<String> updateSpace(@PathVariable("spaceId") Long spaceId,
                                              @Valid @RequestPart("space") SpaceFormDto spaceFormDto,
                                              BindingResult bindingResult,
                                              @RequestPart(value = "spaceImgFile", required = false) List<MultipartFile> spaceImgFileList) {

        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(
                    bindingResult.getFieldError() != null
                            ? bindingResult.getFieldError().getDefaultMessage()
                            : "데이터 검증 실패",
                    HttpStatus.BAD_REQUEST
            );
        }

        try {
            if (spaceFormDto.getId() == null) {
                spaceFormDto.setId(spaceId);
            }

            spaceService.updateSpace(spaceFormDto, spaceImgFileList);
            return new ResponseEntity<>("공간 수정이 완료되었습니다.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("공간 수정 중 에러가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
