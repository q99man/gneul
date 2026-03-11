import React, { useEffect, useRef, useState } from 'react';
import { useCursor } from '../../context/CursorContext';
import { motion } from 'motion/react';

export const CustomCursor = () => {
  const { cursorState } = useCursor();
  const [isMounted, setIsMounted] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);

    const updateMousePosition = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      if (frameRef.current == null) {
        frameRef.current = window.requestAnimationFrame(() => {
          frameRef.current = null;
          const el = cursorRef.current;
          if (!el) return;
          const { x, y } = mousePosRef.current;
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
      }
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (frameRef.current != null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[100] mix-blend-difference hidden md:block"
    >
      <motion.div
        className={`flex items-center justify-center rounded-full bg-white text-black font-bold tracking-widest text-xs
          ${cursorState.type === 'button' ? 'mix-blend-normal border border-white/20' : ''}
        `}
        animate={{
          width: cursorState.type === 'hover' ? 48 : cursorState.type === 'button' ? 80 : 16,
          height: cursorState.type === 'hover' ? 48 : cursorState.type === 'button' ? 80 : 16,
          scale: cursorState.active ? 1 : 0.5,
          backgroundColor: cursorState.type === 'button' ? '#000000' : '#ffffff',
          color: cursorState.type === 'button' ? '#ffffff' : '#000000',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {cursorState.active && cursorState.text && cursorState.type !== 'hover' && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px]"
          >
            {cursorState.text}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
};
