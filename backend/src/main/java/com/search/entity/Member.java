package com.search.entity;

import com.search.constant.Role;
import com.search.dto.MemberFormDto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Member extends BaseTimeEntity {

  @Id
  @Column(name = "member_id")
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String name;

  @Column(unique = true)
  private String email; // 소셜 로그인 및 회원 식별용

  private String password; // 소셜 로그인 위주라면 null 허용 가능

  private String address;

  private String phoneNumber;

  private String picture; // 프로필 이미지

  @Enumerated(EnumType.STRING)
  private Role role; //

  private String provider;   // google, kakao 등
  private String providerId; // 소셜 플랫폼에서 부여한 고유 ID

  // 홈페이지 직접 회원가입 (상세 정보 포함)
  public static Member createMember(MemberFormDto memberFormDto, String password) {
    Member member = new Member();
    member.setName(memberFormDto.getName());
    member.setEmail(memberFormDto.getEmail());
    member.setAddress(memberFormDto.getAddress());
    member.setPhoneNumber(memberFormDto.getPhoneNumber());
    member.setPassword(password);
    member.setRole(Role.GUEST); // 요청하신 GUEST 권한
    return member;
  }

  // 소셜 로그인 사용자를 위한 생성 메서드
  public static Member createSocialMember(String email, String provider, String providerId) {
    Member member = new Member();
    member.setEmail(email);
    member.setProvider(provider);
    member.setProviderId(providerId);
    member.setRole(Role.GUEST); // 소셜도 GUEST로 시작
    // 소셜은 이름/전화번호가 없을 수 있으므로 이메일 앞부분을 임시 이름으로 쓰기도 합니다.
    member.setName(email.split("@")[0]);
    return member;
  }
}
