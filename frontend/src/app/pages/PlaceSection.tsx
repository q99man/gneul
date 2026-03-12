import React, { useRef, useCallback, useState, useEffect, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { GuestSpaceCard } from './GuestSpaceCard';
import type { GuestSpaceCardDest } from './GuestSpaceCard';

const GAP = 16;
const MOBILE_BREAK = 768;
const DRAG_THRESHOLD = 5;
const MIN_CARD_WIDTH = 160;
const DEFAULT_CARD_WIDTH = 240;

interface PlaceSectionProps {
  sectionKey: string;
  title: string;
  destinations: GuestSpaceCardDest[];
  onSelect: (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => void;
}

export function PlaceSection({
  sectionKey,
  title,
  destinations,
  onSelect,
}: PlaceSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(DEFAULT_CARD_WIDTH);
  const rafMeasureRef = useRef<number | null>(null);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const computed = w < MOBILE_BREAK ? (w - 2 * GAP) / 3 : (w - 6 * GAP) / 7;
    const next = Math.max(MIN_CARD_WIDTH, computed);
    setCardWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
  }, []);

  useLayoutEffect(() => {
    if (!destinations.length) return;
    updateWidth();
  }, [destinations.length, updateWidth]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !destinations.length) return;
    const scheduleMeasure = () => {
      if (rafMeasureRef.current != null) return;
      rafMeasureRef.current = requestAnimationFrame(() => {
        rafMeasureRef.current = null;
        updateWidth();
      });
    };
    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(el);
    scheduleMeasure();
    return () => {
      ro.disconnect();
      if (rafMeasureRef.current != null) {
        cancelAnimationFrame(rafMeasureRef.current);
        rafMeasureRef.current = null;
      }
    };
  }, [destinations.length, updateWidth]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = { isDragging: true, startX: e.clientX, startScrollLeft: el.scrollLeft, moved: false };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) >= DRAG_THRESHOLD) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.startScrollLeft - dx;
  }, []);

  const stopDragging = useCallback(() => { dragRef.current.isDragging = false; }, []);

  const handleCardClick = useCallback(
    (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => {
      if (dragRef.current.moved) return;
      onSelect(dest, cardRect, renderId);
    },
    [onSelect]
  );

  if (destinations.length === 0) return null;

  return (
    <section className="w-full py-4 min-h-[200px]">
      <div className="w-full px-[15px] md:px-[50px]">
        <h2 className="flex items-center gap-1 text-lg md:text-xl font-semibold text-gray-900 mb-6 md:mb-8 cursor-pointer hover:text-gray-600 transition-colors font-sans">
          {title}
        </h2>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
          <div className="relative w-full">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto overflow-y-hidden py-3 scroll-smooth select-none cursor-grab active:cursor-grabbing min-h-[280px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
            >
              <div className="flex flex-shrink-0 py-1" style={{ gap: GAP }}>
                {destinations.map((dest, index) => {
                  const renderId = `${sectionKey}-${dest.id}`;
                  return (
                    <div key={renderId} className="flex-shrink-0" style={{ width: cardWidth, minWidth: cardWidth }}>
                      <GuestSpaceCard dest={dest} renderId={renderId} index={index} onSelect={handleCardClick} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
