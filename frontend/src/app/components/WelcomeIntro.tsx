import { useState } from 'react';
import { motion } from 'framer-motion';
import welcomeBg from '../../assets/images/Welcome-bg.png';

const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;
const ENTRANCE_DURATION = 2;
const EXIT_DURATION = 1;

/* 앞쪽 나뭇잎 흔들림: 각 잎마다 다른 각도·속도로 무한 sway */
const leafSway = {
  rotate: [0, 4, -3, 2, 0],
  x: [0, 3, -2, 1, 0],
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const },
};

const leafSwaySlow = {
  rotate: [0, -2, 3, -1, 0],
  x: [0, -2, 2, -1, 0],
  transition: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' as const },
};

const leafSwayFast = {
  rotate: [0, 3, -4, 1, 0],
  x: [0, 2, -3, 0, 0],
  transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
};

const leafSwayAlt = {
  rotate: [0, -3, 2, -1, 0],
  x: [0, -1, 2, -2, 0],
  transition: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' as const },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.32,
      delayChildren: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: EXIT_DURATION,
      ease: EASE_SMOOTH,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.85, ease: EASE_SMOOTH },
  },
  exit: {
    opacity: 0,
    y: -16,
    filter: 'blur(6px)',
    transition: { duration: EXIT_DURATION * 0.4, ease: EASE_SMOOTH },
  },
};

const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL;

export type WelcomeIntroProps = {
  onEnter: () => void;
};

export default function WelcomeIntro({ onEnter }: WelcomeIntroProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleEnter = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(() => onEnter(), EXIT_DURATION * 1000);
  };

  return (
    <motion.div
      className="relative w-full min-h-screen overflow-hidden select-none bg-white text-gray-900 font-sans"
      initial={false}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: isLeaving ? EXIT_DURATION : 0, ease: EASE_SMOOTH }}
    >
      {/* 배경: 백엔드 정적 이미지 사용 */}
      <img
        src={welcomeBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 이미지 위 얇은 그라데이션: 가독성 + 메인 페이지와 톤 맞춤 */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#f2f8fc]/50 via-transparent to-[#f0f9f6]/40" />

      {/* 앞쪽 나뭇잎: 영상처럼 흐릿하게 흔들리는 레이어 (클릭 통과) */}
      <div
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        aria-hidden
      >
        {/* 왼쪽 앞 나뭇잎 1 */}
        <motion.div
          className="absolute left-0 bottom-0 w-[min(55vw,380px)] h-[min(50vw,320px)] origin-bottom-left"
          style={{ filter: 'blur(4px)' }}
          animate={leafSway}
        >
          <svg viewBox="0 0 120 90" className="w-full h-full opacity-[0.35] text-white/90">
            <ellipse cx="30" cy="75" rx="28" ry="12" fill="currentColor" transform="rotate(-25 30 75)" />
            <path d="M12 85 Q35 50 25 20 Q20 5 40 15 Q55 35 30 70 Z" fill="currentColor" opacity={0.9} />
          </svg>
        </motion.div>
        {/* 왼쪽 앞 나뭇잎 2 */}
        <motion.div
          className="absolute left-0 bottom-0 w-[min(42vw,280px)] h-[min(38vw,250px)] origin-bottom-left translate-x-8"
          style={{ filter: 'blur(3px)' }}
          animate={leafSwayFast}
        >
          <svg viewBox="0 0 120 90" className="w-full h-full opacity-[0.25] text-white/90">
            <path d="M8 82 Q32 48 28 22 Q22 8 38 18 Q52 38 26 72 Z" fill="currentColor" />
          </svg>
        </motion.div>
        {/* 오른쪽 앞 나뭇잎 1 - 바깥쪽 덩어리 (좌측 1번과 대칭) */}
        <motion.div
          className="absolute right-0 bottom-0 w-[min(48vw,320px)] h-[min(44vw,280px)] origin-bottom-right"
          style={{ filter: 'blur(4px)' }}
          animate={leafSwaySlow}
        >
          <svg viewBox="0 0 120 90" className="w-full h-full opacity-[0.32] text-white/90 scale-x-[-1]">
            <path d="M12 85 Q35 50 25 20 Q20 5 40 15 Q55 35 30 70 Z" fill="currentColor" />
          </svg>
        </motion.div>
        {/* 오른쪽 앞 나뭇잎 2 - 안쪽 덩어리, 좌측처럼 간격 두고 분리 (뭉침 방지) */}
        <motion.div
          className="absolute right-[min(14vw,90px)] bottom-0 w-[min(36vw,220px)] h-[min(32vw,200px)] origin-bottom-right"
          style={{ filter: 'blur(3px)' }}
          animate={leafSwayAlt}
        >
          <svg viewBox="0 0 120 90" className="w-full h-full opacity-[0.24] text-white/90 scale-x-[-1]">
            <path d="M8 82 Q32 48 28 22 Q22 8 38 18 Q52 38 26 72 Z" fill="currentColor" />
          </svg>
        </motion.div>
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate={isLeaving ? 'exit' : 'show'}
        transition={{ duration: 1.2, ease: EASE_SMOOTH }}
      >
        <div className="flex flex-col items-center w-full max-w-4xl text-center">
          {/* 메인 타이틀 - 메인 페이지와 동일: font-serif, text-gray-900 */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-gray-900 leading-[1.15] mb-6"
          >
            나만의 그늘을 찾아
            <br />
            떠나 볼까요?
          </motion.h1>

          {/* 서브 타이틀 - 메인과 동일 톤 */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl font-sans"
          >
            지금 바로 찾아보세요
          </motion.p>

          {/* 버튼 - 시작하기 하나 */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <button
              type="button"
              onClick={handleEnter}
              className="px-8 py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg cursor-pointer font-sans"
            >
              시작하기
            </button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
