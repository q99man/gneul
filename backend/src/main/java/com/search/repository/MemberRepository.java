package com.search.repository;

import com.search.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    // 이메일을 통해 이미 가입된 회원인지 확인합니다.
    Optional<Member> findByEmail(String email);
}
