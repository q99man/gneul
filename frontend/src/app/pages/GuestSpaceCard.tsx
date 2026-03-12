import React from 'react';
import { motion } from 'motion/react';

export type GuestSpaceCardDest = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  image: string;
  description: string;
  price?: string;
  rating?: string;
  /** 상세 모달용 부가 정보 (선택) */
  address?: string;
  maxCapacity?: number;
};

interface GuestSpaceCardProps {
  dest: GuestSpaceCardDest;
  renderId: string;
  index?: number;
  onSelect: (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => void;
}

export function GuestSpaceCard({ dest, renderId, index = 0, onSelect }: GuestSpaceCardProps) {
  return (
    <motion.div
      data-dest-id={dest.id}
      data-render-id={renderId}
      className="group flex flex-col w-full cursor-pointer rounded-lg shadow-lg shadow-gray-300/40 ring-1 ring-black/5 overflow-hidden bg-white"
      onClick={(e) => onSelect(dest, e.currentTarget.getBoundingClientRect(), renderId)}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay: Math.min(index, 12) * 0.04 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
        <img
          src={dest.image}
          alt={dest.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-sm font-medium">자세히 보기</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3 md:p-4 text-left min-h-0">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate font-sans flex-shrink min-w-0">
            {dest.title}
            {dest.subtitle ? `: ${dest.subtitle}` : ''}
          </h3>

          <span className="text-sm md:text-base text-gray-400 font-medium flex-shrink-0">
            {dest.category}
          </span>
        </div>

        <p className="text-sm md:text-base text-gray-600 truncate leading-snug">
          {dest.description}
        </p>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-base md:text-lg font-bold text-gray-900">
            {dest.price ?? '가격 문의'}
          </p>

          <span className="text-sm md:text-base text-gray-400 tabular-nums">
            {dest.rating ? `★ ${dest.rating}` : '\u00A0'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
