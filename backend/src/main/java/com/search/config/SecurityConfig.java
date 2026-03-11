package com.search.config;

import com.search.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final CustomOAuth2UserService customOAuth2UserService;
  private final OAuth2SuccessHandler oAuth2SuccessHandler;
  private final JwtTokenProvider jwtTokenProvider; // 1. JWT 프로바이더 주입 필요

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      .csrf(csrf -> csrf.disable())
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        // 누구나 접근 가능 (로그인, 회원가입, 상품 조회)
        .requestMatchers("/", "/api/member/new", "/api/member/login", "/api/space/**", "/login/**", "/oauth2/**", "/images/**").permitAll()

        // 2. 관심상품 및 예약: GUEST, USER, HOST, ADMIN 모두 가능하도록 'HOST' 추가
        .requestMatchers("/api/reservation/**", "/api/wishlist/**").hasAnyRole("GUEST", "USER", "HOST", "ADMIN")

        // 3. 호스트 센터 API는 HOST와 ADMIN 권한을 가진 사람만 접근 가능
        .requestMatchers("/api/host/**").hasAnyRole("HOST", "ADMIN")

        // 4. 관리자 전용: 회원 및 전체 상품 관리
        .requestMatchers("/api/admin/**").hasRole("ADMIN")

        .anyRequest().authenticated()
      )
      .oauth2Login(oauth -> oauth
        .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
        .successHandler(oAuth2SuccessHandler)
      )
      // 5. JWT 필터를 시큐리티 필터 체인에 등록 (가장 중요!)
      .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // allowCredentials(true)와 함께 쓸 때 setAllowedOrigins("*")는 불가능하므로 setAllowedOriginPatterns("*") 사용
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setExposedHeaders(Arrays.asList("Authorization"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
