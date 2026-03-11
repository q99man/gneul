import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { getWishlistList, toggleWishlist } from '../api/wishlist';
import type { WishlistDetailDto } from '../api/types';
import { ApiError } from '../api/ApiError';
import { toast } from 'sonner';

export function WishlistContent({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<WishlistDetailDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ spaceId: number; rect: DOMRect } | null>(null);
  const navigate = useNavigate();

  const fetchList = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getWishlistList();
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : '관심상품을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    const onChanged = () => fetchList();
    window.addEventListener('wishlist:changed', onChanged as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => window.removeEventListener('wishlist:changed', onChanged as EventListener);
  }, []);

  const handleRemoveConfirmed = async (spaceId: number) => {
    setRemovingId(spaceId);
    try {
      const latest = await toggleWishlist(spaceId);
      if (latest === false) {
        setItems((prev) => prev.filter((x) => x.spaceId !== spaceId));
      } else {
        await fetchList();
      }
      toast.success('관심상품에서 제거되었습니다.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      toast('처리에 실패했습니다.', {
        description: '잠시 후 다시 시도해주세요.',
      } as { description: ReactNode });
    } finally {
      setRemovingId(null);
      setConfirmTarget(null);
    }
  };

  const handleRemove = (spaceId: number, button: HTMLButtonElement | null) => {
    if (removingId === spaceId) return;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setConfirmTarget({ spaceId, rect });
  };

  return (
    <div className={embedded ? 'w-full' : 'w-full max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14'}>
      <h1 className={`font-bold text-gray-900 font-serif ${embedded ? 'text-[15px] mb-4' : 'text-xl md:text-2xl mb-6'}`}>
        관심상품
      </h1>

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <p className="text-gray-500 font-sans">관심상품을 불러오는 중입니다.</p>
        </div>
      ) : error ? (
        <div className="py-8 rounded-xl border border-gray-200 bg-white/70 px-5">
          <p className="text-gray-700 font-sans mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchList}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-14 text-center rounded-xl border border-gray-200 bg-white/70">
          <p className="text-gray-600 text-[14px] font-medium">관심상품이 없습니다.</p>
          {!embedded && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800"
            >
              홈으로
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((w) => (
            <li
              key={w.wishlistId}
              className="flex items-center gap-4 rounded-xl border border-gray-200/80 bg-white/85 shadow-sm px-4 py-4"
            >
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5">
                <img src={w.imgUrl} alt={w.spaceName} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-gray-900 truncate">{w.spaceName}</p>
                <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                  {w.price.toLocaleString()}원
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={(e) => handleRemove(w.spaceId, e.currentTarget)}
                  disabled={removingId === w.spaceId}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {removingId === w.spaceId ? '처리 중...' : '제거'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {typeof document !== 'undefined' &&
        confirmTarget &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[95]"
              aria-hidden
              onClick={() => setConfirmTarget(null)}
            />
            <div
              className="fixed z-[96] p-3 rounded-xl bg-white border border-gray-200 shadow-lg min-w-[200px]"
              style={{
                top: confirmTarget.rect.bottom,
                left: (() => {
                  const viewW = window.innerWidth;
                  const approximateWidth = 220;
                  const center =
                    confirmTarget.rect.left +
                    confirmTarget.rect.width / 2 -
                    approximateWidth / 2;
                  const padding = 12;
                  const maxLeft = viewW - approximateWidth - padding;
                  return Math.max(padding, Math.min(center, maxLeft));
                })(),
                maxWidth: window.innerWidth - 32,
              }}
            >
              <p className="text-[13px] text-gray-800 font-medium mb-3 text-center">
                관심상품에서 제거하시겠습니까?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-black text-white text-[13px] font-medium cursor-pointer hover:bg-gray-800"
                  onClick={() => handleRemoveConfirmed(confirmTarget.spaceId)}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium cursor-pointer hover:bg-gray-50"
                  onClick={() => setConfirmTarget(null)}
                >
                  취소
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

export default function Wishlist() {
  const navigate = useNavigate();
  return (
    <Layout onLogoClick={() => navigate('/')}>
      <WishlistContent />
    </Layout>
  );
}

