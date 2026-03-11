import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X } from 'lucide-react';

// --- Types ---
type Destination = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  description: string;
};

type CursorType = 'default' | 'hover' | 'button';

type CursorState = {
  active: boolean;
  text: string;
  type: CursorType;
};

// --- Mock Data ---
const DESTINATIONS: Destination[] = [
  {
    id: '01',
    title: 'Kyoto',
    subtitle: 'Japan',
    category: 'Culture & Heritage',
    image:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
    description:
      '전통과 현대가 공존하는 좁은 골목길을 거닐며, 수백 년 된 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈넋은 사찰의 고즈정형화되지 않은 여정 속에서 완벽한 평온을 발견합니다.',
  },
  {
    id: '02',
    title: 'Dolomites',
    subtitle: 'Italy',
    category: 'Alpine Nature',
    image:
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1974&auto=format&fit=crop',
    description:
      '거대한 석회암 봉우리들이 붉은 석양에 물드는 순간, 자연이 만든 가장 웅장한 타이포그래피를 마주하게 됩니다. 압도적인 스케일 속에서 호흡해 보세요.',
  },
  {
    id: '03',
    title: 'Marrakech',
    subtitle: 'Morocco',
    category: 'Sensory Journey',
    image:
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?q=80&w=1974&auto=format&fit=crop',
    description:
      '붉은 성벽 너머 미로 같은 메디나, 코끝을 스치는 강렬한 향신료의 향기. 예측 불가능한 브로큰 그리드처럼, 발길 닿는 모든 곳이 새로운 영감이 됩니다.',
  },
  {
    id: '04',
    title: 'Zermatt',
    subtitle: 'Switzerland',
    category: 'Winter Escape',
    image:
      'https://images.unsplash.com/photo-1531366936337-77b5d2753d0e?q=80&w=2070&auto=format&fit=crop',
    description:
      '새하얀 눈으로 덮인 여백의 미(Negative Space). 마터호른의 날카로운 실루엣 아래서, 복잡한 일상을 지우고 본연의 감각에만 집중하는 시간을 가집니다.',
  },
  {
    id: '05',
    title: 'Santorini',
    subtitle: 'Greece',
    category: 'Ocean View',
    image:
      'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1935&auto=format&fit=crop',
    description:
      '푸른 에게해와 눈부신 하얀 건축물들의 강렬한 대비. 스크롤을 내릴 때마다 새로운 파노라마가 펼쳐지는 듯한 유기적인 아름다움을 경험하세요.',
  },
  {
    id: '06',
    title: 'Kyiv',
    subtitle: 'Ukraine',
    category: 'Urban Explore',
    image:
      'https://images.unsplash.com/photo-1560693529-652a92211bb1?q=80&w=1974&auto=format&fit=crop',
    description:
      '오랜 역사와 멈추지 않는 현대의 박동이 교차하는 도시. 깊이 있는 예술과 문화를 탐험하며 당신만의 내러티브를 완성해 보세요.',
  },
];

export default function App() {
  const [viewMode, setViewMode] = useState<'grid' | 'collage'>('grid');
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<CursorState>({
    active: false,
    text: '',
    type: 'default',
  });
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // --- Custom Cursor Logic ---
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handleMouseEnterCard = () => {
    setCursorState({ active: true, text: 'EXPLORE', type: 'hover' });
  };

  const handleMouseEnterButton = (text: string) => {
    setCursorState({ active: true, text: text, type: 'button' });
  };

  const handleMouseLeave = () => {
    setCursorState({ active: false, text: '', type: 'default' });
  };

  // --- Render ---
  return (
    <div 
      className={`relative min-h-screen bg-[#fafafa] text-gray-900 font-sans selection:bg-black selection:text-white ${selectedDest ? 'overflow-hidden' : 'overflow-x-hidden'}`}
      style={{ cursor: 'none' }} // Hide default cursor
    >
      {/* Custom Cursor Component */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[100] mix-blend-difference"
        style={{
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className={`flex items-center justify-center rounded-full bg-white text-black font-bold tracking-widest text-xs transition-all duration-300 ease-out transform -translate-x-1/2 -translate-y-1/2
            ${cursorState.active ? 'scale-100 opacity-100' : 'scale-50 opacity-100 w-4 h-4'}
            ${cursorState.type === 'hover' ? 'w-24 h-24' : ''}
            ${cursorState.type === 'button' ? 'w-20 h-20 bg-black text-white mix-blend-normal border border-white/20' : ''}
          `}
        >
          {cursorState.active && cursorState.text && (
            <span className="animate-fade-in opacity-100 transition-opacity duration-300">
              {cursorState.text}
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-40 mix-blend-difference text-white">
        <h1 className="text-2xl font-bold tracking-tighter">VOYAGE</h1>
        <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide uppercase">
          <a href="#" className="hover:opacity-50 transition-opacity">Destinations</a>
          <a href="#" className="hover:opacity-50 transition-opacity">Journal</a>
          <a href="#" className="hover:opacity-50 transition-opacity">About</a>
        </nav>
      </header>

      {/* Giant Background Typography */}
      <div className="fixed top-1/2 left-0 w-full -translate-y-1/2 pointer-events-none z-0 overflow-hidden flex justify-center">
        <h2 className="text-[18vw] font-black tracking-tighter text-gray-100 whitespace-nowrap opacity-60 mix-blend-multiply">
          DEPARTURE
        </h2>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 pt-40 pb-40 px-6 md:px-12 max-w-[1800px] mx-auto min-h-screen flex flex-col items-center">
        
        {/* Gallery Container */}
        <div 
          ref={containerRef}
          className={`w-full transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] relative
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10' 
              : 'flex flex-col md:block h-[200vh] md:h-auto' // Collage mode base
            }
          `}
        >
          {DESTINATIONS.map((dest, index) => {
            // Calculate specific classes for the "Broken Grid / Collage" look based on index
            let collageClasses = '';
            if (viewMode === 'collage') {
              const styles = [
                'md:absolute md:top-0 md:left-[5%] md:w-[35%] w-full mb-10', // 0: Top Left
                'md:absolute md:top-[15%] md:left-[45%] md:w-[45%] w-full mb-10', // 1: Top Right, large
                'md:absolute md:top-[45%] md:left-[10%] md:w-[30%] w-full mb-10', // 2: Mid Left
                'md:absolute md:top-[60%] md:left-[55%] md:w-[35%] w-full mb-10', // 3: Bottom Right
                'md:absolute md:top-[85%] md:left-[20%] md:w-[40%] w-full mb-10', // 4: Bottom Left
                'md:absolute md:top-[110%] md:left-[60%] md:w-[30%] w-full mb-10', // 5: Lowest Right
              ];
              collageClasses = styles[index % styles.length];
            }

            return (
              <div
                key={dest.id}
                className={`group relative overflow-hidden bg-gray-200 cursor-none transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]
                  ${viewMode === 'grid' ? 'aspect-[4/5] w-full' : collageClasses}
                  ${viewMode === 'collage' && !collageClasses.includes('md:absolute') ? 'aspect-[4/5]' : ''}
                  ${viewMode === 'collage' ? (index % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square') : ''}
                `}
                onMouseEnter={handleMouseEnterCard}
                onMouseLeave={handleMouseLeave}
                onClick={() => setSelectedDest(dest)}
              >
                {/* Image */}
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                
                {/* Overlay Hover Reveal */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out flex flex-col justify-end p-8">
                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-white/80 text-sm tracking-widest uppercase mb-2">{dest.category}</p>
                    <h3 className="text-white text-4xl md:text-5xl font-bold tracking-tighter">{dest.title}</h3>
                  </div>
                </div>

                {/* Always visible text (vw style) */}
                <div className={`absolute top-6 left-6 mix-blend-difference transition-opacity duration-300 ${viewMode === 'collage' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <span className="text-white text-lg font-bold">.{dest.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating View Toggle */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-4">
        <p className="text-sm italic text-gray-500 font-serif tracking-wide pointer-events-none">
          See more Contents, Archive Website
        </p>
        <button
          className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-3 hover:bg-gray-800 transition-colors"
          onMouseEnter={() => handleMouseEnterButton(viewMode === 'grid' ? 'COLLAGE' : 'GRID')}
          onMouseLeave={handleMouseLeave}
          onClick={() => setViewMode(viewMode === 'grid' ? 'collage' : 'grid')}
        >
          <span className="uppercase text-sm font-bold tracking-widest">
            {viewMode === 'grid' ? 'Collage' : 'Grid'}
          </span>
          <ArrowRight size={18} className={`transition-transform duration-500 ${viewMode === 'collage' ? '-rotate-180' : ''}`} />
        </button>
      </div>

      {/* --- Detail View Modal (Expanded State) --- */}
      <div 
        className={`fixed inset-0 z-50 bg-white flex flex-col md:flex-row transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]
          ${selectedDest ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {selectedDest && (
          <>
            {/* Close Button */}
            <button 
              className="absolute top-8 right-8 z-50 p-4 bg-white/50 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-colors cursor-none"
              onClick={() => setSelectedDest(null)}
              onMouseEnter={() => handleMouseEnterButton('CLOSE')}
              onMouseLeave={handleMouseLeave}
            >
              <X size={24} />
            </button>

            {/* Left: Giant Image */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
              <img 
                src={selectedDest.image} 
                alt={selectedDest.title} 
                className="w-full h-full object-cover animate-image-reveal"
              />
            </div>

            {/* Right: Typography & Content */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-screen flex flex-col justify-center p-10 md:p-24 overflow-y-auto">
              <div className="max-w-xl animate-text-reveal">
                <span className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 block">
                  {selectedDest.category}
                </span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 leading-none">
                  {selectedDest.title}
                </h2>
                <h3 className="text-2xl md:text-4xl font-serif italic text-gray-500 mb-10">
                  {selectedDest.subtitle}
                </h3>
                
                <p className="text-lg md:text-xl leading-relaxed text-gray-800">
                  {selectedDest.description}
                </p>

                <div className="mt-16 pt-10 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Brand Identity, Visual Language</span>
                  <span className="text-sm font-bold uppercase tracking-widest text-black">SEOUL, KR</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inline styles for custom animations that Tailwind standard classes don't cover perfectly */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes imageReveal {
          from { transform: scale(1.1); filter: brightness(0.5); }
          to { transform: scale(1); filter: brightness(1); }
        }
        .animate-image-reveal {
          animation: imageReveal 1s cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }
        @keyframes textReveal {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-text-reveal {
          animation: textReveal 1s cubic-bezier(0.76, 0, 0.24, 1) 0.2s forwards;
          opacity: 0;
        }
        
        /* Hide scrollbar for clean aesthetic */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #fafafa;
        }
        ::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }
      `}} />
    </div>
  );
}