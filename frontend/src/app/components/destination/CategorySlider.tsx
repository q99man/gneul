import React, { useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../data/categories';
import { useMouseTilt } from '../../hooks/useMouseTilt';
import './CategorySlider.css';

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

interface CategorySliderCardProps {
  cat: { name: string; image: string };
  index: number;
  onCardClick: (category: string, el: HTMLElement) => void;
}

function CategorySliderCard({ cat, index, onCardClick }: CategorySliderCardProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({
    maxTilt: 10,
    sensitivity: 1.2,
    resetDelay: 180,
  });

  return (
    <motion.button
      type="button"
      className="category-slider-card"
      variants={cardVariants}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={{ scale: 1.25 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{ transformOrigin: 'center center' }}
      onClick={(e) => onCardClick(cat.name, e.currentTarget)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={ref}
        style={style}
        className="category-slider-card-inner"
      >
        <div className="category-slider-card-bg">
          <img src={cat.image} alt={cat.name} />
          <div className="category-slider-card-overlay" />
        </div>
        <span className="category-slider-card-label">{cat.name}</span>
      </div>
    </motion.button>
  );
}

interface CategorySliderProps {
  onSelect: (category: string, cardRect: DOMRect) => void;
}

const DRAG_THRESHOLD_PX = 8;

export function CategorySlider({ onSelect }: CategorySliderProps) {
  const dragDeltaRef = useRef(0);
  const startXRef = useRef<number | null>(null);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: 'start',
      axis: 'x',
      duration: 32,
      draggable: true,
    },
    [WheelGesturesPlugin({ forceWheelAxis: 'y' })]
  );

  const handleCardClick = useCallback(
    (category: string, el: HTMLElement) => {
      if (dragDeltaRef.current > DRAG_THRESHOLD_PX) return;
      onSelect(category, el.getBoundingClientRect());
    },
    [onSelect]
  );

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    dragDeltaRef.current = 0;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    const delta = Math.abs(e.clientX - startXRef.current);
    if (delta > dragDeltaRef.current) dragDeltaRef.current = delta;
  }, []);

  const onPointerUp = useCallback(() => {
    startXRef.current = null;
  }, []);

  /* 2세트 렌더 → 컨테이너가 뷰포트를 넘어서 브라우저 최대화 시에도 무한스크롤 동작 */
  const categories = [...CATEGORIES, ...CATEGORIES];

  return (
    <section className="category-slider-section">
      <div className="category-slider-section-inner">
        <div
          className="category-slider-viewport"
          ref={emblaRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div className="category-slider-container">
            {categories.map((cat, i) => (
              <div key={`${cat.name}-${i}`} className="category-slider-slide">
                <CategorySliderCard
                  cat={cat}
                  index={i}
                  onCardClick={handleCardClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
