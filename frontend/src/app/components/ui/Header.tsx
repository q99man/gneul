import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Menu } from 'lucide-react';
import { getUserEmailFromToken } from '../../utils/auth';
import { AppSidebar } from './AppSidebar';

export const Header = ({ onLogoClick }: { onLogoClick?: () => void }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(() => getUserEmailFromToken());
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // 사이드바 열릴 때마다 로그인 상태 갱신
  useEffect(() => {
    if (mobileOpen) setUserEmail(getUserEmailFromToken());
  }, [mobileOpen]);

  // OAuth 콜백에서 토큰 저장 시 로그인 상태 반영 (카카오/네이버 등)
  useEffect(() => {
    const onAuthLogin = () => setUserEmail(getUserEmailFromToken());
    window.addEventListener("auth-login", onAuthLogin);
    return () => window.removeEventListener("auth-login", onAuthLogin);
  }, []);

  // 홈(/)으로 올 때마다 로그인 상태 재확인 (OAuth 리다이렉트 직후 반영)
  useEffect(() => {
    if (location.pathname === '/') setUserEmail(getUserEmailFromToken());
  }, [location.pathname]);

  return (
    <header className="w-full px-5 py-4 md:px-10 md:py-5 flex items-center justify-between gap-4 z-50 bg-[#fafafa]/90 backdrop-blur-md border-b border-gray-200">
      {/* 웹 이름 */}
      <button
        type="button"
        onClick={() => {
          onLogoClick?.();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="text-xl md:text-2xl font-serif font-bold tracking-tighter text-gray-700 hover:text-black transition-colors cursor-pointer"
      >
        GNEUL
      </button>

      {/* 가운데 검색 */}
      <div className="flex-1 flex justify-center">
        <motion.div
          ref={searchRef}
          layout
          className="flex items-center overflow-hidden rounded-full border border-gray-300/80 bg-white/80 text-xs md:text-sm lg:text-[15px] text-gray-700 shadow-sm cursor-text hover:border-gray-400/90 hover:bg-white w-full max-w-[260px] md:max-w-[390px] lg:max-w-[520px]"
          animate={{}}
          onClick={() => {
            if (!searchOpen) {
              setSearchOpen(true);
            }
          }}
        >
          <button
            type="button"
              className="pl-3 pr-1 py-1.5 text-gray-700 cursor-pointer hover:text-black"
            onClick={(e) => {
              e.stopPropagation();
              if (!searchOpen) setSearchOpen(true);
            }}
          >
            <Search size={16} />
          </button>
          {!searchOpen && (
            <button
              type="button"
              className="pr-3 py-1.5 text-[11px] md:text-[12px] lg:text-[13px] font-medium text-gray-600 cursor-pointer truncate"
              onClick={(e) => {
                e.stopPropagation();
                if (!searchOpen) setSearchOpen(true);
              }}
            >
              검색
            </button>
          )}
          {searchOpen && (
            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="검색어를 입력해 주세요"
              className="flex-1 pr-3 py-1.5 bg-transparent outline-none text-xs md:text-sm lg:text-base text-gray-800 placeholder:text-gray-400"
            />
          )}
        </motion.div>
      </div>

      {/* 우측 햄버거 버튼 (모든 해상도에서 동일) */}
      <button
        type="button"
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu size={20} />
      </button>

      {/* 사이드바 - body에 포탈, 오른쪽에서 부드럽게 슬라이드 + 블러 오버레이 */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="fixed inset-0 bg-black/30 backdrop-blur-[3px] z-[70]"
                  onClick={() => setMobileOpen(false)}
                  aria-hidden
                />
                <AppSidebar onClose={() => setMobileOpen(false)} isInline={false} />
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};
