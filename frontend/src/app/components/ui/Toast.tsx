import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

export type ToastAnchor = { x: number; y: number; width?: number; height?: number };

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  durationMs?: number;
  /** 버튼 등 기준 요소 위치 → 이 좌표 근처에 토스트 표시 */
  anchor?: ToastAnchor | null;
  /** anchor 있을 때 기준점 대비 위치 */
  placement?: 'above' | 'below';
}

export function Toast({
  message,
  visible,
  onDismiss,
  durationMs = 2000,
  anchor,
  placement = 'above',
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [visible, durationMs, onDismiss]);

  const w = anchor?.width ?? 0;
  const h = anchor?.height ?? 0;
  const position = visible && anchor
    ? {
        left: anchor.x + w / 2,
        top: placement === 'above' ? anchor.y - 8 : anchor.y + h + 8,
      }
    : null;

  if (typeof document === 'undefined') return null;

  const style: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: position.left,
        top: position.top,
        transform: placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
        zIndex: 200,
      }
    : {
        position: 'fixed',
        top: 96,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
      };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: placement === 'above' ? 8 : -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placement === 'above' ? 4 : -4, scale: 0.98 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-medium shadow-lg whitespace-nowrap"
          style={style}
          role="status"
          aria-live="polite"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
