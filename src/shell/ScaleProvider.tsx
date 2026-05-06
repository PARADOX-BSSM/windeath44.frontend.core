import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ScaleContextValue } from './types';

const ScaleContext = createContext<ScaleContextValue | null>(null);

export function useScale(): ScaleContextValue {
  const ctx = useContext(ScaleContext);
  if (!ctx) throw new Error('useScale must be used inside <ScaleProvider>');
  return ctx;
}

export interface ScaleProviderProps {
  children: ReactNode;
  /** 초기 스케일 (기본 1.0 = 100%) */
  initialScale?: number;
}

export function ScaleProvider({ children, initialScale = 1 }: ScaleProviderProps) {
  const [scale, setScaleState] = useState<number>(initialScale);

  const setScale = useCallback((value: number) => {
    setScaleState(value);
  }, []);

  const resetScale = useCallback(() => {
    setScaleState(1);
  }, []);

  // --s CSS 변수를 자동으로 루트에 주입 — CSS에서 calc(X * var(--s, 1) * 1cqh) 로 사용
  useEffect(() => {
    document.documentElement.style.setProperty('--s', String(scale));
  }, [scale]);

  return (
    <ScaleContext.Provider value={{ scale, setScale, resetScale }}>
      {children}
    </ScaleContext.Provider>
  );
}
