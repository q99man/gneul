import React, { useState } from 'react';
import { Info } from 'lucide-react';

export function PointsCouponsContent({ embedded = false }: { embedded?: boolean }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupons, setCoupons] = useState<{ id: string; code: string }[]>([]);

  const handleRegister = () => {
    const trimmed = couponCode.trim();
    if (!trimmed) return;
    setCoupons((prev) => [...prev, { id: crypto.randomUUID(), code: trimmed }]);
    setCouponCode('');
  };

  const availablePoints = 0;
  const pendingEarn = 0;
  const pendingExpire = 0;
  const pointHistory: { type: string; period: string; amount: number }[] = [];

  return (
    <div
      className={
        embedded
          ? 'w-full max-w-3xl flex flex-col gap-6 min-h-0 flex-1'
          : 'w-full max-w-3xl mx-auto flex flex-col gap-6'
      }
    >
      {/* 위: 포인트 구역 */}
      <section className="flex flex-col flex-1 min-h-0 border-b border-gray-100 pb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">포인트</h2>

        {/* 사용 가능 + 안내 */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-base font-medium text-gray-900">사용 가능</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{availablePoints.toLocaleString()}P</p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-base text-gray-600 hover:text-gray-900 shrink-0"
            aria-label="포인트 안내"
          >
            <span>안내</span>
            <Info className="w-4 h-4 rounded-full" aria-hidden />
          </button>
        </div>

        {/* 적립 예정 / 소멸 예정 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg bg-gray-100 px-4 py-3">
            <p className="text-base font-medium text-gray-900">적립 예정</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{pendingEarn.toLocaleString()}P</p>
          </div>
          <div className="rounded-lg bg-gray-100 px-4 py-3">
            <p className="text-base font-medium text-gray-900">소멸 예정</p>
            <p className="text-lg font-semibold text-gray-900 mt-0.5">{pendingExpire.toLocaleString()}P</p>
          </div>
        </div>

        {/* 포인트 변경내역 리스트 */}
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-base font-medium text-gray-900 mb-3">포인트 변경내역</p>
          <div className="flex-1 min-h-[120px] rounded-lg border border-gray-200 bg-gray-50/50 overflow-y-auto">
            {pointHistory.length === 0 ? (
              <p className="text-center text-gray-500 text-base py-8">포인트 변경 내역이 없어요</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pointHistory.map((item, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-base font-medium text-gray-900">{item.type}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.period}</p>
                    </div>
                    <span className="text-base font-semibold text-blue-600">
                      {item.amount >= 0 ? '+' : ''}{item.amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 아래: 쿠폰 구역 */}
      <section className="flex flex-col flex-1 min-h-0">
        <h2 className="text-xl font-bold text-gray-900 mb-4">쿠폰 등록</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="쿠폰 코드를 입력해 주세요"
            className="flex-1 min-w-0 h-11 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
          />
          <button
            type="button"
            onClick={handleRegister}
            className="shrink-0 h-11 px-5 rounded-lg bg-gray-200 text-gray-700 text-base font-medium hover:bg-gray-300 transition-colors cursor-pointer"
          >
            등록하기
          </button>
        </div>

        {/* 등록된 쿠폰 내역 리스트 */}
        <div className="flex-1 min-h-0 flex flex-col">
          <p className="text-base font-medium text-gray-900 mb-3">등록된 쿠폰 내역</p>
          <div className="flex-1 min-h-[120px] rounded-lg border border-gray-200 bg-gray-50/50 overflow-y-auto">
            {coupons.length === 0 ? (
              <p className="text-center text-gray-500 text-base py-8">등록된 쿠폰이 없어요</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {coupons.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-3">
                    <span className="text-base font-medium text-gray-900">{c.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
