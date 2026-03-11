import React from 'react';
import { Outlet } from 'react-router';
import { AuthModal } from './auth/AuthModal';

/**
 * 라우터가 렌더하는 루트 레이아웃.
 * 모든 페이지 + AuthModal이 이 안에서 렌더되므로 모달 안의 LoginForm/SignupForm에서 useNavigate 사용 가능.
 */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <AuthModal />
    </>
  );
}
