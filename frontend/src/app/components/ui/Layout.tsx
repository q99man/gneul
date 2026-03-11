import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  onLogoClick?: () => void;
}

export const Layout = ({ children, onLogoClick }: LayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      
      {/* Header */}
      <div className="sticky top-0 z-50 w-full">
        <Header onLogoClick={onLogoClick} />
      </div>

      {/* Main Content - 배경: 위 하늘빛, 아래 에메랄드(바다) 베이스 흰색 */}
      <main className="flex-1 relative z-10 bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6]">
        <div className="min-h-full w-full pt-0 pb-12 flex flex-col items-center">
          {children}
        </div>
      </main>

      {/* Footer - 페이지 맨 하단에 위치 */}
      <footer className="z-40">
        <Footer />
      </footer>
    </div>
  );
};
