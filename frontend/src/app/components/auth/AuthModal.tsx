import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useAuthModal } from '../../context/AuthModalContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthModal() {
  const { isOpen, mode, clickPosition, signupJustCompleted, clearSignupJustCompleted, closeAuthModal, setMode } = useAuthModal();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  const springTransition = {
    type: 'spring' as const,
    stiffness: 280,
    damping: 26,
    mass: 0.85,
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
            onClick={closeAuthModal}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            initial={{
              left: clickPosition.x,
              top: clickPosition.y,
              x: '-50%',
              y: '-50%',
              scale: 0,
              opacity: 0.8,
            }}
            animate={{
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
              scale: 1,
              opacity: 1,
            }}
            exit={{
              left: clickPosition.x,
              top: clickPosition.y,
              x: '-50%',
              y: '-50%',
              scale: 0,
              opacity: 0.8,
              transition: springTransition,
            }}
            transition={springTransition}
            className="fixed z-[101] w-[95vw] max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200/80 py-6 px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
            <div id="auth-modal-title" className="sr-only">
              {mode === 'login' ? '로그인' : '회원가입'}
            </div>
            <div className="pt-2">
              {mode === 'login' ? (
                <LoginForm
                  embedded
                  successMessage={signupJustCompleted ? '회원가입이 완료되었습니다. 로그인해 주세요.' : undefined}
                  onSuccess={() => { clearSignupJustCompleted(); closeAuthModal(); }}
                  onSwitchToSignup={() => setMode('signup')}
                />
              ) : (
                <SignupForm
                  embedded
                  onSuccess={() => setMode('login', { signupJustCompleted: true })}
                  onSwitchToLogin={() => setMode('login')}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
