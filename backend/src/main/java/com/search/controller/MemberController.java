package com.search.controller;

import com.search.config.JwtTokenProvider;
import com.search.dto.MemberFormDto;
import com.search.dto.MemberUpdateDto;
import com.search.dto.MyPageDto;
import com.search.dto.ReservationHistDto;
import com.search.entity.Member;
import com.search.repository.MemberRepository;
import com.search.service.MemberService;
import com.search.service.ReservationService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final ReservationService reservationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

    // 로그인 요청을 위한 간단한 DTO
    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    // 회원가입
    @PostMapping("/new")
    public ResponseEntity saveMember(@Valid @RequestBody MemberFormDto memberFormDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            StringBuilder sb = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> {
                sb.append(error.getDefaultMessage()).append(" ");
            });
            return new ResponseEntity<>(sb.toString().trim(), HttpStatus.BAD_REQUEST);
        }

        try {
            memberService.saveMember(memberFormDto);
            return new ResponseEntity<>("회원가입이 완료되었습니다.", HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // 일반 로그인
    @PostMapping("/login")
    public ResponseEntity login(@RequestBody LoginRequest loginRequest) {
        // 1. 이메일 확인
        Member member = memberRepository.findByEmail(loginRequest.getEmail())
                .orElse(null);

        if (member == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "가입되지 않은 이메일입니다.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        // 2. 비밀번호 확인 (BCrypt 암호화 비교)
        if (member.getPassword() == null || !passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "비밀번호가 틀렸습니다.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        // 3. 로그인 성공 시 JWT 토큰 발행 (JSON 형태로 반환)
        String token = jwtTokenProvider.createToken(member.getEmail());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", member.getEmail());
        response.put("name", member.getName());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/mypage")
    public ResponseEntity<MyPageDto> getMyPageInfo(Principal principal) {
        String email = principal.getName();
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(EntityNotFoundException::new);

        MyPageDto myPageDto = new MyPageDto();
        myPageDto.setName(member.getName());
        myPageDto.setEmail(member.getEmail());
        myPageDto.setPhoneNumber(member.getPhoneNumber());
        myPageDto.setAddress(member.getAddress());
    if (member.getRole() != null) {
      myPageDto.setRole(member.getRole().name());
    }

        // 예약 서비스에서 리스트 가져오기 (0페이지, 5개 항목 제한)
        Pageable pageable = PageRequest.of(0, 5);
        Page<ReservationHistDto> histPage = reservationService.getReservationList(email, pageable);
        myPageDto.setRecentReservations(histPage.getContent());

        return ResponseEntity.ok(myPageDto);
    }

    @PostMapping("/update")
    public ResponseEntity updateMember(@Valid @RequestBody MemberUpdateDto dto, Principal principal) {
        memberService.updateMember(principal.getName(), dto);
        return new ResponseEntity<>("수정이 완료되었습니다.", HttpStatus.OK);
    }
}
