import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { getReservationList, cancelReservation } from '../api/reservation';
import type { ReservationHistDto } from '../api/types';
import { ApiError } from '../api/ApiError';

export function ReservationListContent({
  embedded = false,
  onGoHome,
}: {
  embedded?: boolean;
  onGoHome?: () => void;
}) {
  const [items, setItems] = useState<ReservationHistDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchPage = async (pageNumber: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await getReservationList({ page: pageNumber });
      setItems(res.content ?? []);
      setTotalPages(res.totalPages ?? 0);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : '내역 로딩 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleCancel = async (reservationId: number) => {
    const ok = window.confirm('예약을 취소하시겠습니까?');
    if (!ok) return;
    setCancellingId(reservationId);
    try {
      await cancelReservation(reservationId);
      await fetchPage(page);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      window.alert('취소 처리 중 오류가 발생했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  const hasPrev = page > 0;
  const hasNext = totalPages > 0 && page < totalPages - 1;

  return (
    <div className={embedded ? 'w-full' : 'w-full max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14'}>
      <h1 className={`font-bold text-gray-900 font-serif ${embedded ? 'text-[15px] mb-4' : 'text-xl md:text-2xl mb-6'}`}>
        나의 예약 내역
      </h1>

      {loading ? (
        <div className="py-10 flex items-center justify-center">
          <p className="text-gray-500 font-sans">내역을 불러오는 중입니다.</p>
        </div>
      ) : error ? (
        <div className="py-8 rounded-xl border border-gray-200 bg-white/70 px-5">
          <p className="text-gray-700 font-sans mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchPage(page)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800"
          >
            다시 시도
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="py-14 text-center rounded-xl border border-gray-200 bg-white/70">
          <p className="text-gray-600 text-[14px] font-medium">예약된 내역이 없습니다.</p>
          {!embedded && (
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800"
            >
              홈으로
            </button>
          )}
          {embedded && onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white text-[13px] font-medium hover:bg-gray-800"
            >
              홈으로
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((res) => (
            <div
              key={res.reservationId}
              className="rounded-xl border border-gray-200/80 bg-white/85 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/70">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] text-gray-500 font-medium">예약일</span>
                  <span className="text-[14px] text-gray-900 font-semibold">
                    {res.reservationDate}
                  </span>
                </div>
                <span
                  className={`text-[13px] font-semibold ${
                    res.reservationStatus === 'RESERVED' ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {res.reservationStatus === 'RESERVED' ? '예약완료' : '취소됨'}
                </span>
              </div>

              <div className="px-5 py-4">
                <ul className="space-y-3">
                  {res.reservationItemDtoList.map((item, idx) => (
                    <li key={`${res.reservationId}-${idx}`} className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-1 ring-black/5">
                        <img
                          src={item.imgUrl}
                          alt={item.spaceName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-gray-900 truncate">
                          {item.spaceName}
                        </p>
                        <p className="text-[13px] text-gray-600 font-medium mt-0.5">
                          {item.reservationPrice.toLocaleString()}원 / {item.count}일
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {res.reservationStatus === 'RESERVED' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(res.reservationId)}
                    disabled={cancellingId === res.reservationId}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 text-[13px] font-semibold hover:bg-red-50 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {cancellingId === res.reservationId ? '취소 중...' : '예약 취소하기'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 페이징 */}
      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          disabled={!hasPrev || loading}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 disabled:opacity-60 disabled:pointer-events-none"
        >
          이전
        </button>
        <span className="text-[13px] text-gray-600 font-medium tabular-nums">
          {totalPages === 0 ? 1 : page + 1} / {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-[13px] font-medium hover:bg-gray-50 disabled:opacity-60 disabled:pointer-events-none"
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default function ReservationList() {
  const navigate = useNavigate();
  return (
    <Layout onLogoClick={() => navigate('/')}>
      <ReservationListContent />
    </Layout>
  );
}

