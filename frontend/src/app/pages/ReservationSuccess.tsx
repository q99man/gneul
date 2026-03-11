import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { getReservationSuccess } from '../api/reservation';
import type { ReservationSuccessDto } from '../api/types';

export default function ReservationSuccess() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [info, setInfo] = useState<ReservationSuccessDto | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      return;
    }
    let cancelled = false;
    getReservationSuccess(id)
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error || !id) {
    return (
      <Layout onLogoClick={() => navigate('/')}>
        <div className="w-full max-w-md mx-auto py-16 text-center">
          <p className="text-gray-700 font-sans mb-6">예약 정보를 불러올 수 없습니다.</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            홈으로
          </button>
        </div>
      </Layout>
    );
  }

  if (!info) {
    return (
      <Layout onLogoClick={() => navigate('/')}>
        <div className="w-full max-w-md mx-auto py-16 text-center">
          <p className="text-gray-600 font-sans">예약 정보를 확인 중입니다...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogoClick={() => navigate('/')}>
      <div className="w-full max-w-md mx-auto py-12 md:py-16 text-center">
        <div className="text-5xl mb-6" aria-hidden>✅</div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-900 mb-2">
          예약이 완료되었습니다!
        </h1>
        <p className="text-gray-600 font-sans mb-8">
          그늘찾기를 이용해 주셔서 감사합니다.
        </p>

        <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6 mb-8 text-left">
          <p className="font-sans text-gray-700 mb-2">
            <span className="font-semibold text-gray-900">예약 번호:</span>{' '}
            {info.reservationId}
          </p>
          <p className="font-sans text-gray-700 mb-2">
            <span className="font-semibold text-gray-900">예약 상품:</span>{' '}
            {info.spaceName}
          </p>
          <p className="font-sans text-gray-700">
            <span className="font-semibold text-gray-900">결제 예정 금액:</span>{' '}
            {info.totalPrice.toLocaleString()}원
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-800 font-medium hover:bg-gray-50 transition-colors"
          >
            홈으로 가기
          </button>
          <button
            type="button"
            onClick={() => navigate('/mypage/reservations')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-gray-800 transition-colors"
          >
            예약 내역 확인
          </button>
        </div>
      </div>
    </Layout>
  );
}
