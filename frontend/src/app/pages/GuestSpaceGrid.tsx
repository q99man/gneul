import React from 'react';
import { motion } from 'motion/react';
import { GuestSpaceCard } from './GuestSpaceCard';
import type { GuestSpaceCardDest } from './GuestSpaceCard';

interface GuestSpaceGridProps {
  items: GuestSpaceCardDest[];
  onSelect: (dest: GuestSpaceCardDest, cardRect: DOMRect) => void;
  category?: string | null;
}

export const GuestSpaceGrid = ({ items, onSelect, category }: GuestSpaceGridProps) => {
  const isAll = !category || category === '전체';
  const base = isAll ? items : items.filter((dest) => dest.category === category);
  const visibleItems = isAll ? base : base.slice(0, 5);

  return (
    <motion.div
      layout
      className="w-full relative transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 md:gap-6 xl:gap-8 px-[15px] md:px-[50px]"
    >
      {visibleItems.map((dest, index) => (
        <GuestSpaceCard
          key={dest.id}
          dest={dest}
          renderId={`dest-${dest.id}`}
          index={index}
          onSelect={(d, rect, _renderId) => onSelect(d, rect)}
        />
      ))}
    </motion.div>
  );
};
