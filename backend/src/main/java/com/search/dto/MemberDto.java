package com.search.dto;

import com.search.constant.Role;
import com.search.entity.Member;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberDto {
  private Long id;
  private String email;
  private String name;
  private Role role;

  // Entity를 Dto로 변환하는 정적 메서드
  public static MemberDto of(Member member) {
    MemberDto dto = new MemberDto();
    dto.setId(member.getId());
    dto.setEmail(member.getEmail());
    dto.setName(member.getName());
    dto.setRole(member.getRole());
    return dto;
  }
}
