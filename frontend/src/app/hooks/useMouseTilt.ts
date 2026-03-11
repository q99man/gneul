import { useCallback, useRef, useState } from 'react';

interface UseMouseTiltOptions {
  /** 최대 기울기 각도(도) */
  maxTilt?: number;
  /** 반응 감도 (0~1, 클수록 민감) */
  sensitivity?: number;
  /** 원래대로 돌아오는 속도 (ms) */
  resetDelay?: number;
}

export function useMouseTilt(options: UseMouseTiltOptions = {}) {
  const {
    maxTilt = 12,
    sensitivity = 1,
    resetDelay = 0,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const centerX = 0.5;
      const centerY = 0.5;
      const rotateY = (x - centerX) * 2 * maxTilt * sensitivity;
      const rotateX = (centerY - y) * 2 * maxTilt * sensitivity;

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
      setTransform({ rotateX, rotateY });
    },
    [maxTilt, sensitivity]
  );

  const handleMouseLeave = useCallback(() => {
    if (resetDelay <= 0) {
      setTransform({ rotateX: 0, rotateY: 0 });
      return;
    }
    resetTimeoutRef.current = setTimeout(() => {
      setTransform({ rotateX: 0, rotateY: 0 });
      resetTimeoutRef.current = null;
    }, resetDelay);
  }, [resetDelay]);

  const style: React.CSSProperties = {
    transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
    transformStyle: 'preserve-3d',
    transition: resetDelay > 0 ? `transform ${resetDelay}ms ease-out` : 'transform 0.15s ease-out',
  };

  return { ref, style, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}
