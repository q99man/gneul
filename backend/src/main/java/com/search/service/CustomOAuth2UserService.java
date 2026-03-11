package com.search.service;

import com.search.entity.Member;
import com.search.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
  private final MemberRepository memberRepository;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) {
    OAuth2User oAuth2User = super.loadUser(userRequest);
    Map<String, Object> attributes = oAuth2User.getAttributes();

    // 어떤 플랫폼(google, kakao, naver 등)인지 확인
    String provider = userRequest.getClientRegistration().getRegistrationId();
    
    String email = "";
    String name = "";
    String providerId = "";

    if (provider.equals("naver")) {
      // 네이버는 'response' 키 안에 실제 정보가 있음
      Map<String, Object> response = (Map<String, Object>) attributes.get("response");
      if (response != null) {
        email = (String) response.get("email");
        name = (String) response.get("name");
        providerId = (String) response.get("id");
      }
    } else if (provider.equals("kakao")) {
      // 카카오는 'kakao_account' 안에 정보가 있음
      Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
      if (kakaoAccount != null) {
        email = (String) kakaoAccount.get("email");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
        if (profile != null) {
          name = (String) profile.get("nickname");
        }
      }
      providerId = attributes.get("id") != null ? attributes.get("id").toString() : null;
    } else {
      // 구글 등 기본 처리
      email = (String) attributes.get("email");
      name = (String) attributes.get("name");
      providerId = attributes.get("sub") != null ? attributes.get("sub").toString() : oAuth2User.getName();
    }

    if (email == null || email.isEmpty()) {
      throw new RuntimeException(provider + " 계정에서 이메일 정보를 불러올 수 없습니다.");
    }

    // 기존 회원이면 업데이트, 없으면 신규 생성
    final String finalEmail = email;
    final String finalName = name;
    final String finalProviderId = providerId;

    Member member = memberRepository.findByEmail(finalEmail)
      .map(entity -> {
        entity.setProviderId(finalProviderId);
        if (finalName != null) entity.setName(finalName);
        return memberRepository.save(entity);
      })
      .orElseGet(() -> {
        Member newMember = Member.createSocialMember(finalEmail, provider, finalProviderId);
        if (finalName != null) newMember.setName(finalName);
        return memberRepository.save(newMember);
      });

    return new DefaultOAuth2User(
      Collections.singleton(new SimpleGrantedAuthority("ROLE_" + member.getRole().name())),
      attributes,
      provider.equals("naver") ? "response" : (provider.equals("kakao") ? "id" : "email")
    );
  }
}
