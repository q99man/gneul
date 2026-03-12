import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GuestSpaceCard } from './GuestSpaceCard';
import type { GuestSpaceCardDest } from './GuestSpaceCard';

const GAP = 16;
const MOBILE_BREAK = 768;
const DRAG_THRESHOLD = 6;
const MIN_CARD_WIDTH = 160;
const DEFAULT_CARD_WIDTH = 240;

interface PlaceSectionProps {
  sectionKey: string;
  title: string;
  destinations: GuestSpaceCardDest[];
  onSelect: (
    dest: GuestSpaceCardDest,
    cardRect: DOMRect,
    renderId: string
  ) => void;
}

export function PlaceSection({
  sectionKey,
  title,
  destinations,
  onSelect,
}: PlaceSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafMeasureRef = useRef<number | null>(null);

  const [cardWidth, setCardWidth] = useState(DEFAULT_CARD_WIDTH);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canScroll = scrollWidth > clientWidth + 4;

    if (!canScroll) {
      setShowLeft(false);
      setShowRight(false);
      return;
    }

    setShowLeft(scrollLeft > 6);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  const updateWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const w = el.clientWidth;
    if (w <= 0) return;

    const computed =
      w < MOBILE_BREAK ? (w - 2 * GAP) / 3 : (w - 6 * GAP) / 7;

    const next = Math.max(MIN_CARD_WIDTH, computed);
    setCardWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));

    requestAnimationFrame(updateScrollButtons);
  }, [updateScrollButtons]);

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
    updateScrollButtons();

    return () => {
      ro.disconnect();
      if (rafMeasureRef.current != null) {
        cancelAnimationFrame(rafMeasureRef.current);
        rafMeasureRef.current = null;
      }
    };
  }, [destinations.length, updateWidth, updateScrollButtons]);

  const scrollByCards = useCallback(
    (count: number) => {
      const el = scrollRef.current;
      if (!el) return;

      el.scrollBy({
        left: (cardWidth + GAP) * count,
        behavior: 'smooth',
      });
    },
    [cardWidth]
  );

  const handleScrollLeft = useCallback(() => {
    scrollByCards(-3);
  }, [scrollByCards]);

  const handleScrollRight = useCallback(() => {
    scrollByCards(3);
  }, [scrollByCards]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const el = scrollRef.current;
    if (!el) return;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const state = dragRef.current;
      if (!state.isDragging) return;

      const el = scrollRef.current;
      if (!el) return;

      const dx = e.clientX - state.startX;

      if (Math.abs(dx) >= DRAG_THRESHOLD) {
        state.moved = true;
      }

      el.scrollLeft = state.startScrollLeft - dx;
      updateScrollButtons();
    },
    [updateScrollButtons]
  );

  const stopDragging = useCallback(() => {
    dragRef.current.isDragging = false;
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 0);
  }, []);

  const handleCardClick = useCallback(
    (dest: GuestSpaceCardDest, cardRect: DOMRect, renderId: string) => {
      if (dragRef.current.moved) return;
      onSelect(dest, cardRect, renderId);
    },
    [onSelect]
  );

  if (destinations.length === 0) return null;

  return (
    <section className="relative w-full py-4">
      <div className="w-full px-[15px] md:px-[50px]">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 cursor-pointer hover:text-gray-600 transition-colors font-serif">
          {title}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="group/section relative w-full">
            {showLeft && (
              <button
                type="button"
                onClick={handleScrollLeft}
                aria-label="왼쪽으로 이동"
                className="
      absolute left-1 top-1/2 z-30
      flex h-10 w-10 -translate-y-1/2 items-center justify-center
      rounded-full border border-gray-200 bg-white/92 text-gray-800
      shadow-md backdrop-blur-md transition-all duration-200
      hover:scale-105 hover:bg-black hover:text-white
      md:left-0 md:h-14 md:w-14 md:-translate-x-1/2
      opacity-100 md:opacity-0
      md:pointer-events-none md:group-hover/section:pointer-events-auto
      md:group-hover/section:opacity-100
    "
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {showRight && (
              <button
                type="button"
                onClick={handleScrollRight}
                aria-label="오른쪽으로 이동"
                className="
      absolute right-1 top-1/2 z-30
      flex h-10 w-10 -translate-y-1/2 items-center justify-center
      rounded-full border border-gray-200 bg-white/92 text-gray-800
      shadow-md backdrop-blur-md transition-all duration-200
      hover:scale-105 hover:bg-black hover:text-white
      md:right-0 md:h-14 md:w-14 md:translate-x-1/2
      opacity-100 md:opacity-0
      md:pointer-events-none md:group-hover/section:pointer-events-auto
      md:group-hover/section:opacity-100
    "
              >
                <ChevronRight size={20} />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={updateScrollButtons}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
              onMouseLeave={stopDragging}
              className="
                flex min-h-[280px] cursor-grab select-none overflow-x-auto overflow-y-hidden
                py-3 scroll-smooth active:cursor-grabbing
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="flex flex-shrink-0 py-1" style={{ gap: GAP }}>
                {destinations.map((dest, index) => {
                  const renderId = `${sectionKey}-${dest.id}-${index}`;

                  return (
                    <div
                      key={renderId}
                      className="flex-shrink-0"
                      style={{ width: cardWidth, minWidth: cardWidth }}
                    >
                      <GuestSpaceCard
                        dest={dest}
                        renderId={renderId}
                        index={index}
                        onSelect={handleCardClick}
                      />
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