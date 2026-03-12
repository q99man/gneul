import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  LogOut,
  Home,
  Bell,
  HelpCircle,
  MessageCircle,
  Bot,
} from 'lucide-react';
import { getUserEmailFromToken, getDisplayName, logout as authLogout } from '../../utils/auth';
import { useAuthModal } from '../../context/AuthModalContext';
import { Toast } from './Toast';
import type { ToastAnchor } from './Toast';

export type AppSidebarProps = {
  onClose: (path?: string) => void;
  /** true면 마이페이지 등에서 메뉴바 옆 인라인으로 표시 */
  isInline?: boolean;
  /** true면 메뉴 클릭 시 navigate 하지 않고 onClose(path)만 호출 (마이페이지 퇴장 애니메이션 후 부모가 이동) */
  closeOnly?: boolean;
};

export function AppSidebar({ onClose, isInline = false, closeOnly = false }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal } = useAuthModal();
  const isOnMypage = closeOnly && location.pathname === '/mypage';
  const userEmail = getUserEmailFromToken();
  const profileTooltipText = userEmail ? (isOnMypage ? '홈으로 돌아가기' : '마이페이지') : '';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutBubbleRect, setLogoutBubbleRect] = useState<DOMRect | null>(null);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [logoutToastAnchor, setLogoutToastAnchor] = useState<ToastAnchor | null>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogoutClick = () => {
    if (!showLogoutConfirm && logoutButtonRef.current) {
      setLogoutBubbleRect(logoutButtonRef.current.getBoundingClientRect());
    }
    setShowLogoutConfirm((v) => !v);
  };

  const handleLogoutConfirm = () => {
    // "로그아웃 되었습니다" 토스트는 항상 로그아웃 버튼 바로 하단에서 뜨도록,
    // 버튼의 DOMRect를 anchor로 사용한다.
    const rect = logoutButtonRef.current?.getBoundingClientRect() ?? null;
    if (rect) {
      setLogoutToastAnchor({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
      setShowLogoutToast(true);
    }
    authLogout();
    setShowLogoutConfirm(false);
    // 확인 시에만 사이드바를 닫기 (마이페이지에서는 홈으로 이동)
    if (isInline) {
      onClose('/');
    } else {
      onClose();
    }
  };

  const handleLogoutToastDismiss = () => {
    setShowLogoutToast(false);
    setLogoutToastAnchor(null);
  };

  const go = (path: string) => {
    if (closeOnly) {
      onClose(path);
    } else {
      navigate(path);
      onClose();
    }
  };

  const baseClass =
    'flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100 border-l border-gray-200/70 shadow-[0_0_35px_rgba(15,23,42,0.12)]';
  const inlineClass = 'w-[80vw] max-w-xs md:w-80 flex-shrink-0';
  const overlayClass =
    'fixed top-0 right-0 bottom-0 w-[80vw] max-w-xs z-[80] flex flex-col';

  const content = (
    <>
      {/* 상단 로그인/회원가입 또는 로그인 유저 영역 */}
      <div className="px-5 pt-4 pb-6 h-[140px] flex flex-col justify-center gap-3 relative bg-gradient-to-r from-white/100 via-gray-50 to-gray-100/90 border-b border-gray-200/80">
        <div className="flex items-center gap-3">
          <div className="relative group flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                if (!userEmail) {
                  onClose();
                  openAuthModal('login', e.clientX, e.clientY);
                } else if (isOnMypage) {
                  onClose('/');
                } else {
                  go('/mypage');
                }
              }}
              className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md shadow-gray-400/40 ring-1 ring-gray-200/70 flex-shrink-0 cursor-pointer hover:ring-gray-300 hover:shadow-gray-500/40"
              aria-label={userEmail ? '마이페이지' : '로그인 / 회원가입'}
            >
              <User className="text-gray-500" size={24} />
            </button>
            {profileTooltipText && (
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-md bg-gray-800 text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10"
                role="tooltip"
              >
                {profileTooltipText}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1 relative group">
            {userEmail ? (
              <>
                <button
                  type="button"
                  onClick={() => (isOnMypage ? onClose('/') : go('/mypage'))}
                  className="text-left text-[15px] font-semibold text-gray-800 truncate cursor-pointer hover:text-gray-900 transition-colors"
                >
                  {getDisplayName() ?? userEmail}님 환영합니다
                </button>
                {profileTooltipText && (
                  <span
                    className="absolute left-0 top-full mt-1.5 px-2.5 py-1 rounded-md bg-gray-800 text-white text-[12px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-10"
                    role="tooltip"
                  >
                    {profileTooltipText}
                  </span>
                )}
              </>
            ) : (
              <div className="flex h-12 flex-col justify-center items-start gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    onClose();
                    openAuthModal('login', e.clientX, e.clientY);
                  }}
                  className="inline-flex items-center gap-1 text-[16px] font-semibold tracking-[0.18em] uppercase text-gray-700 hover:text-gray-900 cursor-pointer text-left"
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    onClose();
                    openAuthModal('signup', e.clientX, e.clientY);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer text-left"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>
        </div>
        {userEmail && (
          <div className="absolute right-5 bottom-4">
            <button
              ref={logoutButtonRef}
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <LogOut size={16} className="text-gray-500" />
              <span>로그아웃</span>
            </button>
          </div>
        )}
        {/* 로그아웃 확인 말풍선: body 포탈 + 아래 방향 + 최상단 z-index */}
        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {showLogoutConfirm && logoutBubbleRect && (
                <>
                  <div
                    className="fixed inset-0 z-[199]"
                    aria-hidden
                    onClick={() => setShowLogoutConfirm(false)}
                  />
                  <motion.div
                    key="logout-bubble"
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="logout-confirm-bubble fixed z-[200] p-3 rounded-xl bg-white border border-gray-200 shadow-lg min-w-[200px]"
                    style={{
                      left: (() => {
                        // 로그아웃 버튼의 가운데를 기준으로 토스트를 가깝게 띄우되,
                        // 화면 밖으로 나가지 않도록 최소/최대 범위만 살짝 클램프합니다.
                        const viewW = window.innerWidth;
                        const approximateWidth = 220; // 토스트 예상 너비
                        const center =
                          logoutBubbleRect.left +
                          logoutBubbleRect.width / 2 -
                          approximateWidth / 2;
                        const padding = 12;
                        const maxLeft = viewW - approximateWidth - padding;
                        return Math.max(padding, Math.min(center, maxLeft));
                      })(),
                      top: logoutBubbleRect.bottom,
                      maxWidth: window.innerWidth - 32,
                    }}
                  >
                    <p className="text-[13px] text-gray-800 font-medium mb-3 text-center">
                      로그아웃 하겠습니까?
                    </p>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={handleLogoutConfirm}
                        className="px-4 py-2 rounded-lg bg-black text-white text-[13px] font-medium cursor-pointer hover:bg-gray-800"
                      >
                        확인
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
        {/* 로그아웃 완료 토스트: body 포탈로 레이아웃 영향 없이 표시 */}
        {typeof document !== 'undefined' &&
          createPortal(
            <Toast
              message="로그아웃 되었습니다"
              visible={showLogoutToast}
              onDismiss={handleLogoutToastDismiss}
              durationMs={2000}
            />,
            document.body
          )}
        <button
          type="button"
          className="absolute top-3 right-3 p-2 text-gray-700 hover:text-black cursor-pointer"
          onClick={() => onClose('/')}
          aria-label="닫기"
        >
          <X size={18} />
        </button>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="flex-1 overflow-y-auto px-5 py-4 text-sm font-sans">
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => go('/')}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer"
            >
              <Home size={18} className="text-gray-500" />
              <span className="text-[13px] font-medium">홈으로</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer"
            >
              <Bell size={18} className="text-gray-500" />
              <span className="text-[13px] font-medium">공지사항</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer"
            >
              <HelpCircle size={18} className="text-gray-500" />
              <span className="text-[13px] font-medium">도움말</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer"
            >
              <MessageCircle size={18} className="text-gray-500" />
              <span className="text-[13px] font-medium">1:1 문의</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 text-gray-800 cursor-pointer"
            >
              <Bot size={18} className="text-gray-500" />
              <span className="text-[13px] font-medium">AI 챗봇</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* 하단 호스트센터 버튼 */}
      <div className="px-5 pb-6 pt-3 border-t border-gray-200 bg-gradient-to-r from-white via-gray-50 to-gray-100">
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gray-700 hover:bg-gray-900 text-white text-[13px] font-semibold py-3 cursor-pointer shadow-2xl"
          onClick={() => {}}
        >
          호스트 신청
        </button>
      </div>
    </>
  );

  if (isInline) {
    return (
      <aside className={`${baseClass} ${inlineClass} min-h-0`}>{content}</aside>
    );
  }

  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0.6 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26, mass: 0.9 }}
      className={`${baseClass} ${overlayClass}`}
    >
      {content}
    </motion.aside>
  );
}
