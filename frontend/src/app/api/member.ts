import { request } from './http';
import { getToken } from '../utils/auth';
import type { MypageDto } from './types';

/** 일반 로그인 요청 (이메일 + 비밀번호) - 백엔드 LoginRequest와 동일 */
export type LoginRequest = {
  email: string;
  password: string;
};

/** 백엔드 로그인 성공 응답 (JSON) */
export type LoginResponse = {
  token: string;
  email?: string;
  name?: string;
};

/** 회원가입 요청 (MemberFormDto와 동일) */
export type SignupRequest = {
  name: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
};

/**
 * 일반 로그인. 성공 시 { token, email?, name? } 반환.
 * 백엔드: POST /api/member/login → { token, email, name }
 * 401: 비밀번호 불일치 / 가입되지 않은 이메일
 */
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await request<LoginResponse | string>('/api/member/login', {
    method: 'POST',
    body: { email: body.email.trim(), password: body.password },
  });
  if (typeof res === 'string') return { token: res };
  if (res && typeof res.token === 'string') return res as LoginResponse;
  throw new Error('로그인 응답 형식이 올바르지 않습니다.');
}

/**
 * 일반 회원가입.
 * 400: 유효성 실패, 409/500: 이미 가입된 이메일
 */
export async function signup(body: SignupRequest): Promise<void> {
  await request('/api/member/new', {
    method: 'POST',
    body: {
      name: body.name.trim(),
      email: body.email.trim(),
      password: body.password,
      address: body.address.trim(),
      phoneNumber: body.phoneNumber.trim(),
    },
  });
}

/**
 * 마이페이지 정보 조회. 토큰 필요. 401 시 로그인 페이지로 보낼 것.
 */
export async function getMypage(): Promise<MypageDto> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  return await request<MypageDto>('/api/member/mypage', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** 개인정보 수정 요청 (이름, 주소, 전화번호) */
export type MemberUpdateRequest = {
  name: string;
  address: string;
  phoneNumber: string;
};

/**
 * 개인정보 수정. 토큰 필요. POST /api/member/update
 */
export async function updateMember(body: MemberUpdateRequest): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('로그인이 필요합니다.');
  await request('/api/member/update', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      name: body.name.trim(),
      address: body.address.trim(),
      phoneNumber: body.phoneNumber.trim(),
    },
  });
}
