import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { AppSidebar } from '../components/ui/AppSidebar';
import { getMypage } from '../api/member';
import type { MypageDto } from '../api/types';
import { ApiError } from '../api/ApiError';
import { ReservationListContent } from './ReservationList';
import { MemberEditContent } from './MemberEdit';
import { WishlistContent } from './Wishlist';
import { AdminDashboardContent } from './AdminDashboard';
import { HostSpaceListContent } from './HostSpaceList';
import { PointsCouponsContent } from './PointsCoupons';

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

type MypageMenuId = 'reward' | 'edit' | 'reservations' | 'wishlist' | 'admin' | 'host_spaces';

const MENU_ITEMS: { id: MypageMenuId; label: string }[] = [
  { id: 'reward', label: '포인트 & 쿠폰' },
  { id: 'edit', label: '개인정보 수정' },
  { id: 'reservations', label: '내 예약 내역' },
  { id: 'wishlist', label: '관심상품' },
];

const FADE_DURATION = 0.35;

/** 헤더/푸터 없이 메뉴바 + 콘텐츠만 전체 화면. 등장·퇴장 모두 페이드. 모바일에서는 기본 메뉴바(AppSidebar) 미표시 */
function MypageShell({
  children,
  isExiting,
  onCloseRequest,
  onCloseComplete,
  isMobile,
}: {
  children: React.ReactNode;
  isExiting: boolean;
  onCloseRequest: (path?: string) => void;
  onCloseComplete: () => void;
  isMobile: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: FADE_DURATION, ease: 'easeOut' }}
      onAnimationComplete={() => {
        if (isExiting) onCloseComplete();
      }}
      className="fixed inset-0 flex flex-col md:flex-row bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] text-gray-900 font-sans z-[60]"
    >
      {children}
      {!isMobile && <AppSidebar onClose={onCloseRequest} isInline closeOnly />}
    </motion.div>
  );
}

/** 마이페이지 메뉴창: 로그인 메뉴바(AppSidebar)와 동일 스타일. 모바일 단독일 때 fullWidth */
function MypageMenuPanel({
  data,
  selectedId,
  onSelect,
  fullWidth,
}: {
  data: MypageDto;
  selectedId: MypageMenuId;
  onSelect: (id: MypageMenuId) => void;
  fullWidth?: boolean;
}) {
  const normalizedRole = (data.role ?? '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'ROLE_ADMIN';
  const isHost = normalizedRole === 'HOST' || normalizedRole === 'ROLE_HOST';

  return (
    <aside
      className={`flex flex-col bg-gradient-to-b from-white via-gray-50 to-gray-100 border-t md:border-t-0 md:border-r border-gray-200/70 shadow-[0_0_35px_rgba(15,23,42,0.12)] min-h-0 ${
        fullWidth ? 'w-full flex-1 min-w-0' : 'w-[80vw] max-w-xs md:w-80 flex-shrink-0'
      }`}
    >
      {/* 상단: 사이드바 로그인/로그아웃 섹션과 동일 상하 크기, 좌측 정렬 */}
      <div className="px-5 pt-8 pb-6 h-[140px] flex flex-col gap-3 justify-center bg-gradient-to-r from-white/100 via-gray-50 to-gray-100/90 border-b border-gray-200/80">
        <h1 className="text-[15px] font-semibold text-gray-800 text-left">마이페이지</h1>
        <div className="flex flex-col min-w-0 text-left">
          <p className="text-[15px] font-semibold text-gray-800 truncate">{data.name}</p>
          <p className="mt-0.5 text-[13px] text-gray-500">
            {isAdmin ? '관리자' : isHost ? '호스트' : '게스트'}
          </p>
        </div>
      </div>
      {/* 메뉴 리스트: 우측 메뉴바(로그인·로그아웃 아래)와 동일 라인에서 시작하도록 pt로 상단 여백 */}
      <nav className="flex-1 overflow-y-auto px-5 pt-4 pb-4 text-sm font-sans">
        <ul className="space-y-1">
          {MENU_ITEMS.map(({ id, label }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onSelect(id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                  selectedId === id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-400 text-[13px]">&lt;</span>
                <span className="text-[13px] font-medium">{label}</span>
              </button>
            </li>
          ))}
          {isHost && (
            <li>
              <button
                type="button"
                onClick={() => onSelect('host_spaces')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                  selectedId === 'host_spaces'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-400 text-[13px]">&lt;</span>
                <span className="text-[13px] font-medium">내 공간 관리</span>
              </button>
            </li>
          )}
          {isAdmin && (
            <li>
              <button
                type="button"
                onClick={() => onSelect('admin')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left cursor-pointer transition-colors ${
                  selectedId === 'admin'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-gray-400 text-[13px]">&lt;</span>
                <span className="text-[13px] font-medium">관리자 페이지</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}

/** 마이페이지 상세창: 메뉴창·로그인 메뉴바와 통일된 패딩·글씨크기 */
const detailPanelClass =
  'flex-1 min-w-0 overflow-y-auto px-5 py-4 md:px-6 md:py-5 text-sm font-sans';

function MypageDetailPanel({
  menuId,
  data,
  onNavigate,
  onSelectMenu,
}: {
  menuId: MypageMenuId;
  data: MypageDto;
  onNavigate: (path: string) => void;
  onSelectMenu: (id: MypageMenuId) => void;
}) {
  if (menuId === 'reward') {
    return (
      <motion.div
        key="reward"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`${detailPanelClass} flex flex-col min-h-0 overflow-hidden`}
      >
        <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col min-h-0">
          <PointsCouponsContent embedded />
        </div>
      </motion.div>
    );
  }

  if (menuId === 'edit') {
    return (
      <motion.div
        key="edit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={detailPanelClass}
      >
        <div className="max-w-xl mx-auto">
          <MemberEditContent embedded onDone={() => onSelectMenu('reward')} />
        </div>
      </motion.div>
    );
  }

  if (menuId === 'reservations') {
    return (
      <motion.div
        key="reservations"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={detailPanelClass}
      >
        <div className="max-w-3xl mx-auto">
          <ReservationListContent embedded />
        </div>
      </motion.div>
    );
  }

  if (menuId === 'wishlist') {
    return (
      <motion.div
        key="wishlist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={detailPanelClass}
      >
        <div className="max-w-3xl mx-auto">
          <WishlistContent embedded />
        </div>
      </motion.div>
    );
  }

  if (menuId === 'admin') {
    return (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={detailPanelClass}
      >
        <div className="max-w-5xl mx-auto">
          <AdminDashboardContent />
        </div>
      </motion.div>
    );
  }

  if (menuId === 'host_spaces') {
    return (
      <motion.div
        key="host_spaces"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={detailPanelClass}
      >
        <div className="max-w-5xl mx-auto">
          <HostSpaceListContent embedded />
        </div>
      </motion.div>
    );
  }

  return null;
}

export default function MyPage() {
  const [data, setData] = useState<MypageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MypageMenuId>('reward');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitTarget, setExitTarget] = useState('/');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    getMypage()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setError('로그인이 필요합니다.');
          navigate('/login', { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : '정보를 불러오는 중 오류가 발생했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // 외부에서 /mypage로 진입할 때 menu 상태로 초기 탭 선택 (예: HostSpaceForm에서 복귀)
  useEffect(() => {
    const state = location.state as { menu?: MypageMenuId } | null;
    if (state?.menu) {
      setSelectedMenu(state.menu);
      if (isMobile) setMobileDetailOpen(true);
      // 상태를 한 번 소비한 뒤에는 URL state를 정리
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, isMobile, navigate]);

  const requestClose = (path?: string) => {
    setExitTarget(path ?? '/');
    setIsExiting(true);
  };
  const completeClose = () => navigate(exitTarget);

  // 퇴장 시 애니메이션 완료 콜백이 불리지 않을 수 있어, 타이머로 이동 보장 (사이드바 홈으로 등)
  useEffect(() => {
    if (!isExiting) return;
    const t = setTimeout(() => {
      navigate(exitTarget);
    }, FADE_DURATION * 1000 + 50);
    return () => clearTimeout(t);
  }, [isExiting, exitTarget, navigate]);

  if (loading) {
    return (
      <MypageShell
        isExiting={isExiting}
        onCloseRequest={requestClose}
        onCloseComplete={completeClose}
        isMobile={isMobile}
      >
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <p className="text-gray-500 font-sans">정보를 불러오는 중입니다.</p>
        </div>
      </MypageShell>
    );
  }

  if (error && !data) {
    return (
      <MypageShell
        isExiting={isExiting}
        onCloseRequest={requestClose}
        onCloseComplete={completeClose}
        isMobile={isMobile}
      >
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-4">
          <p className="text-gray-700 font-sans">{error}</p>
          <button
            type="button"
            onClick={() => requestClose('/')}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로
          </button>
        </div>
      </MypageShell>
    );
  }

  if (!data) return null;

  const handleMenuSelect = (id: MypageMenuId) => {
    setSelectedMenu(id);
    if (isMobile) setMobileDetailOpen(true);
  };

  const MOBILE_FADE = { duration: 0.25, ease: 'easeOut' as const };

  return (
    <MypageShell
      isExiting={isExiting}
      onCloseRequest={requestClose}
      onCloseComplete={completeClose}
      isMobile={isMobile}
    >
      <div className="flex-1 min-w-0 flex flex-col md:flex-row overflow-hidden">
        {/* 데스크톱(md 이상): 상세 왼쪽 + 메뉴 오른쪽 */}
        {!isMobile && (
          <>
            <MypageDetailPanel
              menuId={selectedMenu}
              data={data}
              onNavigate={(path) => navigate(path)}
              onSelectMenu={setSelectedMenu}
            />
            <MypageMenuPanel
              data={data}
              selectedId={selectedMenu}
              onSelect={setSelectedMenu}
            />
          </>
        )}

        {/* 모바일: 메뉴 ↔ 상세 전환 시 페이드, 뒤로가기 시 메인으로 */}
        {isMobile && (
          <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {!mobileDetailOpen ? (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={MOBILE_FADE}
                  className="flex-1 min-w-0 flex flex-col min-h-0"
                >
                  <MypageMenuPanel
                    data={data}
                    selectedId={selectedMenu}
                    onSelect={handleMenuSelect}
                    fullWidth
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={MOBILE_FADE}
                  className="flex-1 min-w-0 flex flex-col min-h-0 overflow-hidden"
                >
                  <MypageDetailPanel
                    menuId={selectedMenu}
                    data={data}
                    onNavigate={(path) => navigate(path)}
                    onSelectMenu={handleMenuSelect}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex-shrink-0 p-4 border-t border-gray-200/80 bg-white/90">
              <button
                type="button"
                onClick={() =>
                  mobileDetailOpen ? setMobileDetailOpen(false) : requestClose('/')
                }
                className="w-full text-left text-[13px] font-medium text-gray-700 hover:text-gray-900 py-2"
              >
                뒤로가기 &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </MypageShell>
  );
}
