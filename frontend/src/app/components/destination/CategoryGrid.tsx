import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { motion, LayoutGroup } from 'motion/react';
import { useMouseTilt } from '../../hooks/useMouseTilt';

interface CategoryGridProps {
  onSelect: (category: string, cardRect: DOMRect) => void;
}

type CategorySummary = {
  name: string;
  image: string;
  count: number;
};

const buildCategories = (): CategorySummary[] =>
  CATEGORIES.map((c) => ({ name: c.name, image: c.image, count: 0 }));

function CategoryCard({
  cat,
  onSelect,
}: {
  cat: CategorySummary;
  onSelect: (category: string, cardRect: DOMRect) => void;
}) {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({
    maxTilt: 14,
    sensitivity: 1.2,
    resetDelay: 200,
  });

  return (
    <motion.button
      layout
      type="button"
      className="group relative overflow-visible aspect-[4/5] w-full cursor-pointer rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
      onClick={(e) => onSelect(cat.name, e.currentTarget.getBoundingClientRect())}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.03, x: 12 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{ perspective: '1200px' }}
    >
      {/* 3D 틸트 적용 레이어 - 은은한 경계선, 호버 시 강조 */}
      <div
        ref={ref}
        style={style}
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-100 via-white to-gray-200 shadow-xl shadow-gray-300/40 ring-[1px] ring-white/20 transition-shadow duration-300 group-hover:ring-2 group-hover:ring-white/50"
      >
        {/* 대표 배경 이미지 + 오버레이 */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ transform: 'translateZ(0)' }}>
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover opacity-75 transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent" />
        </div>

        {/* 텍스트 영역 - 살짝 떠 있는 느낌 */}
        <div
          className="relative z-10 h-full flex flex-col justify-end p-7 md:p-8"
          style={{ transform: 'translateZ(24px)' }}
        >
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-white drop-shadow-lg">
            {cat.name}
          </h3>
        </div>
      </div>
    </motion.button>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 48 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export const CategoryGrid = ({ onSelect }: CategoryGridProps) => {
  const categories = buildCategories();

  return (
    <LayoutGroup>
      <motion.div
        layout
        className="w-full relative transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 xl:gap-10"
      >
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            className="p-3 sm:p-4 min-h-0"
            variants={cardVariants}
            initial="hidden"
            animate="show"
            custom={i}
          >
            <CategoryCard cat={cat} onSelect={onSelect} />
          </motion.div>
        ))}
      </motion.div>
    </LayoutGroup>
  );
};

