import React from 'react';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

export default function HostSpaces() {
  const navigate = useNavigate();
  useEffect(() => {
    // 호스트 공간 리스트는 항상 마이페이지의 "내 공간 관리" 메뉴 안에서 노출
    navigate('/mypage', { replace: true, state: { menu: 'host_spaces' } });
  }, [navigate]);

  return null;
}
