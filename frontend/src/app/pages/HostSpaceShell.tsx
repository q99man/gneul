import React from 'react';
import { motion } from 'motion/react';
import { AppSidebar } from '../components/ui/AppSidebar';

const FADE_DURATION = 0.25;

export function HostSpaceShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: (path?: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: FADE_DURATION, ease: 'easeOut' }}
      className="fixed inset-0 flex min-h-0 flex-col bg-gradient-to-b from-[#f2f8fc] via-white to-[#f0f9f6] text-gray-900 font-sans z-[60] md:flex-row"
    >
      <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
      <div className="hidden min-h-0 md:flex">
        <AppSidebar onClose={onClose} isInline closeOnly />
      </div>
    </motion.div>
  );
}

