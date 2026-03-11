import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { ApiError } from '../../api/ApiError';
import { getWishlistStatus, toggleWishlist } from '../../api/wishlist';
import { isLoggedIn } from '../../utils/auth';
import './WishButton.css';

export function WishButton({
  spaceId,
  className,
  size = 'md',
  withConfirm = false,
}: {
  spaceId: number | string;
  className?: string;
  size?: 'sm' | 'md';
  /** true이면 토글 전에 확인 팝업을 띄움 (기본값: false) */
  withConfirm?: boolean;
}) {
  const [isWished, setIsWished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        if (!isLoggedIn()) {
          if (!cancelled) setIsWished(false);
          return;
        }
        const status = await getWishlistStatus(spaceId);
        if (!cancelled) setIsWished(status);
      } catch {
        if (!cancelled) setIsWished(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [spaceId]);

  const runToggle = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const latest = await toggleWishlist(spaceId);
      setIsWished(latest);
      window.dispatchEvent(new CustomEvent('wishlist:changed'));
      toast.success(latest ? '관심상품에 추가되었습니다.' : '관심상품에서 제거되었습니다.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast('로그인이 필요합니다.', {
          description: '세션이 만료되었습니다. 다시 로그인해주세요.',
        } as { description: ReactNode });
        navigate('/login', { state: { from: location.pathname } });
      } else if (err instanceof ApiError && err.status === 404) {
        toast('상품을 찾을 수 없습니다.', {
          description: '공간 정보를 다시 확인해주세요.',
        } as { description: ReactNode });
      } else {
        toast('처리에 실패했습니다.', {
          description: '잠시 후 다시 시도해주세요.',
        } as { description: ReactNode });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isLoggedIn()) {
      toast('로그인이 필요합니다.', {
        description: '관심상품 기능을 사용하려면 먼저 로그인해주세요.',
      } as { description: ReactNode });
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (submitting) return;

    if (withConfirm) {
      setShowConfirm(true);
    } else {
      void runToggle();
    }
  };

  const handleConfirm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    void runToggle().finally(() => setShowConfirm(false));
  };

  const base =
    'inline-flex items-center justify-center gap-2 rounded-full border transition-colors select-none';
  const s =
    size === 'sm'
      ? 'h-9 px-3 text-[12px]'
      : 'h-10 px-4 text-[13px]';
  const tone = isWished
    ? 'border-gray-900 bg-gray-900 text-white hover:bg-black'
    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50';

  return (
    <div className={`relative inline-flex ${className ?? ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || submitting}
        className={`wish-btn ${base} ${s} ${tone} ${loading ? 'opacity-60' : ''}`}
        aria-pressed={isWished}
        aria-label={isWished ? '관심상품 해제' : '관심상품 담기'}
      >
        {loading ? (
          <span className="text-[12px] text-gray-400">...</span>
        ) : (
          <span className="wish-btn__content">
            <Bookmark
              className="w-4 h-4"
              strokeWidth={2}
              fill={isWished ? 'currentColor' : 'transparent'}
            />
            <span className="font-medium">저장하기</span>
          </span>
        )}
      </button>
      {withConfirm && showConfirm && !loading && (
        <div className="absolute top-full mt-2 right-0 z-40 rounded-lg border border-gray-200 bg-white shadow-lg px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2">
          <span className="whitespace-nowrap">
            {isWished ? '관심상품에서 제거할까요?' : '관심상품에 추가할까요?'}
          </span>
          <button
            type="button"
            className="px-2 py-1 rounded-md bg-black text-white font-semibold cursor-pointer"
            onClick={handleConfirm}
          >
            확인
          </button>
          <button
            type="button"
            className="px-2 py-1 rounded-md border border-gray-200 text-gray-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(false);
            }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}

