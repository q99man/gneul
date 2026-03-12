import React, { useCallback, useMemo, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../data/categories';
import { useMouseTilt } from '../../hooks/useMouseTilt';
import './CategorySlider.css';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: i * 0.05,
    },
  }),
} as const;

interface CategorySliderCardProps {
  cat: { name: string; image: string };
  index: number;
  animationIndex: number;
  onCardClick: (category: string, el: HTMLElement) => void;
}

function CategorySliderCard({
  cat,
  index,
  animationIndex,
  onCardClick,
}: CategorySliderCardProps) {
  const { ref, style, onMouseMove, onMouseLeave } = useMouseTilt({
    maxTilt: 8,
    sensitivity: 1.1,
    resetDelay: 160,
  });

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onCardClick(cat.name, e.currentTarget);
    },
    [cat.name, onCardClick]
  );

  return (
    <motion.button
      type="button"
      className="category-slider-card"
      variants={cardVariants}
      initial="hidden"
      animate="show"
      custom={animationIndex}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{ transformOrigin: 'center center' }}
      onClick={handleClick}
      aria-label={`${cat.name} 카테고리 보기`}
      data-index={index}
    >
      <div
        ref={ref}
        style={style}
        className="category-slider-card-inner"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        <div className="category-slider-card-bg">
          <img src={cat.image} alt="" aria-hidden="true" draggable={false} />
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
  const startXRef = useRef<number | null>(null);
  const dragDeltaRef = useRef(0);
  const draggingRef = useRef(false);

  const categories = useMemo(() => {
    // 전체 화면에서도 루프가 끊기지 않도록 데이터를 2배로 늘림
    return [...CATEGORIES, ...CATEGORIES];
  }, []);

  const wheelPlugin = useMemo(
    () => WheelGesturesPlugin({ forceWheelAxis: 'y' }),
    []
  );

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: 'start',
      axis: 'x',
      duration: 45,
      skipSnaps: true,
    },
    [wheelPlugin]
  );

  const handleCardClick = useCallback(
    (category: string, el: HTMLElement) => {
      if (draggingRef.current) return;
      onSelect(category, el.getBoundingClientRect());
    },
    [onSelect]
  );

  const resetPointerState = useCallback(() => {
    startXRef.current = null;
    dragDeltaRef.current = 0;

    requestAnimationFrame(() => {
      draggingRef.current = false;
    });
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = e.clientX;
    dragDeltaRef.current = 0;
    draggingRef.current = false;
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (startXRef.current === null) return;

    const delta = Math.abs(e.clientX - startXRef.current);
    if (delta > dragDeltaRef.current) {
      dragDeltaRef.current = delta;
    }

    if (delta > DRAG_THRESHOLD_PX) {
      draggingRef.current = true;
    }
  }, []);

  return (
    <section className="category-slider-section" aria-label="공간 카테고리">
      <div className="category-slider-section-inner">
        <div
          className="category-slider-viewport"
          ref={emblaRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={resetPointerState}
          onPointerLeave={resetPointerState}
          onPointerCancel={resetPointerState}
        >
          <div className="category-slider-container">
            {categories.map((cat, i) => (
              <div key={`${cat.name}-${i}`} className="category-slider-slide">
                <CategorySliderCard
                  cat={cat}
                  index={i}
                  animationIndex={i}
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