import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/ui/Layout';
import { GuestSpaceGrid } from './GuestSpaceGrid';
import { GuestSpaceDetail } from './GuestSpaceDetail';
import { CategorySlider } from '../components/category/CategorySlider';
import { CATEGORIES } from '../data/categories';
import { PlaceSection } from './PlaceSection';
import type { GuestSpaceCardDest } from './GuestSpaceCard';
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
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseDetail = () => {
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
    } else {
      setSelectedDest(null);
      setCardRect(null);
      setExitRect(null);
      setSelectedRenderId(null);
    }
  };

  return (
    <>
      {selectedCategory && (
        <div className="relative z-10 w-full mx-auto px-[15px] md:px-[50px] py-4 md:py-5 flex items-center justify-end min-h-[3.5rem] md:min-h-[4rem]">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="p-2.5 md:p-3 bg-white/90 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-colors shadow-sm border border-gray-200/60 cursor-pointer"
            aria-label="카테고리 목록으로 돌아가기"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
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
                  if (main) {
                    main.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
              />

              <PlaceSection
                sectionKey="new"
                title="새로운 공간"
                destinations={destinations.slice(0, 10)}
                onSelect={(dest, rect, renderId) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(renderId);
                }}
              />

              <PlaceSection
                sectionKey="popular"
                title="인기 공간"
                destinations={destinations.slice(5, 15)}
                onSelect={(dest, rect, renderId) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(renderId);
                }}
              />

              <PlaceSection
                sectionKey="recommended"
                title="관리자 추천 공간"
                destinations={destinations.slice(10, 20)}
                onSelect={(dest, rect, renderId) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(renderId);
                }}
              />

              <PlaceSection
                sectionKey="top-rated"
                title="최고 평점 공간"
                destinations={destinations.slice(0, 10)}
                onSelect={(dest, rect, renderId) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(renderId);
                }}
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
                onSelect={(dest, rect) => {
                  setSelectedDest(dest);
                  setCardRect(rect);
                  setSelectedRenderId(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
        <button
          type="button"
          className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-black text-white shadow-2xl transition-all duration-300 ease-out hover:w-44 hover:bg-gray-800 cursor-pointer px-0 hover:px-5 gap-0 hover:gap-2"
          onClick={handleScrollTop}
          aria-label="Back to top"
        >
          <ArrowUp size={18} className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold tracking-widest font-sans opacity-0 transition-all duration-300 group-hover:max-w-40 group-hover:opacity-100">
            Back to top
          </span>
        </button>
      </div>

      <GuestSpaceDetail
        selectedDest={selectedDest}
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
              s.spaceDetail?.replace(/<[^>]+>/g, '').slice(0, 80) || '테스트 공간 설명입니다.',
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

  const handleLogoClick = () => {
    setSelectedDest(null);
    setCardRect(null);
    setExitRect(null);
    setSelectedCategory(null);
    setSelectedRenderId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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