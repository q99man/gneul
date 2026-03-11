import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { getOrderForm, confirmReservation } from '../api/reservation';
import type { OrderFormDto } from '../api/types';

function parseCartItemIds(searchParams: URLSearchParams, state: unknown): number[] {
  const fromState = state && typeof state === 'object' && 'cartItemIds' in state;
  const raw = fromState
    ? (state as { cartItemIds: number[] | string }).cartItemIds
    : searchParams.get('cartItemIds');
  if (Array.isArray(raw)) return raw.filter((v): v is number => typeof v === 'number');
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
}

export default function Order() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const cartItemIds = parseCartItemIds(searchParams, location.state);

  const [orderData, setOrderData] = useState<OrderFormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ phoneNumber: '', address: '' });

  useEffect(() => {
    if (cartItemIds.length === 0) {
      setError('선택된 예약 항목이 없습니다.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchOrderForm = async () => {
      try {
        const data = await getOrderForm(cartItemIds);
        if (!cancelled) {
          setOrderData(data);
          setFormData({
            phoneNumber: data.phoneNumber ?? '',
            address: data.address ?? '',
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError('주문서를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchOrderForm();
    return () => {
      cancelled = true;
    };
  }, [cartItemIds.join(',')]);

  const handleConfirm = async () => {
    if (!orderData) return;
    if (!formData.phoneNumber.trim() || !formData.address.trim()) {
      setError('전화번호와 주소를 모두 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmReservation({
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        orderDtoList: orderData.orderItems.map((item) => ({
          spaceId: item.spaceId,
          count: item.count,
        })),
      });
      navigate('/mypage', { replace: true, state: { reservationSuccess: true } });
    } catch {
      setError('예약 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout onLogoClick={() => navigate('/')}>
        <div className="w-full max-w-2xl mx-auto py-16 text-center">
          <p className="text-gray-600 font-sans">로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error && !orderData) {
    return (
      <Layout onLogoClick={() => navigate('/')}>
        <div className="w-full max-w-2xl mx-auto py-16 text-center">
          <p className="text-gray-700 font-sans mb-6">{error}</p>
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

  if (!orderData) return null;

  return (
    <Layout onLogoClick={() => navigate('/')}>
      <div className="w-full max-w-2xl mx-auto py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-900 mb-8">
          예약 주문서
        </h1>

        {/* 예약자 정보 */}
        <section className="mb-8 p-6 rounded-2xl bg-white/80 border border-gray-200/80 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">예약자 정보</h2>
          <div className="space-y-3 text-gray-700 font-sans">
            <p>이름: {orderData.name}</p>
            <p>이메일: {orderData.email}</p>
          </div>
          <div className="mt-4 space-y-3">
            <input
              type="tel"
              placeholder="전화번호 (010-0000-0000)"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="상세 주소 입력"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </section>

        {/* 선택한 그늘 */}
        <section className="mb-8 p-6 rounded-2xl bg-white/80 border border-gray-200/80 shadow-sm">
          <h2 className="text-lg font-serif font-bold text-gray-900 mb-4">선택한 그늘</h2>
          <ul className="space-y-4">
            {orderData.orderItems.map((item, idx) => (
              <li
                key={`${item.spaceId}-${idx}`}
                className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 border border-gray-100"
              >
                <img
                  src={item.imgUrl}
                  alt={item.spaceName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{item.spaceName}</p>
                  <p className="text-sm text-gray-600">
                    {item.count}일 / {item.reservationPrice.toLocaleString()}원
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 최종 결제 */}
        <section className="p-6 rounded-2xl bg-gray-50 border border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-lg font-serif font-bold text-gray-900">
              최종 결제 금액: {orderData.totalPrice.toLocaleString()}원
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-8 py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? '처리 중...' : '결제 및 예약하기'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 font-sans">{error}</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
