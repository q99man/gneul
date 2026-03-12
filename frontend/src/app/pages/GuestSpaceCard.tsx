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
  address?: string;
  maxCapacity?: number;
};

interface GuestSpaceCardProps {
  dest: GuestSpaceCardDest;
  renderId: string;
  index?: number;
  onSelect: (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => void;
}

export function GuestSpaceCard({
  dest,
  renderId,
  index = 0,
  onSelect,
}: GuestSpaceCardProps) {
  return (
    <motion.div
      data-render-id={renderId}
      className="group/card flex w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-lg shadow-gray-300/40 ring-1 ring-black/5"
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
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
          <span className="text-sm font-medium text-white">자세히 보기</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-2 p-3 text-left md:p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3 className="min-w-0 flex-shrink truncate font-sans text-base font-semibold text-gray-900 md:text-lg">
            {dest.title}
            {dest.subtitle ? `: ${dest.subtitle}` : ''}
          </h3>

          <span className="flex-shrink-0 text-sm font-medium text-gray-400 md:text-base">
            {dest.category}
          </span>
        </div>

        <p className="truncate text-sm leading-snug text-gray-600 md:text-base">
          {dest.description}
        </p>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="text-base font-bold text-gray-900 md:text-lg">
            {dest.price ?? '가격 문의'}
          </p>

          <span className="tabular-nums text-sm text-gray-400 md:text-base">
            {dest.rating ? `★ ${dest.rating}` : '\u00A0'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}