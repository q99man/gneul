import React from 'react';
import { motion } from 'motion/react';
import { GuestSpaceCard } from './GuestSpaceCard';
import type { GuestSpaceCardDest } from './GuestSpaceCard';

interface GuestSpaceGridProps {
  items: GuestSpaceCardDest[];
  onSelect: (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => void;
  category?: string | null;
}

export const GuestSpaceGrid = ({ items, onSelect, category }: GuestSpaceGridProps) => {
  const isAll = !category || category === '전체';
  const base = isAll ? items : items.filter((dest) => dest.category === category);
  const visibleItems = isAll ? base : base.slice(0, 5);

  return (
    <motion.div
      layout
      className="relative grid w-full grid-cols-3 gap-4 px-[15px] transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] sm:grid-cols-4 md:gap-6 md:px-[50px] lg:grid-cols-5 xl:grid-cols-6 xl:gap-8 2xl:grid-cols-7"
    >
      {visibleItems.map((dest, index) => {
        const renderId = `grid-${category ?? 'all'}-${dest.id}-${index}`;

        return (
          <GuestSpaceCard
            key={renderId}
            dest={dest}
            renderId={renderId}
            index={index}
            onSelect={onSelect}
          />
        );
      })}
    </motion.div>
  );
};