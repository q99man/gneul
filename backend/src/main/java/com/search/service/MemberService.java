package com.search.service;

import com.search.dto.MemberFormDto;
import com.search.dto.MemberUpdateDto;
import com.search.entity.Member;
import com.search.repository.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    public Member saveMember(MemberFormDto memberFormDto) {
        // 중복 확인
        memberRepository.findByEmail(memberFormDto.getEmail())
                .ifPresent(m -> {
                    throw new IllegalStateException("이미 가입된 회원입니다.");
                });

        // 암호화 및 엔티티 생성
        String password = passwordEncoder.encode(memberFormDto.getPassword());

        // 정적 팩토리 메서드 활용 (Member 엔티티의 정의에 맞춰 호출)
        Member member = Member.createMember(memberFormDto, password);

        return memberRepository.save(member);
    }

    public void updateMember(String email, MemberUpdateDto dto) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(EntityNotFoundException::new);

        // 더티 체킹에 의해 메서드 종료 시 자동으로 DB에 반영됩니다.
        member.setName(dto.getName());
        member.setAddress(dto.getAddress());
        member.setPhoneNumber(dto.getPhoneNumber());
    }
}
