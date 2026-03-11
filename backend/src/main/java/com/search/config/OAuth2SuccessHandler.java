package com.search.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
  private final JwtTokenProvider tokenProvider;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
    Map<String, Object> attributes = oAuth2User.getAttributes();

    String email = resolveEmail(attributes, authentication);

    if (email == null || email.isBlank()) {
      response.sendRedirect("http://localhost:5173/login?error=email_required");
      return;
    }

    String token = tokenProvider.createToken(email);
    response.sendRedirect("http://localhost:5173/oauth/callback?token=" + token);
  }

  /**
   * Google: attributes.email / Kakao: attributes.kakao_account.email / Naver: attributes.response.email
   */
  private String resolveEmail(Map<String, Object> attributes, Authentication authentication) {
    // Google: 최상위 email
    Object email = attributes.get("email");
    if (email instanceof String) {
      return (String) email;
    }

    // Kakao: kakao_account.email
    Object kakaoAccount = attributes.get("kakao_account");
    if (kakaoAccount instanceof Map) {
      email = ((Map<?, ?>) kakaoAccount).get("email");
      if (email instanceof String) {
        return (String) email;
      }
    }

    // Naver: response.email
    Object naverResponse = attributes.get("response");
    if (naverResponse instanceof Map) {
      email = ((Map<?, ?>) naverResponse).get("email");
      if (email instanceof String) {
        return (String) email;
      }
    }

    return null;
  }
}
