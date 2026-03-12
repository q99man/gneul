import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/ui/Layout';
import { GuestSpaceGrid } from '../pages/GuestSpaceGrid';
import { GuestSpaceDetail } from '../pages/GuestSpaceDetail';
import { CategorySlider } from '../components/category/CategorySlider';
import { CATEGORIES } from '../data/categories';
import { PlaceSection } from '../pages/PlaceSection';
import type { GuestSpaceCardDest } from '../pages/GuestSpaceCard';
import { getMainSpaces } from '../api/space';
import type { MainSpaceDto } from '../api/types';

type ExitRect = { left: number; top: number; width: number; height: number };

interface HomeContentProps {
  destinations: GuestSpaceCardDest[];
  selectedDest: GuestSpaceCardDest | null;
  setSelectedDest: React.Dispatch<React.SetStateAction<GuestSpaceCardDest | null>>;
  cardRect: DOMRect | null;
  setCardRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  exitRect: ExitRect | null;
  setExitRect: React.Dispatch<React.SetStateAction<ExitRect | null>>;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  selectedRenderId: string | null;
  setSelectedRenderId: React.Dispatch<React.SetStateAction<string | null>>;
}

const HomeContent = ({
  destinations,
  selectedDest,
  setSelectedDest,
  cardRect,
  setCardRect,
  exitRect,
  setExitRect,
  selectedCategory,
  setSelectedCategory,
  selectedRenderId,
  setSelectedRenderId,
}: HomeContentProps) => {
  const handleScrollTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectCard = useCallback(
    (dest: GuestSpaceCardDest, rect: DOMRect, renderId: string) => {
      setSelectedDest(dest);
      setCardRect(rect);
      setSelectedRenderId(renderId);
    },
    [setSelectedDest, setCardRect, setSelectedRenderId]
  );

  const handleCloseDetail = useCallback(() => {
    const el = selectedRenderId
      ? document.querySelector<HTMLElement>(`[data-render-id="${selectedRenderId}"]`)
      : null;

    const rect = el?.getBoundingClientRect();

    if (rect) {
      setExitRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });

      requestAnimationFrame(() => {
        setSelectedDest(null);
        setCardRect(null);
        setExitRect(null);
        setSelectedRenderId(null);
      });
      return;
    }

    setSelectedDest(null);
    setCardRect(null);
    setExitRect(null);
    setSelectedRenderId(null);
  }, [
    selectedRenderId,
    setExitRect,
    setSelectedDest,
    setCardRect,
    setSelectedRenderId,
  ]);

  const newSpaces = useMemo(() => destinations.slice(0, 10), [destinations]);
  const popularSpaces = useMemo(() => destinations.slice(5, 15), [destinations]);
  const recommendedSpaces = useMemo(() => destinations.slice(10, 20), [destinations]);
  const topRatedSpaces = useMemo(() => destinations.slice(0, 10), [destinations]);

  return (
    <>
      {selectedCategory && (
        <div className="relative z-10 mx-auto flex min-h-[3.5rem] w-full items-center justify-end px-[15px] py-4 md:min-h-[4rem] md:px-[50px] md:py-5">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="cursor-pointer rounded-full border border-gray-200/60 bg-white/90 p-2.5 shadow-sm backdrop-blur-md transition-colors hover:bg-black hover:text-white md:p-3"
            aria-label="카테고리 목록으로 돌아가기"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      )}

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {!selectedCategory && (
            <motion.div
              key="main-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full"
            >
              <CategorySlider
                onSelect={(category) => {
                  setSelectedCategory(category);
                  const main = document.getElementById('main-scroll');
                  main?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              <PlaceSection
                sectionKey="new"
                title="새로운 공간"
                destinations={newSpaces}
                onSelect={handleSelectCard}
              />

              <PlaceSection
                sectionKey="popular"
                title="인기 공간"
                destinations={popularSpaces}
                onSelect={handleSelectCard}
              />

              <PlaceSection
                sectionKey="recommended"
                title="관리자 추천 공간"
                destinations={recommendedSpaces}
                onSelect={handleSelectCard}
              />

              <PlaceSection
                sectionKey="top-rated"
                title="최고 평점 공간"
                destinations={topRatedSpaces}
                onSelect={handleSelectCard}
              />
            </motion.div>
          )}

          {selectedCategory && (
            <motion.div
              key="guest-space-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <GuestSpaceGrid
                items={destinations}
                category={selectedCategory}
                onSelect={(dest, rect, renderId) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(renderId);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-32 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center">
        <button
          type="button"
          className="group flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-black px-0 text-white shadow-2xl transition-all duration-300 ease-out hover:w-44 hover:gap-2 hover:bg-gray-800 hover:px-5"
          onClick={handleScrollTop}
          aria-label="Back to top"
        >
          <ArrowUp
            size={18}
            className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5"
          />
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-sans text-sm font-bold tracking-widest opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:opacity-100">
            Back to top
          </span>
        </button>
      </div>

      <GuestSpaceDetail
        selectedDest={selectedDest}
        selectedRenderId={selectedRenderId}
        cardRect={cardRect}
        exitRect={exitRect}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default function Home() {
  const [destinations, setDestinations] = useState<GuestSpaceCardDest[]>([]);
  const [selectedDest, setSelectedDest] = useState<GuestSpaceCardDest | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const [exitRect, setExitRect] = useState<ExitRect | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRenderId, setSelectedRenderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const page = await getMainSpaces({ page: 0, size: 20 });
        const list = (page.content ?? []) as MainSpaceDto[];

        if (cancelled) return;

        const categoryNames = CATEGORIES.filter((c) => c.name !== '전체').map((c) => c.name);

        const mapped: GuestSpaceCardDest[] = list.map((s, i) => {
          const categoryLabel =
            categoryNames.length > 0
              ? categoryNames[i % categoryNames.length]
              : '테스트 공간';

          return {
            id: String(s.id),
            title: s.spaceName,
            subtitle: '',
            category: categoryLabel,
            image: s.imgUrl,
            description:
              s.spaceDetail?.replace(/<[^>]+>/g, '').slice(0, 80) ||
              '테스트 공간 설명입니다.',
            price: s.price != null ? `${s.price.toLocaleString()}원` : undefined,
            address: s.address,
            maxCapacity: s.maxCapacity,
          };
        });

        if (!cancelled) {
          setDestinations(mapped);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('메인 공간 조회 실패', err);
          setDestinations([]);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogoClick = useCallback(() => {
    setSelectedDest(null);
    setCardRect(null);
    setExitRect(null);
    setSelectedCategory(null);
    setSelectedRenderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Layout onLogoClick={handleLogoClick}>
      <HomeContent
        destinations={destinations}
        selectedDest={selectedDest}
        setSelectedDest={setSelectedDest}
        cardRect={cardRect}
        setCardRect={setCardRect}
        exitRect={exitRect}
        setExitRect={setExitRect}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRenderId={selectedRenderId}
        setSelectedRenderId={setSelectedRenderId}
      />
    </Layout>
  );
}