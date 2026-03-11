package com.search.service;

import com.search.entity.Member;
import com.search.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final MemberRepository memberRepository;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    Member member = memberRepository.findByEmail(email)
      .orElseThrow(() -> new UsernameNotFoundException("해당 이메일이 존재하지 않습니다: " + email));

    // Member 엔티티를 스프링 시큐리티의 User 객체로 변환
    return User.builder()
      .username(member.getEmail())
      .password(member.getPassword()) // 보통 DB의 인코딩된 비번
      .roles(member.getRole().name()) // 예: ADMIN, USER
      .build();
  }
}
