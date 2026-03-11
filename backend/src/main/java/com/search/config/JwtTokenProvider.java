package com.search.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

  private final UserDetailsService userDetailsService;

  @Value("${jwt.secret}")
  private String secretKey;

  private Key key;

  // 토큰 유효시간 (예: 1시간 = 60 * 60 * 1000L)
  private long tokenValidTime = 24 * 60 * 60 * 1000L; // 24시간으로 설정

  public String createToken(String email) {
    Claims claims = Jwts.claims().setSubject(email); // JWT payload에 저장되는 정보 단위
    Date now = new Date();

    return Jwts.builder()
      .setClaims(claims) // 정보 저장
      .setIssuedAt(now) // 토큰 발행 시간 정보
      .setExpiration(new Date(now.getTime() + tokenValidTime)) // set Expire Time
      .signWith(key, SignatureAlgorithm.HS256)  // 사용할 암호화 알고리즘과 signature에 들어갈 secret값 세팅
      .compact();
  }

  @PostConstruct
  protected void init() {
    // 비밀키를 Base64로 인코딩하여 저장
    byte[] keyBytes = Base64.getEncoder().encode(secretKey.getBytes());
    this.key = Keys.hmacShaKeyFor(keyBytes);
  }

  // 1. JWT 토큰에서 인증 정보 조회 (getAuthentication)
  public Authentication getAuthentication(String token) {
    // 토큰에서 email(subject)을 추출합니다.
    String email = Jwts.parserBuilder()
      .setSigningKey(key)
      .build()
      .parseClaimsJws(token)
      .getBody()
      .getSubject();

    // DB에서 사용자 정보를 로드합니다.
    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

    // 스프링 시큐리티의 인증 객체를 생성하여 반환합니다.
    return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
  }

  // 2. 토큰의 유효성 + 만료일자 확인 (validateToken)
  public boolean validateToken(String token) {
    try {
      Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token);
      return true;
    } catch (SecurityException | MalformedJwtException e) {
      // 잘못된 JWT 서명입니다.
    } catch (ExpiredJwtException e) {
      // 만료된 JWT 토큰입니다.
    } catch (UnsupportedJwtException e) {
      // 지원되지 않는 JWT 토큰입니다.
    } catch (IllegalArgumentException e) {
      // JWT 토큰이 잘못되었습니다.
    }
    return false;
  }
}
