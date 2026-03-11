import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CursorType = 'default' | 'hover' | 'button' | 'text';

interface CursorContextType {
  cursorState: {
    active: boolean;
    text: string;
    type: CursorType;
  };
  setCursorType: (type: CursorType, text?: string) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider = ({ children }: { children: ReactNode }) => {
  const [cursorState, setCursorState] = useState<{ active: boolean; text: string; type: CursorType }>({
    active: false,
    text: '',
    type: 'default',
  });

  const setCursorType = (type: CursorType, text: string = '') => {
    setCursorState({ active: true, text, type });
  };

  const resetCursor = () => {
    setCursorState({ active: false, text: '', type: 'default' });
  };

  return (
    <CursorContext.Provider value={{ cursorState, setCursorType, resetCursor }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (!context) {
    throw new Error('useCursor must be used within a CursorProvider');
  }
  return context;
};
