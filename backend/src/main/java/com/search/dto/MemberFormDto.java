package com.search.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Getter
@Setter
public class MemberFormDto {

  @NotBlank(message = "이름은 필수 입력 값입니다.")
  private String name;

  @NotBlank(message = "이메일은 필수 입력 값입니다.")
  @Email(message = "이메일 형식으로 입력해주세요.")
  private String email;

  @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
  @Length(min = 8, max = 16, message = "비밀번호는 8자 이상, 16자 이하로 입력해주세요.")
  private String password;

  @NotBlank(message = "주소는 필수 입력 값입니다.")
  private String address;

  @NotBlank(message = "전화번호는 필수 입력 값입니다.")
  @Pattern(regexp = "^01(?:0|1|[6-9])-(?:\\d{3}|\\d{4})-\\d{4}$", message = "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)")
  private String phoneNumber;
}
