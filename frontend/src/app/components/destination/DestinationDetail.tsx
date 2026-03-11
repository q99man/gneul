import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Users, Car, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WishButton } from '../wishlist/WishButton';

const HEADER_TOP = 72;
const FOOTER_BOTTOM = 80;

type Rect = { left: number; top: number; width: number; height: number };

interface DestinationDetailProps {
  selectedDest: any;
  cardRect: DOMRect | null;
  exitRect: Rect | null;
  onClose: () => void;
}

const PC_MAX = 1280;

function AmenityIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs min-[800px]:text-sm text-gray-700">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

export const DestinationDetail = ({ selectedDest, cardRect, exitRect, onClose }: DestinationDetailProps) => {
  const [contentHeight, setContentHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  useEffect(() => {
    const update = () => {
      setContentHeight(window.innerHeight - HEADER_TOP - FOOTER_BOTTOM);
      setWindowWidth(window.innerWidth);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (selectedDest) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedDest]);

  const fromCard = useMemo(() => {
    if (!cardRect) return null;
    return {
      left: cardRect.left,
      top: cardRect.top,
      width: cardRect.width,
      height: cardRect.height,
    };
  }, [cardRect]);

  const toFull = useMemo(() => {
    const w = windowWidth || (typeof window !== 'undefined' ? window.innerWidth : 0);
    const h = contentHeight || (typeof window !== 'undefined' ? window.innerHeight - HEADER_TOP - FOOTER_BOTTOM : 0);
    const width = w >= PC_MAX ? PC_MAX : w;
    const left = w >= PC_MAX ? (w - PC_MAX) / 2 : 0;
    return { left, top: HEADER_TOP, width, height: h };
  }, [contentHeight, windowWidth]);

  const hasFromCard = fromCard && selectedDest;
  const exitTarget = exitRect ?? (hasFromCard ? fromCard : null);

  return (
    <AnimatePresence>
      {selectedDest && (
        <motion.div
          key="detail-modal"
          initial={hasFromCard ? fromCard : { scale: 0.92, opacity: 0 }}
          animate={toFull}
          exit={exitTarget || { scale: 0.92, opacity: 0 }}
          transition={{
            type: 'tween',
            duration: 0.35,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="fixed z-50 bg-white flex flex-col min-[800px]:flex-row overflow-hidden min-[1280px]:rounded-b-lg min-[1280px]:shadow-2xl"
        >
          {/* 뒤로가기 - 헤더·카드와 겹치지 않도록 여백(top/right) 확보 */}
          <button
            type="button"
            className="absolute top-4 right-4 min-[800px]:top-6 min-[800px]:right-6 min-[1280px]:top-8 min-[1280px]:right-10 z-[60] p-2.5 min-[800px]:p-3 min-[1280px]:p-4 bg-white/90 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-colors shadow-sm border border-gray-200/50 cursor-pointer"
            onClick={onClose}
            aria-label="메인으로 돌아가기"
          >
            <ArrowLeft className="w-5 h-5 min-[800px]:w-6 min-[800px]:h-6 min-[1280px]:w-7 min-[1280px]:h-7" />
          </button>

          {/* 이미지 영역 - 모바일: 상단 고정 비율, 태블릿/PC: 좌측 절반 */}
          <div className="w-full max-w-[375px] min-[800px]:max-w-none min-[800px]:w-1/2 min-[800px]:min-h-0 h-[40vh] min-[800px]:h-full mx-auto min-[800px]:mx-0 relative overflow-hidden shrink-0">
            <motion.img
              src={selectedDest.image}
              alt={selectedDest.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.05, filter: 'brightness(0.7)' }}
              animate={{ scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
          </div>

          {/* 설명 영역 - 모바일: 375 맞춤, 태블릿 800, PC 1280 */}
          <motion.div
            className="w-full min-[800px]:w-1/2 h-auto min-[800px]:h-full flex flex-col justify-center overflow-y-auto shrink-0 px-4 py-6 min-[800px]:px-8 min-[800px]:py-10 min-[1280px]:px-16 min-[1280px]:py-14"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            transition={{ duration: 0.3, delay: 0.12, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="w-full max-w-[375px] min-[800px]:max-w-[360px] min-[1280px]:max-w-[520px] mx-auto min-[800px]:mx-0">
              {/* 상단 기본 정보 */}
              <section className="space-y-2 mb-6 min-[800px]:mb-8">
                <span className="text-xs min-[800px]:text-sm font-bold tracking-widest text-gray-400 uppercase block font-sans">
                  {selectedDest.category}
                </span>
                <h2 className="text-3xl min-[800px]:text-5xl min-[1280px]:text-6xl min-[1280px]:leading-tight font-black tracking-tighter leading-none font-serif">
                  {selectedDest.title}
                </h2>
                {selectedDest.subtitle && (
                  <h3 className="text-lg min-[800px]:text-2xl min-[1280px]:text-3xl font-serif italic text-gray-500">
                    {selectedDest.subtitle}
                  </h3>
                )}
                {selectedDest.address && (
                  <p className="text-xs min-[800px]:text-sm text-gray-500 mt-2">
                    {selectedDest.address}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <WishButton spaceId={selectedDest.id} withConfirm={false} />
                  <p className="text-base min-[800px]:text-lg font-bold text-gray-900">
                    {selectedDest.price ?? '가격 문의'}
                  </p>
                </div>
              </section>

              {/* 본문 + 예약 카드: 2컬럼 레이아웃 */}
              <div className="mt-4 grid gap-8 min-[1024px]:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
                {/* 왼쪽: 상세 설명 + 편의 시설 */}
                <div className="space-y-6 text-sm min-[800px]:text-base text-gray-800 font-sans">
                  <div className="flex flex-wrap items-center gap-4 border-y border-gray-200 py-4">
                    {selectedDest.maxCapacity && (
                      <AmenityIcon
                        icon={<Users size={18} />}
                        label={`최대 ${selectedDest.maxCapacity}인`}
                      />
                    )}
                    {/* 추후 백엔드/DTO에 편의시설 플래그 추가 시 활성화 */}
                    {/* {selectedDest.parkingAvailable && (
                      <AmenityIcon icon={<Car size={18} />} label="주차 가능" />
                    )}
                    {selectedDest.wifiAvailable && (
                      <AmenityIcon icon={<Wifi size={18} />} label="와이파이" />
                    )} */}
                  </div>

                  <article className="prose prose-sm md:prose-base prose-slate max-w-none prose-headings:font-bold">
                    <h3 className="text-base md:text-lg font-semibold mb-2">공간 소개</h3>
                    <p className="leading-relaxed whitespace-pre-line">
                      {selectedDest.description}
                    </p>
                  </article>
                </div>

                {/* 오른쪽: 예약 카드 (sticky) */}
                <aside className="relative hidden min-[1024px]:block">
                  <div className="sticky top-16 border rounded-3xl p-5 shadow-lg bg-white space-y-4">
                    <div>
                      <span className="text-xl font-bold">
                        {selectedDest.price ?? '가격 문의'}
                      </span>
                      <span className="text-sm text-gray-500"> / 시간 기준</span>
                    </div>
                    <div className="space-y-3 text-xs text-gray-600">
                      <p>이 공간은 메인 페이지에서 바로 예약 요청을 시작할 수 있습니다.</p>
                      {selectedDest.address && (
                        <p className="truncate">
                          위치: <span className="font-medium">{selectedDest.address}</span>
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-full h-12 rounded-2xl bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => {
                        // TODO: 예약 플로우 연동
                      }}
                    >
                      지금 예약하기
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
