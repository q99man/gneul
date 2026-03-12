package com.search.controller;

import com.search.constant.SpaceStatus;
import com.search.dto.SpaceDto;
import com.search.dto.SpaceFormDto;
import com.search.dto.SpaceImageMetaDto;
import com.search.service.SpaceService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @GetMapping("/api/host/spaces")
    public ResponseEntity<List<SpaceDto>> getMySpaces(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        return ResponseEntity.ok(spaceService.getHostSpaceList(principal.getName()));
    }

    @PostMapping("/api/host/space/new")
    public ResponseEntity<String> spaceNew(@Valid @RequestPart("space") SpaceFormDto spaceFormDto,
                                           BindingResult bindingResult,
                                           @RequestPart(value = "imageMetaList", required = false) List<SpaceImageMetaDto> imageMetaList,
                                           @RequestPart("spaceImgFile") List<MultipartFile> spaceImgFileList,
                                           Principal principal) {
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(
                    bindingResult.getFieldError() != null
                            ? bindingResult.getFieldError().getDefaultMessage()
                            : "데이터 검증에 실패했습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (principal == null) {
            return new ResponseEntity<>("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            spaceService.createHostSpace(spaceFormDto, imageMetaList, spaceImgFileList, principal.getName());
            return new ResponseEntity<>("공간 등록이 완료되었습니다.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("공간 등록 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/api/host/space/{spaceId}")
    public ResponseEntity<SpaceFormDto> getSpaceDtl(@PathVariable("spaceId") Long spaceId, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try {
            return new ResponseEntity<>(spaceService.getSpaceDtl(spaceId, principal.getName()), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/api/host/space/{spaceId}")
    public ResponseEntity<String> updateSpace(@PathVariable("spaceId") Long spaceId,
                                              @Valid @RequestPart("space") SpaceFormDto spaceFormDto,
                                              BindingResult bindingResult,
                                              @RequestPart(value = "imageMetaList", required = false) List<SpaceImageMetaDto> imageMetaList,
                                              @RequestPart(value = "spaceImgFile", required = false) List<MultipartFile> spaceImgFileList,
                                              Principal principal) {
        if (bindingResult.hasErrors()) {
            return new ResponseEntity<>(
                    bindingResult.getFieldError() != null
                            ? bindingResult.getFieldError().getDefaultMessage()
                            : "데이터 검증에 실패했습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }

        if (principal == null) {
            return new ResponseEntity<>("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            spaceService.updateHostSpace(spaceId, spaceFormDto, imageMetaList, spaceImgFileList, principal.getName());
            return new ResponseEntity<>("공간 수정이 완료되었습니다.", HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>("공간 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("공간 수정 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/api/host/space/{spaceId}")
    public ResponseEntity<String> deleteSpace(@PathVariable("spaceId") Long spaceId, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>("로그인이 필요합니다.", HttpStatus.UNAUTHORIZED);
        }

        try {
            spaceService.deleteSpace(spaceId, principal.getName());
            return new ResponseEntity<>("공간 삭제가 완료되었습니다.", HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>("공간 정보를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            return new ResponseEntity<>("공간 삭제 중 오류가 발생했습니다.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/api/host/space/{spaceId}/status")
    public ResponseEntity<SpaceStatus> toggleSpaceStatus(@PathVariable("spaceId") Long spaceId, Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        try {
            return new ResponseEntity<>(spaceService.toggleSpaceStatus(spaceId, principal.getName()), HttpStatus.OK);
        } catch (EntityNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}
