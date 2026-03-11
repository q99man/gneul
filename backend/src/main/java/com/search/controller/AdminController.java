package com.search.controller;

import com.search.dto.MemberDto;
import com.search.dto.SpaceDto;
import com.search.entity.Member;
import com.search.entity.Space;
import com.search.repository.MemberRepository;
import com.search.repository.SpaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

  private final MemberRepository memberRepository;
  private final SpaceRepository spaceRepository;

  // 1. 전체 회원 목록 조회 (Member -> MemberDto 변환)
  @GetMapping("/members")
  public ResponseEntity<List<MemberDto>> getMembers() {
    List<Member> members = memberRepository.findAll();

    // 여기서 MemberDto.of()를 사용하기 때문에 이제 회색이 사라질 거예요!
    List<MemberDto> memberDtoList = members.stream()
      .map(MemberDto::of)
      .collect(Collectors.toList());

    return ResponseEntity.ok(memberDtoList);
  }

  // 2. 회원 삭제 (강제 탈퇴)
  @DeleteMapping("/member/{id}")
  public ResponseEntity<String> deleteMember(@PathVariable Long id) {
    memberRepository.deleteById(id);
    return ResponseEntity.ok("회원이 삭제되었습니다.");
  }

  // 2. 전체 공간 목록 조회 (Space -> SpaceDto 변환)
  @GetMapping("/spaces")
  public ResponseEntity<List<SpaceDto>> getSpaces() {
    List<Space> spaces = spaceRepository.findAll();

    // 여기서 SpaceDto.of()를 사용하므로 이 임포트도 활성화됩니다!
    List<SpaceDto> spaceDtoList = spaces.stream()
      .map(SpaceDto::of)
      .collect(Collectors.toList());

    return ResponseEntity.ok(spaceDtoList);
  }

  // 4. 부적절한 공간 삭제
  @DeleteMapping("/space/{id}")
  public ResponseEntity<String> deleteSpace(@PathVariable Long id) {
    spaceRepository.deleteById(id);
    return ResponseEntity.ok("공간 정보가 삭제되었습니다.");
  }
}
