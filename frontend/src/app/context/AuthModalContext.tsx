import React, { createContext, useContext, useState, useCallback } from 'react';

export type AuthModalMode = 'login' | 'signup';

type AuthModalContextValue = {
  isOpen: boolean;
  mode: AuthModalMode;
  clickPosition: { x: number; y: number };
  signupJustCompleted: boolean;
  clearSignupJustCompleted: () => void;
  openAuthModal: (mode: AuthModalMode, x: number, y: number) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode, options?: { signupJustCompleted?: boolean }) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setModeState] = useState<AuthModalMode>('login');
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [signupJustCompleted, setSignupJustCompleted] = useState(false);

  const openAuthModal = useCallback((m: AuthModalMode, x: number, y: number) => {
    setModeState(m);
    setClickPosition({ x, y });
    setSignupJustCompleted(false);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setIsOpen(false), []);

  const setMode = useCallback((m: AuthModalMode, options?: { signupJustCompleted?: boolean }) => {
    setModeState(m);
    setSignupJustCompleted(!!options?.signupJustCompleted);
  }, []);

  const clearSignupJustCompleted = useCallback(() => setSignupJustCompleted(false), []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        clickPosition,
        signupJustCompleted,
        clearSignupJustCompleted,
        openAuthModal,
        closeAuthModal,
        setMode,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
